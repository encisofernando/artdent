<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

class ProductsController extends Controller
{
    public function index(Request $r){
        $cid = $r->user()->company_id ?? null;
        $q = Product::query();
        if($cid){ $q->where('company_id',$cid); }
        if($search = $r->get('q')){
            $q->where(function($w) use($search){
                $w->where('name','like',"%$search%")
                  ->orWhere('sku','like',"%$search%");
            });
        }
        return $q->orderBy('id','desc')->paginate(25);
    }

    public function store(Request $r){
        $cid = $r->user()->company_id ?? null;
        $data = $r->validate([
            'name'=>'required|string|max:191',
            'sku'=>'nullable|string|max:64',
            'price'=>'required|numeric|min:0',
            'tax_rate'=>'nullable|numeric|min:0',
        ]);
        $data['company_id'] = $cid;
        $product = Product::create($data);
        return response()->json($product,201);
    }

    public function show(Request $r, Product $product){
        $this->authorizeProduct($r,$product);
        return $product;
    }

    public function update(Request $r, Product $product){
        $this->authorizeProduct($r,$product);
        $data = $r->validate([
            'name'=>'sometimes|string|max:191',
            'sku'=>'sometimes|nullable|string|max:64',
            'price'=>'sometimes|numeric|min:0',
            'tax_rate'=>'sometimes|numeric|min:0',
        ]);
        $product->update($data);
        return $product;
    }

    public function destroy(Request $r, Product $product){
        $this->authorizeProduct($r,$product);
        $product->delete();
        return response()->noContent();
    }

    protected function authorizeProduct(Request $r, Product $product){
        $cid = $r->user()->company_id ?? null;
        abort_unless($cid && $product->company_id == $cid, 403, 'Forbidden');
    }
}
