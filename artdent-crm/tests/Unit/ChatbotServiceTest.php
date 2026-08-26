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
        $service = new FakeChatbotService(['api_key' => null]);

        // No "Hola": la base de conocimiento estática responde saludos
        // sin llegar nunca a Claude — un pedido de dato en vivo sí cae
        // al fallback que este test verifica.
        $response = $service->generateResponse([
            ['role' => 'user', 'content' => '¿Cuánto vendí hoy?'],
        ]);

        $this->assertSame(
            'Para consultas sobre datos en tiempo real (ventas, stock, jobs, deudas) necesito configurar la API Key de Claude. Podés configurarla en **Ajustes → Integraciones**.',
            $response
        );
    }

    public function test_it_sends_normalized_messages_to_claude(): void
    {
        Http::fake([
            'https://api.anthropic.com/*' => Http::response([
                'content' => [
                    ['text' => 'Respuesta OK'],
                ],
            ], 200),
        ]);

        $service = new FakeChatbotService(['api_key' => 'test-anthropic-key']);

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

            // system/blank quedan afuera de `messages` — Claude los recibe
            // aparte, en el campo `system` del request, no mezclados acá.
            $this->assertCount(3, $messages);
            $this->assertSame('user', $messages[0]['role']);
            $this->assertSame('Hola', $messages[0]['content']);
            $this->assertSame('assistant', $messages[1]['role']);
            $this->assertSame('user', $messages[2]['role']);
            $this->assertSame('Caja de hoy', $messages[2]['content']);

            $system = $request['system'];
            $this->assertStringContainsString('Artie', $system[0]['text']);

            return true;
        });
    }

    public function test_it_only_includes_relevant_context_blocks_in_the_dynamic_context(): void
    {
        $service = new FakeChatbotService(['api_key' => 'test-key']);

        $financeContext = $service->exposeDynamicContext('¿Cómo va la caja hoy?');
        $jobsContext = $service->exposeDynamicContext('Trabajo #1234');

        $this->assertStringContainsString("FINANZAS:\nFINANCE_CTX", $financeContext);
        $this->assertStringNotContainsString("LABORATORIO:\nJOBS_CTX", $financeContext);

        $this->assertStringContainsString("LABORATORIO:\nJOBS_CTX", $jobsContext);
        $this->assertStringNotContainsString("INVENTARIO:\nINVENTORY_CTX", $jobsContext);
    }

    public function test_frontend_config_can_reflect_company_level_overrides(): void
    {
        $service = new FakeChatbotService([
            'enabled' => false,
            'model' => 'claude-haiku-4-5-20251001',
            'api_key' => 'test-key',
        ]);

        $config = $service->getFrontendConfig();

        $this->assertFalse($config['enabled']);
        // El provider queda fijo en 'claude' independientemente de la
        // config — ChatbotService::getFrontendConfig() ya no lo toma de
        // $settings, es un literal. Este assert es guarda de regresión.
        $this->assertSame('claude', $config['provider']);
        $this->assertSame('claude-haiku-4-5-20251001', $config['model']);
        $this->assertNotEmpty($config['welcome_message']);
    }
}

class FakeChatbotService extends ChatbotService
{
    public function __construct(
        protected array $fakeSettings = [],
    ) {}

    public function exposeDynamicContext(string $userMessage): string
    {
        return $this->buildDynamicContext($userMessage);
    }

    protected function resolveChatbotSettings(): array
    {
        return array_merge([
            'enabled' => true,
            'provider' => 'claude',
            'model' => static::DEFAULT_MODEL,
            'api_key' => null,
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
