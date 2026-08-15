<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class CrmInteraction
 *
 * @property int $id
 * @property int $company_id
 * @property int|null $user_id
 * @property int|null $dentist_id
 * @property int|null $crm_client_id
 * @property string $type llamada|email|whatsapp|visita|reunion|otro
 * @property string $direction inbound|outbound
 * @property string|null $subject
 * @property string|null $notes
 * @property string|null $outcome
 * @property Carbon|null $followup_date
 * @property Carbon $interaction_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Company $company
 * @property User|null $user
 * @property Dentist|null $dentist
 * @property CrmClient|null $crm_client
 */
class CrmInteraction extends Model
{
    use BelongsToCompany;

    protected $table = 'crm_interactions';

    protected $casts = [
        'company_id' => 'int',
        'user_id' => 'int',
        'dentist_id' => 'int',
        'crm_client_id' => 'int',
        'followup_date' => 'date',
        'interaction_at' => 'datetime',
    ];

    protected $fillable = [
        'company_id',
        'user_id',
        'dentist_id',
        'crm_client_id',
        'type',
        'direction',
        'subject',
        'notes',
        'outcome',
        'followup_date',
        'interaction_at',
    ];

    public function company(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function dentist(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Dentist::class);
    }

    public function crm_client(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(CrmClient::class);
    }
}
