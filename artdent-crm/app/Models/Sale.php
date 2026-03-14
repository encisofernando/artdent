<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Sale
 *
 * @property int $id
 * @property int $company_id
 * @property int|null $branch_id
 * @property int|null $cash_session_id
 * @property int|null $user_id
 * @property int|null $crm_client_id
 * @property int|null $invoice_id
 * @property string|null $sale_number
 * @property string|null $receipt_type
 * @property string|null $status
 * @property float|null $subtotal
 * @property float|null $discount_amount
 * @property float|null $tax_amount
 * @property float|null $total
 * @property float|null $paid_amount
 * @property float|null $change_amount
 * @property string|null $notes
 * @property Carbon|null $sold_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Branch|null $branch
 * @property Company $company
 * @property User|null $user
 * @property CashSession|null $cash_session
 * @property Collection|SaleItem[] $sale_items
 * @property Collection|SalePayment[] $sale_payments
 */
class Sale extends Model
{
    protected $table = 'sales';

    protected $casts = [
        'company_id' => 'int',
        'branch_id' => 'int',
        'cash_session_id' => 'int',
        'user_id' => 'int',
        'crm_client_id' => 'int',
        'customer_id' => 'int',
        'dentist_id' => 'int',
        'invoice_id' => 'int',
        'subtotal' => 'float',
        'discount_amount' => 'float',
        'tax_amount' => 'float',
        'total' => 'float',
        'paid_amount' => 'float',
        'change_amount' => 'float',
        'sold_at' => 'datetime',
    ];

    protected $fillable = [
        'company_id',
        'branch_id',
        'cash_session_id',
        'user_id',
        'crm_client_id',
        'customer_id',
        'dentist_id',
        'sale_type',
        'invoice_id',
        'sale_number',
        'receipt_type',
        'status',
        'subtotal',
        'discount_amount',
        'tax_amount',
        'total',
        'paid_amount',
        'change_amount',
        'notes',
        'sold_at',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()                          // ← agregado
    {
        return $this->belongsTo(User::class);
    }

    public function cash_session()
    {
        return $this->belongsTo(CashSession::class);
    }

    public function sale_items()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function sale_payments()
    {
        return $this->hasMany(SalePayment::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function dentist()
    {
        return $this->belongsTo(Dentist::class);
    }
}
