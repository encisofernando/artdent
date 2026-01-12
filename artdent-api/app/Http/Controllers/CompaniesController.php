<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;

class CompaniesController extends Controller
{
    /** Devuelve la empresa del usuario autenticado. */
    public function me(Request $request)
    {
        $user = $request->user();
        $company = Company::query()->find($user->company_id);

        if (!$company) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        return response()->json($company);
    }

    /**
     * Devuelve una empresa por id.
     * Por seguridad, solo permite leer la empresa del propio usuario.
     */
    public function show(Request $request, Company $company)
    {
        $user = $request->user();
        if ((int)$company->id !== (int)$user->company_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($company);
    }
}
