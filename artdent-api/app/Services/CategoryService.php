<?php

namespace App\Services;

use App\Models\Category;

class CategoryService
{
    public function list(int $companyId, ?string $q = null)
    {
        $query = Category::query()
            ->where('company_id', $companyId);

        if ($q !== null && trim($q) !== '') {
            $query->where('name', 'like', '%' . trim($q) . '%');
        }

        // Para mostrar parent en frontend sin pedir otro endpoint
        return $query->with(['parent:id,name'])
            ->orderBy('name')
            ->get();
    }

    public function assertValidParent(?int $parentId, int $companyId, ?int $selfId = null): void
    {
        if (!$parentId) return;

        if ($selfId !== null && $parentId === $selfId) {
            abort(response()->json(['message' => 'Invalid parent_id (self)'], 422));
        }

        $parent = Category::query()->find($parentId);
        if (!$parent || (int)$parent->company_id !== $companyId) {
            abort(response()->json(['message' => 'Invalid parent_id'], 422));
        }
    }

    public function create(int $companyId, array $data): Category
    {
        $this->assertValidParent($data['parent_id'] ?? null, $companyId, null);

        $data['company_id'] = $companyId;

        return Category::query()->create($data);
    }

    public function update(Category $category, int $companyId, array $data): Category
    {
        if ((int)$category->company_id !== $companyId) {
            abort(response()->json(['message' => 'Forbidden'], 403));
        }

        if (array_key_exists('parent_id', $data)) {
            $this->assertValidParent(
                $data['parent_id'] ?? null,
                $companyId,
                (int)$category->id
            );
        }

        $category->fill($data)->save();

        return $category->fresh(['parent:id,name']);
    }

    public function delete(Category $category, int $companyId): void
    {
        if ((int)$category->company_id !== $companyId) {
            abort(response()->json(['message' => 'Forbidden'], 403));
        }

        $category->delete();
    }
}
