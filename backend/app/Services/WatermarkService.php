<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use RuntimeException;

class WatermarkService
{
    private const MAX_SIZE = 1200;
private const JPEG_QUALITY = 75;

    /**
     * Crea una portada reducida y protegida.
     *
     * $sourcePath: ruta física de la imagen original.
     * $destinationPath: ruta relativa en el disco public.
     */
    public function createCover(
        string $sourcePath,
        string $destinationPath
    ): string {
        if (! extension_loaded('gd')) {
            throw new RuntimeException(
                'La extensión GD de PHP no está habilitada.'
            );
        }

        if (! is_file($sourcePath)) {
            throw new RuntimeException(
                'No se encuentra la imagen original.'
            );
        }

        $info = @getimagesize($sourcePath);

        if ($info === false) {
            throw new RuntimeException(
                'El archivo no es una imagen válida.'
            );
        }

        $source = match ($info[2]) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($sourcePath),
            IMAGETYPE_PNG => @imagecreatefrompng($sourcePath),
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp')
                ? @imagecreatefromwebp($sourcePath)
                : false,
            default => false,
        };

        if ($source === false) {
            throw new RuntimeException(
                'No se pudo abrir la imagen. Usa JPG, PNG o WebP.'
            );
        }

        $originalWidth = imagesx($source);
        $originalHeight = imagesy($source);

        $scale = min(
            1,
            self::MAX_SIZE / max($originalWidth, $originalHeight)
        );

        $width = max(1, (int) round($originalWidth * $scale));
        $height = max(1, (int) round($originalHeight * $scale));

        $cover = imagecreatetruecolor($width, $height);

        if ($cover === false) {
            imagedestroy($source);

            throw new RuntimeException(
                'No se pudo crear la portada.'
            );
        }

        imagecopyresampled(
            $cover,
            $source,
            0,
            0,
            0,
            0,
            $width,
            $height,
            $originalWidth,
            $originalHeight
        );

        imagedestroy($source);

        $this->drawWatermark($cover, $width, $height);

        ob_start();

        $success = imagejpeg(
            $cover,
            null,
            self::JPEG_QUALITY
        );

        $jpegData = ob_get_clean();

        imagedestroy($cover);

        if (! $success || ! is_string($jpegData)) {
            throw new RuntimeException(
                'No se pudo generar la portada protegida.'
            );
        }

        $stored = Storage::disk('public')->put(
            $destinationPath,
            $jpegData
        );

        if (! $stored) {
            throw new RuntimeException(
                'No se pudo guardar la portada protegida.'
            );
        }

        return $destinationPath;
    }

    /**
     * Dibuja un patrón de texto repetido y diagonal.
     */
    private function drawWatermark(
        \GdImage $image,
        int $width,
        int $height
    ): void {
        $text = 'ARTISTAPP';
        $fontSize = max(12, (int) round(min($width, $height) * 0.055));

        // Blanco semitransparente.
        $white = imagecolorallocatealpha(
            $image,
            255,
            255,
            255,
            78
        );

        // Sombra oscura para mantener la legibilidad.
        $shadow = imagecolorallocatealpha(
            $image,
            0,
            0,
            0,
            95
        );

        // Fuente integrada de GD: no requiere un archivo externo.
        $font = 5;

        $textWidth = imagefontwidth($font) * strlen($text);
        $textHeight = imagefontheight($font);

        $spacingX = max(115, (int) ($width * 0.45));
        $spacingY = max(65, (int) ($height * 0.22));

        // Se repite por toda la superficie con una ligera inclinación.
        for ($y = -$height; $y < $height * 2; $y += $spacingY) {
            for (
                $x = -$width;
                $x < $width * 2;
                $x += $spacingX
            ) {
                $offsetX = (int) ($y * 0.35);

                $textX = $x + $offsetX;
                $textY = $y;

                imagestring(
                    $image,
                    $font,
                    $textX + 1,
                    $textY + 1,
                    $text,
                    $shadow
                );

                imagestring(
                    $image,
                    $font,
                    $textX,
                    $textY,
                    $text,
                    $white
                );
            }
        }

        // Sello central más visible.
        $centerText = 'ARTISTAPP';
        $centerWidth = imagefontwidth(5) * strlen($centerText);

        imagestring(
            $image,
            5,
            max(0, (int) (($width - $centerWidth) / 2)),
            max(0, (int) ($height / 2)),
            $centerText,
            $white
        );
    }
}
