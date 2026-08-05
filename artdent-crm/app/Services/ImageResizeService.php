<?php

namespace App\Services;

use App\Support\TenantStorageUrl;
use Illuminate\Support\Facades\Storage;

class ImageResizeService
{
    // Dimensiones máximas
    private const FULL_MAX = 1200; // px — imagen principal (detalle)

    private const THUMB_MAX = 400;  // px — thumbnail (cards/grids)

    private const WEBP_QUALITY = 82;

    /**
     * Procesa un archivo subido: genera versión full (≤1200px) y thumbnail (≤400px) en WebP.
     * Devuelve ['url' => '/storage/...', 'thumb_url' => '/storage/...']
     */
    public function processUpload(\Illuminate\Http\UploadedFile $file, string $disk = 'public', string $folder = 'products'): array
    {
        $gdImage = $this->loadGd($file->getRealPath(), $file->getMimeType());
        if (! $gdImage) {
            // Fallback: guardar original sin procesar
            $path = $file->store($folder, $disk);

            return ['url' => TenantStorageUrl::publicUrl($path), 'thumb_url' => TenantStorageUrl::publicUrl($path)];
        }

        [$origW, $origH] = [imagesx($gdImage), imagesy($gdImage)];

        // ── Full (≤1200px) ────────────────────────────────────────────────────
        $fullImage = $this->resize($gdImage, $origW, $origH, self::FULL_MAX);
        $fullPath = $folder.'/'.uniqid('', true).'.webp';
        Storage::disk($disk)->put($fullPath, $this->toWebp($fullImage));
        imagedestroy($fullImage);

        // ── Thumbnail (≤400px) ────────────────────────────────────────────────
        $thumbImage = $this->resize($gdImage, $origW, $origH, self::THUMB_MAX);
        $thumbPath = $folder.'/thumbs/'.basename($fullPath);
        Storage::disk($disk)->put($thumbPath, $this->toWebp($thumbImage, 75));
        imagedestroy($thumbImage);

        imagedestroy($gdImage);

        return [
            'url' => TenantStorageUrl::publicUrl($fullPath),
            'thumb_url' => TenantStorageUrl::publicUrl($thumbPath),
        ];
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function loadGd(string $path, string $mime): ?\GdImage
    {
        return match ($mime) {
            'image/jpeg' => @imagecreatefromjpeg($path),
            'image/png' => @imagecreatefrompng($path),
            'image/webp' => @imagecreatefromwebp($path),
            'image/gif' => @imagecreatefromgif($path),
            default => null,
        };
    }

    private function resize(\GdImage $src, int $origW, int $origH, int $maxPx): \GdImage
    {
        if ($origW <= $maxPx && $origH <= $maxPx) {
            // Ya es más pequeña — copiar sin reescalar
            $out = imagecreatetruecolor($origW, $origH);
            $this->enableAlpha($out);
            imagecopy($out, $src, 0, 0, 0, 0, $origW, $origH);

            return $out;
        }

        $ratio = $origW / $origH;
        if ($origW >= $origH) {
            $newW = $maxPx;
            $newH = (int) round($maxPx / $ratio);
        } else {
            $newH = $maxPx;
            $newW = (int) round($maxPx * $ratio);
        }

        $out = imagecreatetruecolor($newW, $newH);
        $this->enableAlpha($out);
        imagecopyresampled($out, $src, 0, 0, 0, 0, $newW, $newH, $origW, $origH);

        return $out;
    }

    private function enableAlpha(\GdImage $img): void
    {
        imagealphablending($img, false);
        imagesavealpha($img, true);
        $transparent = imagecolorallocatealpha($img, 255, 255, 255, 127);
        imagefilledrectangle($img, 0, 0, imagesx($img), imagesy($img), $transparent);
        imagealphablending($img, true);
    }

    private function toWebp(\GdImage $img, int $quality = self::WEBP_QUALITY): string
    {
        ob_start();
        imagewebp($img, null, $quality);

        return ob_get_clean();
    }
}
