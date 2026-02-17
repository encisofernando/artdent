<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoriesController extends Controller
{
    public function __construct(private CategoryService $service) {}

    public function index(Request $request)
    {
        $companyId = (int)$request->user()->company_id;
        $q = $request->query('q');

        $items = $this->service->list($companyId, is_string($q) ? $q : null);
        return response()->json($items);
    }

    public function show(Request $request, Category $category)
    {
        $companyId = (int)$request->user()->company_id;

        if ((int)$category->company_id !== $companyId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($category->load(['parent:id,name']));
    }

    public function store(Request $request)
    {
        $companyId = (int)$request->user()->company_id;

        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:191',
                Rule::unique('categories', 'name')
                    ->where(fn($q) => $q->where('company_id', $companyId)),
            ],
            'parent_id' => ['nullable', 'integer'],
        ]);

        $category = $this->service->create($companyId, $data);

        return response()->json($category->load(['parent:id,name']), 201);
    }

    public function update(Request $request, Category $category)
    {
        $companyId = (int)$request->user()->company_id;

        $data = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:191',
                Rule::unique('categories', 'name')
                    ->ignore($category->id)
                    ->where(fn($q) => $q->where('company_id', $companyId)),
            ],
            'parent_id' => ['nullable', 'integer'],
        ]);

        $updated = $this->service->update($category, $companyId, $data);

        return response()->json($updated);
    }

    public function destroy(Request $request, Category $category)
    {
        $companyId = (int)$request->user()->company_id;

        $this->service->delete($category, $companyId);

        return response()->json(['ok' => true]);
    }
}
