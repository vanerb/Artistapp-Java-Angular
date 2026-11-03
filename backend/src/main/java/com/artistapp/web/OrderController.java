package com.artistapp.web;

import static com.artistapp.support.ApiException.abortIf;
import static com.artistapp.support.ApiException.abortUnless;

import com.artistapp.security.AuthUser;
import com.artistapp.service.Notifier;
import com.artistapp.service.StorageService;
import com.artistapp.support.ApiException;
import com.artistapp.support.Db;
import com.artistapp.support.Input;
import com.artistapp.support.Validation;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Pedidos. Cada artículo tiene su propio estado de envío (lo cambia quien lo vende) y el
 * comprador confirma la recepción; el estado global del pedido se deriva de los artículos.
 */
@RestController
@RequestMapping("/api")
public class OrderController {
    private static final String DETAIL_SELECT = "SELECT d.id AS detalle_id, d.id_pedido, d.estado_envio, d.recibido_confirmado_at, d.id_producto AS id, "
        + "COALESCE(d.nombre_producto, p.nombre) AS nombre, p.imagen, COALESCE(d.precio_unitario, p.precio) AS precio, p.id_tipo, p.id_usuario AS seller_id, s.usuario AS seller_name "
        + "FROM detalles_pedido AS d LEFT JOIN productos AS p ON p.id = d.id_producto LEFT JOIN usuarios AS s ON s.id = p.id_usuario";
    private static final Map<String, String> STATE_LABELS = Map.of("preparando", "Preparando", "enviado", "Enviado", "entregado", "Entregado");

    private final Db db;
    private final StorageService storage;
    private final Notifier notifier;

    public OrderController(Db db, StorageService storage, Notifier notifier) {
        this.db = db;
        this.storage = storage;
        this.notifier = notifier;
    }

    @GetMapping("/orders")
    public Object index(HttpServletRequest request, AuthUser auth, Input input) {
        StringBuilder sql = new StringBuilder("SELECT o.*, u.usuario AS buyer_name FROM pedidos AS o JOIN usuarios AS u ON u.id = o.id_usuario WHERE 1 = 1");
        List<Object> args = new ArrayList<>();
        if (!auth.isAdmin()) { sql.append(" AND o.id_usuario = ?"); args.add(auth.id()); }
        if (input.filled("estado")) { sql.append(" AND o.estado = ?"); args.add(input.str("estado")); }
        sql.append(" ORDER BY o.id DESC");
        Map<String, Object> orders = db.paginate(request, 30, sql.toString(), args.toArray());
        attachDetails(Db.pageData(orders), null, false);
        return orders;
    }

    /** Pedidos que contienen productos vendidos por el usuario autenticado. */
    @GetMapping("/orders/received")
    public Object received(HttpServletRequest request, AuthUser auth) {
        abortUnless(auth.isOneOf(1, 3, 5), 403, "Tu cuenta no puede recibir pedidos.");
        Map<String, Object> orders = db.paginate(request, 30,
            "SELECT DISTINCT o.id, o.nombre, o.estado, o.direccion, o.telefono, o.pago, o.created_at, u.usuario AS buyer_name FROM pedidos AS o "
                + "JOIN detalles_pedido AS d ON d.id_pedido = o.id JOIN productos AS p ON p.id = d.id_producto JOIN usuarios AS u ON u.id = o.id_usuario "
                + "WHERE p.id_usuario = ? ORDER BY o.id DESC", auth.id());
        attachDetails(Db.pageData(orders), auth.id(), true);
        return orders;
    }

