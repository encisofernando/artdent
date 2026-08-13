<?php

namespace Tests\Feature;

use App\Exceptions\PlanLimitExceededException;
use App\Models\ChatbotMessage;
use App\Models\Company;
use App\Models\Plan;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;
use App\Support\PlanLimitService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/**
 * PlanLimitService lee el plan activo vía TenantModuleResolver::currentPlan(),
 * que en modo owner resuelve el plan por config('crm.owner_tenant.plan'). Se
 * usa ese modo acá para poder fijar un plan de prueba sin depender de tablas
 * de tenancy/suscripciones. El modelo Plan vive siempre en la conexión
 * 'central' (real, compartida con artdent-admin), así que también se
 * transacciona esa conexión para no dejar residuos.
 */
class PlanLimitServiceTest extends TestCase
{
    use DatabaseTransactions;

    protected $connectionsToTransact = [null, 'central'];

    protected function setUp(): void
    {
        parent::setUp();

        $this->ensureTables();
    }

    public function test_blocks_creating_a_user_beyond_the_plan_limit(): void
    {
        $this->usePlan(['max_users' => 2]);
        $company = $this->makeCompany();
        $this->makeUser($company);
        $this->makeUser($company);

        $this->expectException(PlanLimitExceededException::class);

        app(PlanLimitService::class)->assertCanAddUser();
    }

    public function test_allows_creating_a_user_under_the_plan_limit(): void
    {
        $this->usePlan(['max_users' => 2]);
        $company = $this->makeCompany();
        $this->makeUser($company);

        app(PlanLimitService::class)->assertCanAddUser();

        $this->assertTrue(true);
    }

    public function test_null_limit_means_unlimited(): void
    {
        $this->usePlan(['max_users' => null]);
        $company = $this->makeCompany();
        $this->makeUser($company);
        $this->makeUser($company);
        $this->makeUser($company);

        app(PlanLimitService::class)->assertCanAddUser();

        $this->assertTrue(true);
    }

    public function test_blocks_creating_a_product_beyond_the_plan_limit(): void
    {
        $this->usePlan(['max_products' => 1]);
        $company = $this->makeCompany();
        // 'slug'/'company_id' son NOT NULL en el schema real (ya no en la
        // tabla mínima de este test — products existía antes de correr esto).
        Product::insert(['company_id' => $company->id, 'name' => 'Producto de prueba', 'slug' => 'producto-prueba-'.uniqid(), 'price' => 100, 'created_at' => now(), 'updated_at' => now()]);

        $this->expectException(PlanLimitExceededException::class);

        app(PlanLimitService::class)->assertCanAddProduct();
    }

    public function test_blocks_recording_a_sale_beyond_the_monthly_plan_limit(): void
    {
        $this->usePlan(['max_sales_per_month' => 1]);
        $company = $this->makeCompany();
        Sale::insert(['company_id' => $company->id, 'total' => 100, 'created_at' => now(), 'updated_at' => now()]);

        $this->expectException(PlanLimitExceededException::class);

        app(PlanLimitService::class)->assertCanRecordSale();
    }

    public function test_blocks_sending_a_chat_message_beyond_the_monthly_plan_limit(): void
    {
        $this->usePlan(['max_chat_messages_per_month' => 1]);
        $conversationId = $this->makeChatbotConversation();
        ChatbotMessage::insert(['conversation_id' => $conversationId, 'role' => 'user', 'content' => 'hola', 'created_at' => now(), 'updated_at' => now()]);

        $this->expectException(PlanLimitExceededException::class);

        app(PlanLimitService::class)->assertCanSendChatMessage();
    }

