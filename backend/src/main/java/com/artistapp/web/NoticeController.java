package com.artistapp.web;

import static com.artistapp.support.ApiException.abortUnless;

import com.artistapp.security.AuthUser;
import com.artistapp.service.Notifier;
import com.artistapp.support.Db;
import com.artistapp.support.Input;
import com.artistapp.support.Validation;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Avisos publicados en los perfiles; los avisos generales son exclusivos de administración. */
@RestController
@RequestMapping("/api/notices")
public class NoticeController {
    private final Db db;
    private final Notifier notifier;

    public NoticeController(Db db, Notifier notifier) {
        this.db = db;
        this.notifier = notifier;
    }

    @GetMapping
    public Object index(HttpServletRequest request, Input input) {
        String sql = "SELECT a.*, u.usuario AS artist_name, u.imagen AS artist_image FROM avisos AS a JOIN usuarios AS u ON u.id = a.id_usuario";
        if (input.filled("usuario")) {
            return db.paginate(request, 30, sql + " WHERE a.id_usuario = ? ORDER BY a.id DESC", input.integer("usuario", 0));
        }
        return db.paginate(request, 30, sql + " ORDER BY a.id DESC");
    }

    @PostMapping
    public ResponseEntity<Object> store(AuthUser auth, Input input) {
        abortUnless(auth.isAdmin(), 403, "Solo administración puede publicar avisos generales.");
        Validation v = new Validation(input, db);
        v.field("titulo").required().string().max(255);
        v.field("aviso").required().string().max(255);
        Map<String, Object> data = new LinkedHashMap<>(v.validate());
        LocalDateTime now = LocalDateTime.now();
        data.put("fecha_publicacion", now.toLocalDate().toString());
        data.put("hora", now.format(DateTimeFormatter.ofPattern("HH:mm:ss")));
        data.put("id_usuario", auth.id());
        long id = db.insert("avisos", data);
        notifier.everyoneExcept(auth.id(), "aviso", "Aviso importante de ArtistApp", (String) data.get("titulo"), "/artistas/" + auth.id());
        return ResponseEntity.status(201).body(db.find("avisos", id));
    }

    @PatchMapping("/{id:\\d+}")
    public Object update(@PathVariable long id, AuthUser auth, Input input) {
        Map<String, Object> notice = db.findOrFail("avisos", id);
        abortUnless(Users.id(notice, "id_usuario") == auth.id() || auth.isAdmin(), 403);
        Validation v = new Validation(input, db);
        v.field("titulo").sometimes().required().string().max(255);
        v.field("aviso").sometimes().required().string().max(255);
        db.update("avisos", v.validate(), id);
        return db.find("avisos", id);
    }

    @DeleteMapping("/{id:\\d+}")
    public Object destroy(@PathVariable long id, AuthUser auth) {
        Map<String, Object> notice = db.findOrFail("avisos", id);
        abortUnless(Users.id(notice, "id_usuario") == auth.id() || auth.isAdmin(), 403);
        db.exec("DELETE FROM avisos WHERE id = ?", id);
        return Map.of("message", "Aviso eliminado.");
    }
}
