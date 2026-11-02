package com.artistapp.service;

import com.artistapp.support.Db;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

/** Notificaciones internas de la aplicación (tabla app_notifications). */
@Service
public class Notifier {
    private final Db db;

    public Notifier(Db db) {
        this.db = db;
    }

    public void user(long userId, String type, String title, String message, String link) {
        insert(List.of(userId), type, title, message, link);
    }

    public void admins(String type, String title, String message, String link) {
        insert(db.ids("SELECT id FROM usuarios WHERE id_tipo = 1"), type, title, message, link);
    }

    public void followers(long artistId, String type, String title, String message, String link) {
        insert(db.ids("SELECT DISTINCT id_usuario FROM favoritos WHERE id_usuariopin = ?", artistId), type, title, message, link);
    }

    public void everyoneExcept(long excludedUserId, String type, String title, String message, String link) {
        insert(db.ids("SELECT id FROM usuarios WHERE id <> ?", excludedUserId), type, title, message, link);
    }

    private void insert(List<Long> userIds, String type, String title, String message, String link) {
        if (userIds.isEmpty()) return;
        Timestamp now = Timestamp.valueOf(LocalDateTime.now());
        List<Object[]> rows = new ArrayList<>();
        for (Long id : userIds) rows.add(new Object[]{id, type, title, message, link, now, now});
        db.jdbc().batchUpdate("INSERT INTO app_notifications (user_id, type, title, message, link, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)", rows);
    }
}
