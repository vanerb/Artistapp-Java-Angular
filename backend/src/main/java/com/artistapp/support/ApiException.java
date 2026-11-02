package com.artistapp.support;

import java.util.List;
import java.util.Map;

/** Error HTTP con el mismo formato JSON que devolvía Laravel: {message, errors?}. */
public class ApiException extends RuntimeException {
    private final int status;
    private final Map<String, List<String>> errors;

    public ApiException(int status, String message) {
        this(status, message, null);
    }

    public ApiException(int status, String message, Map<String, List<String>> errors) {
        super(message);
        this.status = status;
        this.errors = errors;
    }

    public int status() { return status; }
    public Map<String, List<String>> errors() { return errors; }

    public static ApiException notFound() { return new ApiException(404, "No encontrado."); }
    public static ApiException forbidden() { return new ApiException(403, "Esta acción no está autorizada."); }

    /** Equivalente a abort_unless(condition, status, message). */
    public static void abortUnless(boolean condition, int status, String message) {
        if (!condition) throw new ApiException(status, message);
    }

    public static void abortUnless(boolean condition, int status) {
        if (!condition) throw status == 404 ? notFound() : status == 403 ? forbidden() : new ApiException(status, "Error.");
    }

    public static void abortIf(boolean condition, int status, String message) {
        abortUnless(!condition, status, message);
    }
}
