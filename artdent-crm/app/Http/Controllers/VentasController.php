<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class VentasController extends Controller
{
    public function index(Request $request)
    {
        // TODO: listado real de ventas
        return Inertia::render('Ventas/Index', [
            'sales' => [],
        ]);
    }

    public function pos()
    {
        // POS (pantalla caja)
        return Inertia::render('Ventas/POS', [
            'catalog' => [],
        ]);
    }

    public function show($saleId)
    {
        // TODO: detalle venta real
        return Inertia::render('Ventas/Show', [
            'sale' => ['id' => (int)$saleId],
        ]);
    }

    public function store(Request $request)
    {
        // TODO: crear venta + items + recibo + movimientos de stock
        $request->validate([
            'customer_id' => ['nullable','integer'],
            'items' => ['required','array','min:1'],
            'items.*.product_id' => ['required','integer'],
            'items.*.qty' => ['required','numeric','min:0.0001'],
            'items.*.price' => ['required','numeric','min:0'],
            'payments' => ['nullable','array'],
        ]);

        return redirect()->route('ventas.index')->with('success', 'Venta registrada (stub).');
    }
}
