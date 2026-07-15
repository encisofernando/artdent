<?php

namespace App\Http\Controllers;

use App\Models\KbArticle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class KbArticleController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('KbArticles/Index', [
            'articles' => KbArticle::orderBy('order')->orderBy('title')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('KbArticles/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $data['slug'] = $data['slug'] ?: Str::slug($data['title']);

        KbArticle::create($data);

        return redirect()->route('kb-articles.index')->with('success', 'Artículo creado.');
    }

    public function edit(KbArticle $kbArticle): Response
    {
        return Inertia::render('KbArticles/Edit', [
            'article' => $kbArticle,
        ]);
    }

    public function update(Request $request, KbArticle $kbArticle): RedirectResponse
    {
        $data = $this->validated($request, $kbArticle);
        $data['slug'] = $data['slug'] ?: Str::slug($data['title']);

        $kbArticle->update($data);

        return redirect()->route('kb-articles.index')->with('success', 'Artículo actualizado.');
    }

    public function destroy(KbArticle $kbArticle): RedirectResponse
    {
        $kbArticle->delete();

        return redirect()->route('kb-articles.index')->with('success', 'Artículo eliminado.');
    }

    public function togglePublish(KbArticle $kbArticle): RedirectResponse
    {
        $kbArticle->update(['is_published' => ! $kbArticle->is_published]);

        return back()->with('success', $kbArticle->is_published ? 'Artículo publicado.' : 'Artículo despublicado.');
    }

    private function validated(Request $request, ?KbArticle $article = null): array
    {
        $data = $request->validate([
            'slug' => ['nullable', 'string', 'max:100', 'alpha_dash', Rule::unique('kb_articles', 'slug')->ignore($article)],
            'title' => ['required', 'string', 'max:150'],
            'body' => ['required', 'string'],
            'category' => ['nullable', 'string', 'max:50'],
            'is_published' => ['boolean'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $data['is_published'] = $request->boolean('is_published');
        $data['order'] = $data['order'] ?? 0;

        return $data;
    }
}
