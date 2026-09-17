<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\Plan;
use App\Models\SubscriptionInvoice;
use App\Models\Tenant;
use App\Models\TenantModule;
use App\Models\TenantPayment;
use App\Models\TenantSubscription;
use App\Support\CrmMode;
use App\Support\TenantModuleResolver;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    private string $mpAccessToken;

    public function __construct()
    {
        $this->mpAccessToken = config('services.mercadopago.access_token', '');
    }

    public function index(TenantModuleResolver $moduleResolver): Response
    {
        if (! CrmMode::billingEnabled()) {
            return Inertia::render('Admin/Subscription', [
                'tenant' => CrmMode::tenantInfo() ?? CrmMode::ownerTenant(),
                'subscription' => null,
                'plans' => [],
                'modules' => [],
                'invoices' => [],
                'payments' => [],
            ]);
        }

        $tenant = Tenant::find(tenant('id'));

        $subscription = TenantSubscription::where('tenant_id', $tenant->id)
            ->whereIn('status', ['authorized', 'pending'])
            ->latest()
            ->with('plan')
            ->first();

        $plans = Plan::where('is_active', true)
            ->where('is_public', true)
            ->orderBy('price')
            ->get(['id', 'slug', 'name', 'description', 'price', 'trial_days', 'mp_plan_id', 'features']);

        return Inertia::render('Admin/Subscription', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'plan' => $tenant->plan,
                'status' => $tenant->status,
                'trial_ends_at' => $tenant->trial_ends_at,
                'activated_at' => $tenant->activated_at,
            ],
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'mp_preapproval_id' => $subscription->mp_preapproval_id,
                'has_mp_subscription' => ! empty($subscription->mp_preapproval_id),
                'status' => $subscription->status,
                'next_payment_date' => $subscription->next_payment_date,
                'amount' => $subscription->amount,
                'plan' => $subscription->plan ? [
                    'id' => $subscription->plan->id,
                    'name' => $subscription->plan->name,
                    'price' => $subscription->plan->price,
                    'slug' => $subscription->plan->slug,
                ] : null,
            ] : null,
            'plans' => $plans,
            'modules' => $this->modulesState($tenant, $moduleResolver),
            'invoices' => SubscriptionInvoice::where('tenant_id', $tenant->id)
                ->orderByDesc('id')
                ->get(['id', 'receipt_type', 'point_sale', 'number', 'cae', 'total', 'status', 'description', 'issued_at']),
            'payments' => $this->fetchPaymentHistory($tenant->id),
            'bank_details' => [
                'bank_name' => config('services.billing.bank_name', 'Banco Santander'),
                'account_holder' => config('services.billing.account_holder', 'ArtCode SRL'),
                'cuit' => config('services.billing.cuit', '30-71829345-8'),
                'cbu' => config('services.billing.cbu', '0720023420000001234567'),
                'alias' => config('services.billing.alias', 'ARTCODE.PAGOS'),
            ],
        ]);
    }

    /**
     * Módulos contratados — sólo lectura (el tenant no puede tocar sus
     * propios overrides). Mismo cálculo que TenantController::modulesStateFor()
     * en artdent-admin, pero resuelto para el tenant actual automáticamente.
     */
    private function modulesState(Tenant $tenant, TenantModuleResolver $moduleResolver): array
    {
        $enabledSlugs = $moduleResolver->enabledSlugs();
        $plan = $moduleResolver->currentPlan();
        $planModuleSlugs = $plan ? $plan->modules()->pluck('slug')->all() : [];
        $overrides = TenantModule::where('tenant_id', $tenant->id)->with('module')->get()->keyBy('module_id');

        return Module::orderBy('name')->get()->map(function (Module $module) use ($enabledSlugs, $planModuleSlugs, $overrides) {
            $inPlan = in_array($module->slug, $planModuleSlugs, true);
            $override = $overrides->get($module->id);

            return [
                'id' => $module->id,
                'name' => $module->name,
                'in_plan' => $inPlan,
                'has_override' => (bool) $override,
                'effective' => in_array($module->slug, $enabledSlugs, true),
            ];
        })->values()->all();
    }

    /**
     * Historial unificado de pagos del tenant:
     * 1. Pagos asentados en la tabla central tenant_payments (transferencias, QR, efectivo y webhooks MP).
     * 2. Pagos consultados a la API de MercadoPago si estuviera configurado el token, evitando duplicados.
     */
    private function fetchPaymentHistory(string $tenantId): array
    {
        $dbPayments = TenantPayment::where('tenant_id', $tenantId)
            ->orderByDesc('paid_at')
            ->orderByDesc('id')
            ->get();

        $recordedMpIds = $dbPayments->pluck('mp_payment_id')->filter()->map(fn ($id) => (string) $id)->all();

        $mpPayments = collect();
        if (! empty($this->mpAccessToken)) {
            try {
                $response = Http::withToken($this->mpAccessToken)
                    ->timeout(4)
                    ->get('https://api.mercadopago.com/v1/payments/search', [
                        'external_reference' => $tenantId,
                        'sort' => 'date_created',
                        'criteria' => 'desc',
                        'limit' => 20,
                    ]);

                if ($response->successful()) {
                    $mpPayments = collect($response->json('results', []))
                        ->reject(fn (array $p) => in_array((string) $p['id'], $recordedMpIds, true))
                        ->map(fn (array $p) => [
                            'id' => 'mp-'.$p['id'],
                            'status' => $p['status'],
                            'amount' => (float) $p['transaction_amount'],
                            'date' => $p['date_approved'] ?? $p['date_created'],
                            'payment_method' => 'MercadoPago'.(! empty($p['payment_method_id']) ? ' ('.$p['payment_method_id'].')' : ''),
                            'reference' => (string) $p['id'],
                        ]);
                }
            } catch (\Throwable $e) {
                // Silently fallback if MP API is unreachable
            }
        }

        $formattedDbPayments = $dbPayments->map(fn (TenantPayment $p) => [
            'id' => 'pay-'.$p->id,
            'status' => $p->status,
            'amount' => (float) $p->amount,
            'date' => $p->paid_at?->toIso8601String() ?? $p->created_at?->toIso8601String(),
            'payment_method' => $p->method_label,
            'reference' => $p->reference,
        ]);

        return $formattedDbPayments
            ->concat($mpPayments)
            ->sortByDesc('date')
            ->values()
            ->all();
    }

    public function checkout(Request $request): RedirectResponse
    {
        abort_unless(CrmMode::billingEnabled(), 404);

        $request->validate([
            'plan_id' => [
                'required',
                'integer',
                Rule::exists(config('tenancy.database.central_connection').'.plans', 'id'),
            ],
        ]);

        $plan = Plan::findOrFail($request->plan_id);

        if (empty($this->mpAccessToken)) {
            return back()->with('error', 'El servicio de pago online no está configurado. Contacte al soporte.');
        }

        $tenant = Tenant::find(tenant('id'));
        $user = auth()->user();

        // 1. Intentar crear preapproval de suscripción con auto_recurring
        $response = Http::withToken($this->mpAccessToken)
            ->post('https://api.mercadopago.com/preapproval', [
                'reason' => "Suscripción {$plan->name} — {$tenant->name}",
                'external_reference' => $tenant->id,
                'payer_email' => $user?->email ?? $tenant->email,
                'auto_recurring' => [
                    'frequency' => 1,
                    'frequency_type' => 'months',
                    'transaction_amount' => (float) $plan->price,
                    'currency_id' => 'ARS',
                ],
                'back_url' => route('subscription.index'),
                'status' => 'pending',
            ]);

        if ($response->successful()) {
            $data = $response->json();

            TenantSubscription::updateOrCreate(
                ['tenant_id' => $tenant->id],
                [
                    'plan_id' => $plan->id,
                    'mp_preapproval_id' => $data['id'],
                    'status' => 'pending',
                    'amount' => $plan->price,
                    'mp_data' => $data,
                ]
            );

            return redirect()->away($data['init_point']);
        }

        // 2. Fallback si el plan tiene mp_init_point generado
        if (! empty($plan->mp_init_point)) {
            return redirect()->away($plan->mp_init_point);
        }

        Log::error('MP checkout subscription failed', ['body' => $response->body()]);

        return back()->with('error', 'Error al conectar con MercadoPago: '.($response->json('message') ?? 'Intente nuevamente.'));
    }

    /**
     * Pago único o adelanto de cuotas con MercadoPago (1 a 24 meses).
     */
    public function advanceCheckout(Request $request): RedirectResponse
    {
        abort_unless(CrmMode::billingEnabled(), 404);

        $request->validate([
            'months' => ['required', 'integer', 'min:1', 'max:24'],
            'plan_id' => ['nullable', 'integer'],
        ]);

        if (empty($this->mpAccessToken)) {
            return back()->with('error', 'El servicio de pago online no está configurado. Contacte al soporte.');
        }

        $tenant = Tenant::find(tenant('id'));
        $plan = $request->plan_id
            ? Plan::find($request->plan_id)
            : Plan::where('slug', $tenant->plan)->first();

        if (! $plan) {
            return back()->with('error', 'Plan no encontrado.');
        }

        $months = (int) $request->months;
        $unitPrice = (float) $plan->price;
        $totalAmount = $unitPrice * $months;

        $response = Http::withToken($this->mpAccessToken)
            ->post('https://api.mercadopago.com/checkout/preferences', [
                'items' => [
                    [
                        'title' => "Abono {$plan->name} ({$months} ".($months === 1 ? 'mes' : 'meses').") — {$tenant->name}",
                        'quantity' => 1,
                        'unit_price' => $totalAmount,
                        'currency_id' => 'ARS',
                    ],
                ],
                'external_reference' => $tenant->id,
                'payer' => [
                    'email' => auth()->user()?->email ?? $tenant->email,
                    'name' => $tenant->name,
                ],
                'back_urls' => [
                    'success' => route('subscription.index'),
                    'failure' => route('subscription.index'),
                    'pending' => route('subscription.index'),
                ],
                'auto_return' => 'approved',
                'statement_descriptor' => 'ArtCode',
            ]);

        if (! $response->successful()) {
            Log::error('MP advance checkout failed', ['body' => $response->body()]);

            return back()->with('error', 'Error al generar checkout: '.($response->json('message') ?? 'Intente nuevamente.'));
        }

        $data = $response->json();

        return redirect()->away($data['init_point']);
    }

    /**
     * Notificación de pago manual por transferencia bancaria realizada por el tenant.
     */
    public function reportTransfer(Request $request): RedirectResponse
    {
        abort_unless(CrmMode::billingEnabled(), 404);

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'paid_at' => ['required', 'date'],
            'reference' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $tenant = Tenant::find(tenant('id'));
        $plan = Plan::where('slug', $tenant->plan)->first();

        TenantPayment::create([
            'tenant_id' => $tenant->id,
            'tenant_subscription_id' => TenantSubscription::where('tenant_id', $tenant->id)->latest()->value('id'),
            'plan_id' => $plan?->id,
            'payment_method' => TenantPayment::METHOD_TRANSFER,
            'amount' => (float) $validated['amount'],
            'currency' => 'ARS',
            'paid_at' => Carbon::parse($validated['paid_at']),
            'reference' => $validated['reference'],
            'notes' => ! empty($validated['notes']) ? 'Informado por tenant: '.$validated['notes'] : 'Informado desde el panel de suscripción',
            'status' => 'pending',
            'created_by_user_id' => null,
        ]);

        return back()->with('success', 'Transferencia informada correctamente. El pago figura como Pendiente y será verificado por administración a la brevedad.');
    }

    public function cancel(): RedirectResponse
    {
        abort_unless(CrmMode::billingEnabled(), 404);

        $tenantId = tenant('id');

        $subscription = TenantSubscription::where('tenant_id', $tenantId)
            ->where('status', 'authorized')
            ->latest()
            ->first();

        if (! $subscription) {
            return back()->with('error', 'No se encontró una suscripción activa para cancelar.');
        }

        $response = Http::withToken($this->mpAccessToken)
            ->put("https://api.mercadopago.com/preapproval/{$subscription->mp_preapproval_id}", [
                'status' => 'cancelled',
            ]);

        if ($response->successful()) {
            $subscription->update(['status' => 'cancelled']);

            Tenant::where('id', $tenantId)->update([
                'status' => 'cancelled',
                'updated_at' => now(),
            ]);

            return back()->with('success', 'Suscripción cancelada. El acceso estará disponible hasta el fin del período pagado.');
        }

        return back()->with('error', 'Error al cancelar en MercadoPago. Intente nuevamente o contacte al soporte.');
    }
}
