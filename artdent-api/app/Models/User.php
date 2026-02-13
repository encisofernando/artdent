<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Notifications\ResetPasswordNotification;
use App\Traits\HasRoles;

class User extends Authenticatable
{
     use HasApiTokens, Notifiable, HasRoles;

    protected $fillable = [
        'company_id',
        'name',
        'email',
        'password',
        'pricing_mode',
        'b2b_discount_percent',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'b2b_discount_percent' => 'float',
    ];

    /**
     * Envía el email de restablecimiento con tu notificación custom ARTDENT.
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }
}
