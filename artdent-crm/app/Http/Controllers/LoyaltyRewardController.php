<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\LoyaltyReward;
use App\Services\LoyaltyService;
use App\Support\CompanyContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Catálogo de recompensas canjeables por puntos (Sistema → Administración →
 * Recompensas de Puntos) — a diferencia de LoyaltySettings (singleton por
 * empresa), acá hay varias filas reales por empresa.
 */
class LoyaltyRewardController extends Controller
{
    public function index(Request $request): Response
    {
        $query = LoyaltyReward::where('company_id', CompanyContext::id());

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->input('status') === 'active') {
            $query->where('is_active', true);
        } elseif ($request->input('status') === 'inactive') {
            $query->where('is_active', false);
        }

        $items = $query->orderBy('points_cost')->paginate(20)->withQueryString();

        return Inertia::render('LoyaltyReward/Index', [
            'items' => $items,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('LoyaltyReward/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'points_cost' => 'required|integer|min:1',
            'discount_amount' => 'required|numeric|min:0.01',
            'is_active' => 'nullable|boolean',
        ]);

        LoyaltyReward::create([...$validated, 'company_id' => CompanyContext::id()]);

        return redirect()->route('loyalty-rewards.index')
            ->with('success', 'Recompensa creada con éxito.');
    }

    public function edit(LoyaltyReward $loyaltyReward): Response
    {
        $this->authorizeReward($loyaltyReward);

        return Inertia::render('LoyaltyReward/Edit', ['item' => $loyaltyReward]);
    }

    public function update(Request $request, LoyaltyReward $loyaltyReward): RedirectResponse
    {
        $this->authorizeReward($loyaltyReward);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'points_cost' => 'required|integer|min:1',
            'discount_amount' => 'required|numeric|min:0.01',
            'is_active' => 'nullable|boolean',
        ]);

        $loyaltyReward->update($validated);

        return redirect()->route('loyalty-rewards.index')
            ->with('success', 'Recompensa actualizada.');
    }

    public function destroy(LoyaltyReward $loyaltyReward): RedirectResponse
    {
        $this->authorizeReward($loyaltyReward);

        $loyaltyReward->delete();

        return redirect()->route('loyalty-rewards.index')
            ->with('success', 'Recompensa eliminada.');
    }

    /**
     * Recompensas activas que un cliente puede pagar con su saldo actual —
     * consumido por el selector de "Puntos" como medio de pago en el POS
     * (Sale/Create.jsx).
     */
    public function forCustomer(Customer $customer, LoyaltyService $loyalty): JsonResponse
    {
        $rewards = LoyaltyReward::where('company_id', CompanyContext::id())
            ->where('is_active', true)
            ->orderBy('points_cost')
            ->get(['id', 'name', 'points_cost', 'discount_amount']);

        return response()->json([
            'balance' => $loyalty->balanceFor($customer),
            'rewards' => $rewards,
        ]);
    }

    private function authorizeReward(LoyaltyReward $reward): void
    {
        if ($reward->company_id !== CompanyContext::id()) {
            throw new NotFoundHttpException;
        }
    }
}
