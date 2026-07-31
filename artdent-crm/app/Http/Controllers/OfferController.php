<?php

namespace App\Http\Controllers;

use App\Models\Offer;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OfferController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = $request->user()->company_id;

        $items = Offer::query()
            ->where('company_id', $companyId)
            ->withCount('products')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Offer/Index', [
            'items' => $items,
        ]);
    }

    public function create(): Response
    {
        $products = Product::query()
            ->where('company_id', auth()->user()->company_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'sku']);

        return Inertia::render('Offer/Create', [
            'products' => $products,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:discount_percent,discount_fixed,combo,installments'],
            'value' => ['nullable', 'numeric'],
            'badge_text' => ['nullable', 'string', 'max:100'],
            'badge_color' => ['required', 'in:red,orange,green,blue,purple'],
            'description' => ['nullable', 'string'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date'],
            'is_active' => ['boolean'],
            'product_ids' => ['nullable', 'array'],
            'product_ids.*' => ['integer'],
        ]);

        $offer = Offer::create([
            'company_id' => $request->user()->company_id,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'value' => $validated['value'] ?? null,
            'badge_text' => $validated['badge_text'] ?? null,
            'badge_color' => $validated['badge_color'],
            'description' => $validated['description'] ?? null,
            'starts_at' => $validated['starts_at'] ?? null,
            'ends_at' => $validated['ends_at'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $offer->products()->sync($validated['product_ids'] ?? []);

        return redirect()->route('offers.index')->with('success', 'Oferta creada con éxito.');
    }

    public function edit(Offer $offer): Response
    {
        $offer->load('products:id');

        $products = Product::query()
            ->where('company_id', auth()->user()->company_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'sku']);

        return Inertia::render('Offer/Edit', [
            'item' => array_merge($offer->toArray(), [
                'product_ids' => $offer->products->pluck('id')->values()->all(),
            ]),
            'products' => $products,
        ]);
    }

    public function update(Request $request, Offer $offer): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:discount_percent,discount_fixed,combo,installments'],
            'value' => ['nullable', 'numeric'],
            'badge_text' => ['nullable', 'string', 'max:100'],
            'badge_color' => ['required', 'in:red,orange,green,blue,purple'],
            'description' => ['nullable', 'string'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date'],
            'is_active' => ['boolean'],
            'product_ids' => ['nullable', 'array'],
            'product_ids.*' => ['integer'],
        ]);

        $offer->update([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'value' => $validated['value'] ?? null,
            'badge_text' => $validated['badge_text'] ?? null,
            'badge_color' => $validated['badge_color'],
            'description' => $validated['description'] ?? null,
            'starts_at' => $validated['starts_at'] ?? null,
            'ends_at' => $validated['ends_at'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $offer->products()->sync($validated['product_ids'] ?? []);

        return redirect()->route('offers.index')->with('success', 'Oferta actualizada con éxito.');
    }

    public function destroy(Offer $offer): RedirectResponse
    {
        $offer->delete();

        return redirect()->route('offers.index')->with('success', 'Oferta eliminada.');
    }
}
