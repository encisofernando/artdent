<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    public function edit()
    {
        $companyId = auth()->user()->company_id ?? 1;
        $company = Company::findOrFail($companyId);
        
        return \Inertia\Inertia::render('Admin/Settings', [
            'company' => $company
        ]);
    }

    public function update(Request $request)
    {
        $companyId = auth()->user()->company_id ?? 1;
        $company = Company::findOrFail($companyId);

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'fantasy_name' => 'nullable|string|max:150',
            'cuit' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'phone' => 'nullable|string|max:50',
            'whatsapp_phone_number_id' => 'nullable|string|max:100',
            'whatsapp_access_token' => 'nullable|string|max:1000',
        ]);

        $company->update($validated);

        return redirect()->back()->with('success', 'Configuración actualizada.');
    }
}
