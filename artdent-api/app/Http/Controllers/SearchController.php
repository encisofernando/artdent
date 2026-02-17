<?php

namespace App\Http\Controllers;

use App\Models\PopularSearch;
use App\Models\SearchHistory;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SearchController extends Controller
{
    /**
     * GET /api/search/suggestions?q=...
     */
    public function suggestions(Request $request)
    {
        $query = (string) $request->get('q', '');

        if (mb_strlen($query) < 2) {
            return response()->json([]);
        }

        $suggestions = [];

        $products = Product::query()
            ->where('name', 'LIKE', "%{$query}%")
            ->orWhere('description', 'LIKE', "%{$query}%")
            ->orWhere('sku', 'LIKE', "%{$query}%")
            ->limit(6)
            ->get(['id', 'name']);

        foreach ($products as $product) {
            $suggestions[] = [
                'suggestion' => $product->name,
                'type' => 'product',
                'id' => $product->id,
            ];
        }

        $popular = PopularSearch::query()
            ->where('query', 'LIKE', "%{$query}%")
            ->orderByDesc('search_count')
            ->limit(4)
            ->get(['query', 'search_count']);

        foreach ($popular as $item) {
            $suggestions[] = [
                'suggestion' => $item->query,
                'type' => 'query',
                'count' => $item->search_count,
            ];
        }

        return response()->json($suggestions);
    }

    /**
     * GET /api/search/popular?limit=10
     */
    public function popular(Request $request)
    {
        $limit = (int) $request->get('limit', 10);
        $limit = max(1, min($limit, 50));

        return response()->json(
            PopularSearch::query()
                ->orderByDesc('search_count')
                ->limit($limit)
                ->get(['id', 'query', 'search_count', 'click_count', 'conversion_rate', 'last_searched_at'])
        );
    }

    /**
     * POST /api/search/track
     */
    public function track(Request $request)
    {
        $data = $request->validate([
            'query' => 'required|string|max:255',
            'results_count' => 'nullable|integer|min:0',
            'filters' => 'nullable|array',
        ]);

        $userId = optional($request->user())->id;

        // API suele ser stateless: si no hay session, usamos un header o un UUID.
        $sessionId = $request->header('X-Session-Id');
        if (!$sessionId) {
            $sessionId = (string) Str::uuid();
        }

        SearchHistory::create([
            'user_id' => $userId,
            'session_id' => $sessionId,
            'query' => $data['query'],
            'results_count' => $data['results_count'] ?? 0,
            'filters' => $data['filters'] ?? null,
            'has_results' => ((int) ($data['results_count'] ?? 0)) > 0,
        ]);

        PopularSearch::query()->updateOrCreate(
            ['query' => $data['query']],
            [
                'search_count' => DB::raw('search_count + 1'),
                'last_searched_at' => now(),
            ]
        );

        return response()->json(['message' => 'Búsqueda registrada.']);
    }
}
