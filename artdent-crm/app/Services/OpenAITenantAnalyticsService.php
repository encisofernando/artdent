<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Stock;
use App\Models\Tenant;
use Carbon\Carbon;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class OpenAITenantAnalyticsService extends ChatbotService
{
    protected const RESPONSES_ENDPOINT = 'https://api.openai.com/v1/responses';
    protected const DEFAULT_PROMPT_CACHE_KEY = 'artdent:chatbot:erp:v1';
    protected const DEFAULT_PROMPT_CACHE_RETENTION = 'in_memory';
    protected const MAX_TOOL_ROUNDS = 4;
    protected const DEFAULT_MAX_OUTPUT_TOKENS = 900;

    public function __construct()
    {
    }

    /**
     * OpenAI no expone un flag por bloque del estilo `cache: true`.
     * El equivalente soportado hoy es mantener el prefijo fijo intacto,
     * usar `prompt_cache_key` y leer `usage.input_tokens_details.cached_tokens`.
     */
    public function crearPromptCacheado(): array
    {
        return [
            'instructions' => $this->buildStaticInstructions(),
            'tools' => $this->buildToolDefinitions(),
            'tool_choice' => 'auto',
            'parallel_tool_calls' => true,
            'text' => [
                'format' => [
                    'type' => 'json_schema',
                    'name' => 'respuesta_chatbot_erp',
                    'strict' => true,
                    'schema' => $this->buildResponseSchema(),
                ],
            ],
            'prompt_cache_key' => $this->resolvePromptCacheKey(),
            'prompt_cache_retention' => (string) config(
                'services.chatbot.openai_prompt_cache_retention',
                static::DEFAULT_PROMPT_CACHE_RETENTION
            ),
        ];
    }

    public function consultarIA(string $tenantId, string $pregunta): array
    {
        $model = (string) config('services.chatbot.openai_model', static::OPENAI_MODEL);
        $pregunta = $this->sanitizeContent($pregunta);

        if ($pregunta === '') {
            return $this->buildErrorResult(
                tenantId: $tenantId,
                model: $model,
                message: 'Necesito una pregunta para poder consultar la IA.'
            );
        }

        $apiKey = $this->resolveApiKey('openai');

        if (blank($apiKey)) {
            return $this->buildErrorResult(
                tenantId: $tenantId,
                model: $model,
                message: 'Falta configurar la API Key de OpenAI para este entorno.'
            );
        }

        try {
            return $this->runForTenant($tenantId, function (Tenant $tenant) use ($tenantId, $pregunta, $apiKey, $model): array {
                $dynamicData = $this->collectTenantDynamicContext($tenant, $pregunta);
                $usage = $this->emptyUsage();
                $cacheablePrompt = $this->crearPromptCacheado();

                $responsePayload = array_merge($cacheablePrompt, [
                    'model' => $model,
                    'temperature' => 0.2,
                    'max_output_tokens' => static::DEFAULT_MAX_OUTPUT_TOKENS,
                    'metadata' => [
                        'tenant_id' => $tenantId,
                        'integration' => 'artdent-pos-erp',
                    ],
                    'input' => $this->buildDynamicInput($tenantId, $pregunta, $dynamicData),
                ]);

                $response = $this->sendResponseRequest($apiKey, $responsePayload);
                $usage = $this->sumUsage($usage, data_get($response, 'usage', []));

                $round = 0;

                while ($round < static::MAX_TOOL_ROUNDS) {
                    $toolCalls = $this->extractFunctionCalls($response);

                    if ($toolCalls === []) {
                        break;
                    }

                    $toolOutputs = [];

                    foreach ($toolCalls as $toolCall) {
                        $toolOutputs[] = [
                            'type' => 'function_call_output',
                            'call_id' => (string) ($toolCall['call_id'] ?? ''),
                            'output' => $this->encodeJson(
                                $this->executeToolCall(
                                    (string) ($toolCall['name'] ?? ''),
                                    $this->decodeJson((string) ($toolCall['arguments'] ?? '{}'))
                                )
                            ),
                        ];
                    }

                    $response = $this->sendResponseRequest($apiKey, [
                        'model' => $model,
                        'previous_response_id' => data_get($response, 'id'),
                        'input' => $toolOutputs,
                        'max_output_tokens' => static::DEFAULT_MAX_OUTPUT_TOKENS,
                    ]);

                    $usage = $this->sumUsage($usage, data_get($response, 'usage', []));
                    $round++;
                }

                $parsed = $this->normalizeAssistantPayload($this->decodeJson($this->extractResponseText($response)));

                $result = [
                    'ok' => true,
                    'tenant_id' => $tenantId,
                    'model' => $model,
                    'respuesta' => $parsed['respuesta'],
                    'datos_utilizados' => $parsed['datos_utilizados'],
                    'acciones_sugeridas' => $parsed['acciones_sugeridas'],
                    'usage' => $usage,
                    'request_id' => data_get($response, 'id'),
                ];

                Log::info('OpenAI tenant analytics usage', [
                    'tenant_id' => $tenantId,
                    'model' => $model,
                    'request_id' => $result['request_id'],
                    'input_tokens' => $usage['input_tokens'],
                    'output_tokens' => $usage['output_tokens'],
                    'cached_input_tokens' => $usage['cached_input_tokens'],
                    'total_tokens' => $usage['total_tokens'],
                ]);

                return $result;
            });
        } catch (Throwable $e) {
            Log::error('OpenAI tenant analytics failed', [
                'tenant_id' => $tenantId,
                'model' => $model,
                'message' => $e->getMessage(),
            ]);

            return $this->buildErrorResult(
                tenantId: $tenantId,
                model: $model,
                message: 'No pude completar la consulta con OpenAI en este momento.',
                error: $e->getMessage()
            );
        }
    }

    protected function runForTenant(string $tenantId, Closure $callback): mixed
    {
        $currentTenant = tenancy()->initialized ? tenant() : null;

        if ($currentTenant && (string) $currentTenant->getTenantKey() === (string) $tenantId) {
            return $callback($currentTenant);
        }

        /** @var Tenant|null $tenant */
        $tenant = Tenant::query()->find($tenantId);

        if (! $tenant || ! $tenant->isActive()) {
            throw new RuntimeException('El tenant solicitado no existe o no está activo.');
        }

        try {
            if ($currentTenant) {
                tenancy()->end();
            }

            tenancy()->initialize($tenant);

            return $callback($tenant);
        } finally {
            if (tenancy()->initialized) {
                tenancy()->end();
            }

            if ($currentTenant) {
                tenancy()->initialize($currentTenant);
            }
        }
    }

    protected function collectTenantDynamicContext(Tenant $tenant, string $pregunta): array
    {
        $company = Company::query()->first();
        $today = now();
        $monthStart = now()->startOfMonth();
        $monthEnd = now()->endOfMonth();
        $lastThirtyDays = now()->subDays(30);

        $salesToday = $this->whereSaleDateBetween($this->salesQuery(), $today->copy()->startOfDay(), $today->copy()->endOfDay());
        $salesMonth = $this->whereSaleDateBetween($this->salesQuery(), $monthStart, $monthEnd);
        $sales30d = $this->whereSaleDateSince($this->salesQuery(), $lastThirtyDays);

        return [
            'tenant' => [
                'id' => $tenant->getTenantKey(),
                'name' => $tenant->name,
                'status' => $tenant->status,
                'company' => [
                    'id' => $company?->id,
                    'name' => $company?->name,
                    'fantasy_name' => $company?->fantasy_name,
                    'currency' => $company?->currency ?? 'ARS',
                    'timezone' => $company?->timezone ?? config('app.timezone'),
                ],
            ],
            'fecha_actual' => now()->toIso8601String(),
            'pregunta_original' => $pregunta,
            'data' => [
                'ventas' => [
                    'hoy' => [
                        'operaciones' => $salesToday->count(),
                        'total_vendido' => round((float) $this->whereSaleDateBetween($this->salesQuery(), $today->copy()->startOfDay(), $today->copy()->endOfDay())->sum('total'), 2),
                    ],
                    'mes_actual' => [
                        'operaciones' => $salesMonth->count(),
                        'total_vendido' => round((float) $this->whereSaleDateBetween($this->salesQuery(), $monthStart, $monthEnd)->sum('total'), 2),
                    ],
                    'ultimos_30_dias' => [
                        'operaciones' => $sales30d->count(),
                        'total_vendido' => round((float) $this->whereSaleDateSince($this->salesQuery(), $lastThirtyDays)->sum('total'), 2),
                    ],
                ],
                'productos' => [
                    'total_activos' => Product::query()->where(fn (Builder $query) => $query->whereNull('is_active')->orWhere('is_active', true))->count(),
                    'mas_vendidos_30_dias' => $this->obtenerProductosMasVendidos($lastThirtyDays->toDateString(), now()->toDateString(), 5),
                ],
                'stock' => [
                    'productos_con_stock_bajo' => $this->getLowStockSnapshot(8),
                    'registros_sin_stock' => Stock::query()->where('quantity', '<=', 0)->count(),
                ],
            ],
        ];
    }

    protected function sendResponseRequest(string $apiKey, array $payload): array
    {
        $response = Http::acceptJson()
            ->withToken($apiKey)
            ->timeout(static::REQUEST_TIMEOUT_SECONDS)
            ->retry(2, 400, throw: false)
            ->post(static::RESPONSES_ENDPOINT, $payload);

        if (! $response->successful()) {
            $errorBody = $response->json();
            $errorCode = data_get($errorBody, 'error.code');
            $errorType = data_get($errorBody, 'error.type');
            $errorMessage = data_get($errorBody, 'error.message');

            Log::error('OpenAI Responses API error', [
                'status' => $response->status(),
                'error_code' => $errorCode,
                'error_type' => $errorType,
                'body' => Str::limit($response->body(), 4000),
            ]);

            if ($response->status() === 429 && $errorCode === 'insufficient_quota') {
                throw new RuntimeException('La API key de OpenAI no tiene cuota disponible. Revisá billing y límites de uso.');
            }

            if ($response->status() === 401) {
                throw new RuntimeException('La API key de OpenAI es inválida o no está autorizada.');
            }

            throw new RuntimeException($errorMessage ?: 'OpenAI devolvió un error HTTP '.$response->status().'.');
        }

        return $response->json();
    }

    protected function extractFunctionCalls(array $response): array
    {
        return array_values(array_filter(
            data_get($response, 'output', []),
            fn ($item) => is_array($item) && ($item['type'] ?? null) === 'function_call'
        ));
    }

    protected function executeToolCall(string $name, array $arguments): mixed
    {
        return match ($name) {
            'obtenerProductosMasVendidos' => $this->obtenerProductosMasVendidos(
                (string) ($arguments['desde'] ?? ''),
                (string) ($arguments['hasta'] ?? ''),
            ),
            'obtenerTotalVendido' => $this->obtenerTotalVendido(
                (string) ($arguments['desde'] ?? ''),
                (string) ($arguments['hasta'] ?? ''),
            ),
            'obtenerStockActual' => $this->obtenerStockActual((int) ($arguments['productoId'] ?? 0)),
            'obtenerResumenGeneral' => $this->obtenerResumenGeneral((string) ($arguments['periodo'] ?? '30d')),
            default => ['error' => 'Función no soportada: '.$name],
        };
    }

    protected function obtenerProductosMasVendidos(string $desde, string $hasta, int $limit = 10): array
    {
        [$start, $end] = $this->resolveDateRange($desde, $hasta);

        return SaleItem::query()
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->where(function (Builder $query): void {
                $query->whereNull('sales.status')
                    ->orWhere('sales.status', '!=', 'cancelled');
            })
            ->where(function (Builder $query) use ($start, $end): void {
                $query->whereBetween('sales.sold_at', [$start, $end])
                    ->orWhere(function (Builder $fallback) use ($start, $end): void {
                        $fallback->whereNull('sales.sold_at')
                            ->whereBetween('sales.created_at', [$start, $end]);
                    });
            })
            ->selectRaw('sale_items.product_id, sale_items.product_name, SUM(sale_items.quantity) as total_qty, SUM(sale_items.total) as total_amount')
            ->groupBy('sale_items.product_id', 'sale_items.product_name')
            ->orderByDesc('total_qty')
            ->limit($limit)
            ->get()
            ->map(fn ($item) => [
                'producto_id' => $item->product_id,
                'producto' => $item->product_name,
                'cantidad_vendida' => round((float) $item->total_qty, 2),
                'total_facturado' => round((float) $item->total_amount, 2),
            ])
            ->all();
    }

    protected function obtenerTotalVendido(string $desde, string $hasta): float
    {
        [$start, $end] = $this->resolveDateRange($desde, $hasta);

        return round((float) $this->whereSaleDateBetween($this->salesQuery(), $start, $end)->sum('total'), 2);
    }

    protected function obtenerStockActual(int $productoId): array
    {
        $product = Product::query()->find($productoId);

        if (! $product) {
            return [
                'producto_id' => $productoId,
                'error' => 'Producto no encontrado.',
            ];
        }

        $stocks = Stock::query()
            ->with(['warehouse', 'product_variant.variant_attribute_values.product_attribute_value'])
            ->where('product_id', $productoId)
            ->orderByDesc('quantity')
            ->get();

        return [
            'producto_id' => $product->id,
            'producto' => $product->name,
            'stock_total' => round((float) $stocks->sum('quantity'), 2),
            'detalle' => $stocks->map(fn (Stock $stock) => [
                'deposito' => $stock->warehouse?->name,
                'variante' => trim($this->buildVariantLabel($stock)) ?: null,
                'cantidad' => round((float) $stock->quantity, 2),
                'stock_minimo' => $stock->min_quantity !== null ? round((float) $stock->min_quantity, 2) : null,
            ])->all(),
        ];
    }

    protected function obtenerResumenGeneral(string $periodo): array
    {
        [$currentStart, $currentEnd, $previousStart, $previousEnd, $label] = $this->resolvePeriodWindow($periodo);

        $currentSales = $this->whereSaleDateBetween($this->salesQuery(), $currentStart, $currentEnd);
        $previousSales = $this->whereSaleDateBetween($this->salesQuery(), $previousStart, $previousEnd);

        $currentTotal = (float) $this->whereSaleDateBetween($this->salesQuery(), $currentStart, $currentEnd)->sum('total');
        $previousTotal = (float) $this->whereSaleDateBetween($this->salesQuery(), $previousStart, $previousEnd)->sum('total');

        return [
            'periodo' => $label,
            'desde' => $currentStart->toDateString(),
            'hasta' => $currentEnd->toDateString(),
            'totales' => [
                'ventas' => round($currentTotal, 2),
                'operaciones' => $currentSales->count(),
            ],
            'comparacion_periodo_anterior' => [
                'ventas' => round($previousTotal, 2),
                'operaciones' => $previousSales->count(),
                'variacion_porcentual_ventas' => $previousTotal > 0
                    ? round((($currentTotal - $previousTotal) / $previousTotal) * 100, 2)
                    : null,
            ],
            'top_5_productos' => $this->obtenerProductosMasVendidos(
                $currentStart->toDateString(),
                $currentEnd->toDateString(),
                5
            ),
        ];
    }

    protected function getLowStockSnapshot(int $limit = 8): array
    {
        return Stock::query()
            ->with(['product', 'warehouse', 'product_variant.variant_attribute_values.product_attribute_value'])
            ->where(function (Builder $query): void {
                $query->whereColumn('quantity', '<=', 'min_quantity')
                    ->orWhere(function (Builder $fallback): void {
                        $fallback->whereNull('min_quantity')
                            ->where('quantity', '<=', 5);
                    });
            })
            ->orderBy('quantity')
            ->limit($limit)
            ->get()
            ->map(fn (Stock $stock) => [
                'producto_id' => $stock->product_id,
                'producto' => $stock->product?->name,
                'variante' => trim($this->buildVariantLabel($stock)) ?: null,
                'deposito' => $stock->warehouse?->name,
                'stock_actual' => round((float) $stock->quantity, 2),
                'stock_minimo' => $stock->min_quantity !== null ? round((float) $stock->min_quantity, 2) : null,
            ])
            ->all();
    }

    protected function resolveDateRange(string $desde, string $hasta): array
    {
        $start = $this->parseDate($desde, now()->startOfMonth())->startOfDay();
        $end = $this->parseDate($hasta, now())->endOfDay();

        if ($end->lt($start)) {
            [$start, $end] = [$end->copy()->startOfDay(), $start->copy()->endOfDay()];
        }

        return [$start, $end];
    }

    protected function resolvePeriodWindow(string $periodo): array
    {
        return match ($periodo) {
            'hoy' => [
                now()->startOfDay(),
                now()->endOfDay(),
                now()->subDay()->startOfDay(),
                now()->subDay()->endOfDay(),
                'hoy',
            ],
            '7d' => [
                now()->subDays(6)->startOfDay(),
                now()->endOfDay(),
                now()->subDays(13)->startOfDay(),
                now()->subDays(7)->endOfDay(),
                'ultimos_7_dias',
            ],
            'mes_actual' => [
                now()->startOfMonth(),
                now()->endOfMonth(),
                now()->subMonthNoOverflow()->startOfMonth(),
                now()->subMonthNoOverflow()->endOfMonth(),
                'mes_actual',
            ],
            'anio_actual' => [
                now()->startOfYear(),
                now()->endOfYear(),
                now()->subYear()->startOfYear(),
                now()->subYear()->endOfYear(),
                'anio_actual',
            ],
            default => [
                now()->subDays(29)->startOfDay(),
                now()->endOfDay(),
                now()->subDays(59)->startOfDay(),
                now()->subDays(30)->endOfDay(),
                'ultimos_30_dias',
            ],
        };
    }

    protected function parseDate(string $date, Carbon $fallback): Carbon
    {
        try {
            return Carbon::parse($date);
        } catch (Throwable) {
            return $fallback->copy();
        }
    }

    protected function buildStaticInstructions(): string
    {
        return <<<PROMPT
El asistente es un analista comercial experto que responde consultas sobre ventas, productos, facturación, stock y estadísticas para un ERP/POS multi-tenant.

REGLAS GENERALES:
1. Responder solo en JSON válido según el schema provisto.
2. Incluir siempre:
   - "respuesta": explicación directa y concisa.
   - "datos_utilizados": lista de datos del tenant efectivamente usados.
   - "acciones_sugeridas": sugerencias comerciales opcionales.
3. Si falta información, indicar exactamente qué falta.
4. No inventar datos.
5. No completar campos faltantes.
6. No hacer suposiciones.
7. Si la pregunta es ambigua, pedir precisión dentro del campo "respuesta".

CONTEXTO DEL ERP/POS:
- El sistema administra ventas, productos, facturación, stock, clientes y estadísticas.
- Cada consulta pertenece a un tenant distinto.
- Primero debes usar los datos dinámicos inyectados por backend.
- Si necesitas más precisión o un cálculo puntual, usa las funciones disponibles.
- El usuario final solo hace la pregunta; no conoce la estructura interna del sistema.

FORMATO JSON OBLIGATORIO:
{
  "respuesta": "",
  "datos_utilizados": [],
  "acciones_sugeridas": []
}
PROMPT;
    }

    protected function buildToolDefinitions(): array
    {
        return [
            [
                'type' => 'function',
                'name' => 'obtenerProductosMasVendidos',
                'description' => 'Retorna una lista de productos ordenados por ventas dentro de un rango de fechas.',
                'strict' => true,
                'parameters' => [
                    'type' => 'object',
                    'additionalProperties' => false,
                    'properties' => [
                        'desde' => ['type' => 'string', 'description' => 'Fecha inicial en formato YYYY-MM-DD.'],
                        'hasta' => ['type' => 'string', 'description' => 'Fecha final en formato YYYY-MM-DD.'],
                    ],
                    'required' => ['desde', 'hasta'],
                ],
            ],
            [
                'type' => 'function',
                'name' => 'obtenerTotalVendido',
                'description' => 'Retorna el monto total vendido como número en un rango de fechas.',
                'strict' => true,
                'parameters' => [
                    'type' => 'object',
                    'additionalProperties' => false,
                    'properties' => [
                        'desde' => ['type' => 'string', 'description' => 'Fecha inicial en formato YYYY-MM-DD.'],
                        'hasta' => ['type' => 'string', 'description' => 'Fecha final en formato YYYY-MM-DD.'],
                    ],
                    'required' => ['desde', 'hasta'],
                ],
            ],
            [
                'type' => 'function',
                'name' => 'obtenerStockActual',
                'description' => 'Retorna el stock disponible de un producto puntual.',
                'strict' => true,
                'parameters' => [
                    'type' => 'object',
                    'additionalProperties' => false,
                    'properties' => [
                        'productoId' => ['type' => 'integer', 'description' => 'ID interno del producto.'],
                    ],
                    'required' => ['productoId'],
                ],
            ],
            [
                'type' => 'function',
                'name' => 'obtenerResumenGeneral',
                'description' => 'Retorna totales, top 5 productos y comparaciones para un periodo.',
                'strict' => true,
                'parameters' => [
                    'type' => 'object',
                    'additionalProperties' => false,
                    'properties' => [
                        'periodo' => [
                            'type' => 'string',
                            'enum' => ['hoy', '7d', '30d', 'mes_actual', 'anio_actual'],
                            'description' => 'Periodo a resumir.',
                        ],
                    ],
                    'required' => ['periodo'],
                ],
            ],
        ];
    }

    protected function buildResponseSchema(): array
    {
        return [
            'type' => 'object',
            'additionalProperties' => false,
            'properties' => [
                'respuesta' => ['type' => 'string'],
                'datos_utilizados' => [
                    'type' => 'array',
                    'items' => ['type' => 'string'],
                ],
                'acciones_sugeridas' => [
                    'type' => 'array',
                    'items' => ['type' => 'string'],
                ],
            ],
            'required' => ['respuesta', 'datos_utilizados', 'acciones_sugeridas'],
        ];
    }

    protected function buildDynamicInput(string $tenantId, string $pregunta, array $dynamicData): string
    {
        return implode("\n", [
            'CONTENIDO DINAMICO DEL TENANT (NO CACHEABLE):',
            $this->encodeJson([
                'tenantId' => $tenantId,
                'data' => $dynamicData['data'] ?? [],
                'tenant' => $dynamicData['tenant'] ?? [],
                'fecha_actual' => $dynamicData['fecha_actual'] ?? now()->toIso8601String(),
                'pregunta' => $pregunta,
            ]),
            'Recorda: responde solo con el JSON del schema definido.',
        ]);
    }

    protected function extractResponseText(array $response): string
    {
        $topLevelText = data_get($response, 'output_text');

        if (is_string($topLevelText) && trim($topLevelText) !== '') {
            return trim($topLevelText);
        }

        $texts = [];

        foreach (data_get($response, 'output', []) as $item) {
            foreach (($item['content'] ?? []) as $content) {
                if (($content['type'] ?? null) === 'output_text' && is_string($content['text'] ?? null)) {
                    $texts[] = $content['text'];
                }
            }
        }

        $combined = trim(implode("\n", $texts));

        if ($combined === '') {
            throw new RuntimeException('OpenAI no devolvió texto utilizable.');
        }

        return $combined;
    }

    protected function normalizeAssistantPayload(array $payload): array
    {
        return [
            'respuesta' => trim((string) ($payload['respuesta'] ?? 'No pude generar una respuesta válida.')),
            'datos_utilizados' => array_values(array_map('strval', $payload['datos_utilizados'] ?? [])),
            'acciones_sugeridas' => array_values(array_map('strval', $payload['acciones_sugeridas'] ?? [])),
        ];
    }

    protected function emptyUsage(): array
    {
        return [
            'input_tokens' => 0,
            'output_tokens' => 0,
            'cached_input_tokens' => 0,
            'total_tokens' => 0,
        ];
    }

    protected function sumUsage(array $base, array $usage): array
    {
        $base['input_tokens'] += (int) ($usage['input_tokens'] ?? 0);
        $base['output_tokens'] += (int) ($usage['output_tokens'] ?? 0);
        $base['cached_input_tokens'] += (int) data_get($usage, 'input_tokens_details.cached_tokens', 0);
        $base['total_tokens'] += (int) ($usage['total_tokens'] ?? 0);

        return $base;
    }

    protected function resolvePromptCacheKey(): string
    {
        $base = (string) config('services.chatbot.openai_prompt_cache_key', static::DEFAULT_PROMPT_CACHE_KEY);
        $model = (string) config('services.chatbot.openai_model', static::OPENAI_MODEL);

        return $base.':'.$model;
    }

    protected function encodeJson(mixed $payload): string
    {
        $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if ($json === false) {
            throw new RuntimeException('No se pudo serializar el payload JSON.');
        }

        return $json;
    }

    protected function decodeJson(string $payload): array
    {
        $decoded = json_decode($payload, true);

        if (! is_array($decoded)) {
            throw new RuntimeException('No se pudo interpretar el JSON recibido desde OpenAI.');
        }

        return $decoded;
    }

    protected function buildErrorResult(string $tenantId, string $model, string $message, ?string $error = null): array
    {
        return [
            'ok' => false,
            'tenant_id' => $tenantId,
            'model' => $model,
            'respuesta' => $message,
            'datos_utilizados' => [],
            'acciones_sugeridas' => [],
            'usage' => $this->emptyUsage(),
            'request_id' => null,
            'error' => $error,
        ];
    }
}
