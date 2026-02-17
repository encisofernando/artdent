<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReceiptsController extends Controller
{
    public function index(Request $r){
        $cid=$r->user()->company_id;
        return DB::table('receipts')
            ->where('company_id',$cid)
            ->orderBy('id','desc')
            ->paginate(25);
    }

    public function store(Request $r){
        $cid=$r->user()->company_id;
        $data=$r->validate([
            'sale_id'=>'sometimes|nullable|integer',
            'payment_method_id'=>'required|integer',
            'amount'=>'required|numeric',
            'reference'=>'sometimes|nullable|string|max:191',
            'receipt_date'=>'sometimes|nullable|date',
        ]);

        $data['company_id']=$cid;
        $data['receipt_date'] = $data['receipt_date'] ?? now();

        // 1) Insert
        $id = DB::table('receipts')->insertGetId($data);

        // 2) Generar y persistir número de comprobante
        // Formato: 00001-00000001 (ptoVta 5 dígitos - correlativo 8 dígitos)
        $ptoVta = 1;

        if (!empty($data['sale_id'])) {
            $saleNumber = DB::table('sales')->where('id', $data['sale_id'])->value('number');
            if (is_string($saleNumber) && str_contains($saleNumber, '-')) {
                $parts = explode('-', $saleNumber);
                $ptoVta = (int) ($parts[0] ?? 1);
            }
        }

        $receiptNumber = sprintf('%05d-%08d', $ptoVta, (int)$id);

        // Guardar en DB (requiere columna receipt_number)
        try {
            DB::table('receipts')->where('id', $id)->update(['receipt_number' => $receiptNumber]);
        } catch (\Throwable $e) {
            // Si todavía no existe la columna, igual devolvemos el número para el front.
        }

        $receipt = (array) DB::table('receipts')->where('id',$id)->first();
        $receipt['receipt_number'] = $receipt['receipt_number'] ?? $receiptNumber;

        return response()->json($receipt,201);
    }
}
