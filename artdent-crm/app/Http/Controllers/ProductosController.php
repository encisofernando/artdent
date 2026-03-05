<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductosController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->string('q')->toString();

        $products = Product::query()
            ->when($q, fn($query) => $query->where('name','like',"%{$q}%")->orWhere('sku','like',"%{$q}%"))
            ->orderBy('id', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Productos/Index', [
            'filters' => ['q' => $q],
            'products' => $products,
        ]);
    }

    public function create()
    {
        return Inertia::render('Productos/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'sku' => ['nullable','string','max:64'],
            'name' => ['required','string','max:255'],
            'price' => ['required','numeric','min:0'],
            'track_stock' => ['boolean'],
            'min_stock' => ['nullable','numeric','min:0'],
        ]);

        Product::create($data);

        return redirect()->route('productos.index')->with('success', 'Producto creado.');
    }

    public function edit(Product $product)
    {
        return Inertia::render('Productos/Edit', [
            'product' => $product,
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'sku' => ['nullable','string','max:64'],
            'name' => ['required','string','max:255'],
            'price' => ['required','numeric','min:0'],
            'track_stock' => ['boolean'],
            'min_stock' => ['nullable','numeric','min:0'],
        ]);

        $product->update($data);

        return redirect()->route('productos.index')->with('success', 'Producto actualizado.');
    }
}
