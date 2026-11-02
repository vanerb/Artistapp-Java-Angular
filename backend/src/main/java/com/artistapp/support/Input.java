package com.artistapp.support;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

/** Datos de la petición (query + JSON o formulario + archivos), como $request->input() en Laravel. */
public class Input {
    private final Map<String, Object> values;
    private final Map<String, MultipartFile> files;

    public Input(Map<String, Object> values, Map<String, MultipartFile> files) {
        this.values = new LinkedHashMap<>(values);
        this.files = files;
    }

    /** Presente en la petición, aunque esté vacío ("sometimes" en Laravel). */
    public boolean has(String key) {
        return values.containsKey(key) || files.containsKey(key);
    }

    /** Presente y con contenido ("filled" en Laravel). */
    public boolean filled(String key) {
        if (hasFile(key)) return true;
        Object value = values.get(key);
        return value != null && !value.toString().isBlank();
    }

    public Object raw(String key) {
        return values.get(key);
    }

    public String str(String key) {
        Object value = values.get(key);
        return value == null ? null : value.toString();
    }

    public int integer(String key, int fallback) {
        try { return Integer.parseInt(str(key).trim()); } catch (RuntimeException e) { return fallback; }
    }

    public boolean bool(String key) {
        String value = str(key);
        return value != null && (value.equals("1") || value.equalsIgnoreCase("true") || value.equalsIgnoreCase("on") || value.equalsIgnoreCase("yes"));
    }

    public boolean hasFile(String key) {
        MultipartFile file = files.get(key);
        return file != null && !file.isEmpty();
    }

    public MultipartFile file(String key) {
        return hasFile(key) ? files.get(key) : null;
    }
}
