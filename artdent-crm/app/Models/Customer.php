<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use App\Mail\CustomerResetPassword;
use App\Models\Concerns\BelongsToCompany;
use Carbon\Carbon;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

/**
 * Class Customer
 *
 * @property int $id
 * @property int $company_id
 * @property string $name
 * @property string $email
 * @property string|null $password
 * @property string|null $phone
 * @property string|null $dni
 * @property string|null $address
 * @property string|null $city
 * @property string|null $province
 * @property string|null $postal_code
 * @property Carbon|null $email_verified_at
 * @property string|null $remember_token
 * @property bool|null $accepts_marketing
 * @property bool|null $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $deleted_at
 * @property Collection|CrmClient[] $crm_clients
 * @property Collection|CustomerAddress[] $customer_addresses
 * @property Collection|EcommerceOrder[] $ecommerce_orders
 * @property Collection|Review[] $reviews
 * @property Collection|Wishlist[] $wishlists
 */
class Customer extends Authenticatable
{
    use BelongsToCompany, CanResetPassword, HasApiTokens, Notifiable, SoftDeletes;

    public function sendPasswordResetNotification($token): void
    {
        Mail::to($this->email)->queue(new CustomerResetPassword($this, $token));
    }

    protected $table = 'customers';

    protected $casts = [
        'company_id' => 'int',
        'email_verified_at' => 'datetime',
        'accepts_marketing' => 'bool',
        'is_active' => 'bool',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'whatsapp_bsuid',
        'dni',
        'cuit',
        'iva_condition',
        'address',
        'city',
        'province',
        'postal_code',
        'email_verified_at',
        'remember_token',
        'accepts_marketing',
        'is_active',
        'google_id',
        'facebook_id',
        'portal_token',
    ];

    protected static function booted(): void
    {
        static::creating(function (Customer $customer) {
            if (empty($customer->portal_token)) {
                $customer->portal_token = Str::random(48);
            }
        });
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function customer_account()
    {
        return $this->hasOne(CustomerAccount::class);
    }

    public function loyalty_account()
    {
        return $this->hasOne(LoyaltyAccount::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    public function crm_clients()
    {
        return $this->hasMany(CrmClient::class);
    }

    public function customer_addresses()
    {
        return $this->hasMany(CustomerAddress::class);
    }

    public function ecommerce_orders()
    {
        return $this->hasMany(EcommerceOrder::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }
}
