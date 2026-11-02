package com.artistapp.web;

import com.artistapp.service.StorageService;
import com.artistapp.support.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.file.Path;
import java.time.Duration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Sirve los archivos del disco público (imágenes subidas) bajo /api/assets/**. */
@RestController
public class AssetController {
    private final StorageService storage;

    public AssetController(StorageService storage) {
        this.storage = storage;
    }

    @GetMapping("/api/assets/**")
    public ResponseEntity<Resource> show(HttpServletRequest request) {
        String path = java.net.URLDecoder.decode(request.getRequestURI().substring("/api/assets/".length()), java.nio.charset.StandardCharsets.UTF_8);
        if (!storage.exists(StorageService.Disk.PUBLIC, path)) throw ApiException.notFound();
        Path file = storage.path(StorageService.Disk.PUBLIC, path);
        MediaType type = MediaTypeFactory.getMediaType(file.getFileName().toString()).orElse(MediaType.APPLICATION_OCTET_STREAM);
        return ResponseEntity.ok().contentType(type).cacheControl(CacheControl.maxAge(Duration.ofDays(1)).cachePublic()).body(new FileSystemResource(file));
    }
}
