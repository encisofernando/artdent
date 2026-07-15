<?php

namespace App\Http\Controllers;

use App\Models\PayrollConcept;
use App\Models\PayrollVariable;
use App\Support\CompanyContext;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConceptosController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = CompanyContext::id();

        $variables = PayrollVariable::query()
            ->where(fn ($q) => $q->whereNull('company_id')->orWhere('company_id', $companyId))
            ->orderBy('name')
            ->get();

        $concepts = PayrollConcept::query()
            ->where(fn ($q) => $q->whereNull('company_id')->orWhere('company_id', $companyId))
            ->with(['versions' => fn ($q) => $q->orderByDesc('effective_from')])
            ->orderBy('order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Rrhh/Conceptos/Index', [
            'variables' => $variables,
            'concepts' => $concepts,
        ]);
    }
}
