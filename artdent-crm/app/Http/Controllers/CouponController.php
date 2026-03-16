<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CouponController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status', 'all');
        $type = $request->input('type', 'all');

        $query = Coupon::query()->withCount('coupon_usages');

        if ($search) {
            $query->where('code', 'like', "%{$search}%");
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        if ($type === 'fixed') {
            $query->where('type', 'fixed');
        } elseif ($type === 'percent') {
            $query->where('type', 'percent');
        }

        $items = $query->orderBy('id', 'desc')->paginate(20)->withQueryString();

        return Inertia::render('Coupon/Index', [
            'items' => $items,
            'filters' => compact('search', 'status', 'type'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Coupon/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:64|unique:coupons,code',
            'type' => 'required|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'max_uses_per_customer' => 'nullable|integer|min:1',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after_or_equal:valid_from',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['code'] = Str::upper(trim($validated['code']));
        $validated['used_count'] = 0;

        Coupon::create($validated);

        return redirect()->route('coupons.index')->with('success', 'Cupón creado con éxito.');
    }

    public function edit(Coupon $coupon)
    {
        return Inertia::render('Coupon/Edit', ['item' => $coupon]);
    }

    public function update(Request $request, Coupon $coupon)
    {
        $validated = $request->validate([
            'code' => "required|string|max:64|unique:coupons,code,{$coupon->id}",
            'type' => 'required|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'max_uses_per_customer' => 'nullable|integer|min:1',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after_or_equal:valid_from',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['code'] = Str::upper(trim($validated['code']));

        $coupon->update($validated);

        return redirect()->route('coupons.index')->with('success', 'Cupón actualizado con éxito.');
    }

    public function destroy(Coupon $coupon)
    {
        $coupon->delete();

        return redirect()->route('coupons.index')->with('success', 'Cupón eliminado.');
    }
}
