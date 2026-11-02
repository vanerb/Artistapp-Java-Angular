package com.artistapp.web;

import static com.artistapp.support.ApiException.abortIf;
import static com.artistapp.support.ApiException.abortUnless;

import com.artistapp.security.AuthUser;
import com.artistapp.support.Db;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    /** Gastos de envío cuando la cesta contiene algún producto físico. */
    static final BigDecimal SHIPPING = new BigDecimal("4.0");

    private final Db db;

    public CartController(Db db) {
        this.db = db;
    }

    private long cartId(long userId) {
        Long id = db.value("SELECT id FROM cesta WHERE id_usuario = ?", Long.class, userId);
        return id != null ? id : db.insert("cesta", Map.of("id_usuario", userId));
    }

    @GetMapping
    public Object show(AuthUser auth) {
        long cartId = cartId(auth.id());
        List<Map<String, Object>> items = db.list("SELECT p.*, cp.id AS cart_item_id FROM cesta_producto AS cp JOIN productos AS p ON p.id = cp.id_producto WHERE cp.id_cesta = ? ORDER BY cp.id DESC", cartId);
        // Nunca se exponen las rutas privadas del original ni del archivo digital.
        items.forEach(item -> { item.remove("imagen_original"); item.remove("archivos"); });
        BigDecimal subtotal = subtotal(items);
        BigDecimal shipping = shipping(items);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("items", items);
        body.put("subtotal", subtotal.doubleValue());
        body.put("envio", shipping.doubleValue());
        body.put("total", subtotal.add(shipping).doubleValue());
        return body;
    }

    static BigDecimal subtotal(List<Map<String, Object>> items) {
        return items.stream().map(item -> new BigDecimal(item.get("precio").toString())).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    static BigDecimal shipping(List<Map<String, Object>> items) {
        return items.stream().anyMatch(item -> Users.id(item, "id_tipo") == 1) ? SHIPPING : BigDecimal.ZERO;
    }

    @PostMapping("/items/{product:\\d+}")
    @Transactional
    public ResponseEntity<Object> add(@PathVariable long product, AuthUser auth) {
        Map<String, Object> item = db.first("SELECT * FROM productos WHERE id = ? FOR UPDATE", product);
        abortUnless(item != null, 404);
        abortIf(Users.id(item, "cantidad") < 1, 422, "Este producto está agotado.");
        long cartId = cartId(auth.id());
        boolean exists = db.exists("SELECT 1 FROM cesta_producto WHERE id_cesta = ? AND id_producto = ?", cartId, product);
        if (!exists) db.exec("INSERT INTO cesta_producto (id_cesta, id_producto) VALUES (?, ?)", cartId, product);
        return ResponseEntity.status(exists ? 200 : 201).body(Map.of("message", exists ? "El producto ya estaba en la cesta." : "Producto añadido."));
    }

    @DeleteMapping("/items/{product:\\d+}")
    public Object remove(@PathVariable long product, AuthUser auth) {
        Long cart = db.value("SELECT id FROM cesta WHERE id_usuario = ?", Long.class, auth.id());
        if (cart != null) db.exec("DELETE FROM cesta_producto WHERE id_cesta = ? AND id_producto = ?", cart, product);
        return show(auth);
    }

    @DeleteMapping
    public Object clear(AuthUser auth) {
        Long cart = db.value("SELECT id FROM cesta WHERE id_usuario = ?", Long.class, auth.id());
        if (cart != null) db.exec("DELETE FROM cesta_producto WHERE id_cesta = ?", cart);
        return Map.of("message", "Cesta vaciada.");
    }
}
