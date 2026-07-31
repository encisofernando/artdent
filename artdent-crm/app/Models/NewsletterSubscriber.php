<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class NewsletterSubscriber
 *
 * @property int $id
 * @property string $email
 * @property string|null $name
 * @property bool|null $is_active
 * @property Carbon|null $created_at
 */
class NewsletterSubscriber extends Model
{
    protected $table = 'newsletter_subscribers';

    // La tabla no tiene updated_at, pero sí created_at — con $timestamps en
    // true (default) y UPDATED_AT en null, Eloquent completa created_at solo
    // al crear sin intentar tocar una columna updated_at inexistente.
    const UPDATED_AT = null;

    protected $casts = [
        'is_active' => 'bool',
    ];

    protected $fillable = [
        'email',
        'name',
        'is_active',
    ];
}
