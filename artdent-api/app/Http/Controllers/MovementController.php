<?php

namespace App\Http\Controllers;

use App\Models\Movement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MovementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'client_id'  => 'required|exists:clinics,id',
        ]);

        $rows = Movement::query()
            ->where('company_id', $validated['company_id'])
            ->where('client_id',  $validated['client_id'])
            ->orderBy('date')
            ->orderBy('id')
            ->get();

        // Formato que espera tu DataGrid: debit/credit/balance
        $balance = 0;
        $out = $rows->map(function ($m) use (&$balance) {
            $amount = (float)$m->amount;

            $debit  = $m->type === 'charge'  ? $amount : 0; // Debe
            $credit = $m->type === 'payment' ? $amount : 0; // Haber

            // saldo = Haber - Debe acumulado
            $balance += ($credit - $debit);

            return [
                'id'          => $m->id,
                'date'        => $m->date?->format('Y-m-d'),
                'type'        => $m->type === 'payment' ? 'Pago' : 'Cargo',
                'description' => $m->description,
                'reference'   => $m->reference,
                'debit'       => $debit,
                'credit'      => $credit,
                'balance'     => $balance,
            ];
        });

        return response()->json($out);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id'   => 'required|exists:companies,id',
            'client_id'    => 'required|exists:clinics,id',
            'date'         => 'required|date',
            'type'         => 'required|in:payment,charge',
            'amount'       => 'required|numeric|min:0.01',
            'description'  => 'nullable|string',
            'method'       => 'nullable|string',
            'reference'    => 'nullable|string',
            'job_id'       => 'nullable|exists:jobs,id',
        ]);

        $m = Movement::create($validated);

        return response()->json($m, 201);
    }
}
