package com.artistapp.web;

import static com.artistapp.support.ApiException.abortUnless;

import com.artistapp.security.AuthUser;
import com.artistapp.security.Passwords;
import com.artistapp.security.TokenService;
import com.artistapp.service.Mailer;
import com.artistapp.service.Notifier;
import com.artistapp.support.ApiException;
import com.artistapp.support.Db;
import com.artistapp.support.Input;
import com.artistapp.support.Validation;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final Db db;
    private final TokenService tokens;
    private final Passwords passwords;
    private final Notifier notifier;
    private final Mailer mailer;
    private final String frontendUrl;
    private final SecureRandom random = new SecureRandom();

    public AuthController(Db db, TokenService tokens, Passwords passwords, Notifier notifier, Mailer mailer,
                          @Value("${artistapp.frontend-url}") String frontendUrl) {
        this.db = db;
        this.tokens = tokens;
        this.passwords = passwords;
        this.notifier = notifier;
        this.mailer = mailer;
        this.frontendUrl = frontendUrl;
    }

    @PostMapping("/login")
    public Object login(Input input) {
        Validation v = new Validation(input, db);
        v.field("user").required().string().max(255);
        v.field("password").required().string().max(240);
        Map<String, Object> data = v.validate();
        Map<String, Object> user = db.first("SELECT * FROM usuarios WHERE usuario = ? OR correo = ?", data.get("user"), data.get("user"));
        if (user == null || !verifyLegacyPassword(user, (String) data.get("password"))) {
            throw new ApiException(422, "Usuario o contraseña incorrectos.");
        }
        return session(user);
    }

    @PostMapping("/register")
    public Object register(Input input) {
        Validation v = new Validation(input, db);
        v.field("nombre").required().string().max(100);
        v.field("apellidos").required().string().max(140);
        v.field("usuario").required().string().max(100).unique("usuarios", "usuario");
        v.field("correo").required().email().max(240).unique("usuarios", "correo");
        v.field("password").required().string().min(8).max(240).confirmed().regex(Validation.STRONG_PASSWORD, Users.PASSWORD_MESSAGE);
        v.field("id_tipo").required().integer().in("3", "5", "7");
        Map<String, Object> data = v.validate();
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("nombre", data.get("nombre"));
        row.put("apellidos", data.get("apellidos"));
        row.put("usuario", data.get("usuario"));
        row.put("correo", data.get("correo").toString().toLowerCase());
        row.put("contrasena", passwords.hash((String) data.get("password")));
        row.put("id_tipo", data.get("id_tipo"));
        row.put("imagen", "media/no-user.png");
        row.put("biografia", "Aún no tiene");
        long id = db.insert("usuarios", row);
        notifier.user(id, "bienvenida", "¡Te damos la bienvenida a ArtistApp!", "Tu espacio creativo ya está listo. Descubre artistas, comparte tu obra y participa en eventos.", "/descubrir");
        return session(db.find("usuarios", id));
    }

    @GetMapping("/me")
    public Object me(AuthUser user) {
        return Map.of("user", Users.publicUser(db.find("usuarios", user.id())));
    }

    @PostMapping("/logout")
    public Object logout(AuthUser user) {
        tokens.revoke(user.tokenId());
        return Map.of("message", "Sesión cerrada.");
    }

    @PostMapping("/forgot-password")
    public Object forgotPassword(Input input) {
        Validation v = new Validation(input, db);
        v.field("correo").required().email().max(240);
        String email = v.validate().get("correo").toString().toLowerCase();
        Map<String, Object> user = db.first("SELECT * FROM usuarios WHERE correo = ?", email);
        if (user != null) {
            StringBuilder token = new StringBuilder();
            String alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (int i = 0; i < 64; i++) token.append(alphabet.charAt(random.nextInt(alphabet.length())));
            db.exec("DELETE FROM password_reset_tokens WHERE email = ?", email);
            db.exec("INSERT INTO password_reset_tokens (email, token, created_at) VALUES (?, ?, ?)", email, passwords.hash(token.toString()), LocalDateTime.now());
            String link = frontendUrl.replaceAll("/+$", "") + "/restablecer?email=" + URLEncoder.encode(email, StandardCharsets.UTF_8)
                + "&token=" + URLEncoder.encode(token.toString(), StandardCharsets.UTF_8);
            mailer.send(email, "Recupera tu acceso a ArtistApp", "Hola " + user.get("usuario") + ",\n\nPara elegir una nueva contraseña, abre este enlace (válido durante 60 minutos):\n"
                + link + "\n\nSi no solicitaste este cambio, ignora este mensaje.");
        }
        return Map.of("message", "Si existe una cuenta con ese correo, recibirás un enlace para recuperar el acceso.");
    }

    @PostMapping("/reset-password")
    @Transactional
    public Object resetPassword(Input input) {
        Validation v = new Validation(input, db);
        v.field("correo").required().email();
        v.field("token").required().string();
        v.field("password").required().string().min(8).max(240).confirmed().regex(Validation.STRONG_PASSWORD, Users.PASSWORD_MESSAGE);
        Map<String, Object> data = v.validate();
        String email = data.get("correo").toString().toLowerCase();
        Map<String, Object> row = db.first("SELECT * FROM password_reset_tokens WHERE email = ?", email);
        boolean valid = row != null && row.get("created_at") != null
            && Duration.between(LocalDateTime.parse(row.get("created_at").toString(), DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), LocalDateTime.now()).toMinutes() <= 60
            && passwords.check((String) data.get("token"), (String) row.get("token"));
        abortUnless(valid, 422, "El enlace no es válido o ha caducado.");
        Map<String, Object> user = db.first("SELECT * FROM usuarios WHERE correo = ?", email);
        if (user == null) throw ApiException.notFound();
        long userId = ((Number) user.get("id")).longValue();
        db.exec("UPDATE usuarios SET contrasena = ? WHERE id = ?", passwords.hash((String) data.get("password")), userId);
        db.exec("DELETE FROM password_reset_tokens WHERE email = ?", email);
        tokens.revokeAll(userId);
        return Map.of("message", "Contraseña actualizada. Ya puedes iniciar sesión.");
    }

    private ResponseEntity<Map<String, Object>> session(Map<String, Object> user) {
        long id = ((Number) user.get("id")).longValue();
        return ResponseEntity.ok(Map.of("user", Users.publicUser(user), "token", tokens.create(id)));
    }

    /** Acepta los MD5 del proyecto original y los actualiza a bcrypt al iniciar sesión. */
    private boolean verifyLegacyPassword(Map<String, Object> user, String password) {
        String stored = String.valueOf(user.get("contrasena"));
        if (Passwords.isLegacyMd5(stored)) {
            boolean valid = Passwords.md5Matches(password, stored);
            if (valid) db.exec("UPDATE usuarios SET contrasena = ? WHERE id = ?", passwords.hash(password), user.get("id"));
            return valid;
        }
        return passwords.check(password, stored);
    }
}
