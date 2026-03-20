<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use App\Mail\CustomerResetPassword;
use Carbon\Carbon;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\HasApiTokens;

/**
 * Class Customer
 *
 * @property int $id
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
    use CanResetPassword, HasApiTokens, Notifiable, SoftDeletes;

    public function sendPasswordResetNotification($token): void
    {
        Mail::to($this->email)->queue(new CustomerResetPassword($this, $token));
    }

    protected $table = 'customers';

    protected $casts = [
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
        'address',
        'city',
        'province',
        'postal_code',
        'email_verified_at',
        'remember_token',
        'accepts_marketing',
        'is_active',
    ];

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
