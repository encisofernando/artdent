<?php

namespace App\Services;

use App\Models\CashSession;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Dentist;
use App\Models\EcommerceOrder;
use App\Models\Expense;
use App\Models\Job;
use App\Models\Patient;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Stock;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class ChatbotService
{
    protected const MAX_HISTORY_MESSAGES = 8;

    protected const MAX_MESSAGE_LENGTH = 2000;

    protected const DEFAULT_MODEL = ClaudeService::DEFAULT_MODEL;

    public function generateResponse(array $messages, string $userMessage = ''): string
    {
        $settings = $this->resolveChatbotSettings();

        if (! $settings['enabled']) {
            return 'El chatbot está deshabilitado para esta empresa.';
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

        // ── Base de conocimiento: responde sin API key ni tokens ────────────
        $kbAnswer = ChatbotKnowledgeBase::search($latestUserMessage);

        if ($kbAnswer !== null) {
            return $kbAnswer;
        }

        // ── Fallback a Claude: requiere API key ─────────────────────────────
        if (blank($settings['api_key'])) {
            return 'Para consultas sobre datos en tiempo real (ventas, stock, jobs, deudas) necesito configurar la API Key de Claude. Podés configurarla en **Ajustes → Integraciones**.';
        }

        return $this->generateClaudeResponse($normalizedMessages, $latestUserMessage, $settings);
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
            'provider' => 'claude',
            'model' => $settings['model'],
            'welcome_message' => $this->getWelcomeMessage(),
        ];
    }

    public function getWelcomeMessage(): string
    {
        return '¡Hola! Soy **Artie**, tu asistente inteligente de **ArtCode CRM**. 👋 Estoy aquí para ayudarte con ventas, laboratorio, stock y navegación del sistema. ¿En qué te doy una mano?';
    }

    protected function resolveChatbotSettings(): array
    {
        $company = $this->resolveCompany();
        $model = trim((string) ($company?->chatbot_model ?? ''));

        if ($model === '') {
            $model = (string) config('services.chatbot.anthropic_model', static::DEFAULT_MODEL);
        }

        return [
            'enabled' => $company?->chatbot_enabled ?? true,
            'provider' => 'claude',
            'model' => $model,
            'api_key' => $this->resolveApiKey($company),
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

    protected function resolveApiKey(?Company $company = null): ?string
    {
        $company ??= $this->resolveCompany();

        return $company?->chatbot_anthropic_key ?: config('services.chatbot.anthropic_key');
    }

    protected function generateClaudeResponse(array $messages, string $userMessage, array $settings): string
    {
        $staticPrompt = $this->getStaticSystemPrompt();
        $dynamicContext = $this->buildDynamicContext($userMessage);

        $claude = new ClaudeService($settings['api_key'], $settings['model']);

        return $claude->chat($staticPrompt, $dynamicContext, $messages);
    }

    // ── System prompt estático (se cachea en Anthropic) ───────────────────────
    protected function getStaticSystemPrompt(): string
    {
        return <<<'PROMPT'
Eres "Artie", el asistente inteligente de ArtCode CRM.

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
- RRHH: colaboradores, asistencia biométrica, recibos de pago.
- Contabilidad: libros IVA, estado de resultados, cuentas corrientes.

NAVEGACIÓN REAL DEL CRM:
- Gestión > Ventas: Lista de Ventas (/sales), Nueva Venta (/sales/create), Presupuesto (/quotes), Artículos (/products).
- Gestión > Clientes: Lista de Clientes (/customers), Cuentas Corrientes (/customers-accounts).
- Gestión > Proveedores: Directorio (/vendors), Comprobantes (/proveedores/comprobantes), Pagos (/proveedores/pagos), Cta. Cte. (/proveedores/ctacte).
- E-commerce > E-commerce: Pedidos (/ecommerce-orders), Reportes MP (/ecommerce-reports).
- Laboratorio > Órdenes: Consultar (/jobs), Nueva Orden (/jobs/create), Rehacimientos (/job-remakes).
- Laboratorio > Clientes / Odont.: Lista de Odontólogos (/dentists), Pacientes (/patients), Cuentas Corrientes y Pagos (/lab-account-moves), Ingresos y Egresos (/lab-finance).
- Contable > Contable: Panel contable (/contable), Libro IVA Ventas (/export/iva-ventas), Libro IVA Compras (/export/iva-compras), Estado de Resultados (/export/income-statement).
- CRM > Interacciones (/crm-interactions).
- Análisis > Reportes (/reportes).

REGLAS:
1. Nunca inventes cifras, estados, clientes, trabajos ni acciones del sistema.
2. Responde usando solo la información inyectada en el CONTEXTO EN TIEMPO REAL y los datos reales del tenant.
3. Si el usuario pregunta por una persona puntual, prioriza coincidencias por fragmentos del nombre y responde con nombres humanos, nunca con IDs crudos.
4. Si falta un dato puntual o no tienes evidencia suficiente, dilo con honestidad y deriva al módulo real correspondiente del sidebar usando la navegación listada arriba.
5. Cuando orientes navegación, nombra la sección exacta del menú y, si ayuda, incluye la ruta entre paréntesis.
6. Usa Markdown simple: párrafos cortos, listas y negritas cuando ayuden.
PROMPT;
    }

    // ── Contexto dinámico por cada request (NO se cachea) ────────────────────
    protected function buildDynamicContext(string $userMessage): string
    {
        $stats = $this->getQuickStats();
        $contextBlocks = $this->buildContextBlocks($userMessage);

        $header = implode("\n", [
            'RESUMEN ACTUAL:',
            '- Pacientes registrados: '.$stats['patients'],
            '- Usuarios activos: '.$stats['users'],
            '- Ventas en los últimos 30 días: '.$stats['sales_30d'],
            '- Jobs activos: '.$stats['pending_jobs'],
        ]);

        if (empty($contextBlocks)) {
            return $header;
        }

        return $header."\n\nCONTEXTO EN TIEMPO REAL:\n".implode("\n\n", $contextBlocks);
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

            return \Illuminate\Support\Facades\Cache::remember('chatbot_quick_stats_'.$tenantId, 120, function () {
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

            return \Illuminate\Support\Facades\Cache::remember('chatbot_inventory_'.$tenantId, 120, function () {
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

            return \Illuminate\Support\Facades\Cache::remember('chatbot_finance_'.$tenantId, 120, function () {
                $todayStart = now()->startOfDay();
                $todayEnd = now()->endOfDay();
                $monthStart = now()->startOfMonth();
                $monthEnd = now()->endOfMonth();

                $todaySales = $this->whereSaleDateBetween($this->salesQuery(), $todayStart, $todayEnd)->sum('total');
                $todayOperations = $this->whereSaleDateBetween($this->salesQuery(), $todayStart, $todayEnd)->count();
                $monthSales = $this->whereSaleDateBetween($this->salesQuery(), $monthStart, $monthEnd)->sum('total');
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
            $cacheKey = 'chatbot_jobs_'.$tenantId.'_'.md5($searchTerm.'_'.($wantsActiveJobs ? '1' : '0'));

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

            return \Illuminate\Support\Facades\Cache::remember('chatbot_debt_'.$tenantId, 120, function () {
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
                    $lines[] = 'Saldos Lab Odontólogos:';
                    $lines = array_merge($lines, $dentistsWithDebt
                        ->take(3)
                        ->map(fn (Dentist $dentist) => '* **'.$dentist->name.'**: '.$this->formatCurrency($dentist->lab_account?->balance))
                        ->all());
                }

                if ($customersWithDebt->isNotEmpty()) {
                    $lines[] = 'Saldos Clientes Generales:';
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

            return \Illuminate\Support\Facades\Cache::remember('chatbot_purchases_'.$tenantId, 120, function () {
                $purchases = Purchase::with('vendor')->latest('id')->take(5)->get();
                $expenses = Expense::with('category')->latest('id')->take(5)->get();

                $lines = ['Últimos Movimientos de Egresos:'];

                if ($purchases->isNotEmpty()) {
                    $lines[] = 'COMPRAS A PROVEEDORES:';
                    foreach ($purchases as $p) {
                        $lines[] = sprintf('* V/#%d - %s por %s (%s)', $p->id, $p->vendor?->name ?? 'SC', $this->formatCurrency($p->total), $this->formatDate($p->created_at));
                    }
                }

                if ($expenses->isNotEmpty()) {
                    $lines[] = 'GASTOS ASENTADOS:';
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

            return \Illuminate\Support\Facades\Cache::remember('chatbot_ecommerce_'.$tenantId, 120, function () {
                $orders = EcommerceOrder::with('customer')
                    ->whereNotIn('status', ['delivered', 'cancelled', 'completed'])
                    ->latest('id')
                    ->take(5)
                    ->get();

                if ($orders->isEmpty()) {
                    return 'No hay pedidos de ecommerce pendientes de entrega en este momento.';
                }

                $lines = ['PEDIDOS ECOMMERCE (Pendientes):'];

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

            if ($term === '' || mb_strlen($term) < 3) {
                return '';
            }

            $tenantId = $this->resolveCurrentTenantId() ?? '0';
            $cacheKey = 'chatbot_people_'.$tenantId.'_'.md5($term);

            return \Illuminate\Support\Facades\Cache::remember($cacheKey, 60, function () use ($term) {
                $lines = [];
                $termWords = array_filter(explode(' ', trim($term)));
                $filterWords = function ($query) use ($termWords): void {
                    foreach ($termWords as $w) {
                        $query->where('name', 'like', "%{$w}%");
                    }
                };

                $dentists = Dentist::with(['lab_account.moves' => fn ($q) => $q->latest('id')->take(3)])->where($filterWords)->take(2)->get();

                if ($dentists->isNotEmpty()) {
                    $lines[] = 'Dentistas hallados:';
                    foreach ($dentists as $d) {
                        $saldo = $d->lab_account ? $this->formatCurrency($d->lab_account->balance) : '$0';
                        $lines[] = "- {$d->name} (Tel: {$d->phone_number}) - Saldo actual: {$saldo}";

                        if ($d->lab_account?->moves?->isNotEmpty()) {
                            foreach ($d->lab_account->moves as $m) {
                                $lines[] = sprintf('  * Movimiento: %s | %s el %s', $m->type, $this->formatCurrency($m->amount), $m->move_date ? $this->formatDate($m->move_date) : 'N/D');
                            }
                        }
                    }
                }

                $customers = Customer::with(['customer_account.moves' => fn ($q) => $q->latest('id')->take(3)])->where($filterWords)->take(2)->get();

                if ($customers->isNotEmpty()) {
                    $lines[] = 'Clientes hallados:';
                    foreach ($customers as $c) {
                        $saldo = $c->customer_account ? $this->formatCurrency($c->customer_account->balance) : '$0';
                        $lines[] = "- {$c->name} (Doc: {$c->document_number}) - Saldo actual: {$saldo}";

                        if ($c->customer_account?->moves?->isNotEmpty()) {
                            foreach ($c->customer_account->moves as $m) {
                                $lines[] = sprintf('  * Movimiento: %s | %s el %s', $m->type, $this->formatCurrency($m->amount), $m->move_date ? $this->formatDate($m->move_date) : 'N/D');
                            }
                        }
                    }
                }

                if (empty($lines)) {
                    $patients = Patient::where($filterWords)->take(2)->get();

                    if ($patients->isNotEmpty()) {
                        $lines[] = 'Pacientes hallados:';
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
            'realizado', 'realizados', 'hecho', 'hechos', 'recibo', 'su', 'sus', 'cuenta',
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
}