    private void attachDetails(List<Map<String, Object>> orders, Long sellerId, boolean sellerTotal) {
        List<Object> ids = orders.stream().map(order -> order.get("id")).collect(Collectors.toList());
        Map<Object, List<Map<String, Object>>> details = new LinkedHashMap<>();
        if (!ids.isEmpty()) {
            List<Object> args = new ArrayList<>(ids);
            String sql = DETAIL_SELECT + " WHERE d.id_pedido IN (" + Db.marks(ids) + ")";
            if (sellerId != null) { sql += " AND p.id_usuario = ?"; args.add(sellerId); }
            for (Map<String, Object> detail : db.list(sql, args.toArray())) {
                details.computeIfAbsent(Users.id(detail, "id_pedido"), key -> new ArrayList<>()).add(detail);
            }
        }
        for (Map<String, Object> order : orders) {
            List<Map<String, Object>> products = details.getOrDefault(Users.id(order, "id"), new ArrayList<>());
            order.put("productos", products);
            if (sellerTotal) order.put("total_vendedor", CartController.subtotal(products).doubleValue());
            order.put("estado", overallStatus(products, String.valueOf(order.get("estado"))));
        }
    }

    @PostMapping("/checkout")
    @Transactional
    public ResponseEntity<Object> checkout(AuthUser auth, Input input) {
        Validation v = new Validation(input, db);
        v.field("nombre").required().string().max(255);
        v.field("direccion").required().string().max(255);
        v.field("telefono").required().string().max(32);
        Map<String, Object> data = v.validate();
        String phone = data.get("telefono").toString().replaceAll("\\D+", "");
        abortUnless(phone.matches("^[0-9]{9}$"), 422, "El teléfono debe tener 9 dígitos.");
        Long cart = db.value("SELECT id FROM cesta WHERE id_usuario = ?", Long.class, auth.id());
        abortUnless(cart != null, 422, "La cesta está vacía.");
        List<Map<String, Object>> items = db.list("SELECT p.* FROM cesta_producto AS cp JOIN productos AS p ON p.id = cp.id_producto WHERE cp.id_cesta = ? FOR UPDATE", cart);
        abortIf(items.isEmpty(), 422, "La cesta está vacía.");
        for (Map<String, Object> item : items) abortIf(Users.id(item, "cantidad") < 1, 422, "«" + item.get("nombre") + "» ya no está disponible. Quítalo de la cesta para continuar.");
        BigDecimal total = CartController.subtotal(items).add(CartController.shipping(items));
        Map<String, Object> order = new LinkedHashMap<>();
        order.put("id_usuario", auth.id());
        order.put("nombre", data.get("nombre"));
        order.put("estado", "preparando");
        order.put("direccion", data.get("direccion"));
        order.put("telefono", phone);
        order.put("pago", total);
        order.put("created_at", LocalDateTime.now());
        long orderId = db.insert("pedidos", order);
        for (Map<String, Object> item : items) {
            db.exec("INSERT INTO detalles_pedido (id_pedido, id_producto, nombre_producto, precio_unitario) VALUES (?, ?, ?, ?)", orderId, item.get("id"), item.get("nombre"), item.get("precio"));
            db.exec("UPDATE productos SET cantidad = cantidad - 1 WHERE id = ? AND cantidad > 0", item.get("id"));
        }
        db.exec("DELETE FROM cesta_producto WHERE id_cesta = ?", cart);
        items.stream().collect(Collectors.groupingBy(item -> Users.id(item, "id_usuario"))).forEach((sellerId, sold) -> {
            if (sellerId == auth.id()) return;
            String names = sold.stream().map(item -> "«" + item.get("nombre") + "»").collect(Collectors.joining(", "));
            notifier.user(sellerId, "pedido", "Nuevo pedido #" + orderId, "@" + auth.usuario() + " ha comprado " + names + ".", "/pedidos-recibidos");
        });
        return ResponseEntity.status(201).body(Map.of("order", db.find("pedidos", orderId), "message", "Pedido creado."));
    }

