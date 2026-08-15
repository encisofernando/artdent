<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class ChatbotConversation extends Model
{
    use BelongsToCompany;

    protected $table = 'chatbot_conversations';

    protected $casts = [
        'company_id' => 'int',
        'user_id' => 'int',
        'last_message_at' => 'datetime',
    ];

    protected $fillable = [
        'company_id',
        'user_id',
        'title',
        'last_message_at',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function messages()
    {
        return $this->hasMany(ChatbotMessage::class, 'conversation_id');
    }
}
