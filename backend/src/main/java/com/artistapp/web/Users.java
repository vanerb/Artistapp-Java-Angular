package com.artistapp.web;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Campos de usuario que se pueden exponer por la API (nunca la contraseña). */
final class Users {
    static final String PUBLIC_COLUMNS = "id, nombre, apellidos, usuario, correo, id_tipo, imagen, biografia";
    static final String PASSWORD_MESSAGE = "La contraseña debe incluir minúsculas, mayúsculas y números.";
    private static final List<String> FIELDS = List.of("id", "nombre", "apellidos", "usuario", "correo", "id_tipo", "imagen", "biografia");

    private Users() { }

    static Map<String, Object> publicUser(Map<String, Object> row) {
        Map<String, Object> user = new LinkedHashMap<>();
        for (String field : FIELDS) user.put(field, row.get(field));
        user.put("id", ((Number) row.get("id")).longValue());
        user.put("id_tipo", ((Number) row.get("id_tipo")).intValue());
        return user;
    }

    static long id(Map<String, Object> row, String key) {
        Object value = row.get(key);
        return value == null ? 0 : ((Number) value).longValue();
    }
}
