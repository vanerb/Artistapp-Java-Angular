package com.artistapp.web;

import static com.artistapp.support.ApiException.abortIf;
import static com.artistapp.support.ApiException.abortUnless;

import com.artistapp.security.AuthUser;
import com.artistapp.security.OptionalUser;
import com.artistapp.service.Notifier;
import com.artistapp.support.Db;
import com.artistapp.support.Input;
import com.artistapp.support.Validation;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CommunityController {
    private static final String COMMENT_COLUMNS = "c.id, c.publication_id, c.user_id, c.body, c.created_at, u.usuario, u.imagen";
    private static final String EVENT_MESSAGE_COLUMNS = "m.id, m.event_id, m.user_id, m.body, m.created_at, u.usuario, u.imagen";
    private static final String DIRECT_COLUMNS = "m.id, m.sender_id, m.recipient_id, m.body, m.created_at, u.usuario AS sender_name, u.imagen AS sender_image";
    private static final Comparator<Map<String, Object>> NEWEST_FIRST = Comparator.comparing(
        (Map<String, Object> row) -> row.get("updated_at") == null ? "" : row.get("updated_at").toString()).reversed();

    private final Db db;
    private final Notifier notifier;

    public CommunityController(Db db, Notifier notifier) {
        this.db = db;
        this.notifier = notifier;
    }

    @GetMapping("/conversations")
    public Object conversations(AuthUser auth) {
        long userId = auth.id();
        Set<Long> directIds = new LinkedHashSet<>(db.ids("SELECT recipient_id FROM direct_messages WHERE sender_id = ?", userId));
        directIds.addAll(db.ids("SELECT sender_id FROM direct_messages WHERE recipient_id = ?", userId));
        List<Map<String, Object>> direct = new ArrayList<>();
        if (!directIds.isEmpty()) {
            for (Map<String, Object> peer : db.list("SELECT id, usuario AS name, imagen AS image FROM usuarios WHERE id IN (" + Db.marks(directIds) + ")", directIds.toArray())) {
                long peerId = Users.id(peer, "id");
                Map<String, Object> last = db.first("SELECT * FROM direct_messages WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?) ORDER BY id DESC", userId, peerId, peerId, userId);
                direct.add(conversation(peerId, peer, last, "direct"));
            }
            direct.sort(NEWEST_FIRST);
        }
        Set<Long> eventIds = new LinkedHashSet<>(db.ids("SELECT id FROM eventos WHERE id_usuario = ?", userId));
        eventIds.addAll(db.ids("SELECT id_evento FROM listado_evento WHERE id_usuario = ? AND estado = 'aceptado'", userId));
        List<Map<String, Object>> events = new ArrayList<>();
        if (!eventIds.isEmpty()) {
            for (Map<String, Object> event : db.list("SELECT id, nombre AS name, imagen AS image FROM eventos WHERE id IN (" + Db.marks(eventIds) + ")", eventIds.toArray())) {
                long eventId = Users.id(event, "id");
                Map<String, Object> last = db.first("SELECT * FROM event_chat_messages WHERE event_id = ? ORDER BY id DESC", eventId);
                events.add(conversation(eventId, event, last, "event"));
            }
            events.sort(NEWEST_FIRST);
        }
        return Map.of("direct", direct, "events", events);
    }

    private static Map<String, Object> conversation(long id, Map<String, Object> row, Map<String, Object> last, String kind) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", id);
        item.put("name", row.get("name"));
        item.put("image", row.get("image"));
        item.put("last_message", last == null ? null : last.get("body"));
        item.put("updated_at", last == null ? null : last.get("created_at"));
        item.put("kind", kind);
        return item;
    }

    private void eventAccess(AuthUser auth, long eventId) {
        Map<String, Object> event = db.findOrFail("eventos", eventId);
        boolean allowed = Users.id(event, "id_usuario") == auth.id()
            || db.exists("SELECT 1 FROM listado_evento WHERE id_evento = ? AND id_usuario = ? AND estado = 'aceptado'", eventId, auth.id());
        abortUnless(allowed, 403, "El chat está disponible para la organización y las personas aceptadas en el evento.");
    }

    @GetMapping("/publications/{publicationId:\\d+}/comments")
    public Object comments(@PathVariable long publicationId, @OptionalUser AuthUser viewer) {
        Map<String, Object> publication = db.find("publicaciones", publicationId);
        long viewerId = viewer == null ? 0 : viewer.id();
        abortUnless(publication != null && ("public".equals(publication.get("tipo")) || Users.id(publication, "id_usuario") == viewerId), 404);
        return db.list("SELECT " + COMMENT_COLUMNS + " FROM publication_comments AS c JOIN usuarios AS u ON u.id = c.user_id WHERE c.publication_id = ? ORDER BY c.id LIMIT 200", publicationId);
    }

    @PostMapping("/publications/{publicationId:\\d+}/comments")
    public ResponseEntity<Object> addComment(@PathVariable long publicationId, AuthUser auth, Input input) {
        Map<String, Object> publication = db.find("publicaciones", publicationId);
        abortUnless(publication != null && "public".equals(publication.get("tipo")), 404);
        String body = body(input);
        LocalDateTime now = LocalDateTime.now();
        long id = db.insert("publication_comments", Map.of("publication_id", publicationId, "user_id", auth.id(), "body", body, "created_at", now, "updated_at", now));
        return ResponseEntity.status(201).body(db.first("SELECT " + COMMENT_COLUMNS + " FROM publication_comments AS c JOIN usuarios AS u ON u.id = c.user_id WHERE c.id = ?", id));
    }

    @DeleteMapping("/publications/{publicationId:\\d+}/comments/{commentId:\\d+}")
    public Object deleteComment(@PathVariable long publicationId, @PathVariable long commentId, AuthUser auth) {
        Map<String, Object> comment = db.first("SELECT * FROM publication_comments WHERE id = ? AND publication_id = ?", commentId, publicationId);
        abortUnless(comment != null, 404);
        abortUnless(Users.id(comment, "user_id") == auth.id() || auth.isAdmin(), 403);
        db.exec("DELETE FROM publication_comments WHERE id = ?", commentId);
        return Map.of("message", "Comentario eliminado.");
    }

    @GetMapping("/events/{eventId:\\d+}/chat")
    public Object eventMessages(@PathVariable long eventId, AuthUser auth) {
        eventAccess(auth, eventId);
        List<Map<String, Object>> messages = db.list("SELECT " + EVENT_MESSAGE_COLUMNS + " FROM event_chat_messages AS m JOIN usuarios AS u ON u.id = m.user_id WHERE m.event_id = ? ORDER BY m.id DESC LIMIT 100", eventId);
        Collections.reverse(messages);
        return messages;
    }

    @PostMapping("/events/{eventId:\\d+}/chat")
    public ResponseEntity<Object> sendEventMessage(@PathVariable long eventId, AuthUser auth, Input input) {
        eventAccess(auth, eventId);
        String body = body(input);
        LocalDateTime now = LocalDateTime.now();
        long id = db.insert("event_chat_messages", Map.of("event_id", eventId, "user_id", auth.id(), "body", body, "created_at", now, "updated_at", now));
        return ResponseEntity.status(201).body(db.first("SELECT " + EVENT_MESSAGE_COLUMNS + " FROM event_chat_messages AS m JOIN usuarios AS u ON u.id = m.user_id WHERE m.id = ?", id));
    }

    /** El chat directo solo está disponible cuando una de las dos cuentas es de artista. */
    private Map<String, Object> directTarget(AuthUser auth, long otherId) {
        Map<String, Object> other = db.first("SELECT id, usuario, imagen, id_tipo FROM usuarios WHERE id = ?", otherId);
        abortUnless(other != null, 404);
        abortIf(auth.id() == otherId, 422, "No puedes abrir un chat contigo.");
        abortUnless(Users.id(other, "id_tipo") == 5 || auth.idTipo() == 5, 404, "El chat directo está reservado para conversaciones con artistas.");
        return other;
    }

    @GetMapping("/direct-messages/{otherId:\\d+}")
    public Object directMessages(@PathVariable long otherId, AuthUser auth) {
        Map<String, Object> other = directTarget(auth, otherId);
        long viewer = auth.id();
        List<Map<String, Object>> rows = db.list("SELECT " + DIRECT_COLUMNS + " FROM direct_messages AS m JOIN usuarios AS u ON u.id = m.sender_id "
            + "WHERE (m.sender_id = ? AND m.recipient_id = ?) OR (m.sender_id = ? AND m.recipient_id = ?) ORDER BY m.id DESC LIMIT 100", viewer, otherId, otherId, viewer);
        Collections.reverse(rows);
        return Map.of("peer", other, "messages", rows);
    }

    @PostMapping("/direct-messages/{otherId:\\d+}")
    public ResponseEntity<Object> sendDirectMessage(@PathVariable long otherId, AuthUser auth, Input input) {
        Map<String, Object> other = directTarget(auth, otherId);
        String body = body(input);
        LocalDateTime now = LocalDateTime.now();
        long id = db.insert("direct_messages", Map.of("sender_id", auth.id(), "recipient_id", otherId, "body", body, "created_at", now, "updated_at", now));
        String preview = body.codePointCount(0, body.length()) > 180 ? body.substring(0, body.offsetByCodePoints(0, 180)) : body;
        notifier.user(Users.id(other, "id"), "mensaje", "Mensaje de " + auth.usuario(), preview, "/mensajes/artista/" + auth.id());
        return ResponseEntity.status(201).body(db.first("SELECT " + DIRECT_COLUMNS + " FROM direct_messages AS m JOIN usuarios AS u ON u.id = m.sender_id WHERE m.id = ?", id));
    }

    private String body(Input input) {
        Validation v = new Validation(input, db);
        v.field("body").required().string().max(1000);
        return v.validate().get("body").toString();
    }
}
