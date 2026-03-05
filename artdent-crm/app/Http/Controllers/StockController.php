<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class StockController extends Controller
{
    public function index(Request $request)
    {
        // TODO: listar stock consolidado + por depósito
        return Inertia::render('Stock/Index', [
            'items' => [],
        ]);
    }

    public function adjust(Request $request)
    {
        // TODO: registrar movimiento de ajuste (in/out) + auditoría
        $request->validate([
            'product_id' => ['required','integer'],
            'warehouse_id' => ['required','integer'],
            'qty' => ['required','numeric'],
            'note' => ['nullable','string','max:255'],
        ]);

        return back()->with('success', 'Ajuste registrado (stub).');
    }

    public function transfer(Request $request)
    {
        // TODO: transferencia entre depósitos
        $request->validate([
            'product_id' => ['required','integer'],
            'from_warehouse_id' => ['required','integer'],
            'to_warehouse_id' => ['required','integer'],
            'qty' => ['required','numeric','min:0.0001'],
        ]);

        return back()->with('success', 'Transferencia registrada (stub).');
    }
}
