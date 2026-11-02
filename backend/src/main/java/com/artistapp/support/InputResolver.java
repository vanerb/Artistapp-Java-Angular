package com.artistapp.support;

import jakarta.servlet.http.HttpServletRequest;
import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import tools.jackson.databind.json.JsonMapper;

@Component
public class InputResolver implements HandlerMethodArgumentResolver {
    private final JsonMapper json;

    public InputResolver(JsonMapper json) {
        this.json = json;
    }

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterType() == Input.class;
    }

    @Override
    @SuppressWarnings("unchecked")
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer container, NativeWebRequest webRequest, WebDataBinderFactory binderFactory) throws Exception {
        HttpServletRequest request = webRequest.getNativeRequest(HttpServletRequest.class);
        Map<String, Object> values = new LinkedHashMap<>();
        request.getParameterMap().forEach((key, array) -> values.put(key, array.length == 0 ? null : array[0]));
        Map<String, MultipartFile> files = new LinkedHashMap<>();
        MultipartHttpServletRequest multipart = webRequest.getNativeRequest(MultipartHttpServletRequest.class);
        if (multipart != null) multipart.getFileMap().forEach(files::put);
        String type = request.getContentType();
        if (type != null && type.toLowerCase().contains("json")) {
            try (InputStream body = request.getInputStream()) {
                byte[] bytes = body.readAllBytes();
                if (bytes.length > 0) {
                    Object parsed = json.readValue(bytes, Object.class);
                    if (parsed instanceof Map<?, ?> map) values.putAll((Map<String, Object>) map);
                }
            } catch (tools.jackson.core.JacksonException e) {
                throw new ApiException(400, "El cuerpo JSON no es válido.");
            }
        }
        return new Input(values, files);
    }
}
