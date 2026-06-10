<?php

namespace App\Http\Controllers;

use App\Models\Tariff;
use App\Models\TariffPhase;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TariffPhaseController extends Controller
{
    public function index(Tariff $tariff)
    {
        return response()->json($tariff->phases);
    }

    public function store(Request $request, Tariff $tariff): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'price' => ['required', 'numeric', 'min:0'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);

        if (! isset($data['sort_order'])) {
            $data['sort_order'] = $tariff->phases()->max('sort_order') + 1;
        }

        $tariff->phases()->create($data);

        return back()->with('success', 'Fase agregada.');
    }

    public function update(Request $request, Tariff $tariff, TariffPhase $phase): RedirectResponse
    {
        abort_if($phase->tariff_id !== $tariff->id, 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'price' => ['required', 'numeric', 'min:0'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);

        $phase->update($data);

        return back()->with('success', 'Fase actualizada.');
    }

    public function destroy(Tariff $tariff, TariffPhase $phase): RedirectResponse
    {
        abort_if($phase->tariff_id !== $tariff->id, 403);

        $phase->delete();

        return back()->with('success', 'Fase eliminada.');
    }
}
