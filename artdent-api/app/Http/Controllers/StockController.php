<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Stock;
use App\Models\Product;

class StockController extends Controller
{
    /**
     * Resumen de stock por producto (total). Útil para alertas de bajo stock.
     */
    public function low(Request $r){
        $cid = $r->user()->company_id ?? null;
        $min = (int)($r->get('min') ?? 1);
        $q = Stock::query();
        if($cid){ $q->where('company_id',$cid); }
        $q->select('product_id')
          ->selectRaw('SUM(qty) as qty_total')
          ->groupBy('product_id')
          ->havingRaw('SUM(qty) <= ?', [$min]);
        return $q->with('product')->get();
    }

    /**
     * Alias para mantener compatibilidad con el frontend (/products/{product}/stock).
     */
    public function productStock(Request $r, Product $product)
    {
        return $this->byProduct($r, $product);
    }

    /**
     * Resumen por almacén y producto.
     */
    public function summary(Request $r)
    {
        $cid = $r->user()->company_id ?? null;
        abort_unless($cid, 403, 'Forbidden');

        return Stock::query()
            ->where('company_id', $cid)
            ->get(['product_id', 'warehouse_id', 'qty']);
    }

    public function byProduct(Request $r, Product $product){
        $cid = $r->user()->company_id ?? null;
        abort_unless($cid && $product->company_id == $cid, 403, 'Forbidden');
        return Stock::where('company_id',$cid)->where('product_id',$product->id)->get();
    }
}
