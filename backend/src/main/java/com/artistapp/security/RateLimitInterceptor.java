package com.artistapp.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/** Límite de intentos por minuto e IP para las rutas de autenticación (throttle de Laravel). */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {
    private static final Map<String, Integer> LIMITS = Map.of(
        "/api/auth/login", 8,
        "/api/auth/register", 5,
        "/api/auth/forgot-password", 3,
        "/api/auth/reset-password", 5
    );
    private final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        Integer limit = LIMITS.get(request.getRequestURI());
        if (limit == null || !"POST".equals(request.getMethod())) return true;
        long now = System.currentTimeMillis();
        Deque<Long> window = hits.computeIfAbsent(request.getRequestURI() + "|" + request.getRemoteAddr(), key -> new ArrayDeque<>());
        synchronized (window) {
            while (!window.isEmpty() && now - window.peekFirst() > 60_000) window.pollFirst();
            if (window.size() >= limit) {
                long retry = Math.max(1, (60_000 - (now - window.peekFirst())) / 1000);
                response.setStatus(429);
                response.setHeader("Retry-After", String.valueOf(retry));
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"message\":\"Demasiados intentos. Inténtalo de nuevo en " + retry + " segundos.\"}");
                return false;
            }
            window.addLast(now);
        }
        return true;
    }
}
