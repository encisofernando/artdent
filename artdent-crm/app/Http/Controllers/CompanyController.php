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
            'company' => $company,
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
            'iva_condition' => 'nullable|string|max:50',
            'iibb' => 'nullable|string|max:50',
            'start_date' => 'nullable|date',
            'afip_point_sale' => 'nullable|integer',
            'email' => 'nullable|email|max:150',
            'phone' => 'nullable|string|max:50',
            'website' => 'nullable|string|max:150',
            'address' => 'nullable|string|max:150',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'currency' => 'nullable|string|max:10',
            'timezone' => 'nullable|string|max:50',
            'whatsapp_phone_number_id' => 'nullable|string|max:100',
            'whatsapp_access_token' => 'nullable|string|max:1000',
            'whatsapp_message_template' => 'nullable|string|max:2000',
            'email_sale_subject' => 'nullable|string|max:200',
            'email_sale_body' => 'nullable|string|max:3000',
            'email_quote_subject' => 'nullable|string|max:200',
            'email_quote_body' => 'nullable|string|max:3000',
            'email_payment_subject' => 'nullable|string|max:200',
            'email_payment_body' => 'nullable|string|max:3000',
            'chatbot_enabled' => 'nullable|boolean',
            'chatbot_provider' => 'required|string|in:openai,gemini',
            'chatbot_model' => 'nullable|string|max:120',
            'chatbot_openai_key' => 'nullable|string|max:255',
            'chatbot_gemini_key' => 'nullable|string|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // 2MB Max
        ]);

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($company->logo_url) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete(str_replace('/storage/', '', $company->logo_url));
            }

            $path = $request->file('logo')->store('logos', 'public');
            $validated['logo_url'] = '/storage/'.$path;
        }

        // Remove 'logo' from validated data as it's not a database column
        unset($validated['logo']);

        $validated['chatbot_enabled'] = $request->boolean('chatbot_enabled');
        $validated['chatbot_model'] = trim((string) ($validated['chatbot_model'] ?? '')) ?: null;

        $company->update($validated);

        return redirect()->back()->with('success', 'Configuración de la empresa actualizada exitosamente.');
    }
}
