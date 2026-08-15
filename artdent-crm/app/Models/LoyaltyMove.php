<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoyaltyMove extends Model
{
    use BelongsToCompany;

    public const TYPE_ACCRUAL = 'accrual';

    public const TYPE_REDEMPTION = 'redemption';

    public const TYPE_ADJUSTMENT = 'manual_adjustment';

    protected $fillable = [
        'loyalty_account_id',
        'company_id',
        'user_id',
        'loyalty_reward_id',
        'type',
        'amount',
        'balance_after',
        'description',
        'reference_type',
        'reference_id',
        'move_date',
    ];

    protected $casts = [
        'loyalty_account_id' => 'int',
        'company_id' => 'int',
        'user_id' => 'int',
        'loyalty_reward_id' => 'int',
        'amount' => 'integer',
        'balance_after' => 'integer',
        'reference_id' => 'int',
        'move_date' => 'date',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(LoyaltyAccount::class, 'loyalty_account_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reward(): BelongsTo
    {
        return $this->belongsTo(LoyaltyReward::class, 'loyalty_reward_id');
    }
}
