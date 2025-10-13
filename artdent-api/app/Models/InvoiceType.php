<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceType extends Model
{
    public $timestamps = false;
    protected $fillable = ['code','description'];
    protected $table = 'invoice_types';
}
