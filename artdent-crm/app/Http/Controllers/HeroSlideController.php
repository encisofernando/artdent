<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreHeroSlideRequest;
use App\Models\HeroSlide;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HeroSlideController extends Controller
{
    public function index(): \Inertia\Response
    {
        $slides = HeroSlide::orderBy('sort_order')->orderBy('id')->get();

        return Inertia::render('HeroSlide/Index', [
            'slides' => $slides,
        ]);
    }

    public function store(StoreHeroSlideRequest $request): \Illuminate\Http\RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image_url'] = '/storage/'.$request->file('image')->store('hero-slides', 'public');
        }

        HeroSlide::create($data);

        return back()->with('success', 'Slide creado correctamente.');
    }

    public function update(StoreHeroSlideRequest $request, HeroSlide $heroSlide): \Illuminate\Http\RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($heroSlide->image_url) {
                $relative = ltrim(str_replace('/storage/', '', $heroSlide->image_url), '/');
                if (Storage::disk('public')->exists($relative)) {
                    Storage::disk('public')->delete($relative);
                }
            }
            $data['image_url'] = '/storage/'.$request->file('image')->store('hero-slides', 'public');
        }

        $heroSlide->update($data);

        return back()->with('success', 'Slide actualizado correctamente.');
    }

    public function destroy(HeroSlide $heroSlide): \Illuminate\Http\RedirectResponse
    {
        if ($heroSlide->image_url) {
            $relative = ltrim(str_replace('/storage/', '', $heroSlide->image_url), '/');
            if (Storage::disk('public')->exists($relative)) {
                Storage::disk('public')->delete($relative);
            }
        }

        $heroSlide->delete();

        return back()->with('success', 'Slide eliminado.');
    }

    /**
     * API pública para el e-commerce: retorna slides activos ordenados.
     */
    public function apiIndex(): \Illuminate\Http\JsonResponse
    {
        $slides = HeroSlide::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get([
                'id',
                'image_url',
                'click_url',
                'slide_type',
                'eyebrow',
                'title',
                'subtitle',
                'description',
                'button_label',
                'button_url',
                'content_align',
                'content_width',
                'height_mode',
                'font_style',
                'title_size',
                'body_size',
                'overlay_strength',
                'surface_style',
                'eyebrow_color',
                'title_color',
                'subtitle_color',
                'description_color',
                'button_bg_color',
                'button_text_color',
                'button_border_color',
            ]);

        return response()->json($slides);
    }
}
