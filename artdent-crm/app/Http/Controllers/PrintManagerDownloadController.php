<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PrintManagerDownloadController extends Controller
{
    private const PLATFORM_EXTENSION_PRIORITY = [
        'windows' => ['msi', 'exe', 'zip'],
        'linux' => ['appimage', 'deb', 'rpm', 'tar.gz', 'zip'],
    ];

    public function download(Request $request, ?string $platform = null)
    {
        $resolvedPlatform = $this->resolvePlatform($platform ?? $request->query('platform'), (string) $request->userAgent());

        if (! $resolvedPlatform) {
            abort(404, 'No pudimos detectar el sistema operativo. Probá nuevamente desde Windows o Linux.');
        }

        $installer = $this->findInstallerForPlatform($resolvedPlatform);

        if (! $installer) {
            abort(
                404,
                sprintf(
                    'No se encontró instalador para %s. Subilo a storage/app/public/downloads/print-manager/%s',
                    $resolvedPlatform,
                    $resolvedPlatform,
                ),
            );
        }

        return response()->download(
            Storage::disk('public')->path($installer['path']),
            $installer['name'],
            [
                'Content-Type' => mime_content_type(Storage::disk('public')->path($installer['path'])) ?: 'application/octet-stream',
                'Cache-Control' => 'no-store, no-cache, must-revalidate',
            ],
        );
    }

    private function resolvePlatform(?string $platform, string $userAgent): ?string
    {
        $normalized = $this->normalizePlatform($platform);

        if ($normalized) {
            return $normalized;
        }

        $ua = Str::lower($userAgent);

        if (Str::contains($ua, ['windows', 'win64', 'win32'])) {
            return 'windows';
        }

        if (Str::contains($ua, ['linux', 'x11']) && ! Str::contains($ua, ['android'])) {
            return 'linux';
        }

        return null;
    }

    private function normalizePlatform(?string $platform): ?string
    {
        if (! $platform) {
            return null;
        }

        $value = Str::lower(trim($platform));

        return match ($value) {
            'win', 'win32', 'win64', 'windows' => 'windows',
            'linux', 'appimage', 'deb', 'ubuntu', 'debian' => 'linux',
            default => null,
        };
    }

    private function findInstallerForPlatform(string $platform): ?array
    {
        $directory = "downloads/print-manager/{$platform}";
        $disk = Storage::disk('public');

        $files = collect($disk->files($directory))
            ->reject(fn (string $path) => Str::endsWith($path, '.gitkeep'))
            ->map(fn (string $path) => [
                'path' => $path,
                'name' => basename($path),
                'modified_at' => $disk->lastModified($path),
            ])
            ->sortByDesc('modified_at')
            ->values();

        if ($files->isEmpty()) {
            return null;
        }

        foreach (self::PLATFORM_EXTENSION_PRIORITY[$platform] ?? [] as $extension) {
            $match = $files->first(fn (array $file) => $this->matchesExtension($file['name'], $extension));

            if ($match) {
                return $match;
            }
        }

        return $files->first();
    }

    private function matchesExtension(string $fileName, string $extension): bool
    {
        return Str::endsWith(Str::lower($fileName), '.'.Str::lower($extension));
    }
}