    @PatchMapping("/orders/{id:\\d+}/status")
    @Transactional
    public Object updateStatus(@PathVariable long id, AuthUser auth, Input input) {
        boolean isAdmin = auth.isAdmin();
        abortUnless(isAdmin || auth.isOneOf(3, 5), 403, "No tienes permiso para cambiar el estado.");
        Validation v = new Validation(input, db);
        if (isAdmin) v.field("estado").required().in("preparando", "enviado", "entregado", "cancelado");
        else v.field("estado").required().in("preparando", "enviado", "entregado");
        String state = v.validate().get("estado").toString();

        Map<String, Object> order = db.first("SELECT * FROM pedidos WHERE id = ? FOR UPDATE", id);
        abortUnless(order != null, 404);
        List<Long> detailIds = isAdmin
            ? db.ids("SELECT id FROM detalles_pedido WHERE id_pedido = ?", id)
            : db.ids("SELECT d.id FROM detalles_pedido AS d JOIN productos AS p ON p.id = d.id_producto WHERE d.id_pedido = ? AND p.id_usuario = ?", id, auth.id());
        abortUnless(isAdmin || !detailIds.isEmpty(), 403, "Este pedido no contiene productos tuyos.");
        String current = String.valueOf(order.get("estado"));
        abortIf(current.equals("cancelado"), 422, "El pedido está cancelado.");
        if (isAdmin && state.equals("cancelado")) {
            cancelOrder(order, auth);
            return db.find("pedidos", id);
        }
        // El estado de envío es de cada vendedor: administración no puede pisar estados distintos con un solo cambio.
        abortIf(isAdmin && db.count("SELECT COUNT(DISTINCT estado_envio) FROM detalles_pedido WHERE id_pedido = ?", id) > 1,
            422, "Los artículos están en estados distintos porque cada vendedor gestiona los suyos. Administración solo puede cancelar este pedido.");
        if (!state.equals("entregado") && !detailIds.isEmpty()) {
            abortIf(db.exists("SELECT 1 FROM detalles_pedido WHERE id IN (" + Db.marks(detailIds) + ") AND recibido_confirmado_at IS NOT NULL", detailIds.toArray()),
                422, "El comprador ya confirmó la recepción; no se puede retroceder el estado.");
        }
        if (!detailIds.isEmpty()) {
            List<Object> changedArgs = new ArrayList<>(detailIds);
            changedArgs.add(state);
            List<String> changed = db.list("SELECT COALESCE(nombre_producto, 'Artículo') AS nombre FROM detalles_pedido WHERE id IN (" + Db.marks(detailIds) + ") AND estado_envio <> ?", changedArgs.toArray())
                .stream().map(row -> "«" + row.get("nombre") + "»").toList();
            long buyerId = Users.id(order, "id_usuario");
            if (!changed.isEmpty() && buyerId != auth.id()) {
                notifier.user(buyerId, "pedido", "Tu pedido #" + id + " ha cambiado", String.join(", ", changed) + ": " + STATE_LABELS.get(state) + ".", "/pedidos");
            }
            List<Object> args = new ArrayList<>();
            args.add(state);
            args.addAll(detailIds);
            // Si el vendedor cambia el estado después de entregarlo, la confirmación deja de ser válida.
            String confirmation = state.equals("entregado") ? "recibido_confirmado_at" : "NULL";
            db.exec("UPDATE detalles_pedido SET estado_envio = ?, recibido_confirmado_at = " + confirmation + " WHERE id IN (" + Db.marks(detailIds) + ")", args.toArray());
        }
        syncOrderStatus(id);
        return db.find("pedidos", id);
    }

