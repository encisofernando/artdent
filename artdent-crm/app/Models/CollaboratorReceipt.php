<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class CollaboratorReceipt
 *
 * @property int $id
 * @property int $company_id
 * @property int $collaborator_id
 * @property int|null $created_by
 * @property int|null $payment_method_id
 * @property Carbon $period_from
 * @property Carbon $period_to
 * @property int|null $days_worked
 * @property float|null $hours
 * @property float|null $gross
 * @property float|null $extras_total
 * @property float|null $discounts_total
 * @property float|null $net
 * @property string|null $status
 * @property Carbon|null $paid_at
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Collaborator $collaborator
 * @property User|null $user
 * @property PaymentMethod|null $payment_method
 */
class CollaboratorReceipt extends Model
{
    protected $table = 'collaborator_receipts';

    protected $casts = [
        'company_id' => 'int',
        'collaborator_id' => 'int',
        'created_by' => 'int',
        'payment_method_id' => 'int',
        'period_from' => 'date:Y-m-d',
        'period_to' => 'date:Y-m-d',
        'days_worked' => 'int',
        'hours' => 'float',
        'gross' => 'float',
        'extras_total' => 'float',
        'discounts_total' => 'float',
        'net' => 'float',
        'paid_at' => 'datetime',
    ];

    protected $fillable = [
        'company_id',
        'collaborator_id',
        'created_by',
        'payment_method_id',
        'period_from',
        'period_to',
        'days_worked',
        'hours',
        'gross',
        'extras_total',
        'discounts_total',
        'net',
        'status',
        'paid_at',
        'notes',
    ];

    public function collaborator()
    {
        return $this->belongsTo(Collaborator::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function payment_method()
    {
        return $this->belongsTo(PaymentMethod::class);
    }
}
