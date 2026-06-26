<?php

namespace App\Console\Commands;

use App\Models\ProductImage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class GenerateProductImageThumbs extends Command
{
    protected $signature = 'products:generate-thumbs {--force : Regenerar aunque ya tenga thumb_url}';

    protected $description = 'Genera thumbnails WebP (400px) para imágenes de productos ya existentes';

    private const THUMB_MAX = 400;

    private const WEBP_QUALITY = 75;

    public function handle(): int
    {
        $query = ProductImage::query();

        if (! $this->option('force')) {
            $query->whereNull('thumb_url');
        }

        $total = $query->count();

        if ($total === 0) {
            $this->info('No hay imágenes pendientes de procesar.');

            return self::SUCCESS;
        }

        $this->info("Procesando {$total} imágenes...");
        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $ok = 0;
        $skipped = 0;
        $errors = 0;

        $query->chunk(50, function ($images) use ($bar, &$ok, &$skipped, &$errors) {
            foreach ($images as $img) {
                $result = $this->processImage($img);

                match ($result) {
                    'ok' => $ok++,
                    'skipped' => $skipped++,
                    default => $errors++,
                };

                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine(2);
        $this->table(['OK', 'Saltadas', 'Errores'], [[$ok, $skipped, $errors]]);

        return self::SUCCESS;
    }

    private function processImage(ProductImage $img): string
    {
        $url = $img->url;

        if (! str_starts_with($url, '/storage/')) {
            return 'skipped'; // URL externa
        }

        $relativePath = ltrim(str_replace('/storage/', '', $url), '/');
        $disk = Storage::disk('public');

        if (! $disk->exists($relativePath)) {
            return 'skipped';
        }

        $localPath = $disk->path($relativePath);
        $mime = mime_content_type($localPath) ?: '';

        $gdImage = $this->loadGd($localPath, $mime);

        if (! $gdImage) {
            return 'skipped';
        }

        [$origW, $origH] = [imagesx($gdImage), imagesy($gdImage)];

        $thumbImage = $this->resize($gdImage, $origW, $origH, self::THUMB_MAX);
        imagedestroy($gdImage);

        // Guardar en products/thumbs/ con el mismo nombre base pero extensión .webp
        $baseName = pathinfo($relativePath, PATHINFO_FILENAME);
        $thumbPath = 'products/thumbs/'.$baseName.'.webp';

        try {
            $disk->put($thumbPath, $this->toWebp($thumbImage));
            imagedestroy($thumbImage);
            $img->update(['thumb_url' => '/storage/'.$thumbPath]);

            return 'ok';
        } catch (\Throwable) {
            imagedestroy($thumbImage);

            return 'error';
        }
    }

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
            $out = imagecreatetruecolor($origW, $origH);
            $this->enableAlpha($out);
            imagecopy($out, $src, 0, 0, 0, 0, $origW, $origH);

            return $out;
        }

        if ($origW >= $origH) {
            $newW = $maxPx;
            $newH = (int) round($maxPx * $origH / $origW);
        } else {
            $newH = $maxPx;
            $newW = (int) round($maxPx * $origW / $origH);
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

    private function toWebp(\GdImage $img): string
    {
        ob_start();
        imagewebp($img, null, self::WEBP_QUALITY);

        return ob_get_clean();
    }
}
