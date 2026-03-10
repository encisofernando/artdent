<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class CrmClient
 *
 * @property int $id
 * @property int|null $customer_id
 * @property int $company_id
 * @property string $name
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $dni
 * @property string|null $address
 * @property string|null $city
 * @property string|null $province
 * @property Carbon|null $birth_date
 * @property string|null $notes
 * @property bool|null $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $deleted_at
 * @property Company $company
 * @property Customer|null $customer
 */
class CrmClient extends Model
{
    use SoftDeletes;

    protected $table = 'crm_clients';

    protected $casts = [
        'customer_id' => 'int',
        'company_id' => 'int',
        'assigned_user_id' => 'int',
        'birth_date' => 'datetime',
        'last_contact_at' => 'datetime',
        'next_followup_at' => 'date',
        'tags' => 'array',
        'is_active' => 'bool',
    ];

    protected $fillable = [
        'customer_id',
        'company_id',
        'type',
        'name',
        'email',
        'phone',
        'phone_alt',
        'whatsapp',
        'dni',
        'cuit',
        'iva_condition',
        'address',
        'city',
        'province',
        'postal_code',
        'birth_date',
        'source',
        'tags',
        'assigned_user_id',
        'last_contact_at',
        'next_followup_at',
        'notes',
        'is_active',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function assigned_user()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function crm_interactions()
    {
        return $this->hasMany(CrmInteraction::class);
    }
}
