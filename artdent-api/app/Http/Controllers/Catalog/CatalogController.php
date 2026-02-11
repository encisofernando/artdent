<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Company;
use App\Services\PricingService;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    public function categories(Request $request)
    {
        $companyId = (int) ($request->query('company_id') ?? env('ECOMMERCE_COMPANY_ID', 1));

        $cats = Category::query()
            ->where('company_id', $companyId)
            ->orderBy('name')
            ->get();

        return response()->json($cats);
    }

    public function products(Request $request, PricingService $pricing)
    {
        $companyId = (int) ($request->query('company_id') ?? env('ECOMMERCE_COMPANY_ID', 1));
        $q = trim((string) $request->query('q', ''));
        $categoryId = $request->query('category_id');
        $perPage = (int) ($request->query('per_page') ?? 24);
        $perPage = max(1, min(60, $perPage));

        $query = Product::query()
            ->where('company_id', $companyId)
            ->where('is_active', 1)
            ->with(['primaryImage'])
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

        $items = $paginator->getCollection()->map(function (Product $product) use ($pricing, $user, $company) {
            $p = $pricing->priceFor($product, $user, $company);

            $primary = $product->primaryImage;

            return [
                ...$product->toArray(),
                'pricing' => $p,
                'price_final' => $p['final'],
                'price_mode' => $p['mode'],
                'primary_image_url' => $primary ? $primary->url : null,
            ];
        });

        $paginator->setCollection($items);

        return response()->json($paginator);
    }

    public function product(Request $request, Product $product, PricingService $pricing)
    {
        $companyId = (int) ($request->query('company_id') ?? env('ECOMMERCE_COMPANY_ID', 1));

        if ((int) $product->company_id !== $companyId || (int) $product->is_active !== 1) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        $company = Company::query()->find($companyId);
        $user = $request->user();
        $p = $pricing->priceFor($product, $user, $company);

        // Cargar galería
        $product->load(['images']);

        $images = $product->images->map(fn ($img) => [
            'id' => $img->id,
            'url' => $img->url,
            'alt' => $img->alt,
            'sort_order' => $img->sort_order,
            'is_primary' => (bool) $img->is_primary,
        ])->values();

        $primary = $product->images->firstWhere('is_primary', true) ?? $product->images->first();

        return response()->json([
            ...$product->toArray(),
            'pricing' => $p,
            'price_final' => $p['final'],
            'price_mode' => $p['mode'],
            'primary_image_url' => $primary ? $primary->url : null,
            'images' => $images,
        ]);
    }
}
