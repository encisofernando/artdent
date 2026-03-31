<?php

namespace Tests\Unit;

use App\Models\Tenant;
use App\Services\OpenAITenantAnalyticsService;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class OpenAITenantAnalyticsServiceTest extends TestCase
{
    public function test_crear_prompt_cacheado_builds_a_cacheable_openai_prefix(): void
    {
        config()->set('services.chatbot.openai_prompt_cache_key', 'artdent:test-cache');
        config()->set('services.chatbot.openai_prompt_cache_retention', 'in-memory');

        $service = new FakeOpenAITenantAnalyticsService();
        $prompt = $service->crearPromptCacheado();

        $this->assertSame('artdent:test-cache:gpt-5.4-nano', $prompt['prompt_cache_key']);
        $this->assertSame('in-memory', $prompt['prompt_cache_retention']);
        $this->assertSame('auto', $prompt['tool_choice']);
        $this->assertTrue($prompt['parallel_tool_calls']);
        $this->assertCount(4, $prompt['tools']);
        $this->assertSame('json_schema', $prompt['text']['format']['type']);
        $this->assertTrue($prompt['text']['format']['strict']);
        $this->assertStringContainsString('analista comercial experto', $prompt['instructions']);
    }

    public function test_consultar_ia_returns_parsed_json_and_usage_metrics(): void
    {
        config()->set('services.chatbot.openai_key', 'test-openai-key');
        config()->set('services.chatbot.openai_model', 'gpt-5.4-nano');
        config()->set('services.chatbot.openai_prompt_cache_key', 'artdent:test-cache');

        Http::fake([
            'https://api.openai.com/v1/responses' => Http::response([
                'id' => 'resp_final_1',
                'output_text' => json_encode([
                    'respuesta' => 'El producto mas vendido es Resina Z.',
                    'datos_utilizados' => ['data.productos.mas_vendidos_30_dias'],
                    'acciones_sugeridas' => ['Reponer stock del top seller.'],
                ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                'usage' => [
                    'input_tokens' => 1400,
                    'input_tokens_details' => ['cached_tokens' => 1120],
                    'output_tokens' => 120,
                    'total_tokens' => 1520,
                ],
            ], 200),
        ]);

        $service = new FakeOpenAITenantAnalyticsService();
        $result = $service->consultarIA('TENANT001', 'Cuales son los productos mas vendidos a la fecha?');

        $this->assertTrue($result['ok']);
        $this->assertSame('TENANT001', $result['tenant_id']);
        $this->assertSame('gpt-5.4-nano', $result['model']);
        $this->assertSame('El producto mas vendido es Resina Z.', $result['respuesta']);
        $this->assertSame(['data.productos.mas_vendidos_30_dias'], $result['datos_utilizados']);
        $this->assertSame(['Reponer stock del top seller.'], $result['acciones_sugeridas']);
        $this->assertSame(1400, $result['usage']['input_tokens']);
        $this->assertSame(120, $result['usage']['output_tokens']);
        $this->assertSame(1120, $result['usage']['cached_input_tokens']);

        Http::assertSent(function (Request $request): bool {
            $this->assertSame('gpt-5.4-nano', $request['model']);
            $this->assertSame('artdent:test-cache:gpt-5.4-nano', $request['prompt_cache_key']);
            $this->assertSame('auto', $request['tool_choice']);
            $this->assertTrue($request['parallel_tool_calls']);
            $this->assertStringContainsString('TENANT001', $request['input']);
            $this->assertStringContainsString('Cuales son los productos mas vendidos', $request['input']);

            return true;
        });
    }

    public function test_consultar_ia_can_complete_tool_calls_and_accumulate_usage(): void
    {
        config()->set('services.chatbot.openai_key', 'test-openai-key');
        config()->set('services.chatbot.openai_model', 'gpt-5.4-nano');

        Http::fake([
            'https://api.openai.com/v1/responses' => Http::sequence()
                ->push([
                    'id' => 'resp_tool_1',
                    'output' => [
                        [
                            'type' => 'function_call',
                            'name' => 'obtenerTotalVendido',
                            'arguments' => json_encode([
                                'desde' => '2026-03-01',
                                'hasta' => '2026-03-28',
                            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                            'call_id' => 'call_total_1',
                            'status' => 'completed',
                        ],
                    ],
                    'usage' => [
                        'input_tokens' => 1500,
                        'input_tokens_details' => ['cached_tokens' => 1200],
                        'output_tokens' => 40,
                        'total_tokens' => 1540,
                    ],
                ], 200)
                ->push([
                    'id' => 'resp_tool_2',
                    'output_text' => json_encode([
                        'respuesta' => 'El total vendido del periodo es 12500.75.',
                        'datos_utilizados' => ['function.obtenerTotalVendido'],
                        'acciones_sugeridas' => [],
                    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    'usage' => [
                        'input_tokens' => 60,
                        'input_tokens_details' => ['cached_tokens' => 10],
                        'output_tokens' => 70,
                        'total_tokens' => 130,
                    ],
                ], 200),
        ]);

        $service = new FakeOpenAITenantAnalyticsService();
        $result = $service->consultarIA('TENANT001', 'Cuanto vendimos este mes?');

        $this->assertTrue($result['ok']);
        $this->assertSame('El total vendido del periodo es 12500.75.', $result['respuesta']);
        $this->assertSame(['function.obtenerTotalVendido'], $result['datos_utilizados']);
        $this->assertSame(1560, $result['usage']['input_tokens']);
        $this->assertSame(110, $result['usage']['output_tokens']);
        $this->assertSame(1210, $result['usage']['cached_input_tokens']);
        $this->assertSame(1670, $result['usage']['total_tokens']);

        Http::assertSent(function (Request $request): bool {
            if ($request['previous_response_id'] ?? null) {
                $this->assertSame('resp_tool_1', $request['previous_response_id']);
                $this->assertSame('function_call_output', $request['input'][0]['type']);
                $this->assertSame('call_total_1', $request['input'][0]['call_id']);
                $this->assertSame('12500.75', $request['input'][0]['output']);
            }

            return true;
        });
    }
}

class FakeOpenAITenantAnalyticsService extends OpenAITenantAnalyticsService
{
    protected function runForTenant(string $tenantId, \Closure $callback): mixed
    {
        $tenant = new Tenant([
            'id' => $tenantId,
            'name' => 'Tenant demo',
            'status' => 'active',
        ]);

        return $callback($tenant);
    }

    protected function collectTenantDynamicContext(Tenant $tenant, string $pregunta): array
    {
        return [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
            ],
            'fecha_actual' => '2026-03-28T12:00:00-03:00',
            'data' => [
                'ventas' => [
                    'ultimos_30_dias' => [
                        'operaciones' => 24,
                        'total_vendido' => 12500.75,
                    ],
                ],
                'productos' => [
                    'mas_vendidos_30_dias' => [
                        ['producto_id' => 15, 'producto' => 'Resina Z', 'cantidad_vendida' => 40, 'total_facturado' => 4800],
                    ],
                ],
                'stock' => [
                    'productos_con_stock_bajo' => [],
                ],
            ],
        ];
    }

    protected function obtenerTotalVendido(string $desde, string $hasta): float
    {
        return 12500.75;
    }
}
