<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Company;
use App\Models\Stock;
use App\Services\PricingService;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    public function categories(Request $request)
    {
        $companyId = (int) ($request->query('company_id') ?? config('app.ecommerce_company_id', 1));

        $cats = Category::query()
            ->where('company_id', $companyId)
            ->orderBy('name')
            ->get();

        return response()->json($cats);
    }

    public function products(Request $request, PricingService $pricing)
    {
        $companyId = (int) ($request->query('company_id') ?? config('app.ecommerce_company_id', 1));
        $q = trim((string) $request->query('q', ''));
        $categoryId = $request->query('category_id');
        $perPage = (int) ($request->query('per_page') ?? 24);
        $perPage = max(1, min(60, $perPage));

        $query = Product::query()
            ->where('company_id', $companyId)
            ->where('is_active', 1)
            ->with(['primaryImage', 'category'])
            ->orderBy('name');

        if ($categoryId !== null && $categoryId !== '') {
            $query->where('category_id', (int) $categoryId);
        }

        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('sku', 'like', "%{$q}%")
                    ->orWhere('barcode', 'like', "%{$q}%");
            });
        }

        $paginator = $query->paginate($perPage);

        $company = Company::query()->find($companyId);
        $user = $request->user();

        // Obtener stock para todos los productos de la página
        $productIds = $paginator->pluck('id')->toArray();
        $stockTotals = Stock::whereIn('product_id', $productIds)
            ->where('company_id', $companyId)
            ->groupBy('product_id')
            ->selectRaw('product_id, SUM(qty) as total_stock')
            ->pluck('total_stock', 'product_id')
            ->toArray();

        $items = $paginator->getCollection()->map(function (Product $product) use ($pricing, $user, $company, $stockTotals) {
            $p = $pricing->priceFor($product, $user, $company);

            $primary = $product->primaryImage;

            // ✅ Formatear stock: convertir a entero si no tiene decimales
            $stockValue = $stockTotals[$product->id] ?? 0;
            $stock = (float) $stockValue == (int) $stockValue
                ? (int) $stockValue
                : (float) $stockValue;

            return [
                ...$product->toArray(),
                'pricing' => $p,
                'price_final' => $p['final'],
                'price_mode' => $p['mode'],
                'primary_image_url' => $primary ? $primary->url : null,
                'stock' => $stock, // ✅ Stock formateado (6 en lugar de 6.000)
            ];
        });

        $paginator->setCollection($items);

        return response()->json($paginator);
    }

    public function product(Request $request, Product $product, PricingService $pricing)
    {
        $companyId = (int) ($request->query('company_id') ?? config('app.ecommerce_company_id', 1));

        if ((int) $product->company_id !== $companyId || (int) $product->is_active !== 1) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        $company = Company::query()->find($companyId);
        $user = $request->user();
        $p = $pricing->priceFor($product, $user, $company);

        // Cargar galería y categoría
        $product->load(['images', 'category']);

        $images = $product->images->map(fn ($img) => [
            'id' => $img->id,
            'url' => $img->url,
            'alt' => $img->alt,
            'sort_order' => $img->sort_order,
            'is_primary' => (bool) $img->is_primary,
        ])->values();

        $primary = $product->images->firstWhere('is_primary', true) ?? $product->images->first();

        // Obtener stock total del producto
        $stockTotal = Stock::where('product_id', $product->id)
            ->where('company_id', $companyId)
            ->sum('qty');

        // ✅ Formatear stock: convertir a entero si no tiene decimales
        $stock = (float) $stockTotal == (int) $stockTotal
            ? (int) $stockTotal
            : (float) $stockTotal;

        return response()->json([
            ...$product->toArray(),
            'pricing' => $p,
            'price_final' => $p['final'],
            'price_mode' => $p['mode'],
            'primary_image_url' => $primary ? $primary->url : null,
            'images' => $images,
            'stock' => $stock, // ✅ Stock formateado (6 en lugar de 6.000)
        ]);
    }
}
