<?php

namespace App\Http\Controllers;

use App\Models\ProductComparison;
use App\Models\Product;
use Illuminate\Http\Request;

class ComparisonController extends Controller
{
    /**
     * GET /api/comparison
     */
    public function index(Request $request)
    {
        $userId = $request->user()?->id;
        $sessionId = $request->session()->getId();

        $query = ProductComparison::with(['product' => function ($q) {
            $q->with('primaryImage', 'category');
        }])
        ->orderBy('position');

        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('session_id', $sessionId);
        }

        $comparisons = $query->get();

        return response()->json($comparisons);
    }

    /**
     * POST /api/comparison
     */
    public function store(Request $request)
    {
        $userId = $request->user()?->id;
        $sessionId = $request->session()->getId();

        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
        ]);

        // Check if already in comparison
        $query = ProductComparison::where('product_id', $data['product_id']);
        
        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('session_id', $sessionId);
        }

        if ($query->exists()) {
            return response()->json([
                'message' => 'El producto ya está en comparación.',
            ], 422);
        }

        // Check limit (max 4 products)
        $countQuery = ProductComparison::query();
        if ($userId) {
            $countQuery->where('user_id', $userId);
        } else {
            $countQuery->where('session_id', $sessionId);
        }

        if ($countQuery->count() >= 4) {
            return response()->json([
                'message' => 'Máximo 4 productos en comparación. Elimina uno para agregar otro.',
            ], 422);
        }

        // Get next position
        $position = $countQuery->max('position') + 1;

        $comparison = ProductComparison::create([
            'user_id' => $userId,
            'session_id' => $sessionId,
            'product_id' => $data['product_id'],
            'position' => $position,
        ]);

        return response()->json($comparison->load('product'), 201);
    }

    /**
     * DELETE /api/comparison/{comparison}
     */
    public function destroy(Request $request, ProductComparison $comparison)
    {
        $userId = $request->user()?->id;
        $sessionId = $request->session()->getId();

        // Verify ownership
        if ($comparison->user_id !== $userId || $comparison->session_id !== $sessionId) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $comparison->delete();

        return response()->json(['message' => 'Producto eliminado de la comparación.']);
    }

    /**
     * DELETE /api/comparison/clear
     */
    public function clear(Request $request)
    {
        $userId = $request->user()?->id;
        $sessionId = $request->session()->getId();

        $query = ProductComparison::query();

        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('session_id', $sessionId);
        }

        $query->delete();

        return response()->json(['message' => 'Comparación limpiada.']);
    }
}
