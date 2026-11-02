package com.artistapp.web;

import static com.artistapp.support.ApiException.abortIf;
import static com.artistapp.support.ApiException.abortUnless;

import com.artistapp.security.AuthUser;
import com.artistapp.support.Db;
import com.artistapp.support.Input;
import com.artistapp.support.Validation;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Categorías de obras y tipos de producto. */
@RestController
@RequestMapping("/api")
public class CatalogController {
    private final Db db;

    public CatalogController(Db db) {
        this.db = db;
    }

    @GetMapping("/product-types")
    public Object productTypes() {
        return db.list("SELECT * FROM tipo_producto");
    }

    @GetMapping("/categories")
    public Object index() {
        return db.list("SELECT * FROM categoria ORDER BY nombre");
    }

    @PostMapping("/categories")
    public ResponseEntity<Object> store(AuthUser auth, Input input) {
        abortUnless(auth.isAdmin(), 403);
        Validation v = new Validation(input, db);
        v.field("nombre").required().string().max(255).unique("categoria", "nombre");
        long id = db.insert("categoria", v.validate());
        return ResponseEntity.status(201).body(db.find("categoria", id));
    }

    @PatchMapping("/categories/{id:\\d+}")
    public Object update(@PathVariable long id, AuthUser auth, Input input) {
        abortUnless(auth.isAdmin(), 403);
        abortUnless(db.exists("SELECT 1 FROM categoria WHERE id = ?", id), 404);
        Validation v = new Validation(input, db);
        v.field("nombre").required().string().max(255).unique("categoria", "nombre", id);
        db.update("categoria", v.validate(), id);
        return db.find("categoria", id);
    }

    @DeleteMapping("/categories/{id:\\d+}")
    public Object destroy(@PathVariable long id, AuthUser auth) {
        abortUnless(auth.isAdmin(), 403);
        abortIf(db.exists("SELECT 1 FROM publicaciones WHERE id_categoria = ?", id), 422, "Esta categoría está asignada a publicaciones.");
        abortUnless(db.exec("DELETE FROM categoria WHERE id = ?", id) > 0, 404);
        return Map.of("message", "Categoría eliminada.");
    }
}
