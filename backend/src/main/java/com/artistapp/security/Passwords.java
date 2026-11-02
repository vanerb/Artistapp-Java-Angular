package com.artistapp.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/** Contraseñas bcrypt (compatibles con los hashes $2y$ de Laravel) y verificación de los MD5 heredados. */
@Component
public class Passwords {
    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder(10);

    public String hash(String password) {
        return bcrypt.encode(password);
    }

    public boolean check(String password, String stored) {
        if (password == null || stored == null || stored.isEmpty()) return false;
        try {
            return bcrypt.matches(password, stored.startsWith("$2y$") ? "$2a$" + stored.substring(4) : stored);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    public static boolean isLegacyMd5(String stored) {
        return stored != null && stored.length() == 32 && stored.chars().allMatch(c -> Character.digit(c, 16) >= 0);
    }

    public static boolean md5Matches(String password, String stored) {
        try {
            String digest = HexFormat.of().formatHex(MessageDigest.getInstance("MD5").digest(password.getBytes(StandardCharsets.UTF_8)));
            return MessageDigest.isEqual(digest.getBytes(StandardCharsets.UTF_8), stored.toLowerCase().getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
