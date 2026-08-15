<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class CollaboratorDiscount
 *
 * @property int $id
 * @property int $company_id
 * @property int $collaborator_id
 * @property Carbon $date
 * @property string $concept
 * @property float $amount
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Collaborator $collaborator
 */
class CollaboratorDiscount extends Model
{
    use BelongsToCompany;

    protected $table = 'collaborator_discounts';

    protected $casts = [
        'company_id' => 'int',
        'collaborator_id' => 'int',
        'date' => 'date:Y-m-d',
        'amount' => 'float',
    ];

    protected $fillable = [
        'company_id',
        'collaborator_id',
        'date',
        'concept',
        'amount',
    ];

    public function collaborator()
    {
        return $this->belongsTo(Collaborator::class);
    }
}
