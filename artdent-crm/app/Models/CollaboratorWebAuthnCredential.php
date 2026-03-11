<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CollaboratorWebAuthnCredential extends Model
{
    protected $table = 'collaborator_webauthn_credentials';

    protected $fillable = [
        'collaborator_id',
        'credential_id',
        'public_key',
        'sign_count',
        'device_label',
        'user_handle',
    ];

    public function collaborator(): BelongsTo
    {
        return $this->belongsTo(Collaborator::class);
    }
}
