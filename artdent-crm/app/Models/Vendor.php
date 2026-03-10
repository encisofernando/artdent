<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class Vendor
 *
 * @property int $id
 * @property int $company_id
 * @property string $name
 * @property string|null $contact_name
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $address
 * @property string|null $cuit
 * @property string|null $iva_condition
 * @property string|null $notes
 * @property bool|null $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $deleted_at
 * @property Company $company
 * @property Collection|Expense[] $expenses
 * @property Collection|Product[] $products
 * @property Collection|Purchase[] $purchases
 */
class Vendor extends Model
{
    use SoftDeletes;

    protected $table = 'vendors';

    protected $casts = [
        'company_id' => 'int',
        'is_active' => 'bool',
    ];

    protected $fillable = [
        'company_id',
        'name',
        'contact_name',
        'email',
        'phone',
        'whatsapp',
        'website',
        'address',
        'city',
        'province',
        'payment_terms',
        'cuit',
        'iva_condition',
        'notes',
        'is_active',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }
}
