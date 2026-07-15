<?php

namespace App\Http\Controllers;

use App\Models\KbArticle;
use Inertia\Inertia;
use Inertia\Response;

class HelpController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Ayuda/Index', [
            'kbArticles' => KbArticle::where('is_published', true)
                ->orderBy('order')
                ->orderBy('title')
                ->get(['id', 'slug', 'title', 'body', 'category']),
        ]);
    }
}
