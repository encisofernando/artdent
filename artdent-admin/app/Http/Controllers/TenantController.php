<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\Plan;
use App\Models\Tenant;
use App\Models\TenantModule;
use App\Models\UserTenantMap;
use App\Services\MercadoPagoService;
use App\Services\TenantProvisioningService;
use App\Support\SuperadminAudit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Tenant::query()->withCount('userMaps')->orderByDesc('created_at');

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        if ($plan = $request->string('plan')->toString()) {
            $query->where('plan', $plan);
        }

        return Inertia::render('Tenants/Index', [
            'tenants' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only('search', 'status', 'plan'),
            'plans' => Plan::orderBy('name')->get(['id', 'slug', 'name']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Tenants/Create', [
            'plans' => Plan::orderBy('price')->get(['id', 'slug', 'name']),
        ]);
    }

    public function store(Request $request, TenantProvisioningService $provisioning): RedirectResponse
    {
        $data = $request->validate([
            'id' => ['required', 'string', 'max:50', 'regex:/^[a-z0-9\-]+$/', 'unique:tenants,id'],
            'name' => ['required', 'string', 'max:150'],
            'email' => ['nullable', 'email', 'max:150'],
            'domain' => ['nullable', 'string', 'max:255'],
            'plan' => ['required', 'string', 'exists:plans,slug'],
            'status' => ['required', Rule::in(['trial', 'active', 'suspended', 'cancelled'])],
            'trial_ends_at' => ['nullable', 'date'],
            'activated_at' => ['nullable', 'date'],
            'owner_name' => ['required', 'string', 'max:150'],
            'owner_email' => ['required', 'email', 'max:150'],
            'owner_password' => ['nullable', 'string', 'min:8'],
        ]);

        $result = $provisioning->provision($data);

        SuperadminAudit::log('tenant.created', Tenant::find($data['id']), [
            'plan' => $data['plan'],
            'status' => $data['status'],
            'database' => $result['database'],
            'domain' => $result['domain'],
            'owner_email' => $result['owner_email'],
        ]);

        $message = "Empresa creada — DB: {$result['database']} · Dominio: {$result['domain']}";

        if ($result['generated_password']) {
            $message .= " · Password temporal para {$result['owner_email']}: {$result['generated_password']}";
        }

        return redirect()->route('tenants.index')->with('success', $message);
    }

    public function edit(Tenant $tenant): Response
    {
        $tenant->loadCount('userMaps');

        return Inertia::render('Tenants/Edit', [
            'tenant' => [
                ...$tenant->only(['id', 'name', 'email', 'plan', 'status', 'trial_ends_at', 'activated_at', 'created_at']),
                'database' => $tenant->database()->getName(),
                'domain' => $tenant->domains()->first()?->domain,
                'active_subscription' => $tenant->activeSubscription()?->load('plan'),
            ],
            'userMaps' => $tenant->userMaps()->orderBy('email')->get(['id', 'email']),
            'plans' => Plan::orderBy('price')->get(['id', 'slug', 'name']),
            'modules' => $this->modulesStateFor($tenant),
        ]);
    }

    /**
     * Estado de cada módulo del catálogo para este tenant: si viene incluido
     * por el plan contratado, y si hay un override puntual (add-on o
     * revocación) que lo cambia. "effective" es lo que realmente resuelve
     * TenantModuleResolver del lado del CRM.
     */
    private function modulesStateFor(Tenant $tenant): array
    {
        $planSlug = $tenant->activeSubscription()?->plan?->slug ?? $tenant->plan;
        $plan = $planSlug ? Plan::where('slug', $planSlug)->first() : null;
        $planModuleIds = $plan ? $plan->modules()->pluck('modules.id')->all() : [];
        $overrides = $tenant->tenantModules()->get()->keyBy('module_id');

        return Module::orderBy('name')->get()->map(function (Module $module) use ($planModuleIds, $overrides) {
            $inPlan = in_array($module->id, $planModuleIds, true);
            $override = $overrides->get($module->id);

            return [
                'id' => $module->id,
                'slug' => $module->slug,
                'name' => $module->name,
                'in_plan' => $inPlan,
                'has_override' => (bool) $override,
                'effective' => $override ? (bool) $override->enabled : $inPlan,
            ];
        })->values()->all();
    }

    public function updateModule(Request $request, Tenant $tenant, Module $module): RedirectResponse
    {
        $data = $request->validate(['enabled' => ['required', 'boolean']]);

        $planSlug = $tenant->activeSubscription()?->plan?->slug ?? $tenant->plan;
        $plan = $planSlug ? Plan::where('slug', $planSlug)->first() : null;
        $inPlan = $plan ? $plan->modules()->where('modules.id', $module->id)->exists() : false;

        if ($data['enabled'] === $inPlan) {
            // Coincide con lo que ya da el plan — no hace falta override.
            TenantModule::where('tenant_id', $tenant->id)->where('module_id', $module->id)->delete();
        } else {
            TenantModule::updateOrCreate(
                ['tenant_id' => $tenant->id, 'module_id' => $module->id],
                ['enabled' => $data['enabled']],
            );
        }

        SuperadminAudit::log('tenant.module_updated', $tenant, [
            'module' => $module->slug,
            'enabled' => $data['enabled'],
        ]);

        return back()->with('success', "Módulo \"{$module->name}\" actualizado para \"{$tenant->name}\".");
    }

    public function update(Request $request, Tenant $tenant): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['nullable', 'email', 'max:150'],
            'plan' => ['required', 'string', 'exists:plans,slug'],
            'status' => ['required', Rule::in(['trial', 'active', 'suspended', 'cancelled'])],
            'trial_ends_at' => ['nullable', 'date'],
            'activated_at' => ['nullable', 'date'],
        ]);

        $before = $tenant->only(array_keys($data));

        $tenant->update($data);

        SuperadminAudit::log('tenant.updated', $tenant, ['before' => $before, 'after' => $data]);

        return back()->with('success', 'Empresa actualizada.');
    }

    public function destroy(Tenant $tenant): RedirectResponse
    {
        // Loguear ANTES del delete: dispara el drop físico de la BD del
        // tenant (stancl/tenancy), así que después no queda nada que snapshotear.
        SuperadminAudit::log('tenant.deleted', $tenant, [
            'database' => $tenant->database()->getName(),
            'plan' => $tenant->plan,
            'status' => $tenant->status,
        ], 'Acción irreversible: se eliminó físicamente la base de datos del tenant.');

        $tenant->delete();

        return redirect()->route('tenants.index')->with('success', 'Empresa eliminada.');
    }

    public function activate(Tenant $tenant): RedirectResponse
    {
        $tenant->update(['status' => 'active', 'activated_at' => $tenant->activated_at ?? now()]);

        SuperadminAudit::log('tenant.activated', $tenant);

        return back()->with('success', 'Tenant activado.');
    }

    public function suspend(Tenant $tenant): RedirectResponse
    {
        $tenant->update(['status' => 'suspended']);

        SuperadminAudit::log('tenant.suspended', $tenant);

        return back()->with('success', 'Tenant suspendido.');
    }

    public function assignOwner(Tenant $tenant, MercadoPagoService $mercadoPago): RedirectResponse
    {
        $previousPlan = $tenant->plan;

        $tenant->update([
            'plan' => 'owner',
            'status' => 'active',
            'activated_at' => $tenant->activated_at ?? now(),
            'trial_ends_at' => null,
        ]);

        $activeSubscription = $tenant->subscriptions()->where('status', 'authorized')->latest()->first();

        if ($activeSubscription) {
            $mercadoPago->cancelSubscription($activeSubscription);
            $activeSubscription->update(['status' => 'cancelled']);
        }

        SuperadminAudit::log('tenant.assigned_owner', $tenant, [
            'previous_plan' => $previousPlan,
            'cancelled_subscription_id' => $activeSubscription?->id,
        ], 'Acceso ilimitado y permanente otorgado; suscripción de pago activa (si había) cancelada.');

        return back()->with('success', "\"{$tenant->name}\" tiene ahora acceso ilimitado y permanente.");
    }

    public function generateCheckout(Request $request, Tenant $tenant, MercadoPagoService $mercadoPago): RedirectResponse
    {
        $data = $request->validate([
            'plan_id' => ['required', 'exists:plans,id'],
        ]);

        $plan = Plan::findOrFail($data['plan_id']);

        if (! $plan->mp_plan_id) {
            return back()->with('error', "Publicá el plan \"{$plan->name}\" en MercadoPago primero desde la sección Planes.");
        }

        try {
            $checkoutUrl = $mercadoPago->getCheckoutUrl($tenant, $plan);
        } catch (\Throwable $e) {
            return back()->with('error', 'Error al generar checkout: '.$e->getMessage());
        }

        SuperadminAudit::log('tenant.checkout_generated', $tenant, ['plan' => $plan->slug]);

        return back()->with('success', "URL de checkout generada — enviá este link al cliente: {$checkoutUrl}");
    }

    public function storeUserMap(Request $request, Tenant $tenant): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255', 'unique:user_tenant_map,email'],
        ]);

        $tenant->userMaps()->create($data);

        SuperadminAudit::log('tenant.user_map_created', $tenant, ['email' => $data['email']]);

        return back()->with('success', 'Empleado mapeado a este tenant.');
    }

    public function destroyUserMap(Tenant $tenant, UserTenantMap $userMap): RedirectResponse
    {
        abort_unless($userMap->tenant_id === $tenant->id, 404);

        SuperadminAudit::log('tenant.user_map_deleted', $tenant, ['email' => $userMap->email]);

        $userMap->delete();

        return back()->with('success', 'Mapeo eliminado.');
    }
}
