package com.artistapp.support;

import java.math.BigDecimal;
import java.net.URI;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.web.multipart.MultipartFile;

/**
 * Validación declarativa con la semántica de las reglas de Laravel usadas por la API
 * (sometimes, required, nullable, max, unique...). Devuelve solo los campos validados.
 */
public class Validation {
    public static final Pattern STRONG_PASSWORD = Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$");
    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private static final Set<String> IMAGE_TYPES = Set.of("jpg", "jpeg", "png", "gif", "bmp", "webp", "svg");

    private final Input input;
    private final Db db;
    private final List<Field> fields = new ArrayList<>();

    public Validation(Input input, Db db) {
        this.input = input;
        this.db = db;
    }

    public Field field(String name) {
        Field field = new Field(name);
        fields.add(field);
        return field;
    }

    /** Valida y devuelve los datos; lanza un 422 con el formato de Laravel si algo falla. */
    public Map<String, Object> validate() {
        Map<String, Object> data = new LinkedHashMap<>();
        Map<String, List<String>> errors = new LinkedHashMap<>();
        for (Field field : fields) {
            String error = field.check(data);
            if (error != null) errors.put(field.name, List.of(error));
        }
        if (!errors.isEmpty()) {
            String first = errors.values().iterator().next().getFirst();
            int more = errors.size() - 1;
            String message = more > 0 ? first + " (y " + more + (more == 1 ? " error más)" : " errores más)") : first;
            throw new ApiException(422, message, errors);
        }
        return data;
    }

    public final class Field {
        private final String name;
        private boolean sometimes;
        private boolean required;
        private boolean nullable;
        private boolean integer;
        private boolean numeric;
        private boolean email;
        private boolean date;
        private boolean url;
        private boolean file;
        private boolean image;
        private boolean confirmed;
        private String requiredWith;
        private String afterOrEqual;
        private Integer max;
        private BigDecimal min;
        private Pattern regex;
        private String regexMessage;
        private List<String> in;
        private List<String> mimes;
        private String[] unique;
        private Long uniqueIgnore;
        private String[] exists;

        private Field(String name) { this.name = name; }

        public Field sometimes() { sometimes = true; return this; }
        public Field required() { required = true; return this; }
        public Field nullable() { nullable = true; return this; }
        public Field string() { return this; }
        public Field integer() { integer = true; return this; }
        public Field numeric() { numeric = true; return this; }
        public Field email() { email = true; return this; }
        public Field date() { date = true; return this; }
        public Field url() { url = true; return this; }
        public Field file() { file = true; return this; }
        public Field image() { image = true; file = true; return this; }
        public Field confirmed() { confirmed = true; return this; }
        public Field requiredWith(String other) { requiredWith = other; return this; }
        public Field afterOrEqual(String other) { afterOrEqual = other; return this; }
        public Field max(int value) { max = value; return this; }
        public Field min(double value) { min = BigDecimal.valueOf(value); return this; }
        public Field regex(Pattern pattern, String message) { regex = pattern; regexMessage = message; return this; }
        public Field in(String... values) { in = Arrays.asList(values); return this; }
        public Field mimes(String... values) { mimes = Arrays.asList(values); return this; }
        public Field exists(String table, String column) { exists = new String[]{table, column}; return this; }

        public Field unique(String table, String column) { return unique(table, column, null); }

        public Field unique(String table, String column, Long ignoreId) {
            unique = new String[]{table, column};
            uniqueIgnore = ignoreId;
            return this;
        }

        private String check(Map<String, Object> data) {
            boolean present = input.has(name);
            if (sometimes && !present) return null;
            boolean filled = input.filled(name);
            boolean mustFill = required || (requiredWith != null && input.filled(requiredWith));
            if (!filled) {
                if (mustFill) return "El campo " + label() + " es obligatorio.";
                if (present || nullable) data.put(name, null);
                return null;
            }
            if (file) {
                MultipartFile upload = input.file(name);
                if (upload == null) return "El campo " + label() + " debe ser un archivo.";
                String extension = extension(upload.getOriginalFilename());
                if (image && !IMAGE_TYPES.contains(extension)) return "El campo " + label() + " debe ser una imagen.";
                if (mimes != null && !mimes.contains(extension)) return "El campo " + label() + " debe ser de tipo: " + String.join(", ", mimes) + ".";
                if (max != null && upload.getSize() > max * 1024L) return "El campo " + label() + " no debe superar los " + max + " KB.";
                data.put(name, upload);
                return null;
            }
            String text = input.str(name).trim();
            Object value = text;
            if (integer) {
                try { value = Long.parseLong(text); } catch (NumberFormatException e) { return "El campo " + label() + " debe ser un número entero."; }
            } else if (numeric) {
                try { value = new BigDecimal(text); } catch (NumberFormatException e) { return "El campo " + label() + " debe ser un número."; }
            }
            if (value instanceof Number number) {
                BigDecimal decimal = new BigDecimal(number.toString());
                if (min != null && decimal.compareTo(min) < 0) return "El campo " + label() + " debe ser al menos " + min.stripTrailingZeros().toPlainString() + ".";
                if (max != null && decimal.compareTo(BigDecimal.valueOf(max)) > 0) return "El campo " + label() + " no debe ser mayor que " + max + ".";
            } else {
                if (min != null && text.length() < min.intValue()) return "El campo " + label() + " debe tener al menos " + min.intValue() + " caracteres.";
                if (max != null && text.length() > max) return "El campo " + label() + " no debe superar los " + max + " caracteres.";
            }
            if (email && !EMAIL.matcher(text).matches()) return "El campo " + label() + " debe ser un correo válido.";
            if (url && !validUrl(text)) return "El campo " + label() + " debe ser una URL válida.";
            if (date) {
                try { LocalDate.parse(text.length() > 10 ? text.substring(0, 10) : text); } catch (DateTimeParseException e) { return "El campo " + label() + " debe ser una fecha válida."; }
                if (afterOrEqual != null && input.filled(afterOrEqual)) {
                    String other = input.str(afterOrEqual).trim();
                    if (text.compareTo(other) < 0) return "El campo " + label() + " debe ser una fecha igual o posterior a " + afterOrEqual.replace('_', ' ') + ".";
                }
            }
            if (in != null && !in.contains(text)) return "El valor de " + label() + " no es válido.";
            if (regex != null && !regex.matcher(input.str(name)).matches()) return regexMessage;
            if (confirmed && !input.str(name).equals(input.str(name + "_confirmation"))) return "La confirmación de " + label() + " no coincide.";
            if (exists != null && !db.exists("SELECT 1 FROM " + exists[0] + " WHERE " + exists[1] + " = ?", value)) return "El valor de " + label() + " no es válido.";
            if (unique != null) {
                boolean taken = uniqueIgnore == null
                    ? db.exists("SELECT 1 FROM " + unique[0] + " WHERE " + unique[1] + " = ?", text)
                    : db.exists("SELECT 1 FROM " + unique[0] + " WHERE " + unique[1] + " = ? AND id <> ?", text, uniqueIgnore);
                if (taken) return "El valor de " + label() + " ya está en uso.";
            }
            data.put(name, regex != null || confirmed ? input.str(name) : value);
            return null;
        }

        private String label() {
            return name.replace('_', ' ');
        }
    }

    private static boolean validUrl(String text) {
        try {
            URI uri = URI.create(text);
            return uri.getScheme() != null && uri.getHost() != null && (uri.getScheme().equals("http") || uri.getScheme().equals("https"));
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    public static String extension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }
}
