<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Tabla central — ver App\Models\Ticket.
 */
class TicketMessage extends Model
{
    protected $connection = 'central';

    protected $fillable = [
        'ticket_id',
        'author_type',
        'author_name',
        'author_email',
        'body',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }
}
