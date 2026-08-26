<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;

/**
 * Adjuntos de laboratorio: escaneos 3D (stl/ply, sin mime estándar
 * reconocido — PHP los detecta como application/octet-stream, así que sólo
 * se puede validar por extensión) + fotos/documentos (jpg/jpeg/png/webp/pdf,
 * que SÍ tienen mime real). `extensions:` sola para todo el conjunto sólo
 * mira el string del nombre de archivo — un ejecutable renombrado a .jpg la
 * pasaba igual. Los tipos con mime real van por `mimes:` (mira el contenido
 * real del archivo), stl/ply siguen yendo por extensión porque no hay nada
 * más que mirar.
 */
class ScanOrDocumentFile implements ValidationRule
{
    private const EXTENSION_ONLY = ['stl', 'ply'];

    private const MIME_VALIDATED = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile) {
            $fail('El archivo no es válido.');

            return;
        }

        $extension = strtolower((string) $value->getClientOriginalExtension());

        if (in_array($extension, self::EXTENSION_ONLY, true)) {
            return;
        }

        $mimeCheck = Validator::make(
            [$attribute => $value],
            [$attribute => 'mimes:'.implode(',', self::MIME_VALIDATED)],
        );

        if ($mimeCheck->fails()) {
            $fail('El archivo debe ser stl, ply, '.implode(', ', self::MIME_VALIDATED).'.');
        }
    }
}
