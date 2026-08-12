<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Dentist;
use Illuminate\Http\Request;

trait ResolvesCurrentDentist
{
    protected function currentDentist(Request $request): Dentist
    {
        return Dentist::where('id', $request->session()->get('dentist_id'))
            ->where('is_active', true)
            ->firstOrFail();
    }
}
