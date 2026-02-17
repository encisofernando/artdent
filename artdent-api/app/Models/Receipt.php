<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Receipt extends Model
{
    protected $table = 'receipts';

    protected $fillable = [
        'receipt_number',
        'company_id',
        'sale_id',
        'ecommerce_order_id',
        'ledger_id',
        'receipt_date',
        'payment_method_id',
        'amount',
        'reference',
    ];

    protected $casts = [
        'receipt_date' => 'datetime',
        'amount' => 'float',
    ];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class, 'sale_id');
    }

    public function ecommerceOrder(): BelongsTo
    {
        return $this->belongsTo(EcommerceOrder::class, 'ecommerce_order_id');
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_method_id');
    }
}
