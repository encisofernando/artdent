<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Tabla central (BD de artdent-admin, `artcode_admin`), compartida por
 * conexión física — ver App\Models\SubscriptionInvoice para el mismo patrón.
 * Acá el tenant crea/lee sus propios tickets, filtrando manualmente por
 * tenant_id (no aplica BelongsToCompany, que scopea por company_id).
 */
class Ticket extends Model
{
    protected $connection = 'central';

    protected $fillable = [
        'tenant_id',
        'tenant_name',
        'subject',
        'category',
        'priority',
        'status',
        'created_by_name',
        'created_by_email',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function messages(): HasMany
    {
        return $this->hasMany(TicketMessage::class)->orderBy('created_at');
    }
}
