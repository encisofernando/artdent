<?php

namespace App\Services;

use App\Models\CashSession;
use App\Models\Company;
use App\Models\Dentist;
use App\Models\Job;
use App\Models\Patient;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Stock;
use App\Models\User;
use App\Models\Customer;
use App\Models\Purchase;
use App\Models\Expense;
use App\Models\EcommerceOrder;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class ChatbotService
{
    protected const MAX_HISTORY_MESSAGES = 12;
    protected const MAX_MESSAGE_LENGTH = 2000;
    protected const REQUEST_TIMEOUT_SECONDS = 20;
    protected const OPENAI_MODEL = 'gpt-5.4-nano';
    protected const GEMINI_MODEL = 'gemini-1.5-flash';
    protected const DEFAULT_PROVIDER = 'gemini';
    protected ?OpenAITenantAnalyticsService $openAITenantAnalyticsService = null;

    public function __construct(OpenAITenantAnalyticsService $openAITenantAnalyticsService)
    {
        $this->openAITenantAnalyticsService = $openAITenantAnalyticsService;
    }

    public function generateResponse(array $messages, string $userMessage = ''): string
    {
        $settings = $this->resolveChatbotSettings();

        if (! $settings['enabled']) {
            return 'El chatbot está deshabilitado para esta empresa.';
        }

        if (blank($settings['api_key'])) {
            return 'No puedo responder todavía porque falta configurar la API Key del chatbot.';
        }

        $normalizedMessages = $this->normalizeMessages($messages);
        $latestUserMessage = $userMessage !== ''
            ? $this->sanitizeContent($userMessage)
            : $this->extractLatestUserMessage($normalizedMessages);

        if ($latestUserMessage === '') {
            return 'Necesito que me escribas una consulta para poder ayudarte.';
        }

        if ($this->extractLatestUserMessage($normalizedMessages) === '') {
            $normalizedMessages[] = [
                'role' => 'user',
                'content' => $latestUserMessage,
            ];
        }

        $systemPrompt = $this->getSystemPrompt($latestUserMessage);

        return match ($settings['provider']) {
            'openai' => $this->generateOpenAIResponse($normalizedMessages, $systemPrompt, $settings),
            'gemini' => $this->generateGeminiResponse($normalizedMessages, $systemPrompt, $settings),
            default => $this->generateFallbackProviderResponse($normalizedMessages, $systemPrompt, $settings),
        };
    }

    public function isEnabled(): bool
    {
        return $this->resolveChatbotSettings()['enabled'];
    }

    public function getFrontendConfig(): array
    {
        $settings = $this->resolveChatbotSettings();

        return [
            'enabled' => $settings['enabled'],
            'provider' => $settings['provider'],
            'model' => $settings['model'],
            'welcome_message' => $this->getWelcomeMessage(),
        ];
    }

    public function getWelcomeMessage(): string
    {
        return '¡Hola! Soy **Artie**, tu asistente inteligente de **Artdent CRM**. 👋 Estoy aquí para ayudarte con ventas, laboratorio, stock y navegación del sistema. ¿En qué te doy una mano?';
    }

    protected function resolveChatbotSettings(): array
    {
        $company = $this->resolveCompany();
        $provider = Str::lower((string) ($company?->chatbot_provider ?: config('services.chatbot.provider', static::DEFAULT_PROVIDER)));

        if (! in_array($provider, ['openai', 'gemini'], true)) {
            $provider = static::DEFAULT_PROVIDER;
        }

        $model = trim((string) ($company?->chatbot_model ?? ''));

        if ($model === '') {
            $model = (string) config(
                "services.chatbot.{$provider}_model",
                $provider === 'openai' ? static::OPENAI_MODEL : static::GEMINI_MODEL
            );
        }

        return [
            'enabled' => $company?->chatbot_enabled ?? true,
            'provider' => $provider,
            'model' => $model,
            'api_key' => $this->resolveApiKey($provider),
        ];
    }

    protected function resolveCompany(): ?Company
    {
        $user = Auth::user();

        if (! $user instanceof User) {
            return null;
        }

        return $user->relationLoaded('company')
            ? $user->company
            : $user->company()->first();
    }

    protected function resolveApiKey(string $provider): ?string
    {
        $company = $this->resolveCompany();

        return match ($provider) {
            'openai' => $company?->chatbot_openai_key ?: config('services.chatbot.openai_key') ?: config('services.chatbot.api_key'),
            'gemini' => $company?->chatbot_gemini_key ?: config('services.chatbot.gemini_key') ?: config('services.chatbot.api_key'),
            default => config('services.chatbot.api_key'),
        };
    }

    protected function generateFallbackProviderResponse(array $messages, string $systemPrompt, array $settings): string
    {
        Log::warning('Proveedor de chatbot no soportado, usando Gemini por defecto.', [
            'provider' => $settings['provider'],
        ]);

        $fallbackSettings = $settings;
        $fallbackSettings['provider'] = 'gemini';
        $fallbackSettings['model'] = (string) config('services.chatbot.gemini_model', static::GEMINI_MODEL);
        $fallbackSettings['api_key'] = $this->resolveApiKey('gemini');

        return $this->generateGeminiResponse($messages, $systemPrompt, $fallbackSettings);
    }

    protected function generateGeminiResponse(array $messages, string $systemPrompt, array $settings): string
    {
        $url = sprintf(
            'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s',
            $settings['model'],
            $settings['api_key']
        );

        $formattedMessages = $this->formatGeminiMessages($messages);
        
        if (class_exists(\App\Services\DbSchema::class)) {
            $systemPrompt .= "\n\nESQUEMA DE BASE DE DATOS (Tenant):\n" . \App\Services\DbSchema::SCHEMA;
        }

        $tools = [
            [
                'functionDeclarations' => [
                    [
                        'name' => 'ejecutar_consulta_sql',
                        'description' => 'Ejecuta query SQL SELECT real en la DB del CRM para averiguar clientes, ventas, compras, etc. Devuelve un array JSON de resultados. No puedes hacer INSERT/UPDATE/DELETE. Usa LIKE y comodines % cuando busques nombres.',
                        'parameters' => [
                            'type' => 'OBJECT',
                            'properties' => [
                                'query' => [
                                    'type' => 'STRING',
                                    'description' => 'Consulta SQL a ejecutar. Ej: SELECT * FROM patients WHERE name LIKE "%carlos%" LIMIT 5'
                                ]
                            ],
                            'required' => ['query']
                        ]
                    ]
                ]
            ]
        ];

        $round = 0;
        $maxRounds = 4;

        while ($round < $maxRounds) {
            try {
                $response = Http::acceptJson()
                    ->timeout(static::REQUEST_TIMEOUT_SECONDS)
                    ->retry(2, 400, throw: false)
                    ->post($url, [
                        'system_instruction' => [
                            'parts' => [['text' => $systemPrompt]],
                        ],
                        'contents' => $formattedMessages,
                        'tools' => $tools,
                        'generationConfig' => [
                            'temperature' => 0.3,
                            'maxOutputTokens' => 1024,
                        ],
                    ]);

                if (! $response->successful()) {
                    $this->logProviderFailure('Gemini', $settings, $response->status(), $response->body());
                    return 'No pude conectarme con Gemini en este momento. Probá nuevamente en unos segundos.';
                }

                $responseData = $response->json();
                $firstPart = data_get($responseData, 'candidates.0.content.parts.0');

                // Si fue una llamada a herramienta
                if (isset($firstPart['functionCall'])) {
                    $functionName = $firstPart['functionCall']['name'];
                    $functionArgs = $firstPart['functionCall']['args'] ?? [];
                    
                    $formattedMessages[] = [
                        'role' => 'model',
                        'parts' => [$firstPart]
                    ];

                    $functionResult = [];
                    if ($functionName === 'ejecutar_consulta_sql') {
                        $query = $functionArgs['query'] ?? '';
                        if (preg_match('/^\s*(insert|update|delete|drop|alter|truncate|create|replace|grant|revoke)\s/i', $query)) {
                            $functionResult = ['error' => 'Only SELECT queries are allowed.'];
                        } else {
                            try {
                                $results = \Illuminate\Support\Facades\DB::select($query);
                                $functionResult = ['result' => array_slice($results, 0, 50)];
                            } catch (\Throwable $e) {
                                $functionResult = ['error' => $e->getMessage()];
                            }
                        }
                    } else {
                        $functionResult = ['error' => 'Unknown function call'];
                    }

                    $formattedMessages[] = [
                        'role' => 'function',
                        'parts' => [
                            [
                                'functionResponse' => [
                                    'name' => $functionName,
                                    'response' => $functionResult
                                ]
                            ]
                        ]
                    ];
                    
                    $round++;
                    continue;
                }

                $content = data_get($responseData, 'candidates.0.content.parts.0.text');

                if (! is_string($content) || blank($content)) {
                    Log::warning('Gemini devolvió una respuesta vacía.', [
                        'provider' => $settings['provider'],
                        'model' => $settings['model'],
                        'payload' => $responseData,
                    ]);

                    return 'Recibí una respuesta vacía del proveedor. Probá reformular la consulta.';
                }

                return trim($content);
            } catch (Throwable $e) {
                Log::error('Excepción al consultar Gemini.', [
                    'provider' => $settings['provider'],
                    'model' => $settings['model'],
                    'message' => $e->getMessage(),
                ]);

                return 'Ocurrió un error inesperado al consultar Gemini.';
            }
        }
        
        return 'Alcancé mi límite máximo de búsquedas internas. Por favor, intenta ser más específico con tu requerida información.';
    }

    protected function generateOpenAIResponse(array $messages, string $systemPrompt, array $settings): string
    {
        $tenantId = $this->resolveCurrentTenantId();

        if ($tenantId !== null && $this->openAITenantAnalyticsService instanceof OpenAITenantAnalyticsService) {
            try {
                return $this->formatStructuredOpenAIResponse(
                    $this->openAITenantAnalyticsService->consultarIA(
                        $tenantId,
                        $this->extractLatestUserMessage($messages)
                    )
                );
            } catch (Throwable $e) {
                Log::warning('Fallo la capa estructurada de OpenAI; se usa fallback legacy.', [
                    'tenant_id' => $tenantId,
                    'model' => $settings['model'],
                    'message' => $e->getMessage(),
                ]);
            }
        }

        $formattedMessages = array_merge(
            [['role' => 'system', 'content' => $systemPrompt]],
            $messages
        );

        try {
            $response = Http::acceptJson()
                ->withToken($settings['api_key'])
                ->timeout(static::REQUEST_TIMEOUT_SECONDS)
                ->retry(2, 400, throw: false)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => $settings['model'],
                    'messages' => $formattedMessages,
                    'temperature' => 0.3,
                    'max_tokens' => 1024,
                ]);

            if (! $response->successful()) {
                $this->logProviderFailure('OpenAI', $settings, $response->status(), $response->body());

                return 'No pude conectarme con OpenAI en este momento. Probá nuevamente en unos segundos.';
            }

            $content = data_get($response->json(), 'choices.0.message.content');

            if (! is_string($content) || blank($content)) {
                Log::warning('OpenAI devolvió una respuesta vacía.', [
                    'provider' => $settings['provider'],
                    'model' => $settings['model'],
                    'payload' => $response->json(),
                ]);

                return 'Recibí una respuesta vacía del proveedor. Probá reformular la consulta.';
            }

            return trim($content);
        } catch (Throwable $e) {
            Log::error('Excepción al consultar OpenAI.', [
                'provider' => $settings['provider'],
                'model' => $settings['model'],
                'message' => $e->getMessage(),
            ]);

            return 'Ocurrió un error inesperado al consultar OpenAI.';
        }
    }

    protected function resolveCurrentTenantId(): ?string
    {
        if (! function_exists('tenant') || ! tenancy()->initialized) {
            return null;
        }

        $tenant = tenant();

        if (! $tenant) {
            return null;
        }

        return (string) $tenant->getTenantKey();
    }

    protected function formatStructuredOpenAIResponse(array $response): string
    {
        $answer = trim((string) ($response['respuesta'] ?? ''));

        if ($answer === '') {
            return 'No pude generar una respuesta válida desde OpenAI.';
        }

        $parts = [$answer];
        $usedData = $this->normalizeListForDisplay($response['datos_utilizados'] ?? []);
        $suggestedActions = $this->normalizeListForDisplay($response['acciones_sugeridas'] ?? []);

        if ($usedData !== []) {
            $parts[] = '**Datos utilizados:** '.implode(', ', $usedData).'.';
        }

        if ($suggestedActions !== []) {
            $parts[] = "**Acciones sugeridas:**\n- ".implode("\n- ", $suggestedActions);
        }

        return implode("\n\n", $parts);
    }

    protected function normalizeListForDisplay(array $values): array
    {
        return array_values(array_filter(array_map(function ($value): string {
            if (is_scalar($value)) {
                return trim((string) $value);
            }

            $json = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

            return $json === false ? '' : trim($json);
        }, $values)));
    }

    protected function getSystemPrompt(string $userMessage = ''): string
    {
        $stats = $this->getQuickStats();
        $contextBlocks = $this->buildContextBlocks($userMessage);
        $contextText = empty($contextBlocks)
            ? ''
            : "\n\nCONTEXTO EN TIEMPO REAL:\n".implode("\n\n", $contextBlocks);

        return <<<PROMPT
Eres "Artie", el asistente inteligente de Artdent CRM.

PERSONALIDAD:
- Amable, claro, resolutivo y profesional.
- Respondes siempre en español.
- Ayudas con preguntas operativas, reportes rápidos y navegación dentro del CRM.

MÓDULOS QUE CONOCES:
- Gestión clínica: pacientes, historias clínicas y odontogramas.
- Laboratorio: órdenes, rehechos, odontólogos y seguimiento de trabajos.
- Finanzas: ventas, caja, cuentas corrientes y facturación.
- Inventario: stock, productos, variantes, compras y depósitos.
- Ecommerce: pedidos, pagos y cupones.

RESUMEN ACTUAL:
- Pacientes registrados: {$stats['patients']}
- Usuarios activos: {$stats['users']}
- Ventas en los últimos 30 días: {$stats['sales_30d']}
- Jobs activos: {$stats['pending_jobs']}{$contextText}

REGLAS:
1. Eres un asistente OMNISCIENTE. Tienes acceso a buscar nombres de pacientes, odontólogos, saldos de clientes, ventas, últimas compras, deudas y pedidos de ecommerce usando tu herramienta SQL.
2. IMPORTANTE PARA SQL: Cuando uses la herramienta Text-to-SQL, NUNCA reportes IDs crudos al usuario final (ej. `dentist_id: 12` o `patient_id: 3`). Obligatoriamente utiliza sentencias `LEFT JOIN` hacia las tablas relacionadas (ej. `LEFT JOIN dentists ON jobs.dentist_id = dentists.id`) para extraer y mostrar los nombres humanos reales (ej. Carlos, Juan).
3. BÚSQUEDA DE NOMBRES EN SQL: Si el usuario te pide buscar a "Carlos Consiglio", recuerda que en la Base de Datos a menudo se guarda invertido ("CONSIGLIO CARLOS"). Por eso, usa siempre búsquedas fragmentadas: `WHERE name LIKE '%Carlos%' AND name LIKE '%Consiglio%'`. NUNCA uses la frase completa en un solo `LIKE` porque no generará coincidencias.
4. Responde usando solo la información inyectada debajo del resumen y resoluciones SQL.
5. Si falta un dato puntual, dilo con honestidad y sugiere buscarlo en el sidebar.
4. Para orientar navegación usa estas rutas exactas del sidebar:
   - Gestión > Ventas > Lista de Ventas / Nueva Venta / Facturación / Artículos
   - Gestión > Clientes > Lista de Clientes / Cta. Cte. / Pagos
   - Laboratorio > Órdenes > Consultar / Nueva Orden / Rehacimientos
   - Inventario > Compras / Proveedores / Pagos / Stock
   - Laboratorio > Clientes / Odont. > Pacientes / Lista de Odontólogos / Rutas / Cuentas Corrientes y Pagos
   - Análisis > Reportes / Estadísticas / Operaciones
   - Sistema > Administración > Empresa / Usuarios
4. No inventes cifras, estados ni acciones del sistema.
5. Usa Markdown simple: párrafos cortos, listas y negritas cuando ayuden.
PROMPT;
    }

    protected function buildContextBlocks(string $userMessage): array
    {
        $normalizedMessage = $this->normalizeForIntent($userMessage);

        if ($normalizedMessage === '') {
            return [];
        }

        $contextBlocks = [];

        if ($this->containsAny($normalizedMessage, ['deuda', 'deudas', 'saldo', 'saldos', 'cuenta corriente', 'cta cte', 'cta. cte', 'balance', 'debo', 'deben', 'pagar', 'cuanto deben'])) {
            $contextBlocks[] = "CUENTAS:\n".$this->getDebtContext();
        }

        if ($this->shouldIncludeJobsContext($normalizedMessage, $userMessage)) {
            $contextBlocks[] = "LABORATORIO:\n".$this->getPendingJobsContext($userMessage);
        }

        if ($this->containsAny($normalizedMessage, ['stock', 'inventario', 'faltante', 'faltantes', 'existencia', 'existencias'])) {
            $contextBlocks[] = "INVENTARIO:\n".$this->getInventoryContext();
        }

        if ($this->containsAny($normalizedMessage, ['producto', 'productos', 'mas vendido', 'top producto', 'articulo', 'articulos', 'vendido', 'vendidos'])) {
            $contextBlocks[] = "PRODUCTOS:\n".$this->getTopOverallProductContext();
        }

        if ($this->containsAny($normalizedMessage, ['caja', 'finanzas', 'venta', 'ventas', 'facturacion', 'ingreso', 'ingresos', 'ticket', 'tickets', 'cobro', 'cobros', 'ganancia', 'ganancias', 'facturamos'])) {
            $contextBlocks[] = "FINANZAS:\n".$this->getFinanceContext();
        }

        if ($this->containsAny($normalizedMessage, ['cliente', 'clientes', 'mejor cliente', 'ranking', 'consumidor final'])) {
            $contextBlocks[] = "CLIENTES (Ranking):\n".$this->getTopCustomerContext();
        }

        if ($this->containsAny($normalizedMessage, ['proveedor', 'proveedores', 'gasto', 'gastos', 'compra', 'compramos', 'insumo', 'gastado', 'gastamos', 'pago', 'pagos', 'egreso', 'egresos'])) {
            $contextBlocks[] = "COMPRAS Y PROVEEDORES:\n".$this->getPurchasesContext();
        }

        if ($this->containsAny($normalizedMessage, ['ecommerce', 'tienda', 'pedido', 'pedidos', 'online', 'web'])) {
            $contextBlocks[] = "ECOMMERCE:\n".$this->getEcommerceContext();
        }

        // Búsqueda genérica si se solicita información de una persona
        if ($this->containsAny($normalizedMessage, ['paciente', 'pacientes', 'odontologo', 'odontologos', 'doctor', 'doctora', 'dr', 'dra', 'cliente', 'quien', 'informacion', 'historia', 'pago', 'pagos', 'pago de'])) {
            $peopleContext = $this->getPeopleSearchContext($userMessage);
            if ($peopleContext !== '') {
                $contextBlocks[] = "BÚSQUEDA PERSONAS Y SUS PAGOS:\n".$peopleContext;
            }
        }

        return $contextBlocks;
    }

    protected function normalizeMessages(array $messages): array
    {
        $normalizedMessages = [];

        foreach ($messages as $message) {
            if (! is_array($message)) {
                continue;
            }

            $role = $message['role'] ?? null;
            $content = $this->sanitizeContent((string) ($message['content'] ?? ''));

            if (! in_array($role, ['user', 'assistant'], true) || $content === '') {
                continue;
            }

            $normalizedMessages[] = [
                'role' => $role,
                'content' => $content,
            ];
        }

        return array_slice($normalizedMessages, -static::MAX_HISTORY_MESSAGES);
    }

    protected function sanitizeContent(string $content): string
    {
        $content = str_replace(["\r\n", "\r"], "\n", trim($content));
        $content = preg_replace("/\n{3,}/u", "\n\n", $content) ?? $content;

        return Str::limit($content, static::MAX_MESSAGE_LENGTH, '...');
    }

    protected function extractLatestUserMessage(array $messages): string
    {
        for ($index = count($messages) - 1; $index >= 0; $index--) {
            if (($messages[$index]['role'] ?? null) === 'user') {
                return $messages[$index]['content'];
            }
        }

        return '';
    }

    protected function formatGeminiMessages(array $messages): array
    {
        $formattedMessages = [];

        foreach ($messages as $message) {
            if (($message['role'] ?? null) === 'assistant' && empty($formattedMessages)) {
                continue;
            }

            $formattedMessages[] = [
                'role' => $message['role'] === 'assistant' ? 'model' : 'user',
                'parts' => [['text' => $message['content']]],
            ];
        }

        return $formattedMessages;
    }

    protected function shouldIncludeJobsContext(string $normalizedMessage, string $userMessage): bool
    {
        if ($this->containsAny($normalizedMessage, ['trabajo', 'trabajos', 'job', 'jobs', 'laboratorio', 'orden', 'ordenes', 'remake', 'rehecho', 'rehechos', 'entrega'])) {
            return true;
        }

        return preg_match('/\b#?[A-Z0-9-]{3,}\b/i', $userMessage) === 1
            && preg_match('/\d/', $userMessage) === 1;
    }

    protected function getQuickStats(): array
    {
        try {
            $tenantId = $this->resolveCurrentTenantId() ?? '0';
            return \Illuminate\Support\Facades\Cache::remember('chatbot_quick_stats_' . $tenantId, 120, function () {
                return [
                    'patients' => $this->formatInteger(Patient::count()),
                    'sales_30d' => $this->formatInteger(
                        $this->whereSaleDateSince($this->salesQuery(), now()->subDays(30))->count()
                    ),
                    'pending_jobs' => $this->formatInteger(
                        Job::where(function (Builder $query): void {
                            $query->whereNull('status')
                                ->orWhereNotIn('status', ['finished', 'delivered', 'cancelled']);
                        })->count()
                    ),
                    'users' => $this->formatInteger(User::count()),
                ];
            });
        } catch (Throwable $e) {
            Log::warning('No se pudieron cargar las estadísticas rápidas del chatbot.', [
                'message' => $e->getMessage(),
            ]);

            return [
                'patients' => 'N/D',
                'sales_30d' => 'N/D',
                'pending_jobs' => 'N/D',
                'users' => 'N/D',
            ];
        }
    }

    protected function getInventoryContext(): string
    {
        try {
            $tenantId = $this->resolveCurrentTenantId() ?? '0';
            return \Illuminate\Support\Facades\Cache::remember('chatbot_inventory_' . $tenantId, 120, function () {
                $lowStock = Stock::with([
                    'product',
                    'warehouse',
                    'product_variant.variant_attribute_values.product_attribute_value',
                ])
                    ->where('quantity', '>', 0)
                    ->where(function (Builder $query): void {
                        $query->whereColumn('quantity', '<=', 'min_quantity')
                            ->orWhere(function (Builder $fallback): void {
                                $fallback->whereNull('min_quantity')
                                    ->where('quantity', '<=', 5);
                            });
                    })
                    ->orderBy('quantity')
                    ->take(8)
                    ->get();

                if ($lowStock->isEmpty()) {
                    return 'No hay alertas de stock bajo en este momento.';
                }

                $lines = [];

                foreach ($lowStock as $stock) {
                    $name = $stock->product?->name ?? 'Producto desconocido';
                    $warehouse = $stock->warehouse?->name;
                    $variantLabel = $this->buildVariantLabel($stock);
                    $threshold = $stock->min_quantity !== null
                        ? ' / min. '.$this->formatQuantity($stock->min_quantity)
                        : '';

                    $lines[] = sprintf(
                        '* **%s%s**: %s un.%s%s',
                        $name,
                        $variantLabel,
                        $this->formatQuantity($stock->quantity),
                        $warehouse ? ' en '.$warehouse : '',
                        $threshold
                    );
                }

                return implode("\n", $lines);
            });
        } catch (Throwable $e) {
            Log::error('Error al consultar inventario para el chatbot.', [
                'message' => $e->getMessage(),
            ]);

            return 'No pude consultar el inventario en este momento.';
        }
    }

    protected function getFinanceContext(): string
    {
        try {
            $tenantId = $this->resolveCurrentTenantId() ?? '0';
            return \Illuminate\Support\Facades\Cache::remember('chatbot_finance_' . $tenantId, 120, function () {
                $todayStart = now()->startOfDay();
                $todayEnd = now()->endOfDay();
                $monthStart = now()->startOfMonth();
                $monthEnd = now()->endOfMonth();

                $todaySalesQuery = $this->whereSaleDateBetween($this->salesQuery(), $todayStart, $todayEnd);
                $monthSalesQuery = $this->whereSaleDateBetween($this->salesQuery(), $monthStart, $monthEnd);

                $todaySales = $todaySalesQuery->sum('total');
                $todayOperations = $this->whereSaleDateBetween($this->salesQuery(), $todayStart, $todayEnd)->count();
                $monthSales = $monthSalesQuery->sum('total');
                $activeSessions = CashSession::where('status', 'open')->count();

                $lastSale = Sale::with(['customer', 'dentist'])
                    ->where(function (Builder $query): void {
                        $query->whereNull('status')
                            ->orWhere('status', '!=', 'cancelled');
                    })
                    ->latest('id')
                    ->first();

                $lastSaleStr = $lastSale 
                    ? 'Última venta: #'.$lastSale->id.' por '.$this->formatCurrency($lastSale->total).' ('.($lastSale->customer?->name ?? $lastSale->dentist?->name ?? 'Cons. Final').') el '.$this->formatDate($lastSale->created_at).'.' 
                    : 'Sin registros de ventas.';

                return implode("\n", [
                    '* Ventas de hoy: **'.$this->formatCurrency($todaySales).'** en **'.$this->formatInteger($todayOperations).' operaciones**.',
                    '* Ventas del mes: **'.$this->formatCurrency($monthSales).'**.',
                    '* Cajas abiertas: **'.$this->formatInteger($activeSessions).'**.',
                    '* '.$lastSaleStr,
                ]);
            });
        } catch (Throwable $e) {
            Log::error('Error al consultar finanzas para el chatbot.', [
                'message' => $e->getMessage(),
            ]);

            return 'No pude obtener el resumen financiero en este momento.';
        }
    }

    protected function getPendingJobsContext(string $userMessage = ''): string
    {
        try {
            $normalizedMessage = $this->normalizeForIntent($userMessage);
            $searchTerm = $this->resolveSearchTerm($userMessage);
            $wantsActiveJobs = $searchTerm === ''
                || $this->containsAny($normalizedMessage, ['pendiente', 'pendientes', 'en proceso', 'entrega', 'listo', 'listos', 'hoy']);

            $tenantId = $this->resolveCurrentTenantId() ?? '0';
            $cacheKey = 'chatbot_jobs_' . $tenantId . '_' . md5($searchTerm . '_' . ($wantsActiveJobs ? '1' : '0'));

            return \Illuminate\Support\Facades\Cache::remember($cacheKey, 60, function () use ($searchTerm, $wantsActiveJobs) {
                $query = Job::with(['patient', 'dentist', 'job_type']);

                if ($searchTerm !== '') {
                    $query->where(function (Builder $jobQuery) use ($searchTerm): void {
                        $jobQuery->where('job_number', 'like', "%{$searchTerm}%")
                            ->orWhere('description', 'like', "%{$searchTerm}%")
                            ->orWhereHas('patient', function (Builder $patientQuery) use ($searchTerm): void {
                                $patientQuery->where('name', 'like', "%{$searchTerm}%");
                            })
                            ->orWhereHas('dentist', function (Builder $dentistQuery) use ($searchTerm): void {
                                $dentistQuery->where('name', 'like', "%{$searchTerm}%");
                            });
                    });
                }

                if ($wantsActiveJobs) {
                    $query->where(function (Builder $jobStatusQuery): void {
                        $jobStatusQuery->whereNull('status')
                            ->orWhereNotIn('status', ['finished', 'delivered', 'cancelled']);
                    });
                }

                $jobs = $query
                    ->orderByRaw('CASE WHEN due_date IS NULL THEN 1 ELSE 0 END')
                    ->orderBy('due_date')
                    ->latest('id')
                    ->take(5)
                    ->get();

                if ($jobs->isEmpty()) {
                    return 'No encontré trabajos que coincidan con esa búsqueda.';
                }

                $lines = [];

                foreach ($jobs as $job) {
                    $statusMap = [
                        'pending' => 'Pendiente',
                        'in_progress' => 'En proceso',
                        'ready' => 'Listo',
                        'finished' => 'Finalizado',
                        'delivered' => 'Entregado',
                        'cancelled' => 'Cancelado',
                    ];

                    $patient = $job->patient?->name ?? 'Sin paciente';
                    $dentist = $job->dentist?->name ?? 'Sin odontólogo';
                    $service = $job->job_type?->name ?? 'Servicio no especificado';
                    $status = $statusMap[$job->status] ?? Str::headline((string) $job->status);

                    $lines[] = sprintf(
                        '* **Job #%s** (%s): Paciente **%s**, Dr. %s, estado **%s**, entrega **%s**.',
                        $job->job_number,
                        $service,
                        $patient,
                        $dentist,
                        $status,
                        $this->formatDate($job->due_date)
                    );
                }

                return implode("\n", $lines);
            });
        } catch (Throwable $e) {
            Log::error('Error al consultar jobs para el chatbot.', [
                'message' => $e->getMessage(),
            ]);

            return 'No pude buscar trabajos en este momento.';
        }
    }

    protected function getDebtContext(): string
    {
        try {
            $tenantId = $this->resolveCurrentTenantId() ?? '0';
            return \Illuminate\Support\Facades\Cache::remember('chatbot_debt_' . $tenantId, 120, function () {
                $dentistsWithDebt = Dentist::whereHas('lab_account', function (Builder $query): void {
                    $query->where('balance', '>', 0);
                })
                    ->with('lab_account')
                    ->get()
                    ->sortByDesc(fn (Dentist $dentist) => (float) ($dentist->lab_account?->balance ?? 0))
                    ->values();

                $customersWithDebt = Customer::whereHas('customer_account', function (Builder $query): void {
                    $query->where('balance', '>', 0);
                })
                    ->with('customer_account')
                    ->get()
                    ->sortByDesc(fn (Customer $customer) => (float) ($customer->customer_account?->balance ?? 0))
                    ->values();

                if ($dentistsWithDebt->isEmpty() && $customersWithDebt->isEmpty()) {
                    return 'No hay saldos pendientes en cuentas corrientes de odontólogos ni de clientes.';
                }

                $lines = [];
                
                if ($dentistsWithDebt->isNotEmpty()) {
                    $lines[] = "Saldos Lab Odontólogos:";
                    $lines = array_merge($lines, $dentistsWithDebt
                        ->take(3)
                        ->map(fn (Dentist $dentist) => '* **'.$dentist->name.'**: '.$this->formatCurrency($dentist->lab_account?->balance))
                        ->all());
                }

                if ($customersWithDebt->isNotEmpty()) {
                    $lines[] = "Saldos Clientes Generales:";
                    $lines = array_merge($lines, $customersWithDebt
                        ->take(3)
                        ->map(fn (Customer $customer) => '* **'.$customer->name.'**: '.$this->formatCurrency($customer->customer_account?->balance))
                        ->all());
                }

                return implode("\n", $lines);
            });
        } catch (Throwable $e) {
            Log::error('Error al consultar deudas para el chatbot.', [
                'message' => $e->getMessage(),
            ]);

            return 'No pude consultar las cuentas corrientes en este momento.';
        }
    }

    protected function getPurchasesContext(): string
    {
        try {
            $tenantId = $this->resolveCurrentTenantId() ?? '0';
            return \Illuminate\Support\Facades\Cache::remember('chatbot_purchases_' . $tenantId, 120, function () {
                $purchases = Purchase::with('vendor')->latest('id')->take(5)->get();
                $expenses = Expense::with('category')->latest('id')->take(5)->get();

                $lines = ["Últimos Movimientos de Egresos:"];
                
                if ($purchases->isNotEmpty()) {
                    $lines[] = "COMPRAS A PROVEEDORES:";
                    foreach ($purchases as $p) {
                        $lines[] = sprintf('* V/#%d - %s por %s (%s)', $p->id, $p->vendor?->name ?? 'SC', $this->formatCurrency($p->total), $this->formatDate($p->created_at));
                    }
                }

                if ($expenses->isNotEmpty()) {
                    $lines[] = "GASTOS ASENTADOS:";
                    foreach ($expenses as $e) {
                        $lines[] = sprintf('* %s - %s por %s', $e->category?->name ?? 'Gasto', $e->reference, $this->formatCurrency($e->amount));
                    }
                }

                return count($lines) === 1 ? 'No hay registro de egresos recientes.' : implode("\n", $lines);
            });
        } catch (Throwable $e) {
            return 'No pude obtener compras y gastos en este momento.';
        }
    }

    protected function getEcommerceContext(): string
    {
        try {
            $tenantId = $this->resolveCurrentTenantId() ?? '0';
            return \Illuminate\Support\Facades\Cache::remember('chatbot_ecommerce_' . $tenantId, 120, function () {
                $orders = EcommerceOrder::with('customer')
                    ->whereNotIn('status', ['delivered', 'cancelled', 'completed'])
                    ->latest('id')
                    ->take(5)
                    ->get();
                    
                if ($orders->isEmpty()) return 'No hay pedidos de ecommerce pendientes de entrega en este momento.';
                
                $lines = ["PEDIDOS ECOMMERCE (Pendientes):"];
                foreach ($orders as $o) {
                    $lines[] = sprintf('* Pedido #%d: Cliente **%s** (%s) - %s', $o->id, $o->customer?->name ?? 'SC', $o->status, $this->formatCurrency($o->total));
                }
                return implode("\n", $lines);
            });
        } catch (Throwable $e) {
            return 'No pude obtener los pedidos online.';
        }
    }

    protected function getPeopleSearchContext(string $userMessage): string
    {
        try {
            $term = $this->resolveSearchTerm($userMessage);
            if ($term === '' || mb_strlen($term) < 3) return '';

            $tenantId = $this->resolveCurrentTenantId() ?? '0';
            $cacheKey = 'chatbot_people_' . $tenantId . '_' . md5($term);

            return \Illuminate\Support\Facades\Cache::remember($cacheKey, 60, function () use ($term) {
                $lines = [];

                $termWords = array_filter(explode(' ', trim($term)));
                $filterWords = function ($query) use ($termWords) {
                    foreach ($termWords as $w) {
                        $query->where('name', 'like', "%{$w}%");
                    }
                };

                // Buscar Odontologos
                $dentists = Dentist::with(['lab_account.moves' => fn($q) => $q->latest('id')->take(3)])->where($filterWords)->take(2)->get();
                if ($dentists->isNotEmpty()) {
                    $lines[] = "Dentistas hallados:";
                    foreach ($dentists as $d) {
                        $saldo = $d->lab_account ? $this->formatCurrency($d->lab_account->balance) : '$0';
                        $lines[] = "- {$d->name} (Tel: {$d->phone_number}) - Saldo actual: {$saldo}";
                        if ($d->lab_account?->moves?->isNotEmpty()) {
                            foreach ($d->lab_account->moves as $m) {
                                $lines[] = sprintf("  * Movimiento: %s | %s el %s", $m->type, $this->formatCurrency($m->amount), $m->move_date ? $this->formatDate($m->move_date) : 'N/D');
                            }
                        }
                    }
                }

                // Buscar Clientes
                $customers = Customer::with(['customer_account.moves' => fn($q) => $q->latest('id')->take(3)])->where($filterWords)->take(2)->get();
                if ($customers->isNotEmpty()) {
                    $lines[] = "Clientes hallados:";
                    foreach ($customers as $c) {
                        $saldo = $c->customer_account ? $this->formatCurrency($c->customer_account->balance) : '$0';
                        $lines[] = "- {$c->name} (Doc: {$c->document_number}) - Saldo actual: {$saldo}";
                        if ($c->customer_account?->moves?->isNotEmpty()) {
                            foreach ($c->customer_account->moves as $m) {
                                $lines[] = sprintf("  * Movimiento: %s | %s el %s", $m->type, $this->formatCurrency($m->amount), $m->move_date ? $this->formatDate($m->move_date) : 'N/D');
                            }
                        }
                    }
                }

                // Buscar Pacientes (si no se encontraron dentistas o clientes)
                if (empty($lines)) {
                    $patients = Patient::where($filterWords)->take(2)->get();
                    if ($patients->isNotEmpty()) {
                        $lines[] = "Pacientes hallados:";
                        foreach ($patients as $p) {
                            $lines[] = "- {$p->name} (Tel: {$p->phone_number}) - Historial disponible en sistema.";
                        }
                    }
                }

                return empty($lines) ? "No existen registros personales bajo el nombre '{$term}'." : implode("\n", $lines);
            });
        } catch (Throwable $e) {
            return 'No pude ejecutar la búsqueda de personas ahora.';
        }
    }

    protected function getTopCustomerContext(): string
    {
        try {
            $startOfMonth = now()->startOfMonth();
            $dateLimit = $this->whereSaleDateSince($this->salesQuery(), $startOfMonth)->exists()
                ? $startOfMonth
                : now()->subYear();
            $periodLabel = $dateLimit->equalTo($startOfMonth) ? 'este mes' : 'en el último año';

            $salesSince = $this->whereSaleDateSince($this->salesQuery(), $dateLimit);

            $topCustomer = $this->whereSaleDateSince($this->salesQuery(), $dateLimit)
                ->whereNotNull('customer_id')
                ->selectRaw('customer_id, SUM(total) as total_spent, COUNT(*) as orders_count')
                ->groupBy('customer_id')
                ->orderByDesc('total_spent')
                ->with('customer')
                ->first();

            $finalConsumerSales = (clone $salesSince)
                ->whereNull('customer_id')
                ->whereNull('dentist_id')
                ->count();

            $finalConsumerTotal = $this->whereSaleDateSince($this->salesQuery(), $dateLimit)
                ->whereNull('customer_id')
                ->whereNull('dentist_id')
                ->sum('total');

            if (! $topCustomer || ! $topCustomer->customer) {
                $topDentist = $this->whereSaleDateSince($this->salesQuery(), $dateLimit)
                    ->whereNotNull('dentist_id')
                    ->selectRaw('dentist_id, SUM(total) as total_spent, COUNT(*) as orders_count')
                    ->groupBy('dentist_id')
                    ->orderByDesc('total_spent')
                    ->with('dentist')
                    ->first();

                if (! $topDentist || ! $topDentist->dentist) {
                    return 'No hay ventas suficientes para armar un ranking de clientes.';
                }

                $name = $topDentist->dentist->name;
                $spent = (float) $topDentist->total_spent;
                $orders = (int) $topDentist->orders_count;
                $idField = 'dentist_id';
                $idValue = $topDentist->dentist_id;
            } else {
                $name = $topCustomer->customer->name;
                $spent = (float) $topCustomer->total_spent;
                $orders = (int) $topCustomer->orders_count;
                $idField = 'customer_id';
                $idValue = $topCustomer->customer_id;
            }

            $items = SaleItem::whereHas('sale', function (Builder $query) use ($idField, $idValue, $dateLimit): void {
                $query->where($idField, $idValue);
                $this->whereSaleDateSince($query, $dateLimit);
            })
                ->selectRaw('product_name, SUM(quantity) as total_qty')
                ->groupBy('product_name')
                ->orderByDesc('total_qty')
                ->take(3)
                ->get();

            $products = $items
                ->map(fn (SaleItem $item) => $item->product_name.' ('.$this->formatQuantity($item->total_qty).' un.)')
                ->implode(', ');

            $lines = [
                '* Mejor cliente '.$periodLabel.': **'.$name.'**.',
                '* Facturación acumulada: **'.$this->formatCurrency($spent).'** en **'.$this->formatInteger($orders).' ventas**.',
            ];

            if ($products !== '') {
                $lines[] = '* Productos más comprados: '.$products.'.';
            }

            $lines[] = '* Consumidor Final: **'.$this->formatInteger($finalConsumerSales).' ventas** por **'.$this->formatCurrency($finalConsumerTotal).'**.';

            return implode("\n", $lines);
        } catch (Throwable $e) {
            Log::error('Error al calcular ranking de clientes para el chatbot.', [
                'message' => $e->getMessage(),
            ]);

            return 'No pude calcular el ranking de clientes en este momento.';
        }
    }

    protected function getTopOverallProductContext(): string
    {
        try {
            $itemsQuery = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
                ->where(function (Builder $query): void {
                    $query->whereNull('sales.status')
                        ->orWhere('sales.status', '!=', 'cancelled');
                })
                ->selectRaw('sale_items.product_name, SUM(sale_items.quantity) as total_qty')
                ->groupBy('sale_items.product_name')
                ->orderByDesc('total_qty');

            $items = $this->applyJoinedSalesSince(clone $itemsQuery, now()->subDays(30))
                ->take(5)
                ->get();

            if ($items->isEmpty()) {
                $items = $itemsQuery->take(5)->get();
            }

            if ($items->isEmpty()) {
                return 'Todavía no hay ventas suficientes para detectar productos destacados.';
            }

            $lines = [];

            foreach ($items as $index => $item) {
                $badge = match ($index) {
                    0 => '🥇',
                    1 => '🥈',
                    2 => '🥉',
                    default => ($index + 1).'.',
                };

                $lines[] = sprintf(
                    '* %s **%s**: %s unidades vendidas.',
                    $badge,
                    $item->product_name,
                    $this->formatQuantity($item->total_qty)
                );
            }

            return implode("\n", $lines);
        } catch (Throwable $e) {
            Log::error('Error al calcular ranking de productos para el chatbot.', [
                'message' => $e->getMessage(),
            ]);

            return 'No pude calcular el ranking de productos en este momento.';
        }
    }

    protected function salesQuery(): Builder
    {
        return Sale::query()->where(function (Builder $query): void {
            $query->whereNull('status')
                ->orWhere('status', '!=', 'cancelled');
        });
    }

    protected function whereSaleDateSince(Builder $query, Carbon $date): Builder
    {
        return $query->where(function (Builder $dateQuery) use ($date): void {
            $dateQuery->where('sold_at', '>=', $date)
                ->orWhere(function (Builder $fallbackQuery) use ($date): void {
                    $fallbackQuery->whereNull('sold_at')
                        ->where('created_at', '>=', $date);
                });
        });
    }

    protected function whereSaleDateBetween(Builder $query, Carbon $start, Carbon $end): Builder
    {
        return $query->where(function (Builder $dateQuery) use ($start, $end): void {
            $dateQuery->whereBetween('sold_at', [$start, $end])
                ->orWhere(function (Builder $fallbackQuery) use ($start, $end): void {
                    $fallbackQuery->whereNull('sold_at')
                        ->whereBetween('created_at', [$start, $end]);
                });
        });
    }

    protected function applyJoinedSalesSince(Builder $query, Carbon $date): Builder
    {
        return $query->where(function (Builder $dateQuery) use ($date): void {
            $dateQuery->where('sales.sold_at', '>=', $date)
                ->orWhere(function (Builder $fallbackQuery) use ($date): void {
                    $fallbackQuery->whereNull('sales.sold_at')
                        ->where('sales.created_at', '>=', $date);
                });
        });
    }

    protected function normalizeForIntent(string $message): string
    {
        $normalized = Str::lower(Str::ascii($message));
        $normalized = preg_replace('/[^\p{L}\p{N}\s-]/u', '', $normalized) ?? $normalized;

        return preg_replace('/\s+/u', ' ', trim($normalized)) ?? '';
    }

    protected function containsAny(string $text, array $needles): bool
    {
        foreach ($needles as $needle) {
            if (str_contains($text, $needle)) {
                return true;
            }
        }

        return false;
    }

    protected function resolveSearchTerm(string $userMessage): string
    {
        $cleanMessage = trim($userMessage);

        if ($cleanMessage === '') {
            return '';
        }

        // Si el usuario especifica explicitamente #123 o orden ORD-123
        if (preg_match('/(?:job|orden)\s+([A-Z0-9-]{4,})/i', $cleanMessage, $matches) === 1) {
            return $matches[1];
        }
        
        if (preg_match('/#([A-Z0-9-]{3,})/i', $cleanMessage, $matches) === 1) {
            return $matches[1];
        }

        $ascii = $this->normalizeForIntent($cleanMessage);
        $tokens = preg_split('/\s+/u', $ascii, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $stopWords = [
            'trabajo', 'trabajos', 'job', 'jobs', 'orden', 'ordenes', 'laboratorio',
            'pendiente', 'pendientes', 'estado', 'estados', 'buscar', 'busca', 'mostra',
            'mostrame', 'mostrar', 'de', 'del', 'la', 'el', 'los', 'las', 'que', 'como',
            'donde', 'esta', 'estan', 'hay', 'para', 'con', 'por', 'favor', 'tiene', 'tienen',
            'tengo', 'tenemos', 'solicito', 'solicitado', 'quien', 'cual', 'cuales',
            'un', 'una', 'es', 'son', 'algun', 'alguna', 'servicio', 'pedido', 'necesito',
            'saber', 'sobre', 'paciente', 'odontologo', 'dr', 'dra', 'doctor', 'doctora',
            'cliente', 'hizo', 'hace', 'detalle', 'detalles', 'ver', 'quiero', 'informacion',
            'dato', 'datos', 'este', 'esta', 'ese', 'esa', 'ayer', 'hoy', 'manana',
            'mes', 'semana', 'pasado', 'pasada', 'fue', 'pago', 'pagos', 'abono', 'abonos',
            'realizado', 'realizados', 'hecho', 'hechos', 'recibo', 'su', 'sus', 'cuenta'
        ];

        $filteredTokens = array_values(array_filter($tokens, function (string $token) use ($stopWords): bool {
            return mb_strlen($token) > 2 && ! in_array($token, $stopWords, true);
        }));

        if (count($filteredTokens) >= 1 && count($filteredTokens) <= 4) {
            return implode(' ', array_slice($filteredTokens, 0, 4));
        }

        return '';
    }

    protected function buildVariantLabel(Stock $stock): string
    {
        if (! $stock->product_variant) {
            return '';
        }

        $attributes = $stock->product_variant->variant_attribute_values
            ->map(fn ($value) => $value->product_attribute_value?->value)
            ->filter()
            ->implode(', ');

        if ($attributes !== '') {
            return ' ['.$attributes.']';
        }

        return $stock->product_variant->sku ? ' ['.$stock->product_variant->sku.']' : '';
    }

    protected function formatCurrency(float|int|string|null $value): string
    {
        return '$ '.number_format((float) $value, 2, ',', '.');
    }

    protected function formatInteger(float|int|string|null $value): string
    {
        return number_format((float) $value, 0, ',', '.');
    }

    protected function formatQuantity(float|int|string|null $value): string
    {
        $number = (float) $value;

        if ((float) ((int) $number) === $number) {
            return number_format($number, 0, ',', '.');
        }

        return number_format($number, 2, ',', '.');
    }

    protected function formatDate(?Carbon $date): string
    {
        return $date?->format('d/m/Y') ?? 'Sin fecha';
    }

    protected function logProviderFailure(string $providerName, array $settings, int $status, string $body): void
    {
        Log::error("{$providerName} API error", [
            'provider' => $settings['provider'],
            'model' => $settings['model'],
            'status' => $status,
            'body' => Str::limit($body, 3000),
        ]);
    }
}
