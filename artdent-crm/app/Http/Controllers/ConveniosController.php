<?php

namespace App\Http\Controllers;

use App\Models\LaborAgreement;
use App\Support\CompanyContext;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConveniosController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = CompanyContext::id();

        $agreements = LaborAgreement::query()
            ->where(fn ($q) => $q->whereNull('company_id')->orWhere('company_id', $companyId))
            ->with(['categories' => fn ($q) => $q->orderBy('order')->orderBy('name'), 'categories.salaryScales' => fn ($q) => $q->orderByDesc('effective_from')])
            ->withCount('categories')
            ->orderBy('name')
            ->get();

        return Inertia::render('Rrhh/Convenios/Index', [
            'agreements' => $agreements,
        ]);
    }
}
