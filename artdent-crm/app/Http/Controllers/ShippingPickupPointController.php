<?php

namespace App\Http\Controllers;

use App\Models\ShippingPickupPoint;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShippingPickupPointController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ShippingPickupPoint::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($request->input('status') === 'active') {
            $query->where('is_active', true);
        } elseif ($request->input('status') === 'inactive') {
            $query->where('is_active', false);
        }

        $items = $query->orderBy('name')->paginate(20)->withQueryString();

        return Inertia::render('ShippingPickupPoint/Index', [
            'items' => $items,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('ShippingPickupPoint/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'province' => 'required|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'phone' => 'nullable|string|max:30',
            'schedule' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'notes' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'accepts_cash_payment' => 'nullable|boolean',
        ]);

        ShippingPickupPoint::create($validated);

        return redirect()->route('shipping-pickup-points.index')
            ->with('success', 'Punto de retiro creado con éxito.');
    }

    public function edit(ShippingPickupPoint $shippingPickupPoint): Response
    {
        return Inertia::render('ShippingPickupPoint/Edit', ['item' => $shippingPickupPoint]);
    }

    public function update(Request $request, ShippingPickupPoint $shippingPickupPoint): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'province' => 'required|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'phone' => 'nullable|string|max:30',
            'schedule' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'notes' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'accepts_cash_payment' => 'nullable|boolean',
        ]);

        $shippingPickupPoint->update($validated);

        return redirect()->route('shipping-pickup-points.index')
            ->with('success', 'Punto de retiro actualizado.');
    }

    public function destroy(ShippingPickupPoint $shippingPickupPoint): RedirectResponse
    {
        $shippingPickupPoint->delete();

        return redirect()->route('shipping-pickup-points.index')
            ->with('success', 'Punto de retiro eliminado.');
    }
}