    public function test_chat_message_count_ignores_assistant_replies(): void
    {
        // max=2, pero sólo 1 mensaje de "user" (las 2 respuestas de "assistant"
        // no deben contar contra el límite) → no debería lanzar.
        $this->usePlan(['max_chat_messages_per_month' => 2]);
        $conversationId = $this->makeChatbotConversation();
        ChatbotMessage::insert(['conversation_id' => $conversationId, 'role' => 'user', 'content' => 'hola', 'created_at' => now(), 'updated_at' => now()]);
        ChatbotMessage::insert(['conversation_id' => $conversationId, 'role' => 'assistant', 'content' => 'hola!', 'created_at' => now(), 'updated_at' => now()]);
        ChatbotMessage::insert(['conversation_id' => $conversationId, 'role' => 'assistant', 'content' => 'en qué te ayudo?', 'created_at' => now(), 'updated_at' => now()]);

        app(PlanLimitService::class)->assertCanSendChatMessage();

        $this->assertTrue(true);
    }

    protected function usePlan(array $overrides): Plan
    {
        $slug = 'test-plan-'.uniqid();

        config([
            'crm.mode' => 'owner',
            'crm.owner_tenant.plan' => $slug,
        ]);

        return Plan::create(array_merge([
            'slug' => $slug,
            'name' => 'Plan de prueba',
            'price' => 0,
            'trial_days' => 0,
            'is_active' => true,
            'is_public' => true,
            'max_users' => null,
            'max_products' => null,
            'max_sales_per_month' => null,
            'max_chat_messages_per_month' => null,
        ], $overrides));
    }

    protected function makeCompany(): Company
    {
        $company = new Company(['name' => 'Company '.uniqid()]);
        $company->save();

        return $company;
    }

    protected function makeUser(Company $company): User
    {
        return User::create([
            'company_id' => $company->id,
            'name' => 'Tester',
            'email' => 'tester+'.uniqid().'@example.com',
            'password' => Hash::make('password'),
        ]);
    }

    protected function makeChatbotConversation(): int
    {
        $company = $this->makeCompany();
        $user = $this->makeUser($company);

        return \App\Models\ChatbotConversation::create([
            'company_id' => $company->id,
            'user_id' => $user->id,
            'last_message_at' => now(),
        ])->id;
    }

    protected function ensureTables(): void
    {
        if (! Schema::hasTable('companies')) {
            Schema::create('companies', function (Blueprint $table): void {
                $table->id();
                $table->string('name');
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

        if (! Schema::hasTable('products')) {
            Schema::create('products', function (Blueprint $table): void {
                $table->id();
                $table->string('name');
                $table->decimal('price', 12, 2)->default(0);
                $table->timestamps();
                $table->softDeletes();
            });
        }

        if (! Schema::hasTable('sales')) {
            Schema::create('sales', function (Blueprint $table): void {
                $table->id();
                $table->decimal('total', 12, 2)->default(0);
                $table->timestamps();
                $table->softDeletes();
            });
        }

        // `plans` vive en la conexión 'central' (compartida con
        // artdent-admin, otro codebase) — no tiene migración en este
        // repo, así que hay que armarla acá igual que el resto.
        if (! Schema::connection('central')->hasTable('plans')) {
            Schema::connection('central')->create('plans', function (Blueprint $table): void {
                $table->id();
                $table->string('slug')->unique();
                $table->string('name');
                $table->decimal('price', 10, 2)->default(0);
                $table->unsignedInteger('trial_days')->default(0);
                $table->boolean('is_active')->default(true);
                $table->boolean('is_public')->default(true);
                $table->string('mp_plan_id')->nullable();
                $table->unsignedInteger('max_users')->nullable();
                $table->unsignedInteger('max_products')->nullable();
                $table->unsignedInteger('max_sales_per_month')->nullable();
                $table->unsignedInteger('max_chat_messages_per_month')->nullable();
                $table->json('features')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('chatbot_messages')) {
            Schema::create('chatbot_messages', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('conversation_id');
                $table->string('role');
                $table->text('content');
                $table->json('metadata')->nullable();
                $table->timestamps();
            });
        }
    }
}
