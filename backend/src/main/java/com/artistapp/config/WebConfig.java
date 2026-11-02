package com.artistapp.config;

import com.artistapp.security.AuthUserResolver;
import com.artistapp.security.RateLimitInterceptor;
import com.artistapp.service.StorageService;
import com.artistapp.support.InputResolver;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final AuthUserResolver authUserResolver;
    private final InputResolver inputResolver;
    private final RateLimitInterceptor rateLimit;
    private final StorageService storage;
    private final String frontendUrl;

    public WebConfig(AuthUserResolver authUserResolver, InputResolver inputResolver, RateLimitInterceptor rateLimit,
                     StorageService storage, @Value("${artistapp.frontend-url}") String frontendUrl) {
        this.authUserResolver = authUserResolver;
        this.inputResolver = inputResolver;
        this.rateLimit = rateLimit;
        this.storage = storage;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(authUserResolver);
        resolvers.add(inputResolver);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimit).addPathPatterns("/api/auth/**");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        Set<String> origins = new LinkedHashSet<>(List.of("http://localhost:4200", "http://127.0.0.1:4200"));
        if (!frontendUrl.isBlank()) origins.add(frontendUrl.replaceAll("/+$", ""));
        registry.addMapping("/api/**").allowedOrigins(origins.toArray(String[]::new))
            .allowedMethods("*").allowedHeaders("*").maxAge(600);
    }

    /** Equivalente al enlace public/storage de Laravel. */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/storage/**")
            .addResourceLocations(storage.publicRoot().toUri().toString())
            .setCachePeriod(86400);
    }
}
