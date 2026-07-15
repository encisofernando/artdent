<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Tabla central — catálogo de artículos gestionado desde artdent-admin.
 * Acá sólo se lee (published), nunca se escribe.
 */
class KbArticle extends Model
{
    protected $connection = 'central';

    protected $casts = [
        'is_published' => 'boolean',
        'order' => 'integer',
    ];
}
