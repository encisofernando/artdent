<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Class SaleReturn
 *
 * @property int $id
 * @property int $company_id
 * @property int $sale_id
 * @property int $user_id
 * @property string|null $reason
 * @property string $refund_method
 * @property float $total_refund
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Sale $sale
 * @property User $user
 * @property Collection|SaleReturnItem[] $items
 */
class SaleReturn extends Model
{
    protected $table = 'sale_returns';

    protected $casts = [
        'company_id' => 'int',
        'sale_id' => 'int',
        'user_id' => 'int',
        'total_refund' => 'float',
    ];

    protected $fillable = [
        'company_id',
        'sale_id',
        'user_id',
        'reason',
        'refund_method',
        'total_refund',
    ];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleReturnItem::class);
    }
}
