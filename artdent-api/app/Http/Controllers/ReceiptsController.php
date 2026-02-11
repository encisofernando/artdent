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
            // opcional, si querés forzar una fecha distinta
            'receipt_date'=>'sometimes|nullable|date',
        ]);

        $data['company_id']=$cid;
        // `receipts.receipt_date` es NOT NULL en la DB
        $data['receipt_date'] = $data['receipt_date'] ?? now();

        // 1) Insert
        $id = DB::table('receipts')->insertGetId($data);

        // 2) Generar y persistir número de comprobante
        // Formato ejemplo: 0001-00000042
        $receiptNumber = '0001-' . str_pad((string)$id, 8, '0', STR_PAD_LEFT);
        // Guardar en DB (requiere columna receipt_number)
        try {
            DB::table('receipts')->where('id', $id)->update(['receipt_number' => $receiptNumber]);
        } catch (\Throwable $e) {
            // Si todavía no corrieron la migración, igual devolvemos el número para que el front lo muestre.
        }

        $receipt = (array) DB::table('receipts')->where('id',$id)->first();
        $receipt['receipt_number'] = $receipt['receipt_number'] ?? $receiptNumber;

        return response()->json($receipt,201);
    }
}
