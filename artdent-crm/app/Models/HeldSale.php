<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class HeldSale
 *
 * @property int $id
 * @property int $company_id
 * @property int $user_id
 * @property string|null $label
 * @property array $cart_data
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property User $user
 */
class HeldSale extends Model
{
    protected $table = 'held_sales';

    protected $casts = [
        'company_id' => 'int',
        'user_id' => 'int',
        'cart_data' => 'array',
    ];

    protected $fillable = [
        'company_id',
        'user_id',
        'label',
        'cart_data',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
