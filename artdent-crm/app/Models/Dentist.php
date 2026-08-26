<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Class Dentist
 *
 * @property int $id
 * @property int $company_id
 * @property string|null $portal_token
 * @property string|null $code
 * @property string|null $type
 * @property string $name
 * @property string|null $contact_name
 * @property string|null $email
 * @property string|null $dni
 * @property string|null $phone
 * @property string|null $phone_alt
 * @property string|null $address
 * @property string|null $city
 * @property string|null $province
 * @property string|null $cuit
 * @property string|null $iva_condition
 * @property string|null $license_number
 * @property float|null $credit_limit
 * @property int|null $payment_days
 * @property bool|null $is_active
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $deleted_at
 * @property Company $company
 * @property Collection|Tariff[] $tariffs
 * @property Collection|Job[] $jobs
 * @property LabAccount|null $lab_account
 * @property Collection|Patient[] $patients
 */
class Dentist extends Model
{
    use BelongsToCompany;
    use SoftDeletes;

    protected $table = 'dentists';

    protected $casts = [
        'company_id' => 'int',
        'credit_limit' => 'float',
        'payment_days' => 'int',
        'discount_pct' => 'float',
        'is_active' => 'bool',
        'last_order_at' => 'datetime',
    ];

    protected $fillable = [
        'company_id',
        'portal_token',
        'code',
        'type',
        'name',
        'contact_name',
        'email',
        'dni',
        'phone',
        'phone_alt',
        'whatsapp',
        'specialty',
        'zone',
        'instagram',
        'website',
        'source',
        'discount_pct',
        'preferred_delivery_day',
        'last_order_at',
        'address',
        'city',
        'province',
        'postal_code',
        'cuit',
        'iva_condition',
        'license_number',
        'credit_limit',
        'payment_days',
        'is_active',
        'notes',
    ];

    protected static function booted(): void
    {
        static::creating(function (Dentist $dentist) {
            if (empty($dentist->portal_token)) {
                $dentist->portal_token = Str::random(48);
            }
        });
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function tariffs()
    {
        return $this->belongsToMany(Tariff::class, 'dentist_tariff_prices')
            ->withPivot('id', 'price')
            ->withTimestamps();
    }

    public function jobs()
    {
        return $this->hasMany(Job::class);
    }

    public function lab_account()
    {
        return $this->hasOne(LabAccount::class);
    }

    public function labAccount()
    {
        return $this->hasOne(LabAccount::class);
    }

    public function patients()
    {
        return $this->hasMany(Patient::class);
    }

    public function crm_interactions()
    {
        return $this->hasMany(CrmInteraction::class);
    }

    public function login_codes()
    {
        return $this->hasMany(DentistLoginCode::class);
    }

    public function delivery_routes()
    {
        return $this->hasMany(DentistDeliveryRoute::class);
    }

    public function supply_sales()
    {
        return $this->hasMany(Sale::class)->where('sale_type', 'lab_supply');
    }
}
