package com.artistapp.config;

import com.artistapp.security.Passwords;
import com.artistapp.support.Db;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Sustituye a las migraciones y seeders de Laravel: crea solo lo que falta, sin tocar
 * los datos del esquema histórico, y deja preparados los catálogos y la cuenta de administración.
 * Se puede ejecutar en cada arranque sin duplicar nada.
 */
@Component
public class SchemaInitializer implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(SchemaInitializer.class);
    private static final String ID = "id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY";
    private static final String FK = " BIGINT UNSIGNED NOT NULL";

    private static final List<String> TABLES = List.of(
        "tipo_usuario (" + ID + ", nombre VARCHAR(255) NOT NULL)",
        "tipo_producto (" + ID + ", nombre VARCHAR(255) NOT NULL)",
        "categoria (" + ID + ", nombre VARCHAR(255) NOT NULL)",
        "usuarios (" + ID + ", nombre VARCHAR(255) NOT NULL, apellidos VARCHAR(255) NOT NULL, usuario VARCHAR(255) NOT NULL UNIQUE, correo VARCHAR(255) NOT NULL UNIQUE, contrasena VARCHAR(255) NOT NULL, id_tipo" + FK + ", imagen VARCHAR(255) NOT NULL DEFAULT 'media/no-user.png', biografia VARCHAR(255) NOT NULL DEFAULT '', INDEX (id_tipo))",
        "publicaciones (" + ID + ", titulo VARCHAR(255) NOT NULL, descripcion VARCHAR(255) NOT NULL, tipo VARCHAR(255) NOT NULL DEFAULT 'public', id_categoria" + FK + ", id_usuario" + FK + ", megusta INT UNSIGNED NOT NULL DEFAULT 0, imagen VARCHAR(255) NOT NULL DEFAULT '', INDEX (id_categoria), INDEX (id_usuario))",
        "eventos (" + ID + ", nombre VARCHAR(255) NOT NULL, ubicacion VARCHAR(255) NOT NULL, link VARCHAR(255) NOT NULL DEFAULT '', fecha_inicio DATE NOT NULL, fecha_fin DATE NOT NULL, id_usuario" + FK + ", imagen VARCHAR(255) NOT NULL DEFAULT '', INDEX (id_usuario))",
        "listado_evento (" + ID + ", id_evento" + FK + ", id_usuario" + FK + ", estado VARCHAR(255) NOT NULL DEFAULT 'pendiente', INDEX (id_evento), INDEX (id_usuario))",
        "productos (" + ID + ", nombre VARCHAR(255) NOT NULL, descripcion VARCHAR(255) NOT NULL, precio DECIMAL(10,2) NOT NULL, cantidad INT NOT NULL DEFAULT 0, imagen VARCHAR(255) NOT NULL DEFAULT '', imagen_original VARCHAR(255) NULL, id_tipo" + FK + ", id_usuario" + FK + ", archivos VARCHAR(255) NOT NULL DEFAULT '', INDEX (id_tipo), INDEX (id_usuario))",
        "cesta (" + ID + ", id_usuario" + FK + " UNIQUE)",
        "cesta_producto (" + ID + ", id_cesta" + FK + ", id_producto" + FK + ", INDEX (id_cesta), INDEX (id_producto))",
        "pedidos (" + ID + ", id_usuario" + FK + ", nombre VARCHAR(255) NOT NULL, estado VARCHAR(255) NOT NULL DEFAULT 'preparando', direccion VARCHAR(255) NOT NULL, telefono VARCHAR(32) NOT NULL, pago DECIMAL(10,2) NOT NULL, INDEX (id_usuario))",
        "detalles_pedido (" + ID + ", id_pedido" + FK + ", id_producto" + FK + ", estado_envio VARCHAR(255) NOT NULL DEFAULT 'preparando', recibido_confirmado_at TIMESTAMP NULL, INDEX (id_pedido), INDEX (id_producto))",
        "avisos (" + ID + ", titulo VARCHAR(255) NOT NULL, aviso VARCHAR(255) NOT NULL, fecha_publicacion DATE NOT NULL, id_usuario" + FK + ", hora TIME NOT NULL, INDEX (id_usuario))",
        "favoritos (" + ID + ", id_usuario" + FK + ", id_usuariopin" + FK + ", INDEX (id_usuario), INDEX (id_usuariopin))",
        "megusta (" + ID + ", id_usuario" + FK + ", id_publicacion" + FK + ", megusta TINYINT UNSIGNED NOT NULL DEFAULT 0, INDEX (id_usuario), INDEX (id_publicacion))",
        "informes (" + ID + ", id_usuario" + FK + ", informe VARCHAR(255) NOT NULL, id_usuarioreferenciado" + FK + ", estado VARCHAR(255) NOT NULL DEFAULT 'pendiente', INDEX (id_usuario), INDEX (id_usuarioreferenciado))",
        "personal_access_tokens (" + ID + ", tokenable_type VARCHAR(255) NOT NULL, tokenable_id" + FK + ", name VARCHAR(255) NOT NULL, token VARCHAR(64) NOT NULL UNIQUE, abilities TEXT NULL, last_used_at TIMESTAMP NULL, expires_at TIMESTAMP NULL, created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL, INDEX (tokenable_type, tokenable_id))",
        "password_reset_tokens (email VARCHAR(255) NOT NULL PRIMARY KEY, token VARCHAR(255) NOT NULL, created_at TIMESTAMP NULL)",
        "app_notifications (" + ID + ", user_id" + FK + ", type VARCHAR(40) NOT NULL, title VARCHAR(180) NOT NULL, message TEXT NOT NULL, link VARCHAR(255) NULL, read_at TIMESTAMP NULL, created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL, INDEX (user_id))",
        "publication_comments (" + ID + ", publication_id" + FK + ", user_id" + FK + ", body VARCHAR(1000) NOT NULL, created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL, INDEX (publication_id), INDEX (user_id))",
        "event_chat_messages (" + ID + ", event_id" + FK + ", user_id" + FK + ", body VARCHAR(1000) NOT NULL, created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL, INDEX (event_id), INDEX (user_id))",
        "direct_messages (" + ID + ", sender_id" + FK + ", recipient_id" + FK + ", body VARCHAR(1000) NOT NULL, created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL, INDEX (sender_id), INDEX (recipient_id))"
    );

    private final Db db;
    private final Passwords passwords;
    private final String adminName;
    private final String adminUsername;
    private final String adminEmail;
    private final String adminPassword;

    public SchemaInitializer(Db db, Passwords passwords,
                             @Value("${artistapp.admin.name}") String adminName,
                             @Value("${artistapp.admin.username}") String adminUsername,
                             @Value("${artistapp.admin.email}") String adminEmail,
                             @Value("${artistapp.admin.password}") String adminPassword) {
        this.db = db;
        this.passwords = passwords;
        this.adminName = adminName;
        this.adminUsername = adminUsername;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        for (String table : TABLES) db.exec("CREATE TABLE IF NOT EXISTS " + table + " ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        addMissingColumns();
        seedCatalogs();
        seedAdmin();
        log.info("Esquema de ArtistApp, tipos de usuario y categorías preparados.");
    }

    private boolean hasColumn(String table, String column) {
        return db.exists("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?", table, column);
    }

    /** Columnas añadidas tras el esquema histórico (equivale a las migraciones de octubre de 2026). */
    private void addMissingColumns() {
        if (!hasColumn("productos", "imagen_original")) {
            db.exec("ALTER TABLE productos ADD COLUMN imagen_original VARCHAR(255) NULL AFTER imagen");
        }
        boolean addedDeliveryState = false;
        if (!hasColumn("detalles_pedido", "estado_envio")) {
            db.exec("ALTER TABLE detalles_pedido ADD COLUMN estado_envio VARCHAR(255) NOT NULL DEFAULT 'preparando'");
            addedDeliveryState = true;
        }
        if (!hasColumn("detalles_pedido", "recibido_confirmado_at")) {
            db.exec("ALTER TABLE detalles_pedido ADD COLUMN recibido_confirmado_at TIMESTAMP NULL");
        }
        if (addedDeliveryState) {
            // Conserva el estado de los pedidos que ya existían antes de separar el envío por artículo.
            for (Map<String, Object> order : db.list("SELECT id, estado FROM pedidos")) {
                String state = String.valueOf(order.get("estado"));
                if (!List.of("preparando", "enviado", "entregado").contains(state)) state = "preparando";
                if (state.equals("entregado")) {
                    db.exec("UPDATE detalles_pedido SET estado_envio = ?, recibido_confirmado_at = ? WHERE id_pedido = ?", state, LocalDateTime.now(), order.get("id"));
                } else {
                    db.exec("UPDATE detalles_pedido SET estado_envio = ? WHERE id_pedido = ?", state, order.get("id"));
                }
            }
        }
    }

    private void seedCatalogs() {
        Map<Integer, String> userTypes = Map.of(1, "Administrador", 3, "Organizador Eventos", 5, "Artista", 7, "Visitante");
        userTypes.forEach((id, name) -> upsertById("tipo_usuario", id, name));
        Map<Integer, String> productTypes = Map.of(1, "Físico", 2, "Digital");
        productTypes.forEach((id, name) -> upsertById("tipo_producto", id, name));
        for (String name : List.of("Anime", "Manga", "Cosplay", "Cartoon", "Realismo", "Yuri", "Yaoi", "Diseños 3D", "Comic")) {
            if (!db.exists("SELECT 1 FROM categoria WHERE nombre = ?", name)) db.exec("INSERT INTO categoria (nombre) VALUES (?)", name);
        }
    }

    private void upsertById(String table, int id, String name) {
        if (db.exists("SELECT 1 FROM " + table + " WHERE id = ?", id)) {
            db.exec("UPDATE " + table + " SET nombre = ? WHERE id = ?", name, id);
        } else {
            db.exec("INSERT INTO " + table + " (id, nombre) VALUES (?, ?)", id, name);
        }
    }

    private void seedAdmin() {
        if (adminEmail.isBlank() || adminPassword.isBlank()) return;
        String email = adminEmail.trim().toLowerCase();
        // Solo se crea si no existe, para no pisar cambios hechos después desde la aplicación.
        if (db.exists("SELECT 1 FROM usuarios WHERE correo = ? OR usuario = ?", email, adminUsername)) return;
        db.exec("INSERT INTO usuarios (nombre, apellidos, usuario, correo, contrasena, id_tipo, imagen, biografia) VALUES (?, 'ArtistApp', ?, ?, ?, 1, 'media/no-user.png', 'Cuenta de administración')",
            adminName, adminUsername, email, passwords.hash(adminPassword));
    }
}
