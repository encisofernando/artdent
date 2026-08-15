<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class DentistDeliveryRoute
 *
 * @property int $id
 * @property int $company_id
 * @property int $dentist_id
 * @property string|null $route_name
 * @property int|null $delivery_day ISO weekday: 1=Lunes … 7=Domingo
 * @property int $delivery_order
 * @property string|null $address
 * @property string|null $contact_name
 * @property string|null $contact_phone
 * @property string|null $notes
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Company $company
 * @property Dentist $dentist
 */
class DentistDeliveryRoute extends Model
{
    use BelongsToCompany;

    protected $table = 'dentist_delivery_routes';

    protected $casts = [
        'company_id' => 'int',
        'dentist_id' => 'int',
        'delivery_day' => 'int',
        'delivery_order' => 'int',
        'is_active' => 'bool',
    ];

    protected $fillable = [
        'company_id',
        'dentist_id',
        'route_name',
        'delivery_day',
        'delivery_order',
        'address',
        'contact_name',
        'contact_phone',
        'notes',
        'is_active',
    ];

    public function company(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function dentist(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Dentist::class);
    }
}
