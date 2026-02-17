<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContactMessage extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'contact_messages';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'status',
        'ip_address',
        'user_agent',
        'replied_at',
        'replied_by',
        'reply_notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'replied_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'subject_label',
        'reference_number',
        'is_replied',
    ];

    /**
     * Obtener la etiqueta del asunto
     *
     * @return string
     */
    public function getSubjectLabelAttribute(): string
    {
        $labels = [
            'consulta-producto' => 'Consulta sobre producto',
            'cotizacion' => 'Solicitud de cotización',
            'pedido' => 'Estado de pedido',
            'facturacion' => 'Facturación',
            'soporte-tecnico' => 'Soporte técnico',
            'otro' => 'Otro',
        ];

        return $labels[$this->subject] ?? $this->subject;
    }

    /**
     * Obtener el número de referencia
     *
     * @return string
     */
    public function getReferenceNumberAttribute(): string
    {
        return 'CONT-' . str_pad($this->id, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Verificar si el mensaje fue respondido
     *
     * @return bool
     */
    public function getIsRepliedAttribute(): bool
    {
        return $this->status === 'replied';
    }

    /**
     * Scope para mensajes pendientes
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope para mensajes leídos
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRead($query)
    {
        return $query->where('status', 'read');
    }

    /**
     * Scope para mensajes respondidos
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeReplied($query)
    {
        return $query->where('status', 'replied');
    }

    /**
     * Scope para buscar por nombre o email
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $search
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%");
        });
    }

    /**
     * Marcar como respondido
     *
     * @param int|null $userId
     * @param string|null $notes
     * @return bool
     */
    public function markAsReplied($userId = null, $notes = null): bool
    {
        return $this->update([
            'status' => 'replied',
            'replied_at' => now(),
            'replied_by' => $userId,
            'reply_notes' => $notes,
        ]);
    }

    /**
     * Relación con el usuario que respondió
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function repliedBy()
    {
        return $this->belongsTo(User::class, 'replied_by');
    }
}
