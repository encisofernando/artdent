<?php

namespace Tests\Unit;

use App\Services\ChatbotService;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ChatbotServiceTest extends TestCase
{
    public function test_it_returns_a_clear_message_when_api_key_is_missing(): void
    {
        config()->set('services.chatbot.api_key', null);
        config()->set('services.chatbot.provider', 'openai');

        $service = new FakeChatbotService();

        $response = $service->generateResponse([
            ['role' => 'user', 'content' => 'Hola'],
        ]);

        $this->assertSame(
            'No puedo responder todavía porque falta configurar la API Key del chatbot.',
            $response
        );
    }

    public function test_it_sends_normalized_messages_to_openai(): void
    {
        config()->set('services.chatbot.api_key', 'test-openai-key');
        config()->set('services.chatbot.provider', 'openai');

        Http::fake([
            'https://api.openai.com/*' => Http::response([
                'choices' => [
                    ['message' => ['content' => 'Respuesta OK']],
                ],
            ], 200),
        ]);

        $service = new FakeChatbotService();

        $response = $service->generateResponse([
            ['role' => 'assistant', 'content' => '   '],
            ['role' => 'user', 'content' => " Hola \r\n\r\n"],
            ['role' => 'assistant', 'content' => '**Resumen**'],
            ['role' => 'system', 'content' => 'Ignorar'],
            ['role' => 'user', 'content' => '   Caja de hoy   '],
        ]);

        $this->assertSame('Respuesta OK', $response);

        Http::assertSent(function (Request $request): bool {
            $messages = $request['messages'];

            $this->assertCount(4, $messages);
            $this->assertSame('system', $messages[0]['role']);
            $this->assertSame('Hola', $messages[1]['content']);
            $this->assertSame('assistant', $messages[2]['role']);
            $this->assertSame('Caja de hoy', $messages[3]['content']);

            return true;
        });
    }

    public function test_it_only_includes_relevant_context_blocks_in_the_prompt(): void
    {
        config()->set('services.chatbot.api_key', 'test-key');
        config()->set('services.chatbot.provider', 'openai');

        $service = new FakeChatbotService();

        $financePrompt = $service->exposeSystemPrompt('¿Cómo va la caja hoy?');
        $jobsPrompt = $service->exposeSystemPrompt('Trabajo #1234');

        $this->assertStringContainsString("FINANZAS:\nFINANCE_CTX", $financePrompt);
        $this->assertStringNotContainsString("LABORATORIO:\nJOBS_CTX", $financePrompt);

        $this->assertStringContainsString("LABORATORIO:\nJOBS_CTX", $jobsPrompt);
        $this->assertStringNotContainsString("INVENTARIO:\nINVENTORY_CTX", $jobsPrompt);
    }

    public function test_it_formats_gemini_messages_without_a_leading_assistant_message(): void
    {
        config()->set('services.chatbot.api_key', 'test-gemini-key');
        config()->set('services.chatbot.provider', 'gemini');

        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'Respuesta Gemini'],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $service = new FakeChatbotService();

        $response = $service->generateResponse([
            ['role' => 'assistant', 'content' => 'Bienvenido'],
            ['role' => 'user', 'content' => 'Mostrame stock'],
            ['role' => 'assistant', 'content' => 'Claro'],
            ['role' => 'user', 'content' => 'y caja'],
        ]);

        $this->assertSame('Respuesta Gemini', $response);

        Http::assertSent(function (Request $request): bool {
            $contents = $request['contents'];

            $this->assertSame('user', $contents[0]['role']);
            $this->assertSame('Mostrame stock', $contents[0]['parts'][0]['text']);
            $this->assertSame('model', $contents[1]['role']);
            $this->assertSame('user', $contents[2]['role']);

            return true;
        });
    }

    public function test_frontend_config_can_reflect_company_level_overrides(): void
    {
        $service = new FakeChatbotService([
            'enabled' => false,
            'provider' => 'openai',
            'model' => 'gpt-4.1-mini',
            'api_key' => 'test-key',
        ]);

        $config = $service->getFrontendConfig();

        $this->assertFalse($config['enabled']);
        $this->assertSame('openai', $config['provider']);
        $this->assertSame('gpt-4.1-mini', $config['model']);
        $this->assertNotEmpty($config['welcome_message']);
    }
}

class FakeChatbotService extends ChatbotService
{
    public function __construct(
        protected array $fakeSettings = [],
    ) {
    }

    public function exposeSystemPrompt(string $userMessage): string
    {
        return $this->getSystemPrompt($userMessage);
    }

    protected function resolveChatbotSettings(): array
    {
        return array_merge([
            'enabled' => true,
            'provider' => config('services.chatbot.provider', 'gemini'),
            'model' => config('services.chatbot.gemini_model', 'gemini-1.5-flash-latest'),
            'api_key' => config('services.chatbot.api_key'),
        ], $this->fakeSettings);
    }

    protected function getQuickStats(): array
    {
        return [
            'patients' => '10',
            'sales_30d' => '8',
            'pending_jobs' => '4',
            'users' => '3',
        ];
    }

    protected function getInventoryContext(): string
    {
        return 'INVENTORY_CTX';
    }

    protected function getFinanceContext(): string
    {
        return 'FINANCE_CTX';
    }

    protected function getPendingJobsContext(string $userMessage = ''): string
    {
        return 'JOBS_CTX';
    }

    protected function getDebtContext(): string
    {
        return 'DEBT_CTX';
    }

    protected function getTopCustomerContext(): string
    {
        return 'CUSTOMER_CTX';
    }

    protected function getTopOverallProductContext(): string
    {
        return 'PRODUCT_CTX';
    }
}
