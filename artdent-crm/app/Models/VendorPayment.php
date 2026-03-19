<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorPayment extends Model
{
    protected $table = 'vendor_payments';

    protected $fillable = [
        'company_id',
        'vendor_id',
        'user_id',
        'payment_method_id',
        'amount',
        'payment_date',
        'reference_no',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'company_id' => 'int',
            'vendor_id' => 'int',
            'user_id' => 'int',
            'payment_method_id' => 'int',
            'amount' => 'float',
            'payment_date' => 'date',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }
}
