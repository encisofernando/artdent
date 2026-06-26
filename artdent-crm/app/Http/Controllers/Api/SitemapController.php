<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    private const SHOP_URL = 'https://shop.artdent.com.ar';

    public function index(Request $request): Response
    {
        $companyId = 1;

        $products = Product::query()
            ->where('company_id', $companyId)
            ->where('is_active', true)
            ->select('id', 'name', 'slug', 'updated_at')
            ->orderByDesc('updated_at')
            ->get();

        $categories = Category::query()
            ->where('is_active', true)
            ->select('id', 'slug', 'updated_at')
            ->get();

        $staticPages = [
            ['loc' => '/',             'changefreq' => 'daily',   'priority' => '1.0'],
            ['loc' => '/productos',    'changefreq' => 'daily',   'priority' => '0.9'],
            ['loc' => '/nosotros',     'changefreq' => 'monthly', 'priority' => '0.5'],
            ['loc' => '/contacto',     'changefreq' => 'monthly', 'priority' => '0.5'],
            ['loc' => '/devoluciones', 'changefreq' => 'monthly', 'priority' => '0.3'],
            ['loc' => '/terminos',     'changefreq' => 'monthly', 'priority' => '0.3'],
            ['loc' => '/privacidad',   'changefreq' => 'monthly', 'priority' => '0.3'],
        ];

        $xml = $this->buildXml($staticPages, $products, $categories);

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    /**
     * @param  array<int, array<string, string>>  $staticPages
     * @param  \Illuminate\Database\Eloquent\Collection<int, Product>  $products
     * @param  \Illuminate\Database\Eloquent\Collection<int, Category>  $categories
     */
    private function buildXml(array $staticPages, $products, $categories): string
    {
        $lines = [];
        $lines[] = '<?xml version="1.0" encoding="UTF-8"?>';
        $lines[] = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Static pages
        foreach ($staticPages as $page) {
            $lines[] = $this->urlEntry(
                self::SHOP_URL.$page['loc'],
                Carbon::now()->toDateString(),
                $page['changefreq'],
                $page['priority'],
            );
        }

        // Category pages
        foreach ($categories as $cat) {
            $lines[] = $this->urlEntry(
                self::SHOP_URL.'/productos?cat='.$cat->id,
                $cat->updated_at?->toDateString() ?? Carbon::now()->toDateString(),
                'weekly',
                '0.7',
            );
        }

        // Product pages
        foreach ($products as $product) {
            $slug = $this->productSlug($product->id, $product->name);
            $lines[] = $this->urlEntry(
                self::SHOP_URL.'/productos/'.$slug,
                $product->updated_at?->toDateString() ?? Carbon::now()->toDateString(),
                'weekly',
                '0.8',
            );
        }

        $lines[] = '</urlset>';

        return implode("\n", $lines);
    }

    private function urlEntry(string $loc, string $lastmod, string $changefreq, string $priority): string
    {
        return sprintf(
            "  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n    <changefreq>%s</changefreq>\n    <priority>%s</priority>\n  </url>",
            htmlspecialchars($loc, ENT_XML1),
            $lastmod,
            $changefreq,
            $priority,
        );
    }

    /** Replica la lógica de productPath() del frontend */
    private function productSlug(int $id, string $name): string
    {
        $slug = mb_strtolower($name, 'UTF-8');
        $slug = strtr($slug, [
            'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u',
            'ä' => 'a', 'ë' => 'e', 'ï' => 'i', 'ö' => 'o', 'ü' => 'u',
            'ñ' => 'n', 'ç' => 'c',
        ]);
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug) ?? '';
        $slug = trim($slug, '-');

        return "{$id}-{$slug}";
    }
}
