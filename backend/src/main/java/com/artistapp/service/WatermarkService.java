package com.artistapp.service;

import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Path;
import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import org.springframework.stereotype.Service;

/** Genera la portada pública de un producto: reducida a 1200 px, JPEG y con marca de agua ARTISTAPP. */
@Service
public class WatermarkService {
    private static final int MAX_SIZE = 1200;
    private static final float JPEG_QUALITY = 0.75f;
    private static final String TEXT = "ARTISTAPP";

    private final StorageService storage;

    public WatermarkService(StorageService storage) {
        this.storage = storage;
    }

    public String createCover(Path source, String destination) {
        BufferedImage original;
        try {
            original = ImageIO.read(source.toFile());
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo abrir la imagen. Usa JPG, PNG o WebP.", e);
        }
        if (original == null) throw new IllegalStateException("El archivo no es una imagen válida.");

        double scale = Math.min(1, MAX_SIZE / (double) Math.max(original.getWidth(), original.getHeight()));
        int width = Math.max(1, (int) Math.round(original.getWidth() * scale));
        int height = Math.max(1, (int) Math.round(original.getHeight() * scale));

        BufferedImage cover = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = cover.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, width, height);
        g.drawImage(original, 0, 0, width, height, null);
        drawWatermark(g, width, height);
        g.dispose();

        storage.put(StorageService.Disk.PUBLIC, destination, encodeJpeg(cover));
        return destination;
    }

    /** Patrón de texto repetido en diagonal más un sello central. */
    private void drawWatermark(Graphics2D g, int width, int height) {
        int fontSize = Math.max(14, (int) Math.round(Math.min(width, height) * 0.035));
        g.setFont(new Font(Font.SANS_SERIF, Font.BOLD, fontSize));
        FontMetrics metrics = g.getFontMetrics();
        int spacingX = Math.max(115, (int) (width * 0.45));
        int spacingY = Math.max(65, (int) (height * 0.22));
        for (int y = -height; y < height * 2; y += spacingY) {
            for (int x = -width; x < width * 2; x += spacingX) {
                int textX = x + (int) (y * 0.35);
                text(g, textX, y, 0.25f, 0.39f);
            }
        }
        int centerX = Math.max(0, (width - metrics.stringWidth(TEXT)) / 2);
        text(g, centerX, Math.max(metrics.getAscent(), height / 2), 0.3f, 0.6f);
    }

    private void text(Graphics2D g, int x, int y, float shadowAlpha, float textAlpha) {
        g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, shadowAlpha));
        g.setColor(Color.BLACK);
        g.drawString(TEXT, x + 1, y + 1);
        g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, textAlpha));
        g.setColor(Color.WHITE);
        g.drawString(TEXT, x, y);
        g.setComposite(AlphaComposite.SrcOver);
    }

    private byte[] encodeJpeg(BufferedImage image) {
        ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ImageOutputStream out = ImageIO.createImageOutputStream(bytes)) {
            writer.setOutput(out);
            ImageWriteParam params = writer.getDefaultWriteParam();
            params.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            params.setCompressionQuality(JPEG_QUALITY);
            writer.write(null, new IIOImage(image, null, null), params);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo generar la portada protegida.", e);
        } finally {
            writer.dispose();
        }
        return bytes.toByteArray();
    }
}
