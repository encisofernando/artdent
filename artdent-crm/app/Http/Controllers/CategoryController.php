<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status', 'all');

        $query = Category::with('category');

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($status === 'active') {
            $query->where('is_active', 1);
        } elseif ($status === 'inactive') {
            $query->where('is_active', 0);
        }

        $items = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('Category/Index', [
            'items' => $items,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ]
        ]);
    }

    public function create()
    {
        $categories = Category::where('is_active', 1)->get(['id', 'name']);
        return Inertia::render('Category/Create', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:categories,id',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        Category::create($validated);

        return redirect()->route('categorys.index')->with('success', 'Categoría creada con éxito.');
    }

    public function show(Category $category)
    {
        // 
    }

    public function edit(Category $category)
    {
        $categories = Category::where('is_active', 1)->where('id', '!=', $category->id)->get(['id', 'name']);
        return Inertia::render('Category/Edit', [
            'item' => $category,
            'categories' => $categories
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:categories,id',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        return redirect()->route('categorys.index')->with('success', 'Categoría actualizada con éxito.');
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return redirect()->route('categorys.index')->with('success', 'Categoría eliminada con éxito.');
    }
}
