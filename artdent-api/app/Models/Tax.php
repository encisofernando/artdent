<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tax extends Model
{
    protected $fillable = ['company_id','name','rate','is_default'];
}
