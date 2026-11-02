package com.artistapp.web;

import static com.artistapp.support.ApiException.abortIf;
import static com.artistapp.support.ApiException.abortUnless;

import com.artistapp.security.AuthUser;
import com.artistapp.service.Notifier;
import com.artistapp.support.Db;
import com.artistapp.support.Input;
import com.artistapp.support.Validation;
import jakarta.servlet.http.HttpServletRequest;
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

/** Informes (denuncias) sobre otras cuentas. */
@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final Db db;
    private final Notifier notifier;

    public ReportController(Db db, Notifier notifier) {
        this.db = db;
        this.notifier = notifier;
    }

    @GetMapping
    public Object index(HttpServletRequest request, AuthUser auth) {
        String sql = "SELECT r.*, reporter.usuario AS reportante, target.usuario AS usuario_referenciado FROM informes AS r "
            + "JOIN usuarios AS reporter ON reporter.id = r.id_usuario JOIN usuarios AS target ON target.id = r.id_usuarioreferenciado";
        if (auth.isAdmin()) return db.paginate(request, 30, sql + " ORDER BY r.id DESC");
        return db.paginate(request, 30, sql + " WHERE r.id_usuario = ? ORDER BY r.id DESC", auth.id());
    }

    @PostMapping
    public ResponseEntity<Object> store(AuthUser auth, Input input) {
        Validation v = new Validation(input, db);
        v.field("informe").required().string().max(255);
        v.field("id_usuarioreferenciado").required().integer().exists("usuarios", "id");
        Map<String, Object> data = new LinkedHashMap<>(v.validate());
        abortIf(((Number) data.get("id_usuarioreferenciado")).longValue() == auth.id(), 422, "No puedes reportarte a ti misma/o.");
        data.put("id_usuario", auth.id());
        data.put("estado", "pendiente");
        long id = db.insert("informes", data);
        notifier.admins("informe", "Nuevo informe recibido", "@" + auth.usuario() + ": " + data.get("informe"), "/admin/informes");
        return ResponseEntity.status(201).body(db.find("informes", id));
    }

    @PatchMapping("/{id:\\d+}")
    public Object update(@PathVariable long id, AuthUser auth, Input input) {
        abortUnless(auth.isAdmin(), 403);
        Validation v = new Validation(input, db);
        v.field("estado").required().in("pendiente", "en revisión", "resuelta", "descartada");
        Map<String, Object> data = v.validate();
        Map<String, Object> report = db.findOrFail("informes", id);
        db.update("informes", data, id);
        notifier.user(Users.id(report, "id_usuario"), "informe", "Actualización de tu informe", "El estado de tu informe ahora es: " + data.get("estado") + ".", "/informes");
        return db.find("informes", id);
    }

    @DeleteMapping("/{id:\\d+}")
    public Object destroy(@PathVariable long id, AuthUser auth) {
        Map<String, Object> report = auth.isAdmin()
            ? db.find("informes", id)
            : db.first("SELECT * FROM informes WHERE id = ? AND id_usuario = ? AND estado = 'pendiente'", id, auth.id());
        abortUnless(report != null, 404);
        db.exec("DELETE FROM informes WHERE id = ?", id);
        if (auth.isAdmin()) notifier.user(Users.id(report, "id_usuario"), "informe", "Informe eliminado", "El equipo de ArtistApp ha eliminado un informe.", "/informes");
        return Map.of("message", "Informe eliminado.");
    }
}
