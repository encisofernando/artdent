<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsappMessage extends Model
{
    protected $table = 'whatsapp_messages';

    protected $casts = [
        'conversation_id' => 'int',
        'payload' => 'array',
        'error_data' => 'array',
    ];

    protected $fillable = [
        'conversation_id',
        'direction',
        'wa_message_id',
        'type',
        'payload',
        'status',
        'error_data',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(WhatsappConversation::class, 'conversation_id');
    }
}
