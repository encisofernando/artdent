<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductBarcode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductBarcodeController extends Controller
{
    public function store(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'variant_id' => ['nullable', 'integer', Rule::exists('product_variants', 'id')->where('product_id', $product->id)],
            'barcode' => [
                'required', 'string', 'max:64',
                Rule::unique('product_barcodes', 'barcode'),
                Rule::unique('products', 'barcode'),
                Rule::unique('product_variants', 'barcode'),
            ],
            'label' => ['nullable', 'string', 'max:100'],
        ], [
            'barcode.unique' => 'Ese código de barras ya está en uso.',
        ]);

        ProductBarcode::create([
            'product_id' => $product->id,
            'variant_id' => $validated['variant_id'] ?? null,
            'barcode' => $validated['barcode'],
            'label' => $validated['label'] ?? null,
        ]);

        return back()->with('success', 'Código de barras agregado.');
    }

    public function destroy(ProductBarcode $productBarcode): RedirectResponse
    {
        $productBarcode->delete();

        return back()->with('success', 'Código de barras eliminado.');
    }
}