    /** El comprador confirma la recepción de un artículo concreto. */
    @PatchMapping("/orders/{id:\\d+}/items/{detail:\\d+}/confirm-received")
    @Transactional
    public Object confirmReceived(@PathVariable long id, @PathVariable long detail, AuthUser auth) {
        Map<String, Object> order = db.first("SELECT * FROM pedidos WHERE id = ? FOR UPDATE", id);
        abortUnless(order != null, 404);
        abortUnless(Users.id(order, "id_usuario") == auth.id() || auth.isAdmin(), 403, "Solo el comprador puede confirmar la recepción.");
        abortIf("cancelado".equals(order.get("estado")), 422, "El pedido está cancelado.");
        Map<String, Object> item = db.first("SELECT * FROM detalles_pedido WHERE id = ? AND id_pedido = ?", detail, id);
        abortUnless(item != null, 404, "El artículo no pertenece a este pedido.");
        abortUnless("entregado".equals(item.get("estado_envio")), 422, "El vendedor todavía no ha marcado este artículo como entregado.");
        abortIf(item.get("recibido_confirmado_at") != null, 422, "La recepción de este artículo ya está confirmada.");
        db.exec("UPDATE detalles_pedido SET recibido_confirmado_at = ? WHERE id = ?", LocalDateTime.now(), detail);
        syncOrderStatus(id);
        Long sellerId = db.value("SELECT p.id_usuario FROM productos AS p WHERE p.id = ?", Long.class, item.get("id_producto"));
        if (sellerId != null && sellerId != auth.id()) {
            notifier.user(sellerId, "pedido", "Recepción confirmada", "@" + auth.usuario() + " ha recibido «" + item.get("nombre_producto") + "» del pedido #" + id + ".", "/pedidos-recibidos");
        }
        return db.find("pedidos", id);
    }

    static String overallStatus(List<Map<String, Object>> products, String fallback) {
        if ("cancelado".equals(fallback)) return "cancelado";
        if (products.isEmpty()) return fallback;
        if (products.stream().allMatch(p -> shipping(p).equals("entregado") && p.get("recibido_confirmado_at") != null)) return "entregado";
        if (products.stream().allMatch(p -> shipping(p).equals("entregado"))) return "pendiente_confirmacion";
        if (products.stream().anyMatch(p -> shipping(p).equals("entregado"))) return "entrega_parcial";
        if (products.stream().anyMatch(p -> shipping(p).equals("enviado"))) return "enviado";
        return "preparando";
    }

    private static String shipping(Map<String, Object> product) {
        Object state = product.get("estado_envio");
        return state == null ? "preparando" : state.toString();
    }

    private void syncOrderStatus(long id) {
        Map<String, Object> order = db.find("pedidos", id);
        if (order == null || "cancelado".equals(order.get("estado"))) return;
        List<Map<String, Object>> products = db.list("SELECT estado_envio, recibido_confirmado_at FROM detalles_pedido WHERE id_pedido = ?", id);
        db.exec("UPDATE pedidos SET estado = ? WHERE id = ?", overallStatus(products, String.valueOf(order.get("estado"))), id);
    }

    @PatchMapping("/orders/{id:\\d+}")
    public Object update(@PathVariable long id, AuthUser auth, Input input) {
        abortUnless(auth.isAdmin(), 403);
        Validation v = new Validation(input, db);
        v.field("nombre").sometimes().required().string().max(255);
        v.field("direccion").sometimes().required().string().max(255);
        v.field("telefono").sometimes().required().string().max(32);
        Map<String, Object> data = v.validate();
        abortUnless(db.exists("SELECT 1 FROM pedidos WHERE id = ?", id), 404);
        db.update("pedidos", data, id);
        return db.find("pedidos", id);
    }

    @DeleteMapping("/orders/{id:\\d+}")
    @Transactional
    public Object destroy(@PathVariable long id, AuthUser auth) {
        abortUnless(auth.isAdmin(), 403);
        Map<String, Object> order = db.first("SELECT * FROM pedidos WHERE id = ? FOR UPDATE", id);
        abortUnless(order != null, 404);
        if (!"cancelado".equals(order.get("estado"))) restock(id);
        db.exec("DELETE FROM detalles_pedido WHERE id_pedido = ?", id);
        db.exec("DELETE FROM pedidos WHERE id = ?", id);
        return Map.of("message", "Pedido eliminado.");
    }

