package com.artistapp.web;

import static com.artistapp.support.ApiException.abortIf;
import static com.artistapp.support.ApiException.abortUnless;

import com.artistapp.security.AuthUser;
import com.artistapp.service.StorageService;
import com.artistapp.service.StorageService.Disk;
import com.artistapp.service.WatermarkService;
import com.artistapp.support.ApiException;
import com.artistapp.support.Db;
import com.artistapp.support.Input;
import com.artistapp.support.Validation;
import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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

/**
 * Tienda. Al subir un producto se guarda el original en el disco privado y se publica
 * una portada reducida con marca de agua; el archivo digital solo se entrega al comprador.
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {
    private static final String NO_FILES = "Sin archivos";
    private static final String PUBLIC_SELECT = "SELECT p.id, p.nombre, p.descripcion, p.precio, p.cantidad, p.imagen, p.id_tipo, p.id_usuario, "
        + "u.usuario AS artist_name, u.imagen AS artist_image, t.nombre AS type_name "
        + "FROM productos AS p JOIN usuarios AS u ON u.id = p.id_usuario LEFT JOIN tipo_producto AS t ON t.id = p.id_tipo";

    private final Db db;
    private final StorageService storage;
    private final WatermarkService watermark;

    public ProductController(Db db, StorageService storage, WatermarkService watermark) {
        this.db = db;
        this.storage = storage;
        this.watermark = watermark;
    }

    @GetMapping
    public Object index(HttpServletRequest request, Input input) {
        StringBuilder sql = new StringBuilder(PUBLIC_SELECT).append(" WHERE 1 = 1");
        List<Object> args = new ArrayList<>();
        if (input.filled("q")) {
            String search = "%" + input.str("q") + "%";
            sql.append(" AND (p.nombre LIKE ? OR p.descripcion LIKE ? OR u.usuario LIKE ?)");
            args.add(search);
            args.add(search);
            args.add(search);
        }
        if (input.filled("tipo")) {
            sql.append(" AND p.id_tipo = ?");
            args.add(input.integer("tipo", 0));
        }
        if (input.filled("precio")) {
            // Rangos "min-max" o "min-?" (sin límite superior).
            String[] range = input.str("precio").split("-", 2);
            if (range.length == 2 && isNumeric(range[0])) {
                if (range[1].equals("?")) {
                    sql.append(" AND p.precio >= ?");
                    args.add(Double.parseDouble(range[0]));
                } else if (isNumeric(range[1])) {
                    sql.append(" AND p.precio BETWEEN ? AND ?");
                    args.add(Double.parseDouble(range[0]));
                    args.add(Double.parseDouble(range[1]));
                }
            }
        }
        if (input.bool("disponible")) sql.append(" AND p.cantidad > 0");
        sql.append(" ORDER BY p.id DESC");
        return db.paginate(request, 24, sql.toString(), args.toArray());
    }

    private static boolean isNumeric(String value) {
        try { Double.parseDouble(value.trim()); return !value.isBlank(); } catch (NumberFormatException e) { return false; }
    }

    @GetMapping("/{id:\\d+}")
    public Object show(@PathVariable long id) {
        return findPublicProduct(id);
    }

    @PostMapping
    public ResponseEntity<Object> store(AuthUser auth, Input input) {
        abortUnless(auth.isOneOf(1, 3, 5), 403, "Solo artistas y organizadores pueden vender productos.");
        Validation v = new Validation(input, db);
        v.field("nombre").required().string().max(255);
        v.field("descripcion").required().string().max(255);
        v.field("precio").required().numeric().min(0.01);
        v.field("cantidad").required().integer().min(0);
        v.field("id_tipo").required().integer().in("1", "2");
        v.field("imagen").required().image().mimes("jpg", "jpeg", "png", "webp").max(8192);
        v.field("archivo_digital").nullable().file().max(51200);
        Map<String, Object> data = v.validate();
        MultipartFile digital = (MultipartFile) data.remove("archivo_digital");
        if (((Number) data.get("id_tipo")).intValue() == 2) {
            abortUnless(digital != null, 422, "Añade el archivo que recibirá el comprador.");
        }

        String originalPath = null;
        String coverPath = null;
        String digitalPath = null;
        long id;
        try {
            originalPath = storage.store((MultipartFile) data.get("imagen"), "originales/productos", Disk.LOCAL);
            coverPath = "uploads/productos/" + UUID.randomUUID() + ".jpg";
            watermark.createCover(storage.path(Disk.LOCAL, originalPath), coverPath);
            if (digital != null) digitalPath = storage.store(digital, "digital", Disk.LOCAL);
            data.put("id_usuario", auth.id());
            data.put("imagen", coverPath);
            data.put("imagen_original", originalPath);
            data.put("archivos", digitalPath != null ? digitalPath : NO_FILES);
            id = db.insert("productos", data);
        } catch (RuntimeException exception) {
            storage.delete(Disk.PUBLIC, coverPath);
            storage.delete(Disk.LOCAL, originalPath);
            storage.delete(Disk.LOCAL, digitalPath);
            if (exception instanceof IllegalStateException) throw new ApiException(422, exception.getMessage());
            throw exception;
        }
        // No se devuelve imagen_original ni la ruta del archivo digital.
        return ResponseEntity.status(201).body(findPublicProduct(id));
    }

    @PatchMapping("/{id:\\d+}")
    public Object update(@PathVariable long id, AuthUser auth, Input input) {
        Map<String, Object> product = db.findOrFail("productos", id);
        abortUnless(Users.id(product, "id_usuario") == auth.id() || auth.isAdmin(), 403);
        Validation v = new Validation(input, db);
        v.field("nombre").sometimes().required().string().max(255);
        v.field("descripcion").sometimes().required().string().max(255);
        v.field("precio").sometimes().required().numeric().min(0.01);
        v.field("cantidad").sometimes().required().integer().min(0);
        v.field("id_tipo").sometimes().integer().in("1", "2");
        v.field("imagen").sometimes().nullable().image().mimes("jpg", "jpeg", "png", "webp").max(8192);
        v.field("archivo_digital").sometimes().nullable().file().max(51200);
        Map<String, Object> data = v.validate();
        Object image = data.remove("imagen");
        MultipartFile digital = (MultipartFile) data.remove("archivo_digital");
        if (data.containsKey("id_tipo") && data.get("id_tipo") == null) data.remove("id_tipo");

        int nextType = data.containsKey("id_tipo") ? ((Number) data.get("id_tipo")).intValue() : (int) Users.id(product, "id_tipo");
        String currentFiles = (String) product.get("archivos");
        abortIf(nextType == 2 && digital == null && (currentFiles == null || currentFiles.isBlank() || currentFiles.equals(NO_FILES)),
            422, "Añade el archivo que recibirá el comprador.");

        String newOriginalPath = null;
        String newCoverPath = null;
        String newDigitalPath = null;
        try {
            if (image instanceof MultipartFile file) {
                newOriginalPath = storage.store(file, "originales/productos", Disk.LOCAL);
                newCoverPath = "uploads/productos/" + UUID.randomUUID() + ".jpg";
                watermark.createCover(storage.path(Disk.LOCAL, newOriginalPath), newCoverPath);
                data.put("imagen", newCoverPath);
                data.put("imagen_original", newOriginalPath);
            }
            if (digital != null) {
                newDigitalPath = storage.store(digital, "digital", Disk.LOCAL);
                data.put("archivos", newDigitalPath);
            }
            db.update("productos", data, id);
        } catch (RuntimeException exception) {
            storage.delete(Disk.PUBLIC, newCoverPath);
            storage.delete(Disk.LOCAL, newOriginalPath);
            storage.delete(Disk.LOCAL, newDigitalPath);
            if (exception instanceof IllegalStateException) throw new ApiException(422, exception.getMessage());
            throw exception;
        }
        // Los archivos anteriores se eliminan solo después de actualizar la base de datos.
        if (newCoverPath != null) {
            storage.delete(Disk.PUBLIC, (String) product.get("imagen"));
            storage.delete(Disk.LOCAL, (String) product.get("imagen_original"));
        }
        if (newDigitalPath != null && currentFiles != null && !currentFiles.equals(NO_FILES)) {
            storage.delete(Disk.LOCAL, currentFiles);
        }
        return findPublicProduct(id);
    }

    @DeleteMapping("/{id:\\d+}")
    @Transactional
    public Object destroy(@PathVariable long id, AuthUser auth) {
        Map<String, Object> product = db.findOrFail("productos", id);
        abortUnless(Users.id(product, "id_usuario") == auth.id() || auth.isAdmin(), 403);
        abortIf(db.exists("SELECT 1 FROM detalles_pedido WHERE id_producto = ?", id), 422, "Este producto ya aparece en pedidos y no se puede borrar.");
        db.exec("DELETE FROM cesta_producto WHERE id_producto = ?", id);
        db.exec("DELETE FROM productos WHERE id = ?", id);
        storage.delete(Disk.PUBLIC, (String) product.get("imagen"));
        storage.delete(Disk.LOCAL, (String) product.get("imagen_original"));
        String files = (String) product.get("archivos");
        if (files != null && !files.equals(NO_FILES)) storage.delete(Disk.LOCAL, files);
        return Map.of("message", "Producto eliminado.");
    }

    /** Solo los datos que pueden exponerse por la API. */
    private Map<String, Object> findPublicProduct(long id) {
        Map<String, Object> product = db.first(PUBLIC_SELECT + " WHERE p.id = ?", id);
        if (product == null) throw ApiException.notFound();
        return new LinkedHashMap<>(product);
    }
}
