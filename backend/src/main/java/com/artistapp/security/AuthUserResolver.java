package com.artistapp.security;

import com.artistapp.support.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/** Inyecta el AuthUser del token Bearer; responde 401 si es obligatorio y falta. */
@Component
public class AuthUserResolver implements HandlerMethodArgumentResolver {
    private static final String ATTRIBUTE = AuthUserResolver.class.getName();
    private final TokenService tokens;

    public AuthUserResolver(TokenService tokens) {
        this.tokens = tokens;
    }

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterType() == AuthUser.class;
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer container, NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
        HttpServletRequest request = webRequest.getNativeRequest(HttpServletRequest.class);
        AuthUser user = (AuthUser) request.getAttribute(ATTRIBUTE);
        if (user == null) {
            String header = request.getHeader("Authorization");
            if (header != null && header.regionMatches(true, 0, "Bearer ", 0, 7)) user = tokens.resolve(header.substring(7).trim());
            if (user != null) request.setAttribute(ATTRIBUTE, user);
        }
        if (user == null && !parameter.hasParameterAnnotation(OptionalUser.class)) throw new ApiException(401, "Unauthenticated.");
        return user;
    }
}
