<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Class LabSupplyWithdrawal
 *
 * @property int $id
 * @property int $company_id
 * @property int $warehouse_id
 * @property int $user_id
 * @property int|null $collaborator_id
 * @property string|null $external_person
 * @property string $status
 * @property float $total_cost
 * @property Carbon $withdrawn_at
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Warehouse $warehouse
 * @property User $user
 * @property Collaborator|null $collaborator
 * @property Collection|LabSupplyWithdrawalItem[] $items
 */
class LabSupplyWithdrawal extends Model
{
    use BelongsToCompany;

    protected $table = 'lab_supply_withdrawals';

    protected $casts = [
        'company_id' => 'int',
        'warehouse_id' => 'int',
        'user_id' => 'int',
        'collaborator_id' => 'int',
        'total_cost' => 'float',
        'withdrawn_at' => 'date',
    ];

    protected $fillable = [
        'company_id',
        'warehouse_id',
        'user_id',
        'collaborator_id',
        'external_person',
        'status',
        'total_cost',
        'withdrawn_at',
        'notes',
    ];

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function collaborator(): BelongsTo
    {
        return $this->belongsTo(Collaborator::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(LabSupplyWithdrawalItem::class, 'withdrawal_id');
    }

    /** Nombre del destinatario para mostrar en UI y ticket */
    public function recipientName(): string
    {
        return $this->collaborator?->name ?? $this->external_person ?? '—';
    }

    /** Número formateado tipo #0001 */
    public function formattedNumber(): string
    {
        return '#'.str_pad($this->id, 4, '0', STR_PAD_LEFT);
    }
}
