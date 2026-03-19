<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorAccountMove extends Model
{
    protected $table = 'vendor_account_moves';

    protected $fillable = [
        'vendor_account_id',
        'user_id',
        'type',
        'amount',
        'balance_after',
        'description',
        'reference_type',
        'reference_id',
        'move_date',
    ];

    protected function casts(): array
    {
        return [
            'vendor_account_id' => 'int',
            'user_id' => 'int',
            'amount' => 'float',
            'balance_after' => 'float',
            'reference_id' => 'int',
            'move_date' => 'date',
        ];
    }

    public function vendorAccount(): BelongsTo
    {
        return $this->belongsTo(VendorAccount::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
