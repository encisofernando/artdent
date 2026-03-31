<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = \App\Models\Customer::query();

        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('dni', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
        }

        $items = $query->paginate(15)->withQueryString();

        return Inertia::render('Customer/Index', [
            'items' => $items,
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Customer/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('customers', 'email')->whereNotNull('email')],
            'password' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:50', Rule::unique('customers', 'phone')->whereNotNull('phone')],
            'dni' => ['nullable', 'string', 'max:20', Rule::unique('customers', 'dni')->whereNotNull('dni')],
            'cuit' => ['nullable', 'string', 'max:20'],
            'iva_condition' => ['nullable', 'string', 'in:consumidor_final,responsable_inscripto,monotributista,exento'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'accepts_marketing' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ], [
            'email.unique' => 'Ya existe un cliente registrado con ese correo electrónico.',
            'phone.unique' => 'Ya existe un cliente registrado con ese número de teléfono.',
            'dni.unique' => 'Ya existe un cliente registrado con ese DNI.',
        ]);

        $customer = Customer::create($validated);

        if ($request->wantsJson()) {
            return response()->json(['customer' => $customer]);
        }

        return redirect()->route('customers.index')->with('success', 'Customer created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Customer $customer)
    {
        return Inertia::render('Customer/Edit', [
            'item' => $customer,
            'portalUrl' => $customer->portal_token
                ? route('customer.portal', $customer->portal_token)
                : null,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('customers', 'email')->ignore($customer->id)->whereNotNull('email')],
            'password' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:50', Rule::unique('customers', 'phone')->ignore($customer->id)->whereNotNull('phone')],
            'dni' => ['nullable', 'string', 'max:20', Rule::unique('customers', 'dni')->ignore($customer->id)->whereNotNull('dni')],
            'cuit' => ['nullable', 'string', 'max:20'],
            'iva_condition' => ['nullable', 'string', 'in:consumidor_final,responsable_inscripto,monotributista,exento'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'accepts_marketing' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ], [
            'email.unique' => 'Ya existe un cliente registrado con ese correo electrónico.',
            'phone.unique' => 'Ya existe un cliente registrado con ese número de teléfono.',
            'dni.unique' => 'Ya existe un cliente registrado con ese DNI.',
        ]);

        $customer->update($validated);

        return redirect()->route('customers.index')->with('success', 'Customer updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        $customer->delete();

        return redirect()->route('customers.index')->with('success', 'Customer deleted successfully.');
    }
}
