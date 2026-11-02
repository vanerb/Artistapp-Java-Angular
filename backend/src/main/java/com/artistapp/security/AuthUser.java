package com.artistapp.security;

import java.util.Map;

/** Usuario autenticado por token Bearer. Tipos: 1 admin, 3 organizador, 5 artista, 7 amante del arte. */
public record AuthUser(long id, String usuario, int idTipo, String contrasena, long tokenId) {
    public static final int ADMIN = 1;
    public static final int ORGANIZER = 3;
    public static final int ARTIST = 5;

    static AuthUser from(Map<String, Object> row, long tokenId) {
        return new AuthUser(
            ((Number) row.get("id")).longValue(),
            (String) row.get("usuario"),
            ((Number) row.get("id_tipo")).intValue(),
            (String) row.get("contrasena"),
            tokenId
        );
    }

    public boolean isAdmin() { return idTipo == ADMIN; }

    public boolean isOneOf(int... types) {
        for (int type : types) if (type == idTipo) return true;
        return false;
    }
}
