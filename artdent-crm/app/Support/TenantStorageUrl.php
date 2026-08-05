<?php

namespace App\Support;

class TenantStorageUrl
{
    /**
     * URL pública para un path relativo dentro del disco 'public'.
     *
     * FilesystemTenancyBootstrapper redirige la raíz física de ese disco a
     * storage/tenant{id}/app/public cuando hay tenancy inicializada (ver
     * config/tenancy.php), pero eso no incluye ningún symlink/URL nuevo — el
     * viejo prefijo /storage/ sigue sirviendo storage/app/public (central),
     * que todavía tiene contenido real de antes de la conversión a
     * multi-tenant (hero-slides, comprobantes, instaladores). Por eso hace
     * falta un symlink dedicado (public/tenant-storage) y elegir el prefijo
     * correcto según haya o no tenancy activa en el request actual.
     */
    public static function publicUrl(string $path): string
    {
        $prefix = tenancy()->initialized ? '/tenant-storage/' : '/storage/';

        return $prefix.ltrim($path, '/');
    }

    /**
     * Inversa de publicUrl(): dada una URL ya guardada (con cualquiera de los
     * dos prefijos), devuelve el path relativo dentro del disco 'public' para
     * poder borrarla/reescribirla vía Storage::disk('public').
     */
    public static function relativePath(string $url): string
    {
        return ltrim((string) preg_replace('#^/(tenant-storage|storage)/#', '', $url), '/');
    }
}
