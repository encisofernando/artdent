<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReceiptsController extends Controller
{
    public function index(Request $r){
        $cid=$r->user()->company_id;
        return DB::table('receipts')->where('company_id',$cid)->orderBy('id','desc')->paginate(25);
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
        $id=DB::table('receipts')->insertGetId($data);
        $receipt = (array) DB::table('receipts')->where('id',$id)->first();
        // Numeración simple, estable y sin migraciones: usar el ID como correlativo.
        // Formato ejemplo: 0001-00000042
        $receipt['receipt_number'] = '0001-' . str_pad((string)$id, 8, '0', STR_PAD_LEFT);
        return response()->json($receipt,201);
    }
}
