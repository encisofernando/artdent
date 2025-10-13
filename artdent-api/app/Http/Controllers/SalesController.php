<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Services\StockService;

class SalesController extends Controller
{
    public function store(Request $r, StockService $stock){
        $cid = $r->user()->company_id;
        $data = $r->validate([
            'warehouse_id'=>'required|integer',
            'customer_id'=>'nullable|integer',
            'items'=>'required|array|min:1',
            'items.*.product_id'=>'required|integer',
            'items.*.qty'=>'required|numeric|min:0.001',
            'items.*.unit_price'=>'required|numeric|min:0',
        ]);

        $sale = DB::transaction(function() use($cid,$data,$stock,$r){
            $sale = Sale::create([
                'company_id'=>$cid,
                'warehouse_id'=>$data['warehouse_id'],
                'cashier_id'=>$r->user()->id,
                'sale_date'=>now(),
                'status'=>'confirmed'
            ]);
            $subtotal = 0;
            foreach($data['items'] as $it){
                $line = $it['qty'] * $it['unit_price'];
                $subtotal += $line;
                $si = SaleItem::create([
                    'sale_id'=>$sale->id,
                    'product_id'=>$it['product_id'],
                    'qty'=>$it['qty'],
                    'unit_price'=>$it['unit_price'],
                    'line_total'=>$line
                ]);
                $stock->moveOut($cid,$data['warehouse_id'],$it['product_id'],$it['qty'],'sale_item',$si->id);
            }
            $sale->update(['subtotal'=>$subtotal,'tax_total'=>0,'total'=>$subtotal]);
            return $sale;
        });

        return $sale->load('items');
    }

    public function show(Request $r, Sale $sale){
        $cid = $r->user()->company_id;
        abort_unless($sale->company_id == $cid, 403, 'Forbidden');
        return $sale->load('items');
    }
}
