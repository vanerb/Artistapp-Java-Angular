package com.artistapp.web;

import static com.artistapp.support.ApiException.abortUnless;

import com.artistapp.security.AuthUser;
import com.artistapp.security.OptionalUser;
import com.artistapp.service.Notifier;
import com.artistapp.service.StorageService;
import com.artistapp.support.ApiException;
import com.artistapp.support.Db;
import com.artistapp.support.Input;
import com.artistapp.support.Validation;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
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
@RequestMapping("/api/events")
public class EventController {
    private final Db db;
    private final Notifier notifier;
    private final StorageService storage;

    public EventController(Db db, Notifier notifier, StorageService storage) {
        this.db = db;
        this.notifier = notifier;
        this.storage = storage;
    }

    @GetMapping
    public Object index(HttpServletRequest request, Input input, @OptionalUser AuthUser viewer) {
        StringBuilder sql = new StringBuilder("SELECT e.*, u.usuario AS organizer_name, u.imagen AS organizer_image, "
            + "(SELECT COUNT(*) FROM listado_evento le WHERE le.id_evento = e.id AND le.estado = 'aceptado') AS participant_count");
        List<Object> args = new ArrayList<>();
        if (viewer != null) {
            sql.append(", (SELECT mine.estado FROM listado_evento AS mine WHERE mine.id_evento = e.id AND mine.id_usuario = ? LIMIT 1) AS participation_status");
            args.add(viewer.id());
        }
        sql.append(" FROM eventos AS e JOIN usuarios AS u ON u.id = e.id_usuario WHERE DATE(e.fecha_fin) >= ?");
        args.add(LocalDate.now().toString());
        if (input.filled("q")) {
            sql.append(" AND (e.nombre LIKE ? OR e.ubicacion LIKE ?)");
            args.add("%" + input.str("q") + "%");
            args.add("%" + input.str("q") + "%");
        }
        Validation v = new Validation(input, db);
        v.field("desde").sometimes().nullable().date();
        v.field("hasta").sometimes().nullable().date();
        Map<String, Object> dates = v.validate();
        String from = (String) dates.get("desde");
        String to = (String) dates.get("hasta");
        if (from != null && to != null && to.compareTo(from) < 0) {
            String message = "La fecha final debe ser igual o posterior a la fecha inicial.";
            throw new ApiException(422, message, Map.of("hasta", List.of(message)));
        }
        // Incluye los eventos que se solapan con el intervalo, aunque empiecen antes o acaben después.
        if (from != null) { sql.append(" AND DATE(e.fecha_fin) >= ?"); args.add(from); }
        if (to != null) { sql.append(" AND DATE(e.fecha_inicio) <= ?"); args.add(to); }
        sql.append(" ORDER BY e.fecha_inicio");
        return db.paginate(request, 24, sql.toString(), args.toArray());
    }

    @PostMapping
    public ResponseEntity<Object> store(AuthUser auth, Input input) {
        abortUnless(auth.isOneOf(1, 3), 403);
        Validation v = new Validation(input, db);
        v.field("nombre").required().string().max(255);
        v.field("ubicacion").required().string().max(255);
        v.field("link").nullable().url().max(255);
        v.field("fecha_inicio").required().date();
        v.field("fecha_fin").required().date().afterOrEqual("fecha_inicio");
        v.field("imagen").nullable().image().max(8192);
        Map<String, Object> data = v.validate();
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("nombre", data.get("nombre"));
        row.put("ubicacion", data.get("ubicacion"));
        row.put("link", data.get("link") == null ? "" : data.get("link"));
        row.put("fecha_inicio", data.get("fecha_inicio"));
        row.put("fecha_fin", data.get("fecha_fin"));
        row.put("id_usuario", auth.id());
        row.put("imagen", data.get("imagen") instanceof MultipartFile file ? storage.store(file, "uploads/imgevento", StorageService.Disk.PUBLIC) : "");
        long id = db.insert("eventos", row);
        notifier.followers(auth.id(), "evento", "Nuevo evento: " + data.get("nombre"), (String) data.get("ubicacion"), "/descubrir");
        return ResponseEntity.status(201).body(db.find("eventos", id));
    }

