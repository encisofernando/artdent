<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Services\StockService;

class PurchasesController extends Controller
{
    public function store(Request $r, StockService $stock){
        $cid = $r->user()->company_id;
        $data = $r->validate([
            'warehouse_id'=>'required|integer',
            'supplier_id'=>'nullable|integer',
            'invoice_number'=>'nullable|string|max:64',
            'purchase_date'=>'nullable|date',
            'items'=>'required|array|min:1',
            'items.*.product_id'=>'required|integer',
            'items.*.qty'=>'required|numeric|min:0.001',
            'items.*.unit_cost'=>'required|numeric|min:0',
        ]);

        $purchase = DB::transaction(function() use($cid,$data,$stock){
            $purchase = Purchase::create([
                'company_id'=>$cid,
                'warehouse_id'=>$data['warehouse_id'],
                'supplier_id'=>$data['supplier_id'] ?? null,
                'invoice_number'=>$data['invoice_number'] ?? null,
                'purchase_date'=>$data['purchase_date'] ?? now(),
                'status'=>'confirmed'
            ]);
            $subtotal = 0;
            foreach($data['items'] as $it){
                $line = $it['qty'] * $it['unit_cost'];
                $subtotal += $line;
                $pi = PurchaseItem::create([
                    'purchase_id'=>$purchase->id,
                    'product_id'=>$it['product_id'],
                    'qty'=>$it['qty'],
                    'unit_cost'=>$it['unit_cost'],
                    'line_total'=>$line
                ]);
                $stock->moveIn($cid,$data['warehouse_id'],$it['product_id'],$it['qty'],'purchase_item',$pi->id);
            }
            $purchase->update(['subtotal'=>$subtotal,'tax_total'=>0,'total'=>$subtotal]);
            return $purchase;
        });

        return $purchase->load('items');
    }

    public function show(Request $r, Purchase $purchase){
        $cid = $r->user()->company_id;
        abort_unless($purchase->company_id == $cid, 403, 'Forbidden');
        return $purchase->load('items');
    }
}
