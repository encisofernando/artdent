<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantPayment extends Model
{
    public const METHOD_TRANSFER = 'transfer';
    public const METHOD_QR = 'qr';
    public const METHOD_CASH = 'cash';
    public const METHOD_MERCADOPAGO = 'mercadopago';
    public const METHOD_OTHER = 'other';

    public const METHODS = [
        self::METHOD_TRANSFER => 'Transferencia bancaria',
        self::METHOD_QR => 'Pago QR / Billetera',
        self::METHOD_CASH => 'Efectivo',
        self::METHOD_MERCADOPAGO => 'MercadoPago',
        self::METHOD_OTHER => 'Otro',
    ];

    protected $fillable = [
        'tenant_id',
        'tenant_subscription_id',
        'plan_id',
        'subscription_invoice_id',
        'payment_method',
        'amount',
        'currency',
        'paid_at',
        'reference',
        'notes',
        'status',
        'created_by_user_id',
        'mp_payment_id',
        'period_starts_at',
        'period_ends_at',
    ];

    protected $casts = [
        'amount' => 'float',
        'paid_at' => 'datetime',
        'period_starts_at' => 'date',
        'period_ends_at' => 'date',
    ];

    protected $appends = [
        'method_label',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class, 'tenant_subscription_id');
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'plan_id');
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(SubscriptionInvoice::class, 'subscription_invoice_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function getMethodLabelAttribute(): string
    {
        return self::METHODS[$this->payment_method] ?? ucfirst($this->payment_method);
    }
}
