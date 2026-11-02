package com.artistapp.web;

import com.artistapp.security.AuthUser;
import com.artistapp.support.Db;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final Db db;

    public NotificationController(Db db) {
        this.db = db;
    }

    @GetMapping
    public Object index(HttpServletRequest request, AuthUser auth) {
        return Map.of(
            "data", db.paginate(request, 30, "SELECT * FROM app_notifications WHERE user_id = ? ORDER BY id DESC", auth.id()),
            "unread", unread(auth));
    }

    @PatchMapping("/{id:\\d+}/read")
    public Object read(@PathVariable long id, AuthUser auth) {
        db.exec("UPDATE app_notifications SET read_at = ?, updated_at = ? WHERE id = ? AND user_id = ? AND read_at IS NULL", LocalDateTime.now(), LocalDateTime.now(), id, auth.id());
        return Map.of("unread", unread(auth));
    }

    @PatchMapping("/read-all")
    public Object readAll(AuthUser auth) {
        db.exec("UPDATE app_notifications SET read_at = ?, updated_at = ? WHERE user_id = ? AND read_at IS NULL", LocalDateTime.now(), LocalDateTime.now(), auth.id());
        return Map.of("unread", 0);
    }

    private long unread(AuthUser auth) {
        return db.count("SELECT COUNT(*) FROM app_notifications WHERE user_id = ? AND read_at IS NULL", auth.id());
    }
}