    @GetMapping("/orders/{id:\\d+}/products/{product:\\d+}/download")
    public ResponseEntity<Resource> download(@PathVariable long id, @PathVariable long product, AuthUser auth) {
        Map<String, Object> order = db.findOrFail("pedidos", id);
        abortUnless(Users.id(order, "id_usuario") == auth.id() || auth.isAdmin(), 403);
        abortIf("cancelado".equals(order.get("estado")), 403, "El pedido está cancelado.");
        String delivery = db.value("SELECT d.estado_envio FROM detalles_pedido AS d JOIN productos AS p ON p.id = d.id_producto WHERE d.id_pedido = ? AND p.id = ? AND p.id_tipo = 2", String.class, id, product);
        abortUnless(delivery != null, 404);
        // Cada artículo digital se libera cuando su vendedor lo entrega, sin depender del resto del pedido.
        abortUnless(auth.isAdmin() || delivery.equals("entregado"), 403, "El vendedor todavía no ha entregado este artículo.");
        String file = db.value("SELECT archivos FROM productos WHERE id = ?", String.class, product);
        boolean available = file != null && !file.isBlank() && !file.equals("Sin archivos") && storage.exists(StorageService.Disk.LOCAL, file);
        if (!available) throw new ApiException(404, "El archivo digital no está disponible.");
        Path path = storage.path(StorageService.Disk.LOCAL, file);
        MediaType type = MediaTypeFactory.getMediaType(path.getFileName().toString()).orElse(MediaType.APPLICATION_OCTET_STREAM);
        return ResponseEntity.ok()
            .contentType(type)
            .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(path.getFileName().toString()).build().toString())
            .body(new FileSystemResource(path));
    }

    @PostMapping("/orders/{id:\\d+}/cancel")
    @Transactional
    public Object refund(@PathVariable long id, AuthUser auth) {
        Map<String, Object> order = db.first("SELECT * FROM pedidos WHERE id = ? FOR UPDATE", id);
        abortUnless(order != null, 404);
        abortUnless(Users.id(order, "id_usuario") == auth.id() || auth.isAdmin(), 403);
        abortIf("entregado".equals(order.get("estado")), 422, "No se puede cancelar un pedido entregado.");
        abortIf("cancelado".equals(order.get("estado")), 422, "Este pedido ya está cancelado.");
        cancelOrder(order, auth);
        return Map.of("message", "Pedido cancelado y artículos devueltos al inventario.");
    }

    /**
     * El comprador solo cancela mientras nada haya salido; administración, mientras nadie haya confirmado la recepción.
     * Avisa a la otra parte y devuelve al inventario lo que no se ha entregado.
     */
    private void cancelOrder(Map<String, Object> order, AuthUser auth) {
        long id = Users.id(order, "id");
        abortIf(db.exists("SELECT 1 FROM detalles_pedido WHERE id_pedido = ? AND recibido_confirmado_at IS NOT NULL", id),
            422, "Este pedido tiene artículos con la recepción confirmada y ya no se puede cancelar.");
        abortUnless(auth.isAdmin() || !db.exists("SELECT 1 FROM detalles_pedido WHERE id_pedido = ? AND estado_envio <> 'preparando'", id),
            422, "Algún artículo ya se ha enviado o entregado, así que el pedido ya no se puede cancelar.");
        restock(id);
        db.exec("UPDATE pedidos SET estado = 'cancelado' WHERE id = ?", id);
        for (Long sellerId : db.ids("SELECT DISTINCT p.id_usuario FROM detalles_pedido AS d JOIN productos AS p ON p.id = d.id_producto WHERE d.id_pedido = ?", id)) {
            if (sellerId != auth.id()) notifier.user(sellerId, "pedido", "Pedido #" + id + " cancelado", "El pedido se ha cancelado. Los artículos sin entregar han vuelto a tu inventario.", "/pedidos-recibidos");
        }
        long buyerId = Users.id(order, "id_usuario");
        if (buyerId != auth.id()) notifier.user(buyerId, "pedido", "Pedido #" + id + " cancelado", "Administración ha cancelado tu pedido.", "/pedidos");
    }

    /** Devuelve al inventario una unidad por cada artículo que no se ha entregado. */
    private void restock(long orderId) {
        for (Long productId : db.ids("SELECT id_producto FROM detalles_pedido WHERE id_pedido = ? AND estado_envio <> 'entregado'", orderId)) {
            db.exec("UPDATE productos SET cantidad = cantidad + 1 WHERE id = ?", productId);
        }
    }
}
