<?php

namespace Tests\Feature;

use App\Models\ChatbotConversation;
use App\Models\Company;
use App\Models\User;
use App\Services\ChatbotService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Mockery\MockInterface;
use Tests\TestCase;

class ChatbotControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware();
        $this->ensureChatbotTables();
    }

    public function test_history_endpoint_returns_persisted_messages(): void
    {
        $user = $this->createUserWithCompany([
            'chatbot_provider' => 'openai',
            'chatbot_model' => 'gpt-4o-mini',
        ]);

        $conversation = ChatbotConversation::create([
            'company_id' => $user->company_id,
            'user_id' => $user->id,
            'last_message_at' => now(),
        ]);

        $conversation->messages()->createMany([
            ['role' => 'user', 'content' => 'Hola Artie'],
            ['role' => 'assistant', 'content' => 'Hola, ¿cómo estás?'],
        ]);

        $response = $this
            ->actingAs($user)
            ->getJson(route('api.chatbot.history'));

        $response
            ->assertOk()
            ->assertJsonPath('messages.0.content', 'Hola Artie')
            ->assertJsonPath('messages.1.content', 'Hola, ¿cómo estás?')
            ->assertJsonPath('meta.provider', 'openai')
            ->assertJsonPath('meta.model', 'gpt-4o-mini');
    }

    public function test_message_endpoint_persists_user_and_assistant_messages(): void
    {
        $user = $this->createUserWithCompany([
            'chatbot_provider' => 'openai',
            'chatbot_model' => 'gpt-4o-mini',
        ]);

        $this->mock(ChatbotService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('isEnabled')->once()->andReturn(true);
            $mock->shouldReceive('generateResponse')
                ->once()
                ->withArgs(function (array $messages, string $userMessage): bool {
                    return $userMessage === 'Necesito ventas de hoy'
                        && count($messages) === 1
                        && $messages[0]['role'] === 'user';
                })
                ->andReturn('Ventas de hoy: $ 10.000');
            $mock->shouldReceive('getFrontendConfig')->andReturn([
                'enabled' => true,
                'provider' => 'openai',
                'model' => 'gpt-4o-mini',
                'welcome_message' => 'Hola',
            ]);
        });

        $response = $this
            ->actingAs($user)
            ->postJson(route('api.chatbot'), [
                'message' => 'Necesito ventas de hoy',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Ventas de hoy: $ 10.000')
            ->assertJsonCount(2, 'messages')
            ->assertJsonPath('messages.0.role', 'user')
            ->assertJsonPath('messages.1.role', 'assistant');

        $this->assertDatabaseHas('chatbot_conversations', [
            'company_id' => $user->company_id,
            'user_id' => $user->id,
        ]);

        $this->assertDatabaseHas('chatbot_messages', [
            'role' => 'user',
            'content' => 'Necesito ventas de hoy',
        ]);

        $this->assertDatabaseHas('chatbot_messages', [
            'role' => 'assistant',
            'content' => 'Ventas de hoy: $ 10.000',
        ]);
    }

    public function test_reset_endpoint_deletes_the_persisted_conversation(): void
    {
        $user = $this->createUserWithCompany();

        $conversation = ChatbotConversation::create([
            'company_id' => $user->company_id,
            'user_id' => $user->id,
            'last_message_at' => now(),
        ]);

        $conversation->messages()->create([
            'role' => 'user',
            'content' => 'Borrar chat',
        ]);

        $response = $this
            ->actingAs($user)
            ->deleteJson(route('api.chatbot.reset'));

        $response
            ->assertOk()
            ->assertJsonPath('message', 'La conversación fue reiniciada.')
            ->assertJsonCount(0, 'messages');

        $this->assertDatabaseMissing('chatbot_conversations', [
            'id' => $conversation->id,
        ]);
    }

    public function test_history_endpoint_returns_a_fallback_payload_when_storage_tables_are_missing(): void
    {
        $user = $this->createUserWithCompany([
            'chatbot_provider' => 'openai',
            'chatbot_model' => 'gpt-4o-mini',
        ]);

        Schema::dropIfExists('chatbot_messages');
        Schema::dropIfExists('chatbot_conversations');

        $this->mock(ChatbotService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('getFrontendConfig')->once()->andReturn([
                'enabled' => true,
                'provider' => 'openai',
                'model' => 'gpt-4o-mini',
                'welcome_message' => 'Hola',
            ]);
        });

        $response = $this
            ->actingAs($user)
            ->getJson(route('api.chatbot.history'));

        $response
            ->assertOk()
            ->assertJsonCount(0, 'messages')
            ->assertJsonPath('meta.provider', 'openai')
            ->assertJsonPath('storage_ready', false);
    }

    public function test_message_endpoint_can_reply_without_persistent_storage(): void
    {
        $user = $this->createUserWithCompany([
            'chatbot_provider' => 'openai',
            'chatbot_model' => 'gpt-4o-mini',
        ]);

        Schema::dropIfExists('chatbot_messages');
        Schema::dropIfExists('chatbot_conversations');

        $this->mock(ChatbotService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('isEnabled')->once()->andReturn(true);
            $mock->shouldReceive('generateResponse')
                ->once()
                ->withArgs(function (array $messages, string $userMessage): bool {
                    return $userMessage === 'Seguimos sin historial'
                        && count($messages) === 1
                        && $messages[0]['role'] === 'user'
                        && $messages[0]['content'] === 'Seguimos sin historial';
                })
                ->andReturn('Puedo responder aunque el historial no este listo.');
            $mock->shouldReceive('getFrontendConfig')->once()->andReturn([
                'enabled' => true,
                'provider' => 'openai',
                'model' => 'gpt-4o-mini',
                'welcome_message' => 'Hola',
            ]);
        });

        $response = $this
            ->actingAs($user)
            ->postJson(route('api.chatbot'), [
                'message' => 'Seguimos sin historial',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Puedo responder aunque el historial no este listo.')
            ->assertJsonPath('meta.provider', 'openai')
            ->assertJsonPath('storage_ready', false)
            ->assertJsonMissingPath('messages');
    }

    protected function createUserWithCompany(array $companyOverrides = []): User
    {
        $company = Company::create(array_merge([
            'name' => 'ArtDent Test',
            'chatbot_enabled' => true,
            'chatbot_provider' => 'gemini',
            'chatbot_model' => 'gemini-1.5-flash-latest',
        ], $companyOverrides));

        return User::create([
            'company_id' => $company->id,
            'name' => 'Tester',
            'email' => 'tester+'.uniqid().'@example.com',
            'password' => Hash::make('password'),
        ]);
    }

    protected function ensureChatbotTables(): void
    {
        if (! Schema::hasTable('companies')) {
            Schema::create('companies', function (Blueprint $table): void {
                $table->id();
                $table->string('name');
                $table->boolean('chatbot_enabled')->default(true);
                $table->string('chatbot_provider')->nullable();
                $table->string('chatbot_model')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
                $table->string('name');
                $table->string('email')->unique();
                $table->string('password');
                $table->rememberToken()->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }

        if (! Schema::hasTable('chatbot_conversations')) {
            Schema::create('chatbot_conversations', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->timestamp('last_message_at')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('chatbot_messages')) {
            Schema::create('chatbot_messages', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('conversation_id')->constrained('chatbot_conversations')->cascadeOnDelete();
                $table->string('role');
                $table->longText('content');
                $table->json('metadata')->nullable();
                $table->timestamps();
            });
        }
    }
}
