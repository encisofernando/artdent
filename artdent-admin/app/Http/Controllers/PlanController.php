<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\Plan;
use App\Services\MercadoPagoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Plans/Index', [
            'plans' => Plan::withCount('subscriptions')->orderBy('price')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Plans/Create', [
            'modules' => Module::orderBy('name')->get(['id', 'slug', 'name', 'icon']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        $plan = Plan::create($data);
        $plan->modules()->sync($request->input('module_ids', []));

        return redirect()->route('plans.index')->with('success', "Plan \"{$plan->name}\" creado.");
    }

    public function toggleActive(Plan $plan): RedirectResponse
    {
        $plan->update(['is_active' => ! $plan->is_active]);

        return back()->with('success', $plan->is_active ? "Plan \"{$plan->name}\" activado." : "Plan \"{$plan->name}\" desactivado.");
    }

    public function edit(Plan $plan): Response
    {
        $plan->load('modules:id');

        return Inertia::render('Plans/Edit', [
            'plan' => $plan,
            'moduleIds' => $plan->modules->pluck('id'),
            'modules' => Module::orderBy('name')->get(['id', 'slug', 'name', 'icon']),
        ]);
    }

    public function update(Request $request, Plan $plan): RedirectResponse
    {
        $data = $this->validated($request, $plan);

        $plan->update($data);

        if ($request->has('module_ids')) {
            $plan->modules()->sync($request->input('module_ids', []));
        }

        return redirect()->route('plans.index')->with('success', "Plan \"{$plan->name}\" actualizado.");
    }

    public function destroy(Plan $plan): RedirectResponse
    {
        $plan->delete();

        return redirect()->route('plans.index')->with('success', 'Plan eliminado.');
    }

    public function publishToMp(Plan $plan, MercadoPagoService $mercadoPago): RedirectResponse
    {
        if ($plan->mp_plan_id) {
            return back()->with('error', 'Este plan ya está publicado en MercadoPago.');
        }

        if (! $plan->is_public) {
            return back()->with('error', 'Sólo los planes públicos pueden publicarse en MercadoPago.');
        }

        try {
            $mercadoPago->createPlan($plan);
        } catch (\Throwable $e) {
            return back()->with('error', 'Error al publicar en MP: '.$e->getMessage());
        }

        return back()->with('success', "Plan publicado en MercadoPago — ID: {$plan->fresh()->mp_plan_id}");
    }

    public function syncMp(Plan $plan, MercadoPagoService $mercadoPago): RedirectResponse
    {
        try {
            $mercadoPago->updatePlan($plan);
        } catch (\Throwable $e) {
            return back()->with('error', 'Error de sincronización: '.$e->getMessage());
        }

        return back()->with('success', 'Plan sincronizado con MercadoPago.');
    }

    private function validated(Request $request, ?Plan $plan = null): array
    {
        $data = $request->validate([
            'slug' => ['required', 'string', 'max:50', 'alpha_dash', Rule::unique('plans', 'slug')->ignore($plan)],
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'trial_days' => ['required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'is_public' => ['boolean'],
            'max_users' => ['nullable', 'integer', 'min:0'],
            'max_products' => ['nullable', 'integer', 'min:0'],
            'max_sales_per_month' => ['nullable', 'integer', 'min:0'],
            'max_chat_messages_per_month' => ['nullable', 'integer', 'min:0'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string'],
        ]);

        $data['is_active'] = $request->boolean('is_active');
        $data['is_public'] = $request->boolean('is_public');

        return $data;
    }
}
