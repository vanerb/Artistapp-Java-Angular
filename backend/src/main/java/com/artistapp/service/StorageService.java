package com.artistapp.service;

import com.artistapp.support.Validation;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.SecureRandom;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Discos de archivos: "public" (imágenes visibles, servidas en /api/assets) y
 * "local" (originales y descargas digitales protegidas), con la misma estructura que Laravel.
 */
@Service
public class StorageService {
    public enum Disk { PUBLIC, LOCAL }

    private static final String ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private final Path publicRoot;
    private final Path localRoot;
    private final SecureRandom random = new SecureRandom();

    public StorageService(@Value("${artistapp.storage-path}") String storagePath) {
        Path root = Path.of(storagePath).toAbsolutePath().normalize();
        this.publicRoot = root.resolve("public");
        this.localRoot = root.resolve("private");
    }

    public Path publicRoot() { return publicRoot; }

    /** Guarda el archivo con un nombre aleatorio y devuelve su ruta relativa (como store() en Laravel). */
    public String store(MultipartFile file, String directory, Disk disk) {
        String extension = Validation.extension(file.getOriginalFilename());
        StringBuilder name = new StringBuilder();
        for (int i = 0; i < 40; i++) name.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        String relative = directory + "/" + name + (extension.isEmpty() ? "" : "." + extension);
        try (InputStream in = file.getInputStream()) {
            Path target = path(disk, relative);
            Files.createDirectories(target.getParent());
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new UncheckedIOException("No se pudo guardar el archivo.", e);
        }
        return relative;
    }

    public void put(Disk disk, String relative, byte[] bytes) {
        try {
            Path target = path(disk, relative);
            Files.createDirectories(target.getParent());
            Files.write(target, bytes);
        } catch (IOException e) {
            throw new UncheckedIOException("No se pudo guardar el archivo.", e);
        }
    }

    public void delete(Disk disk, String relative) {
        if (relative == null || relative.isBlank()) return;
        try {
            Path target = path(disk, relative);
            if (target != null) Files.deleteIfExists(target);
        } catch (IOException | IllegalArgumentException ignored) {
            // Igual que Storage::delete: un archivo ausente no es un error.
        }
    }

    public boolean exists(Disk disk, String relative) {
        try {
            Path target = path(disk, relative);
            return Files.isRegularFile(target);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    /** Resuelve la ruta dentro del disco e impide salir de él. */
    public Path path(Disk disk, String relative) {
        Path root = disk == Disk.PUBLIC ? publicRoot : localRoot;
        String clean = relative.replace('\\', '/');
        if (clean.startsWith("/") || clean.contains("..")) throw new IllegalArgumentException("Ruta no válida");
        Path resolved = root.resolve(clean).normalize();
        if (!resolved.startsWith(root)) throw new IllegalArgumentException("Ruta no válida");
        return resolved;
    }
}
