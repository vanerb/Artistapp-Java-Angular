package com.artistapp.web;

import static com.artistapp.support.ApiException.abortIf;
import static com.artistapp.support.ApiException.abortUnless;

import com.artistapp.security.AuthUser;
import com.artistapp.security.Passwords;
import com.artistapp.security.TokenService;
import com.artistapp.service.StorageService;
import com.artistapp.support.Db;
import com.artistapp.support.Input;
import com.artistapp.support.Validation;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final Db db;
    private final Passwords passwords;
    private final StorageService storage;
    private final TokenService tokens;

    public AdminController(Db db, Passwords passwords, StorageService storage, TokenService tokens) {
        this.db = db;
        this.passwords = passwords;
        this.storage = storage;
        this.tokens = tokens;
    }

    @GetMapping("/summary")
    public Object summary(AuthUser auth) {
        abortUnless(auth.isAdmin(), 403);
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("usuarios", db.count("SELECT COUNT(*) FROM usuarios"));
        summary.put("publicaciones", db.count("SELECT COUNT(*) FROM publicaciones"));
        summary.put("productos", db.count("SELECT COUNT(*) FROM productos"));
        summary.put("eventos", db.count("SELECT COUNT(*) FROM eventos"));
        summary.put("pedidos_pendientes", db.count("SELECT COUNT(*) FROM pedidos WHERE estado NOT IN ('entregado', 'cancelado')"));
        summary.put("informes_pendientes", db.count("SELECT COUNT(*) FROM informes WHERE estado NOT IN ('resuelta', 'descartada')"));
        BigDecimal sales = db.value("SELECT COALESCE(SUM(pago), 0) FROM pedidos WHERE estado NOT IN ('cancelado')", BigDecimal.class);
        summary.put("ventas", sales == null ? 0 : sales);
        return summary;
    }

    @GetMapping("/users")
    public Object users(HttpServletRequest request, AuthUser auth) {
        abortUnless(auth.isAdmin(), 403);
        return db.paginate(request, 40, "SELECT " + Users.PUBLIC_COLUMNS + " FROM usuarios ORDER BY id DESC");
    }

    @PostMapping("/users")
    public ResponseEntity<Object> storeUser(AuthUser auth, Input input) {
        abortUnless(auth.isAdmin(), 403);
        Validation v = new Validation(input, db);
        v.field("nombre").required().string().max(100);
        v.field("apellidos").required().string().max(140);
        v.field("usuario").required().string().max(100).unique("usuarios", "usuario");
        v.field("correo").required().email().max(240).unique("usuarios", "correo");
        v.field("id_tipo").required().integer().exists("tipo_usuario", "id");
        v.field("password").required().string().min(8).confirmed().regex(Validation.STRONG_PASSWORD, Users.PASSWORD_MESSAGE);
        v.field("imagen").nullable().image().max(8192);
        v.field("biografia").nullable().string().max(255);
        Map<String, Object> data = v.validate();
        data.put("contrasena", passwords.hash((String) data.remove("password")));
        data.put("imagen", data.get("imagen") instanceof MultipartFile file ? storage.store(file, "uploads/usuarios", StorageService.Disk.PUBLIC) : "media/no-user.png");
        if (data.get("biografia") == null) data.put("biografia", "");
        long id = db.insert("usuarios", data);
        return ResponseEntity.status(201).body(db.first("SELECT " + Users.PUBLIC_COLUMNS + " FROM usuarios WHERE id = ?", id));
    }

    @PatchMapping("/users/{id:\\d+}")
    public Object updateUser(@PathVariable long id, AuthUser auth, Input input) {
        abortUnless(auth.isAdmin(), 403);
        abortUnless(db.exists("SELECT 1 FROM usuarios WHERE id = ?", id), 404);
        Validation v = new Validation(input, db);
        v.field("nombre").sometimes().required().string().max(255);
        v.field("apellidos").sometimes().required().string().max(255);
        v.field("usuario").sometimes().required().string().max(255).unique("usuarios", "usuario", id);
        v.field("correo").sometimes().required().email().max(255).unique("usuarios", "correo", id);
        v.field("id_tipo").sometimes().integer().exists("tipo_usuario", "id");
        v.field("biografia").sometimes().nullable().string().max(255);
        v.field("imagen").sometimes().nullable().image().max(8192);
        v.field("password").sometimes().nullable().string().min(8).confirmed().regex(Validation.STRONG_PASSWORD, Users.PASSWORD_MESSAGE);
        Map<String, Object> data = v.validate();
        Object password = data.remove("password");
        if (password != null) data.put("contrasena", passwords.hash(password.toString()));
        if (data.get("imagen") instanceof MultipartFile file) data.put("imagen", storage.store(file, "uploads/usuarios", StorageService.Disk.PUBLIC));
        else data.remove("imagen");
        if (data.containsKey("id_tipo") && data.get("id_tipo") == null) data.remove("id_tipo");
        if (data.containsKey("biografia") && data.get("biografia") == null) data.put("biografia", "");
        db.update("usuarios", data, id);
        return db.first("SELECT " + Users.PUBLIC_COLUMNS + " FROM usuarios WHERE id = ?", id);
    }

    /** Elimina la cuenta y todo su contenido relacionado. */
    @DeleteMapping("/users/{id:\\d+}")
    @Transactional
    public Object deleteUser(@PathVariable long id, AuthUser auth) {
        abortUnless(auth.isAdmin(), 403);
        abortIf(id == auth.id(), 422, "No puedes eliminar tu propia cuenta de administración.");
        abortUnless(db.exists("SELECT 1 FROM usuarios WHERE id = ?", id), 404);
        tokens.revokeAll(id);
        List<Long> eventIds = db.ids("SELECT id FROM eventos WHERE id_usuario = ?", id);
        List<Long> productIds = db.ids("SELECT id FROM productos WHERE id_usuario = ?", id);
        List<Long> orderIds = db.ids("SELECT id FROM pedidos WHERE id_usuario = ?", id);
        db.exec("DELETE FROM favoritos WHERE id_usuario = ? OR id_usuariopin = ?", id, id);
        db.exec("DELETE FROM megusta WHERE id_usuario = ? OR id_publicacion IN (SELECT id FROM publicaciones WHERE id_usuario = ?)", id, id);
        db.exec("DELETE FROM listado_evento WHERE id_usuario = ?", id);
        if (!eventIds.isEmpty()) db.exec("DELETE FROM listado_evento WHERE id_evento IN (" + Db.marks(eventIds) + ")", eventIds.toArray());
        db.exec("DELETE FROM informes WHERE id_usuario = ? OR id_usuarioreferenciado = ?", id, id);
        if (!productIds.isEmpty()) db.exec("DELETE FROM cesta_producto WHERE id_producto IN (" + Db.marks(productIds) + ")", productIds.toArray());
        db.exec("DELETE FROM cesta_producto WHERE id_cesta IN (SELECT id FROM cesta WHERE id_usuario = ?)", id);
        db.exec("DELETE FROM cesta WHERE id_usuario = ?", id);
        if (!orderIds.isEmpty()) db.exec("DELETE FROM detalles_pedido WHERE id_pedido IN (" + Db.marks(orderIds) + ")", orderIds.toArray());
        if (!productIds.isEmpty()) db.exec("DELETE FROM detalles_pedido WHERE id_producto IN (" + Db.marks(productIds) + ")", productIds.toArray());
        db.exec("DELETE FROM pedidos WHERE id_usuario = ?", id);
        db.exec("DELETE FROM avisos WHERE id_usuario = ?", id);
        db.exec("DELETE FROM publicaciones WHERE id_usuario = ?", id);
        db.exec("DELETE FROM eventos WHERE id_usuario = ?", id);
        db.exec("DELETE FROM productos WHERE id_usuario = ?", id);
        db.exec("DELETE FROM usuarios WHERE id = ?", id);
        return Map.of("message", "Cuenta eliminada.");
    }
}
