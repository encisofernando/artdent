<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientesController extends Controller
{
    public function index(Request $request)
    {
        // TODO: listado real (paginado + búsqueda)
        return Inertia::render('Clientes/Index', [
            'customers' => [],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required','string','max:255'],
            'email' => ['nullable','email','max:255'],
            'phone' => ['nullable','string','max:50'],
        ]);

        return back()->with('success', 'Cliente creado (stub).');
    }

    public function update(Request $request, $customerId)
    {
        $request->validate([
            'name' => ['required','string','max:255'],
            'email' => ['nullable','email','max:255'],
            'phone' => ['nullable','string','max:50'],
        ]);

        return back()->with('success', 'Cliente actualizado (stub).');
    }
}
