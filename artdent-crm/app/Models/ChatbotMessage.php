<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatbotMessage extends Model
{
    protected $table = 'chatbot_messages';

    protected $casts = [
        'conversation_id' => 'int',
        'metadata' => 'array',
    ];

    protected $fillable = [
        'conversation_id',
        'role',
        'content',
        'metadata',
    ];

    public function conversation()
    {
        return $this->belongsTo(ChatbotConversation::class, 'conversation_id');
    }
}
