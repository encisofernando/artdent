<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserTenantMap extends Model
{
    protected $table = 'user_tenant_map';

    protected $fillable = ['email', 'tenant_id'];
    
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
