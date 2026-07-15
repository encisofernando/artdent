<?php

namespace App\Support;

use App\Models\Tariff;

/**
 * Resuelve tokens {{arancel:Nombre exacto del arancel}} dentro del texto libre de
 * "Importante leer" del arancel, reemplazándolos por el precio vigente de ese arancel.
 * Así el texto no repite precios a mano: cuando el arancel se actualiza (manual o por
 * aumento masivo), el texto de notas refleja el precio nuevo automáticamente.
 */
class TariffNotesRenderer
{
    private const PATTERN = '/\{\{\s*arancel:\s*([^}]+?)\s*\}\}/iu';

    public static function resolve(?string $text, int $companyId): ?string
    {
        if (! $text) {
            return $text;
        }

        return preg_replace_callback(self::PATTERN, function (array $matches) use ($companyId) {
            $name = trim($matches[1]);

            $tariff = Tariff::where('company_id', $companyId)
                ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
                ->first();

            if (! $tariff) {
                return $matches[0];
            }

            return $tariff->price > 0
                ? '$'.number_format((float) $tariff->price, 2, ',', '.')
                : 'Consultar precio';
        }, $text);
    }
}
