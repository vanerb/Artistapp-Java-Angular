package com.artistapp;

import static org.assertj.core.api.Assertions.assertThat;

import com.artistapp.security.TokenService;
import com.artistapp.service.StorageService;
import com.artistapp.support.Db;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import tools.jackson.databind.json.JsonMapper;

/** Pedidos con varios vendedores contra la API completa, sobre H2 en modo MySQL. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
    "spring.datasource.url=jdbc:h2:mem:orders;MODE=MySQL;DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE;DB_CLOSE_DELAY=-1",
    "spring.datasource.username=sa",
    "server.address=127.0.0.1",
    "artistapp.storage-path=target/test-storage"
})
class OrderFlowTest {
    private static final AtomicInteger SEQUENCE = new AtomicInteger();

    @LocalServerPort int port;
    @Autowired Db db;
    @Autowired TokenService tokens;
    @Autowired StorageService storage;
    @Autowired JsonMapper json;

    private final HttpClient http = HttpClient.newHttpClient();
    private long buyerId, sellerAId, sellerBId;
    private String buyer, sellerA, sellerB, admin;
    private long productA, productB, digitalA;

    @BeforeEach
    void seed() {
        buyerId = user(7);
        sellerAId = user(5);
        sellerBId = user(3);
        buyer = tokens.create(buyerId);
        sellerA = tokens.create(sellerAId);
        sellerB = tokens.create(sellerBId);
        admin = tokens.create(user(1));
        productA = product(sellerAId, "Lámina A", "10.00", 1, "Sin archivos");
        productB = product(sellerBId, "Lámina B", "20.00", 1, "Sin archivos");
        String file = "digital/test-" + SEQUENCE.incrementAndGet() + ".txt";
        storage.put(StorageService.Disk.LOCAL, file, "obra".getBytes(StandardCharsets.UTF_8));
        digitalA = product(sellerAId, "Digital A", "5.00", 2, file);
    }

    @Test
    void statusIsDerivedFromEachSellersItems() {
        long order = order(productA, productB);
        assertThat(buyerStatus(order)).isEqualTo("preparando");

        setStatus(sellerA, order, "enviado", 200);
        assertThat(buyerStatus(order)).isEqualTo("enviado");
        assertThat(sellerStatus(sellerB, order)).isEqualTo("preparando");

        setStatus(sellerA, order, "entregado", 200);
        assertThat(buyerStatus(order)).isEqualTo("entrega_parcial");
        assertThat(sellerStatus(sellerA, order)).isEqualTo("pendiente_confirmacion");

        confirm(order, productA, 200);
        setStatus(sellerA, order, "preparando", 422);
        setStatus(sellerB, order, "entregado", 200);
        assertThat(buyerStatus(order)).isEqualTo("pendiente_confirmacion");

        confirm(order, productB, 200);
        assertThat(buyerStatus(order)).isEqualTo("entregado");
    }

    @Test
    void sellerCannotChangeOrdersWithoutTheirProducts() {
        long order = order(productA);
        setStatus(sellerB, order, "enviado", 403);
    }

    @Test
    void buyerCanOnlyCancelWhileNothingHasShipped() {
        long order = order(productA, productB);
        assertThat(call(buyer, "POST", "/orders/" + order + "/cancel", null).status).isEqualTo(200);
        assertThat(stock(productA)).isEqualTo(5);
        assertThat(stock(productB)).isEqualTo(5);

        long shipped = order(productA, productB);
        setStatus(sellerA, shipped, "enviado", 200);
        assertThat(call(buyer, "POST", "/orders/" + shipped + "/cancel", null).status).isEqualTo(422);
        assertThat(buyerStatus(shipped)).isEqualTo("enviado");
    }

    @Test
    void adminCancelKeepsDeliveredItemsOutOfStockAndRespectsConfirmedReceipts() {
        long order = order(productA, productB);
        setStatus(sellerA, order, "entregado", 200);
        setStatus(admin, order, "cancelado", 200);
        assertThat(stock(productA)).isEqualTo(4);
        assertThat(stock(productB)).isEqualTo(5);

        long confirmed = order(productB);
        setStatus(sellerB, confirmed, "entregado", 200);
        confirm(confirmed, productB, 200);
        setStatus(admin, confirmed, "cancelado", 422);
    }

    @Test
    void adminCannotOverwriteDifferentSellerStates() {
        long order = order(productA, productB);
        setStatus(sellerA, order, "entregado", 200);
        setStatus(admin, order, "enviado", 422);
        assertThat(item(order, productA).get("estado_envio")).isEqualTo("entregado");

        long same = order(productA, productB);
        setStatus(admin, same, "enviado", 200);
        assertThat(item(same, productB).get("estado_envio")).isEqualTo("enviado");
    }

    @Test
    void orderHistoryKeepsPriceAndNameAtPurchaseTime() {
        long order = order(productB);
        db.exec("UPDATE productos SET precio = 99, nombre = 'Otro' WHERE id = ?", productB);
        Map<String, Object> line = item(order, productB);
        assertThat(line.get("nombre")).isEqualTo("Lámina B");
        assertThat(((Number) line.get("precio")).doubleValue()).isEqualTo(20.0);
        assertThat(((Number) sellerOrder(sellerB, order).get("total_vendedor")).doubleValue()).isEqualTo(20.0);
        assertThat(buyerOrder(order).get("created_at")).isNotNull();
    }

    @Test
    void digitalItemIsReleasedByItsOwnDeliveryEvenIfAnotherSellerIsPending() {
        long order = order(digitalA, productB);
        String path = "/orders/" + order + "/products/" + digitalA + "/download";
        assertThat(call(buyer, "GET", path, null).status).isEqualTo(403);

        setStatus(sellerA, order, "entregado", 200);
        Response download = call(buyer, "GET", path, null);
        assertThat(download.status).isEqualTo(200);
        assertThat(download.body).isEqualTo("obra");
        assertThat(buyerStatus(order)).isEqualTo("entrega_parcial");
        assertThat(call(sellerB, "GET", path, null).status).isEqualTo(403);
    }

    @Test
    void deletingADeliveredOrderDoesNotReturnStock() {
        long order = order(productB);
        setStatus(sellerB, order, "entregado", 200);
        confirm(order, productB, 200);
        assertThat(call(admin, "DELETE", "/orders/" + order, null).status).isEqualTo(200);
        assertThat(stock(productB)).isEqualTo(4);
    }

    @Test
    void sellerWithPendingSalesCannotBeDeletedAndFinishedSalesStayInHistory() {
        long order = order(productA, productB);
        assertThat(call(admin, "DELETE", "/admin/users/" + sellerAId, null).status).isEqualTo(422);

        setStatus(sellerA, order, "entregado", 200);
        confirm(order, productA, 200);
        assertThat(call(admin, "DELETE", "/admin/users/" + sellerAId, null).status).isEqualTo(200);

        Map<String, Object> line = item(order, productA);
        assertThat(line.get("nombre")).isEqualTo("Lámina A");
        assertThat(((Number) line.get("precio")).doubleValue()).isEqualTo(10.0);
        assertThat(line.get("imagen")).isNull();
        assertThat(buyerStatus(order)).isEqualTo("entrega_parcial");
    }

    @Test
    void ordersNotifyTheOtherParty() {
        long order = order(productA, productB);
        assertThat(notifications(sellerA)).anyMatch(text -> text.contains("Nuevo pedido #" + order) && text.contains("Lámina A") && !text.contains("Lámina B"));
        assertThat(notifications(sellerB)).anyMatch(text -> text.contains("Nuevo pedido #" + order));

        setStatus(sellerA, order, "enviado", 200);
        assertThat(notifications(buyer)).anyMatch(text -> text.contains("Tu pedido #" + order) && text.contains("Enviado"));

        setStatus(sellerA, order, "entregado", 200);
        confirm(order, productA, 200);
        assertThat(notifications(sellerA)).anyMatch(text -> text.contains("Recepción confirmada"));

        assertThat(call(admin, "POST", "/orders/" + order("cancel", productB) + "/cancel", null).status).isEqualTo(200);
        assertThat(notifications(buyer)).anyMatch(text -> text.contains("Administración ha cancelado"));
    }

    @Test
    void checkoutNamesTheSoldOutProduct() {
        call(buyer, "POST", "/cart/items/" + productA, null);
        db.exec("UPDATE productos SET cantidad = 0 WHERE id = ?", productA);
        Response response = call(buyer, "POST", "/checkout", Map.of("nombre", "V", "direccion", "D", "telefono", "600000000"));
        assertThat(response.status).isEqualTo(422);
        assertThat(response.body).contains("Lámina A");
    }

    @Test
    void uploadsMustReallyBeImages() throws Exception {
        assertThat(upload("x.svg", "<svg xmlns=\"http://www.w3.org/2000/svg\"><script>alert(1)</script></svg>".getBytes(StandardCharsets.UTF_8))).isEqualTo(422);
        assertThat(upload("x.jpg", "no soy una imagen".getBytes(StandardCharsets.UTF_8))).isEqualTo(422);
        ByteArrayOutputStream png = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(4, 4, BufferedImage.TYPE_INT_RGB), "png", png);
        assertThat(upload("x.png", png.toByteArray())).isEqualTo(201);
    }

    @Test
    void sellerCannotBuyTheirOwnProduct() {
        Response response = call(sellerA, "POST", "/cart/items/" + productA, null);
        assertThat(response.status).isEqualTo(422);
        assertThat(response.body).contains("propios productos");
    }

    @Test
    void eventRulesProtectDatesAndParticipants() {
        Map<String, Object> event = new LinkedHashMap<>();
        event.put("nombre", "E");
        event.put("ubicacion", "U");
        event.put("fecha_inicio", "2030-01-10");
        event.put("fecha_fin", "2030-01-12");
        event.put("id_usuario", sellerBId);
        long id = db.insert("eventos", event);
        assertThat(call(sellerB, "PATCH", "/events/" + id, Map.of("fecha_fin", "2030-01-01")).status).isEqualTo(422);
        assertThat(call(sellerB, "PATCH", "/events/" + id, Map.of("fecha_fin", "2030-01-20")).status).isEqualTo(200);
        assertThat(call(buyer, "GET", "/events/" + id + "/participants", null).status).isEqualTo(403);
        assertThat(call(sellerB, "GET", "/events/" + id + "/participants", null).status).isEqualTo(200);
        assertThat(call(admin, "GET", "/events/" + id + "/participants", null).status).isEqualTo(200);

        db.exec("INSERT INTO event_chat_messages (event_id, user_id, body) VALUES (?, ?, 'hola')", id, sellerBId);
        assertThat(call(sellerB, "DELETE", "/events/" + id, null).status).isEqualTo(200);
        assertThat(db.count("SELECT COUNT(*) FROM event_chat_messages WHERE event_id = ?", id)).isZero();
    }

    @Test
    void deletingContentLeavesNoOrphans() {
        Map<String, Object> post = new LinkedHashMap<>();
        post.put("titulo", "t");
        post.put("descripcion", "d");
        post.put("id_categoria", 1);
        post.put("id_usuario", sellerAId);
        long postId = db.insert("publicaciones", post);
        assertThat(call(buyer, "POST", "/publications/" + postId + "/comments", Map.of("body", "c")).status).isEqualTo(201);
        assertThat(call(sellerA, "DELETE", "/publications/" + postId, null).status).isEqualTo(200);
        assertThat(db.count("SELECT COUNT(*) FROM publication_comments WHERE publication_id = ?", postId)).isZero();

        assertThat(call(buyer, "POST", "/direct-messages/" + sellerAId, Map.of("body", "hola")).status).isEqualTo(201);
        assertThat(call(admin, "DELETE", "/admin/users/" + sellerAId, null).status).isEqualTo(200);
        assertThat(db.count("SELECT COUNT(*) FROM direct_messages WHERE recipient_id = ?", sellerAId)).isZero();
        assertThat(db.count("SELECT COUNT(*) FROM app_notifications WHERE user_id = ?", sellerAId)).isZero();
    }

    @Test
    void expiredSessionsStopWorking() {
        assertThat(call(buyer, "GET", "/auth/me", null).status).isEqualTo(200);
        long tokenId = Long.parseLong(buyer.substring(0, buyer.indexOf('|')));
        db.exec("UPDATE personal_access_tokens SET expires_at = ? WHERE id = ?", java.time.LocalDateTime.now().minusMinutes(1), tokenId);
        assertThat(call(buyer, "GET", "/auth/me", null).status).isEqualTo(401);

        long legacy = Long.parseLong(sellerA.substring(0, sellerA.indexOf('|')));
        db.exec("UPDATE personal_access_tokens SET expires_at = NULL, created_at = ? WHERE id = ?", java.time.LocalDateTime.now().minusDays(31), legacy);
        assertThat(call(sellerA, "GET", "/auth/me", null).status).isEqualTo(401);
    }

    @Test
    void replacingOrDeletingAnImageRemovesTheOldFile() throws Exception {
        ByteArrayOutputStream png = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(4, 4, BufferedImage.TYPE_INT_RGB), "png", png);
        Map<String, Object> created = json.readValue(multipart("/publications", Map.of("titulo", "t", "descripcion", "d", "id_categoria", "1"), "x.png", png.toByteArray()).body(), Map.class);
        String first = (String) created.get("imagen");
        long id = ((Number) created.get("id")).longValue();
        assertThat(storage.exists(StorageService.Disk.PUBLIC, first)).isTrue();

        HttpResponse<String> patched = multipart("/publications/" + id, Map.of("_method", "PATCH"), "y.png", png.toByteArray());
        assertThat(patched.statusCode()).isEqualTo(200);
        String second = (String) json.readValue(patched.body(), Map.class).get("imagen");
        assertThat(second).isNotEqualTo(first);
        assertThat(storage.exists(StorageService.Disk.PUBLIC, first)).isFalse();
        assertThat(storage.exists(StorageService.Disk.PUBLIC, second)).isTrue();

        assertThat(call(sellerA, "DELETE", "/publications/" + id, null).status).isEqualTo(200);
        assertThat(storage.exists(StorageService.Disk.PUBLIC, second)).isFalse();
    }

    // ---------------------------------------------------------------- utilidades

    private long user(int type) {
        int n = SEQUENCE.incrementAndGet();
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("nombre", "N");
        row.put("apellidos", "A");
        row.put("usuario", "u" + n);
        row.put("correo", "u" + n + "@example.test");
        row.put("contrasena", "x");
        row.put("id_tipo", type);
        return db.insert("usuarios", row);
    }

    private long product(long seller, String name, String price, int type, String files) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("nombre", name);
        row.put("descripcion", "d");
        row.put("precio", new java.math.BigDecimal(price));
        row.put("cantidad", 5);
        row.put("imagen", "uploads/x.jpg");
        row.put("id_tipo", type);
        row.put("id_usuario", seller);
        row.put("archivos", files);
        return db.insert("productos", row);
    }

    private long order(long... products) {
        return order("order", products);
    }

    private long order(String label, long... products) {
        for (long product : products) assertThat(call(buyer, "POST", "/cart/items/" + product, null).status).isEqualTo(201);
        Response response = call(buyer, "POST", "/checkout", Map.of("nombre", label, "direccion", "Calle", "telefono", "600000000"));
        assertThat(response.status).isEqualTo(201);
        return ((Number) ((Map<?, ?>) response.map().get("order")).get("id")).longValue();
    }

    private void setStatus(String token, long order, String state, int expected) {
        assertThat(call(token, "PATCH", "/orders/" + order + "/status", Map.of("estado", state)).status).isEqualTo(expected);
    }

    private void confirm(long order, long product, int expected) {
        Object detail = item(order, product).get("detalle_id");
        assertThat(call(buyer, "PATCH", "/orders/" + order + "/items/" + detail + "/confirm-received", null).status).isEqualTo(expected);
    }

    private int stock(long product) {
        return db.value("SELECT cantidad FROM productos WHERE id = ?", Integer.class, product);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> find(String token, String path, long order) {
        List<Map<String, Object>> rows = (List<Map<String, Object>>) call(token, "GET", path, null).map().get("data");
        return rows.stream().filter(row -> ((Number) row.get("id")).longValue() == order).findFirst().orElseThrow();
    }

    private Map<String, Object> buyerOrder(long order) {
        return find(buyer, "/orders", order);
    }

    private Map<String, Object> sellerOrder(String token, long order) {
        return find(token, "/orders/received", order);
    }

    private Object buyerStatus(long order) {
        return buyerOrder(order).get("estado");
    }

    private Object sellerStatus(String token, long order) {
        return sellerOrder(token, order).get("estado");
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> item(long order, long product) {
        return ((List<Map<String, Object>>) buyerOrder(order).get("productos")).stream()
            .filter(row -> ((Number) row.get("id")).longValue() == product).findFirst().orElseThrow();
    }

    @SuppressWarnings("unchecked")
    private List<String> notifications(String token) {
        Map<String, Object> page = (Map<String, Object>) call(token, "GET", "/notifications", null).map().get("data");
        return ((List<Map<String, Object>>) page.get("data")).stream().map(row -> row.get("title") + " " + row.get("message")).toList();
    }

    private int upload(String filename, byte[] content) throws Exception {
        return multipart("/publications", Map.of("titulo", "t", "descripcion", "d", "id_categoria", "1"), filename, content).statusCode();
    }

    private HttpResponse<String> multipart(String path, Map<String, String> fields, String filename, byte[] content) throws Exception {
        String boundary = "----test" + SEQUENCE.incrementAndGet();
        ByteArrayOutputStream body = new ByteArrayOutputStream();
        for (Map.Entry<String, String> field : fields.entrySet()) {
            body.write(("--" + boundary + "\r\nContent-Disposition: form-data; name=\"" + field.getKey() + "\"\r\n\r\n" + field.getValue() + "\r\n").getBytes(StandardCharsets.UTF_8));
        }
        body.write(("--" + boundary + "\r\nContent-Disposition: form-data; name=\"imagen\"; filename=\"" + filename + "\"\r\nContent-Type: application/octet-stream\r\n\r\n").getBytes(StandardCharsets.UTF_8));
        body.write(content);
        body.write(("\r\n--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + "/api" + path))
            .header("Authorization", "Bearer " + sellerA)
            .header("Content-Type", "multipart/form-data; boundary=" + boundary)
            .POST(HttpRequest.BodyPublishers.ofByteArray(body.toByteArray())).build();
        return http.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private Response call(String token, String method, String path, Map<String, ?> body) {
        try {
            HttpRequest.Builder request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + "/api" + path)).header("Authorization", "Bearer " + token);
            if (body == null) {
                request.method(method, HttpRequest.BodyPublishers.noBody());
            } else {
                request.header("Content-Type", "application/json").method(method, HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body)));
            }
            HttpResponse<String> response = http.send(request.build(), HttpResponse.BodyHandlers.ofString());
            return new Response(response.statusCode(), response.body());
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    private final class Response {
        final int status;
        final String body;

        Response(int status, String body) {
            this.status = status;
            this.body = body;
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> map() {
            return json.readValue(body, Map.class);
        }
    }
}
