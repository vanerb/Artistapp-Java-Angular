package com.artistapp.support;

import jakarta.servlet.http.HttpServletRequest;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Time;
import java.sql.Timestamp;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import org.springframework.jdbc.core.ColumnMapRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Component;

/**
 * Acceso SQL directo sobre el esquema histórico, al estilo del query builder de Laravel.
 * Las filas se devuelven como mapas para conservar exactamente los nombres de columna en el JSON.
 */
@Component
public class Db {
    private static final DateTimeFormatter TIMESTAMP = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final JdbcTemplate jdbc;
    private final ColumnMapRowMapper mapper = new ColumnMapRowMapper() {
        @Override
        protected Map<String, Object> createColumnMap(int columnCount) {
            return new LinkedHashMap<>(columnCount);
        }

        @Override
        protected Object getColumnValue(ResultSet rs, int index) throws SQLException {
            Object value = rs.getObject(index);
            if (value instanceof Timestamp timestamp) return timestamp.toLocalDateTime().format(TIMESTAMP);
            if (value instanceof java.time.LocalDateTime dateTime) return dateTime.format(TIMESTAMP);
            if (value instanceof java.sql.Date date) return date.toLocalDate().toString();
            if (value instanceof java.time.LocalDate date) return date.toString();
            if (value instanceof Time time) return time.toString();
            if (value instanceof java.time.LocalTime time) return time.format(DateTimeFormatter.ofPattern("HH:mm:ss"));
            if (value instanceof java.math.BigInteger big) return big.longValue();
            if (value instanceof Boolean bool) return bool ? 1 : 0;
            return value;
        }
    };

    public Db(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public JdbcTemplate jdbc() { return jdbc; }

    public List<Map<String, Object>> list(String sql, Object... args) {
        return jdbc.query(sql, mapper, args);
    }

    public Map<String, Object> first(String sql, Object... args) {
        String limited = sql.endsWith(" FOR UPDATE")
            ? sql.substring(0, sql.length() - " FOR UPDATE".length()) + " LIMIT 1 FOR UPDATE"
            : sql + " LIMIT 1";
        List<Map<String, Object>> rows = list(limited, args);
        return rows.isEmpty() ? null : rows.getFirst();
    }

    public Map<String, Object> find(String table, long id) {
        return first("SELECT * FROM " + table + " WHERE id = ?", id);
    }

    public Map<String, Object> findOrFail(String table, long id) {
        Map<String, Object> row = find(table, id);
        if (row == null) throw ApiException.notFound();
        return row;
    }

    public boolean exists(String sql, Object... args) {
        Integer result = jdbc.queryForObject("SELECT EXISTS(" + sql + ")", Integer.class, args);
        return result != null && result == 1;
    }

    public long count(String sql, Object... args) {
        Long result = jdbc.queryForObject(sql, Long.class, args);
        return result == null ? 0 : result;
    }

    public List<Long> ids(String sql, Object... args) {
        return jdbc.queryForList(sql, Long.class, args);
    }

    public <T> T value(String sql, Class<T> type, Object... args) {
        List<T> values = jdbc.queryForList(sql + " LIMIT 1", type, args);
        return values.isEmpty() ? null : values.getFirst();
    }

    public int exec(String sql, Object... args) {
        return jdbc.update(sql, args);
    }

    public long insert(String table, Map<String, ?> values) {
        StringJoiner columns = new StringJoiner(", ");
        StringJoiner marks = new StringJoiner(", ");
        List<Object> args = new ArrayList<>();
        values.forEach((column, value) -> { columns.add("`" + column + "`"); marks.add("?"); args.add(value); });
        String sql = "INSERT INTO " + table + " (" + columns + ") VALUES (" + marks + ")";
        GeneratedKeyHolder keys = new GeneratedKeyHolder();
        jdbc.update((Connection connection) -> {
            PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            for (int i = 0; i < args.size(); i++) statement.setObject(i + 1, args.get(i));
            return statement;
        }, keys);
        Number key = keys.getKey();
        return key == null ? 0 : key.longValue();
    }

    public int update(String table, Map<String, ?> values, long id) {
        if (values.isEmpty()) return 0;
        StringJoiner sets = new StringJoiner(", ");
        List<Object> args = new ArrayList<>();
        values.forEach((column, value) -> { sets.add("`" + column + "` = ?"); args.add(value); });
        args.add(id);
        return jdbc.update("UPDATE " + table + " SET " + sets + " WHERE id = ?", args.toArray());
    }

    /** Marcadores "?, ?, ?" para cláusulas IN. Devuelve "NULL" si la colección está vacía. */
    public static String marks(Collection<?> values) {
        if (values.isEmpty()) return "NULL";
        return String.join(", ", java.util.Collections.nCopies(values.size(), "?"));
    }

    /** Paginación con el mismo formato que el LengthAwarePaginator de Laravel. */
    public Map<String, Object> paginate(HttpServletRequest request, int perPage, String sql, Object... args) {
        long total = count("SELECT COUNT(*) FROM (" + sql + ") AS aggregate_table", args);
        int page = 1;
        try { page = Math.max(1, Integer.parseInt(request.getParameter("page"))); } catch (RuntimeException ignored) { }
        Object[] pageArgs = java.util.Arrays.copyOf(args, args.length + 2);
        pageArgs[args.length] = perPage;
        pageArgs[args.length + 1] = (long) (page - 1) * perPage;
        List<Map<String, Object>> data = list(sql + " LIMIT ? OFFSET ?", pageArgs);
        int lastPage = (int) Math.max(1, Math.ceil(total / (double) perPage));
        String path = request.getRequestURL().toString();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("current_page", page);
        result.put("data", data);
        result.put("first_page_url", path + "?page=1");
        result.put("from", data.isEmpty() ? null : (page - 1) * perPage + 1);
        result.put("last_page", lastPage);
        result.put("last_page_url", path + "?page=" + lastPage);
        result.put("next_page_url", page < lastPage ? path + "?page=" + (page + 1) : null);
        result.put("path", path);
        result.put("per_page", perPage);
        result.put("prev_page_url", page > 1 ? path + "?page=" + (page - 1) : null);
        result.put("to", data.isEmpty() ? null : (page - 1) * perPage + data.size());
        result.put("total", total);
        return result;
    }

    @SuppressWarnings("unchecked")
    public static List<Map<String, Object>> pageData(Map<String, Object> page) {
        return (List<Map<String, Object>>) page.get("data");
    }
}
