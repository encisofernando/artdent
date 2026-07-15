<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SuperadminAuditLog extends Model
{
    protected $fillable = [
        'actor_id',
        'actor_email',
        'action',
        'tenant_id',
        'tenant_name',
        'changes',
        'note',
        'ip_address',
    ];

    protected $casts = [
        'changes' => 'array',
    ];

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
