<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class UserTenantMap extends Model
{
    protected $connection = 'central';

    protected $table = 'user_tenant_map';

    protected $fillable = ['email', 'tenant_id'];

    public function setEmailAttribute(string $value): void
    {
        $this->attributes['email'] = Str::lower(trim($value));
    }
}
