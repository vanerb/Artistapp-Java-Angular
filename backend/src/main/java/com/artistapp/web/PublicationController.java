package com.artistapp.web;

import static com.artistapp.support.ApiException.abortUnless;

import com.artistapp.security.AuthUser;
import com.artistapp.security.OptionalUser;
import com.artistapp.service.Notifier;
import com.artistapp.service.StorageService;
import com.artistapp.support.Db;
import com.artistapp.support.Input;
import com.artistapp.support.Validation;
import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
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
@RequestMapping("/api/publications")
public class PublicationController {
    private final Db db;
    private final Notifier notifier;
    private final StorageService storage;

    public PublicationController(Db db, Notifier notifier, StorageService storage) {
        this.db = db;
        this.notifier = notifier;
        this.storage = storage;
    }

    /** El feed es público; si hay token se personaliza el "me gusta". */
    @GetMapping
    public Object index(HttpServletRequest request, Input input, @OptionalUser AuthUser viewer) {
        StringBuilder sql = new StringBuilder("SELECT p.*, u.usuario AS artist_name, u.imagen AS artist_image, c.nombre AS category_name, "
            + "EXISTS(SELECT 1 FROM megusta m WHERE m.id_publicacion = p.id AND m.id_usuario = ? AND m.megusta = 1) AS liked_by_me "
            + "FROM publicaciones AS p LEFT JOIN usuarios AS u ON u.id = p.id_usuario LEFT JOIN categoria AS c ON c.id = p.id_categoria WHERE 1 = 1");
        List<Object> args = new ArrayList<>();
        args.add(viewer == null ? null : viewer.id());
        if (viewer == null || !viewer.isAdmin()) sql.append(" AND p.tipo = 'public'");
        if (input.filled("q")) {
            sql.append(" AND (p.titulo LIKE ? OR p.descripcion LIKE ?)");
            args.add("%" + input.str("q") + "%");
            args.add("%" + input.str("q") + "%");
        }
        if (input.filled("categoria")) {
            sql.append(" AND p.id_categoria = ?");
            args.add(input.integer("categoria", 0));
        }
        sql.append(" ORDER BY p.megusta DESC, p.id DESC");
        return db.paginate(request, 24, sql.toString(), args.toArray());
    }

    @PostMapping
    public ResponseEntity<Object> store(AuthUser auth, Input input) {
        abortUnless(auth.isOneOf(1, 3, 5), 403, "Solo artistas y organizadores pueden publicar obras.");
        Validation v = new Validation(input, db);
        v.field("titulo").required().string().max(255);
        v.field("descripcion").required().string().max(255);
        v.field("id_categoria").required().integer().exists("categoria", "id");
        v.field("imagen").nullable().image().max(8192);
        Map<String, Object> data = v.validate();
        String image = data.get("imagen") instanceof MultipartFile file ? storage.store(file, "uploads/publicaciones", StorageService.Disk.PUBLIC) : "";
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("titulo", data.get("titulo"));
        row.put("descripcion", data.get("descripcion"));
        row.put("tipo", "public");
        row.put("id_categoria", data.get("id_categoria"));
        row.put("id_usuario", auth.id());
        row.put("megusta", 0);
        row.put("imagen", image);
        long id = db.insert("publicaciones", row);
        notifier.followers(auth.id(), "obra", "Nueva obra de " + auth.usuario(), (String) data.get("titulo"), "/descubrir");
        return ResponseEntity.status(201).body(db.find("publicaciones", id));
    }

    @PatchMapping("/{id:\\d+}")
    public Object update(@PathVariable long id, AuthUser auth, Input input) {
        Map<String, Object> post = db.findOrFail("publicaciones", id);
        abortUnless(Users.id(post, "id_usuario") == auth.id() || auth.isAdmin(), 403);
        Validation v = new Validation(input, db);
        v.field("titulo").sometimes().required().string().max(255);
        v.field("descripcion").sometimes().required().string().max(255);
        v.field("id_categoria").sometimes().integer().exists("categoria", "id");
        v.field("imagen").nullable().image().max(8192);
        Map<String, Object> data = v.validate();
        if (data.get("imagen") instanceof MultipartFile file) {
            data.put("imagen", storage.store(file, "uploads/publicaciones", StorageService.Disk.PUBLIC));
        } else {
            data.remove("imagen");
        }
        if (data.containsKey("id_categoria") && data.get("id_categoria") == null) data.remove("id_categoria");
        db.update("publicaciones", data, id);
        return db.find("publicaciones", id);
    }

    @DeleteMapping("/{id:\\d+}")
    @Transactional
    public Object destroy(@PathVariable long id, AuthUser auth) {
        Map<String, Object> post = db.findOrFail("publicaciones", id);
        abortUnless(Users.id(post, "id_usuario") == auth.id() || auth.isAdmin(), 403);
        db.exec("DELETE FROM megusta WHERE id_publicacion = ?", id);
        db.exec("DELETE FROM publicaciones WHERE id = ?", id);
        return Map.of("message", "Publicación eliminada.");
    }

    @PostMapping("/{id:\\d+}/like")
    @Transactional
    public Object toggleLike(@PathVariable long id, AuthUser auth) {
        abortUnless(db.exists("SELECT 1 FROM publicaciones WHERE id = ?", id), 404);
        long userId = auth.id();
        boolean liked = db.exists("SELECT 1 FROM megusta WHERE id_usuario = ? AND id_publicacion = ? AND megusta = 1", userId, id);
        if (liked) {
            db.exec("UPDATE megusta SET megusta = 0 WHERE id_usuario = ? AND id_publicacion = ?", userId, id);
            liked = false;
        } else {
            // Reutiliza la fila más antigua para no acumular duplicados del esquema heredado.
            Long firstId = db.value("SELECT id FROM megusta WHERE id_usuario = ? AND id_publicacion = ? ORDER BY id", Long.class, userId, id);
            if (firstId != null) {
                db.exec("UPDATE megusta SET megusta = 0 WHERE id_usuario = ? AND id_publicacion = ?", userId, id);
                db.exec("UPDATE megusta SET megusta = 1 WHERE id = ?", firstId);
            } else {
                db.exec("INSERT INTO megusta (id_usuario, id_publicacion, megusta) VALUES (?, ?, 1)", userId, id);
            }
            liked = true;
        }
        long count = db.count("SELECT COUNT(DISTINCT id_usuario) FROM megusta WHERE id_publicacion = ? AND megusta = 1", id);
        db.exec("UPDATE publicaciones SET megusta = ? WHERE id = ?", count, id);
        return Map.of("liked", liked, "count", count);
    }

    @PatchMapping("/{id:\\d+}/visibility")
    public Object toggleVisibility(@PathVariable long id, AuthUser auth) {
        abortUnless(auth.isAdmin(), 403);
        Map<String, Object> post = db.findOrFail("publicaciones", id);
        String type = "public".equals(post.get("tipo")) ? "private" : "public";
        db.exec("UPDATE publicaciones SET tipo = ? WHERE id = ?", type, id);
        return Map.of("tipo", type);
    }
}
