<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WhatsappConversation extends Model
{
    protected $table = 'whatsapp_conversations';

    protected $casts = [
        'company_id' => 'int',
        'customer_id' => 'int',
        'last_message_at' => 'datetime',
        'window_expires_at' => 'datetime',
    ];

    protected $fillable = [
        'company_id',
        'phone',
        'customer_id',
        'last_message_at',
        'window_expires_at',
    ];

    /** Indica si la ventana de 24hs para mensajes libres sigue abierta. */
    public function isWindowOpen(): bool
    {
        return $this->window_expires_at !== null && $this->window_expires_at->isFuture();
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(WhatsappMessage::class, 'conversation_id');
    }
}
