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
                  ->orWhere('sku','like',"%$search%")
                  ->orWhere('barcode','like',"%$search%");
            });
        }
        if($r->filled('category_id')){
            $q->where('category_id', $r->integer('category_id'));
        }
        if($r->filled('is_active')){
            $q->where('is_active', filter_var($r->get('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = min(max((int)($r->get('per_page') ?? 25), 1), 100);
        return $q->orderBy('id','desc')->paginate($perPage);
    }

    public function store(Request $r){
        $cid = $r->user()->company_id ?? null;
        $data = $r->validate([
            'name'        => 'required|string|max:191',
            'sku'         => 'nullable|string|max:64',
            'barcode'     => 'nullable|string|max:64',
            'description' => 'nullable|string',
            'unit'        => 'nullable|string|max:16',
            'category_id' => 'nullable|integer',
            'vendor_id'   => 'nullable|integer',
            'cost'        => 'nullable|numeric|min:0',
            'price'       => 'required|numeric|min:0',
            'tax_rate'    => 'nullable|numeric|min:0',
            'tax_id'      => 'nullable|integer',
            'is_active'   => 'nullable|boolean',
            'track_stock' => 'nullable|boolean',
            'min_stock'   => 'nullable|integer|min:0',
        ]);
        $data['company_id'] = $cid;

        // Defaults coherentes con la tabla
        $data['cost'] = $data['cost'] ?? 0;
        $data['tax_rate'] = $data['tax_rate'] ?? 0;
        $data['is_active'] = array_key_exists('is_active', $data) ? (bool)$data['is_active'] : true;
        $data['track_stock'] = array_key_exists('track_stock', $data) ? (bool)$data['track_stock'] : true;
        $data['min_stock'] = $data['min_stock'] ?? 0;

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
            'name'        => 'sometimes|string|max:191',
            'sku'         => 'sometimes|nullable|string|max:64',
            'barcode'     => 'sometimes|nullable|string|max:64',
            'description' => 'sometimes|nullable|string',
            'unit'        => 'sometimes|nullable|string|max:16',
            'category_id' => 'sometimes|nullable|integer',
            'vendor_id'   => 'sometimes|nullable|integer',
            'cost'        => 'sometimes|nullable|numeric|min:0',
            'price'       => 'sometimes|numeric|min:0',
            'tax_rate'    => 'sometimes|nullable|numeric|min:0',
            'tax_id'      => 'sometimes|nullable|integer',
            'is_active'   => 'sometimes|boolean',
            'track_stock' => 'sometimes|boolean',
            'min_stock'   => 'sometimes|integer|min:0',
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
