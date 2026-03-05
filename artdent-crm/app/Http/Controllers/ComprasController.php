<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ComprasController extends Controller
{
    public function index()
    {
        // TODO: listado real de compras
        return Inertia::render('Compras/Index', [
            'purchases' => [],
        ]);
    }

    public function store(Request $request)
    {
        // TODO: crear compra + movimientos de stock
        $request->validate([
            'supplier_id' => ['nullable','integer'],
            'items' => ['required','array','min:1'],
            'items.*.product_id' => ['required','integer'],
            'items.*.qty' => ['required','numeric','min:0.0001'],
            'items.*.cost' => ['required','numeric','min:0'],
        ]);

        return back()->with('success', 'Compra registrada (stub).');
    }
}
