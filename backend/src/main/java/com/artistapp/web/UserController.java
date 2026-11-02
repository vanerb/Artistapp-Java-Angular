package com.artistapp.web;

import static com.artistapp.support.ApiException.abortIf;
import static com.artistapp.support.ApiException.abortUnless;

import com.artistapp.security.AuthUser;
import com.artistapp.security.OptionalUser;
import com.artistapp.security.Passwords;
import com.artistapp.service.StorageService;
import com.artistapp.support.ApiException;
import com.artistapp.support.Db;
import com.artistapp.support.Input;
import com.artistapp.support.Validation;
import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class UserController {
    private final Db db;
    private final Passwords passwords;
    private final StorageService storage;

    public UserController(Db db, Passwords passwords, StorageService storage) {
        this.db = db;
        this.passwords = passwords;
        this.storage = storage;
    }

    @GetMapping("/users")
    public Object index(HttpServletRequest request, Input input, @OptionalUser AuthUser viewer) {
        StringBuilder sql = new StringBuilder("SELECT id, nombre, apellidos, usuario, id_tipo, imagen, biografia, ");
        List<Object> args = new ArrayList<>();
        if (viewer != null) {
            sql.append("EXISTS(SELECT 1 FROM favoritos f WHERE f.id_usuario = ? AND f.id_usuariopin = usuarios.id) AS followed_by_me FROM usuarios WHERE usuarios.id <> ?");
            args.add(viewer.id());
            args.add(viewer.id());
        } else {
            sql.append("0 AS followed_by_me FROM usuarios WHERE 1 = 1");
        }
        if (input.filled("q")) {
            sql.append(" AND (usuario LIKE ? OR nombre LIKE ?)");
            args.add("%" + input.str("q") + "%");
            args.add("%" + input.str("q") + "%");
        }
        if (input.filled("tipo")) {
            sql.append(" AND id_tipo = ?");
            args.add(input.integer("tipo", 0));
        }
        sql.append(" ORDER BY usuario");
        return db.paginate(request, 24, sql.toString(), args.toArray());
    }

    @GetMapping("/users/{id:\\d+}")
    public Object show(@PathVariable long id, Input input, @OptionalUser AuthUser viewer) {
        Map<String, Object> user = db.first("SELECT id, nombre, apellidos, usuario, id_tipo, imagen, biografia FROM usuarios WHERE id = ?", id);
        if (user == null) throw ApiException.notFound();
        int perPage = 6;
        int worksPage = Math.max(1, input.integer("obras_page", 1));
        int noticesPage = Math.max(1, input.integer("avisos_page", 1));
        int eventsPage = Math.max(1, input.integer("eventos_page", 1));

        long worksTotal = db.count("SELECT COUNT(*) FROM publicaciones WHERE id_usuario = ? AND tipo = 'public'", id);
        user.put("publicaciones", db.list("SELECT * FROM publicaciones WHERE id_usuario = ? AND tipo = 'public' ORDER BY id DESC LIMIT ? OFFSET ?", id, perPage, (worksPage - 1) * perPage));
        long noticesTotal = db.count("SELECT COUNT(*) FROM avisos WHERE id_usuario = ?", id);
        user.put("avisos", db.list("SELECT * FROM avisos WHERE id_usuario = ? ORDER BY id DESC LIMIT ? OFFSET ?", id, perPage, (noticesPage - 1) * perPage));
        long eventsTotal = db.count("SELECT COUNT(*) FROM eventos WHERE id_usuario = ?", id);
        if (viewer != null) {
            user.put("eventos", db.list("SELECT eventos.*, (SELECT mine.estado FROM listado_evento AS mine WHERE mine.id_evento = eventos.id AND mine.id_usuario = ? LIMIT 1) AS participation_status FROM eventos WHERE id_usuario = ? ORDER BY fecha_inicio DESC LIMIT ? OFFSET ?",
                viewer.id(), id, perPage, (eventsPage - 1) * perPage));
        } else {
            user.put("eventos", db.list("SELECT * FROM eventos WHERE id_usuario = ? ORDER BY fecha_inicio DESC LIMIT ? OFFSET ?", id, perPage, (eventsPage - 1) * perPage));
        }
        Map<String, Object> pagination = new LinkedHashMap<>();
        pagination.put("obras", pageInfo(worksPage, perPage, worksTotal));
        pagination.put("avisos", pageInfo(noticesPage, perPage, noticesTotal));
        pagination.put("eventos", pageInfo(eventsPage, perPage, eventsTotal));
        user.put("pagination", pagination);
        user.put("fijado", viewer != null && db.exists("SELECT 1 FROM favoritos WHERE id_usuario = ? AND id_usuariopin = ?", viewer.id(), id));
        user.put("seguidores_count", db.count("SELECT COUNT(DISTINCT id_usuario) FROM favoritos WHERE id_usuariopin = ?", id));
        user.put("seguidos_count", db.count("SELECT COUNT(DISTINCT id_usuariopin) FROM favoritos WHERE id_usuario = ?", id));
        return user;
    }

    private static Map<String, Object> pageInfo(int page, int perPage, long total) {
        return Map.of("page", page, "per_page", perPage, "total", total, "last_page", Math.max(1, (int) Math.ceil(total / (double) perPage)));
    }

    @GetMapping("/users/{id:\\d+}/community")
    public Object community(@PathVariable long id, HttpServletRequest request, Input input) {
        abortUnless(db.exists("SELECT 1 FROM usuarios WHERE id = ?", id), 404);
        Validation v = new Validation(input, db);
        v.field("tipo").required().in("seguidores", "seguidos");
        v.field("page").sometimes().integer().min(1);
        boolean followers = "seguidores".equals(v.validate().get("tipo"));
        String sql = followers
            ? "SELECT DISTINCT u.id, u.usuario, u.imagen, u.biografia FROM favoritos AS f JOIN usuarios AS u ON u.id = f.id_usuario WHERE f.id_usuariopin = ? ORDER BY u.usuario"
            : "SELECT DISTINCT u.id, u.usuario, u.imagen, u.biografia FROM favoritos AS f JOIN usuarios AS u ON u.id = f.id_usuariopin WHERE f.id_usuario = ? ORDER BY u.usuario";
        return db.paginate(request, 30, sql, id);
    }

    @GetMapping("/account")
    public Object me(AuthUser auth) {
        long id = auth.id();
        Map<String, Object> user = Users.publicUser(db.find("usuarios", id));
        user.put("publicaciones", db.list("SELECT * FROM publicaciones WHERE id_usuario = ? ORDER BY id DESC", id));
        user.put("avisos", db.list("SELECT * FROM avisos WHERE id_usuario = ? ORDER BY id DESC", id));
        user.put("eventos", db.list("SELECT e.*, le.estado AS participacion FROM listado_evento AS le JOIN eventos AS e ON e.id = le.id_evento WHERE le.id_usuario = ?", id));
        user.put("eventos_propios", db.list("SELECT * FROM eventos WHERE id_usuario = ? ORDER BY fecha_inicio DESC", id));
        user.put("productos", db.list("SELECT id, nombre, descripcion, precio, cantidad, imagen, id_tipo FROM productos WHERE id_usuario = ? ORDER BY id DESC", id));
        user.put("favoritos", db.list("SELECT DISTINCT u.id, u.usuario, u.imagen, u.biografia FROM favoritos AS f JOIN usuarios AS u ON u.id = f.id_usuariopin WHERE f.id_usuario = ? ORDER BY u.usuario", id));
        user.put("seguidores", db.list("SELECT DISTINCT u.id, u.usuario, u.imagen, u.biografia FROM favoritos AS f JOIN usuarios AS u ON u.id = f.id_usuario WHERE f.id_usuariopin = ? ORDER BY u.usuario", id));
        user.put("obras_favoritas", db.list("SELECT p.id, p.titulo, p.descripcion, p.imagen, p.megusta, u.usuario AS artist_name FROM publicaciones AS p "
            + "JOIN (SELECT DISTINCT id_publicacion FROM megusta WHERE id_usuario = ? AND megusta = 1) AS liked ON liked.id_publicacion = p.id "
            + "JOIN usuarios AS u ON u.id = p.id_usuario WHERE p.tipo = 'public' ORDER BY p.id DESC", id));
        return user;
    }

    @PatchMapping("/account")
    public Object update(AuthUser auth, Input input) {
        Validation v = new Validation(input, db);
        v.field("nombre").sometimes().required().string().max(100);
        v.field("apellidos").sometimes().required().string().max(140);
        v.field("usuario").sometimes().required().string().max(100).unique("usuarios", "usuario", auth.id());
        v.field("correo").sometimes().required().email().max(240).unique("usuarios", "correo", auth.id());
        v.field("biografia").sometimes().nullable().string().max(255);
        v.field("imagen").sometimes().image().max(8192);
        v.field("password_actual").sometimes().requiredWith("password").string();
        v.field("password").sometimes().required().string().min(8).confirmed().regex(Validation.STRONG_PASSWORD, Users.PASSWORD_MESSAGE);
        Map<String, Object> data = v.validate();
        if (data.get("password") != null) {
            Object current = data.get("password_actual");
            if (!passwords.check(current == null ? "" : current.toString(), auth.contrasena())) {
                throw new ApiException(422, "La contraseña actual no es correcta.");
            }
            data.put("contrasena", passwords.hash((String) data.get("password")));
        }
        data.remove("password");
        data.remove("password_actual");
        if (data.get("imagen") instanceof MultipartFile file) {
            data.put("imagen", storage.store(file, "uploads/usuarios", StorageService.Disk.PUBLIC));
        } else {
            data.remove("imagen");
        }
        if (data.containsKey("biografia") && data.get("biografia") == null) data.put("biografia", "");
        db.update("usuarios", data, auth.id());
        return Map.of("user", Users.publicUser(db.find("usuarios", auth.id())));
    }

    @PostMapping("/users/{id:\\d+}/favorite")
    public Object toggleFavorite(@PathVariable long id, AuthUser auth) {
        abortUnless(db.exists("SELECT 1 FROM usuarios WHERE id = ?", id), 404);
        abortIf(id == auth.id(), 422, "No puedes fijar tu propio perfil.");
        if (db.exists("SELECT 1 FROM favoritos WHERE id_usuario = ? AND id_usuariopin = ?", auth.id(), id)) {
            db.exec("DELETE FROM favoritos WHERE id_usuario = ? AND id_usuariopin = ?", auth.id(), id);
            return Map.of("pinned", false);
        }
        db.exec("INSERT INTO favoritos (id_usuario, id_usuariopin) VALUES (?, ?)", auth.id(), id);
        return Map.of("pinned", true);
    }
}
