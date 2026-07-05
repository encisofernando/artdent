<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeWebAuthnCredential extends Model
{
    protected $table = 'employee_webauthn_credentials';

    protected $fillable = [
        'employee_id',
        'credential_id',
        'public_key',
        'sign_count',
        'device_label',
        'user_handle',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
