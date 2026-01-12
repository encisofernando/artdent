<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoriesController extends Controller
{
    public function index(Request $request)
    {
        $companyId = (int)$request->user()->company_id;
        $query = Category::query()->where('company_id', $companyId);

        // Soporte simple de búsqueda
        if ($request->filled('q')) {
            $q = (string)$request->query('q');
            $query->where('name', 'like', "%{$q}%");
        }

        $items = $query->orderBy('name')->get();
        return response()->json($items);
    }

    public function show(Request $request, Category $category)
    {
        if ((int)$category->company_id !== (int)$request->user()->company_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return response()->json($category);
    }

    public function store(Request $request)
    {
        $companyId = (int)$request->user()->company_id;

        $data = $request->validate([
            'name' => ['required', 'string', 'max:191', Rule::unique('categories', 'name')->where(fn($q) => $q->where('company_id', $companyId))],
            'parent_id' => ['nullable', 'integer'],
        ]);

        $data['company_id'] = $companyId;

        // Si viene parent_id, validar que sea de la misma empresa
        if (!empty($data['parent_id'])) {
            $parent = Category::query()->find($data['parent_id']);
            if (!$parent || (int)$parent->company_id !== $companyId) {
                return response()->json(['message' => 'Invalid parent_id'], 422);
            }
        }

        $category = Category::query()->create($data);
        return response()->json($category, 201);
    }

    public function update(Request $request, Category $category)
    {
        $companyId = (int)$request->user()->company_id;
        if ((int)$category->company_id !== $companyId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:191', Rule::unique('categories', 'name')->ignore($category->id)->where(fn($q) => $q->where('company_id', $companyId))],
            'parent_id' => ['nullable', 'integer'],
        ]);

        if (array_key_exists('parent_id', $data) && !empty($data['parent_id'])) {
            $parent = Category::query()->find($data['parent_id']);
            if (!$parent || (int)$parent->company_id !== $companyId) {
                return response()->json(['message' => 'Invalid parent_id'], 422);
            }
        }

        $category->fill($data)->save();
        return response()->json($category);
    }

    public function destroy(Request $request, Category $category)
    {
        if ((int)$category->company_id !== (int)$request->user()->company_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $category->delete();
        return response()->json(['ok' => true]);
    }
}
