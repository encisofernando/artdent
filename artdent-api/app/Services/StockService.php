<?php

namespace App\Services;

use App\Models\Stock;
use App\Models\StockMovement;

class StockService {
    public function moveOut($companyId,$warehouseId,$productId,$qty,$refType,$refId){
        $stock = Stock::firstOrCreate([
            'company_id'=>$companyId,
            'warehouse_id'=>$warehouseId,
            'product_id'=>$productId
        ],['qty'=>0]);
        if($stock->qty < $qty){
            throw new \Exception('Stock insuficiente');
        }
        $stock->decrement('qty',$qty);
        StockMovement::create([
            'company_id'=>$companyId,
            'warehouse_id'=>$warehouseId,
            'product_id'=>$productId,
            'movement_date'=>now(),
            'type'=>'out',
            'qty'=>$qty,
            'reference_type'=>$refType,
            'reference_id'=>$refId
        ]);
    }

    public function moveIn($companyId,$warehouseId,$productId,$qty,$refType,$refId){
        $stock = Stock::firstOrCreate([
            'company_id'=>$companyId,
            'warehouse_id'=>$warehouseId,
            'product_id'=>$productId
        ],['qty'=>0]);
        $stock->increment('qty',$qty);
        StockMovement::create([
            'company_id'=>$companyId,
            'warehouse_id'=>$warehouseId,
            'product_id'=>$productId,
            'movement_date'=>now(),
            'type'=>'in',
            'qty'=>$qty,
            'reference_type'=>$refType,
            'reference_id'=>$refId
        ]);
    }
}
