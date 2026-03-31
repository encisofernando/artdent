<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Tenant;
use App\Models\TenantSubscription;
use App\Support\CrmMode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
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

    public function index(): Response
    {
        if (! CrmMode::billingEnabled()) {
            return Inertia::render('Admin/Subscription', [
                'tenant' => CrmMode::tenantInfo() ?? CrmMode::ownerTenant(),
                'subscription' => null,
                'plans' => [],
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
                'status' => $subscription->status,
                'next_payment_date' => $subscription->next_payment_date,
                'amount' => $subscription->amount,
                'plan' => $subscription->plan ? [
                    'name' => $subscription->plan->name,
                    'price' => $subscription->plan->price,
                ] : null,
            ] : null,
            'plans' => $plans,
        ]);
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

        if (! $plan->mp_plan_id) {
            return back()->with('error', 'Este plan aún no está disponible para pago online. Contacte al soporte.');
        }

        $tenant = Tenant::find(tenant('id'));

        $response = Http::withToken($this->mpAccessToken)
            ->post('https://api.mercadopago.com/preapproval', [
                'preapproval_plan_id' => $plan->mp_plan_id,
                'reason' => "Plan {$plan->name} — ArtDent",
                'external_reference' => "tenant_{$tenant->id}_plan_{$plan->id}",
                'payer_email' => auth()->user()->email,
                'back_url' => route('subscription.index'),
                'status' => 'pending',
            ]);

        if (! $response->successful()) {
            return back()->with('error', 'Error al conectar con MercadoPago. Intente nuevamente.');
        }

        $data = $response->json();

        TenantSubscription::create([
            'tenant_id' => $tenant->id,
            'plan_id' => $plan->id,
            'mp_preapproval_id' => $data['id'],
            'status' => 'pending',
            'amount' => $plan->price,
            'mp_data' => $data,
        ]);

        // Redirect user to MP checkout
        return redirect()->away($data['init_point']);
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
