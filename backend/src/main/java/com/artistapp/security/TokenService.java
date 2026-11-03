package com.artistapp.security;

import com.artistapp.support.Db;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.zip.CRC32;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Tokens de acceso personales compatibles con Laravel Sanctum: se guardan como SHA-256
 * en personal_access_tokens y el cliente recibe "id|texto", así las sesiones existentes siguen siendo válidas.
 */
@Service
public class TokenService {
    static final String TOKENABLE_TYPE = "App\\Models\\ArtistUser";
    private static final String ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    private static final DateTimeFormatter TIMESTAMP = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final Db db;
    private final int lifetimeDays;
    private final SecureRandom random = new SecureRandom();

    public TokenService(Db db, @Value("${artistapp.token-days:30}") int lifetimeDays) {
        this.db = db;
        this.lifetimeDays = lifetimeDays;
    }

    public String create(long userId) {
        StringBuilder plain = new StringBuilder(48);
        for (int i = 0; i < 40; i++) plain.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        CRC32 crc = new CRC32();
        crc.update(plain.toString().getBytes(StandardCharsets.UTF_8));
        plain.append(String.format("%08x", crc.getValue()));
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("tokenable_type", TOKENABLE_TYPE);
        row.put("tokenable_id", userId);
        row.put("name", "artistapp-angular");
        row.put("token", sha256(plain.toString()));
        row.put("abilities", "[\"*\"]");
        row.put("expires_at", LocalDateTime.now().plusDays(lifetimeDays));
        row.put("created_at", LocalDateTime.now());
        row.put("updated_at", LocalDateTime.now());
        db.exec("DELETE FROM personal_access_tokens WHERE expires_at IS NOT NULL AND expires_at < ?", LocalDateTime.now());
        long id = db.insert("personal_access_tokens", row);
        return id + "|" + plain;
    }

    public AuthUser resolve(String bearer) {
        if (bearer == null || bearer.isBlank()) return null;
        Map<String, Object> token;
        int separator = bearer.indexOf('|');
        if (separator > 0) {
            long id;
            try { id = Long.parseLong(bearer.substring(0, separator)); } catch (NumberFormatException e) { return null; }
            token = db.find("personal_access_tokens", id);
            if (token == null || !MessageDigest.isEqual(
                ((String) token.get("token")).getBytes(StandardCharsets.UTF_8),
                sha256(bearer.substring(separator + 1)).getBytes(StandardCharsets.UTF_8))) return null;
        } else {
            token = db.first("SELECT * FROM personal_access_tokens WHERE token = ?", sha256(bearer));
            if (token == null) return null;
        }
        if (!TOKENABLE_TYPE.equals(token.get("tokenable_type"))) return null;
        if (isExpired(token)) return null;
        Map<String, Object> user = db.find("usuarios", ((Number) token.get("tokenable_id")).longValue());
        if (user == null) return null;
        long tokenId = ((Number) token.get("id")).longValue();
        db.exec("UPDATE personal_access_tokens SET last_used_at = ? WHERE id = ?", LocalDateTime.now(), tokenId);
        return AuthUser.from(user, tokenId);
    }

    /** Los tokens anteriores a la caducidad no tienen expires_at: cuentan desde su creación. */
    private boolean isExpired(Map<String, Object> token) {
        LocalDateTime now = LocalDateTime.now();
        if (token.get("expires_at") != null) return LocalDateTime.parse(token.get("expires_at").toString(), TIMESTAMP).isBefore(now);
        return token.get("created_at") != null && LocalDateTime.parse(token.get("created_at").toString(), TIMESTAMP).plusDays(lifetimeDays).isBefore(now);
    }

    public void revoke(long tokenId) {
        db.exec("DELETE FROM personal_access_tokens WHERE id = ?", tokenId);
    }

    public void revokeAll(long userId) {
        db.exec("DELETE FROM personal_access_tokens WHERE tokenable_type = ? AND tokenable_id = ?", TOKENABLE_TYPE, userId);
    }

    static String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
