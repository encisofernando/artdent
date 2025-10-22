<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'company_id','user_id','branch_id','first_name','last_name','email','phone','salary_base','is_active'
    ];
}
