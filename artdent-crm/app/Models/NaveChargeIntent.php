<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class NaveChargeIntent extends Model
{
    use BelongsToCompany;

    public const PAYABLE_SALE = 'sale';

    public const PAYABLE_CUSTOMER_ACCOUNT = 'customer_account';

    public const PAYABLE_LAB_ACCOUNT = 'lab_account';

    public const TYPE_STATIC_QR = 'static_qr';

    public const TYPE_PAYMENT_LINK = 'payment_link';

    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUS_EXPIRED = 'expired';

    protected $fillable = [
        'company_id',
        'payable_type',
        'payable_id',
        'nave_payment_type',
        'pos_id',
        'payment_request_id',
        'amount',
        'description',
        'status',
        'nave_payment_id',
        'webhook_secret',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'company_id' => 'int',
            'payable_id' => 'int',
            'amount' => 'float',
            'metadata' => 'array',
        ];
    }
}
