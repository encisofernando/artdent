<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vendor extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'company_id','name','tax_id','email','phone','address','city','state','zip','is_active'
    ];
}