    @PatchMapping("/{id:\\d+}")
    public Object update(@PathVariable long id, AuthUser auth, Input input) {
        Map<String, Object> event = db.findOrFail("eventos", id);
        abortUnless(Users.id(event, "id_usuario") == auth.id() || auth.isAdmin(), 403);
        Validation v = new Validation(input, db);
        v.field("nombre").sometimes().required().string().max(255);
        v.field("ubicacion").sometimes().required().string().max(255);
        v.field("link").sometimes().nullable().url().max(255);
        v.field("fecha_inicio").sometimes().required().date();
        v.field("fecha_fin").sometimes().required().date();
        v.field("imagen").nullable().image().max(8192);
        Map<String, Object> data = v.validate();
        String start = String.valueOf(data.getOrDefault("fecha_inicio", event.get("fecha_inicio")));
        String end = String.valueOf(data.getOrDefault("fecha_fin", event.get("fecha_fin")));
        if (end.compareTo(start) < 0) {
            String message = "La fecha de fin debe ser igual o posterior a la de inicio.";
            throw new ApiException(422, message, Map.of("fecha_fin", List.of(message)));
        }
        if (data.get("imagen") instanceof MultipartFile file) {
            data.put("imagen", storage.store(file, "uploads/imgevento", StorageService.Disk.PUBLIC));
            storage.deleteUpload(event.get("imagen"));
        } else {
            data.remove("imagen");
        }
        if (data.containsKey("link") && data.get("link") == null) data.put("link", "");
        db.update("eventos", data, id);
        return db.find("eventos", id);
    }

    @DeleteMapping("/{id:\\d+}")
    @Transactional
    public Object destroy(@PathVariable long id, AuthUser auth) {
        Map<String, Object> event = db.findOrFail("eventos", id);
        abortUnless(Users.id(event, "id_usuario") == auth.id() || auth.isAdmin(), 403);
        db.exec("DELETE FROM listado_evento WHERE id_evento = ?", id);
        db.exec("DELETE FROM event_chat_messages WHERE event_id = ?", id);
        db.exec("DELETE FROM eventos WHERE id = ?", id);
        storage.deleteUpload(event.get("imagen"));
        return Map.of("message", "Evento eliminado.");
    }

    @PostMapping("/{id:\\d+}/participants")
    public ResponseEntity<Object> join(@PathVariable long id, AuthUser auth) {
        abortUnless(db.exists("SELECT 1 FROM eventos WHERE id = ?", id), 404);
        Map<String, Object> entry = db.first("SELECT * FROM listado_evento WHERE id_evento = ? AND id_usuario = ?", id, auth.id());
        if (entry != null) return ResponseEntity.ok(Map.of("message", "Ya has solicitado participar.", "estado", entry.get("estado")));
        db.exec("INSERT INTO listado_evento (id_evento, id_usuario, estado) VALUES (?, ?, 'pendiente')", id, auth.id());
        return ResponseEntity.status(201).body(Map.of("message", "Solicitud enviada.", "estado", "pendiente"));
    }

    @DeleteMapping("/{id:\\d+}/participants/me")
    public Object leave(@PathVariable long id, AuthUser auth) {
        db.exec("DELETE FROM listado_evento WHERE id_evento = ? AND id_usuario = ?", id, auth.id());
        return Map.of("message", "Has salido del evento.");
    }

    @GetMapping("/{id:\\d+}/participants")
    public Object participants(@PathVariable long id, AuthUser auth) {
        Map<String, Object> event = db.findOrFail("eventos", id);
        abortUnless(Users.id(event, "id_usuario") == auth.id() || auth.isAdmin(), 403);
        return db.list("SELECT le.id, le.estado, u.id AS user_id, u.usuario, u.imagen, u.biografia FROM listado_evento AS le "
            + "JOIN usuarios AS u ON u.id = le.id_usuario WHERE le.id_evento = ? ORDER BY u.usuario", id);
    }

    @PatchMapping("/{id:\\d+}/participants/{participant:\\d+}")
    public Object decideParticipant(@PathVariable long id, @PathVariable long participant, AuthUser auth, Input input) {
        Map<String, Object> event = db.findOrFail("eventos", id);
        abortUnless(Users.id(event, "id_usuario") == auth.id() || auth.isAdmin(), 403);
        Validation v = new Validation(input, db);
        v.field("estado").required().in("aceptado", "rechazado", "pendiente");
        Object state = v.validate().get("estado");
        abortUnless(db.exists("SELECT 1 FROM listado_evento WHERE id = ? AND id_evento = ?", participant, id), 404);
        db.exec("UPDATE listado_evento SET estado = ? WHERE id = ? AND id_evento = ?", state, participant, id);
        return Map.of("estado", state);
    }
}
