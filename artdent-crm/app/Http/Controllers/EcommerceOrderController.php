<?php

namespace App\Http\Controllers;

use App\Models\EcommerceOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EcommerceOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
        public function index()
    {
        $items = \App\Models\EcommerceOrder::paginate(10);
        return Inertia::render('EcommerceOrder/Index', [
            'items' => $items
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
        public function create()
    {
        return Inertia::render('EcommerceOrder/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
        public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'nullable',
            'customer_id' => 'nullable',
            'coupon_id' => 'nullable',
            'shipping_method_id' => 'nullable',
            'order_number' => 'nullable',
            'status' => 'nullable',
            'payment_status' => 'nullable',
            'subtotal' => 'nullable',
            'discount_amount' => 'nullable',
            'shipping_cost' => 'nullable',
            'tax_amount' => 'nullable',
            'total' => 'nullable',
            'shipping_name' => 'nullable',
            'shipping_address' => 'nullable',
            'shipping_city' => 'nullable',
            'shipping_province' => 'nullable',
            'shipping_postal' => 'nullable',
            'shipping_phone' => 'nullable',
            'customer_notes' => 'nullable',
            'admin_notes' => 'nullable'
        ]);

        \App\Models\EcommerceOrder::create($validated);

        return redirect()->route('ecommerce-orders.index')->with('success', 'EcommerceOrder created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(EcommerceOrder $ecommerceOrder)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
        public function edit(EcommerceOrder $ecommerceOrder)
    {
        return Inertia::render('EcommerceOrder/Edit', [
            'item' => $ecommerceOrder
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
        public function update(Request $request, EcommerceOrder $ecommerceOrder)
    {
        $validated = $request->validate([
            'company_id' => 'nullable',
            'customer_id' => 'nullable',
            'coupon_id' => 'nullable',
            'shipping_method_id' => 'nullable',
            'order_number' => 'nullable',
            'status' => 'nullable',
            'payment_status' => 'nullable',
            'subtotal' => 'nullable',
            'discount_amount' => 'nullable',
            'shipping_cost' => 'nullable',
            'tax_amount' => 'nullable',
            'total' => 'nullable',
            'shipping_name' => 'nullable',
            'shipping_address' => 'nullable',
            'shipping_city' => 'nullable',
            'shipping_province' => 'nullable',
            'shipping_postal' => 'nullable',
            'shipping_phone' => 'nullable',
            'customer_notes' => 'nullable',
            'admin_notes' => 'nullable'
        ]);

        $ecommerceOrder->update($validated);

        return redirect()->route('ecommerce-orders.index')->with('success', 'EcommerceOrder updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
        public function destroy(EcommerceOrder $ecommerceOrder)
    {
        $ecommerceOrder->delete();
        return redirect()->route('ecommerce-orders.index')->with('success', 'EcommerceOrder deleted successfully.');
    }
}
