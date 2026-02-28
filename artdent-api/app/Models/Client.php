<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Job;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'clinics';  // Reutiliza clinics para clientes

    protected $fillable = [
        'company_id', 'name', 'type', 'cuit', 'phone', 'email', 'balance', 'active', 'address'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function jobs()
    {
        return $this->hasMany(Job::class, 'clinic_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'client_id');
    }
}
