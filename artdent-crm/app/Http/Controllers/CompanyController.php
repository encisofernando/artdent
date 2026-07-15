<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Support\AccountingSettings;
use App\Support\CompanyContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
        $companyId = CompanyContext::id();
        $company = Company::findOrFail($companyId);

        return \Inertia\Inertia::render('Admin/Settings', [
            'company' => $company,
            'accountingSettings' => $company->normalizedAccountingSettings(),
        ]);
    }

    /**
     * Cambia la company activa en sesión (sólo usuarios con companies.switch).
     */
    public function setActive(Request $request)
    {
        $validated = $request->validate([
            'company_id' => ['required', 'integer'],
        ]);

        CompanyContext::set($validated['company_id']);

        return redirect()->back()->with('success', 'Compañía activa actualizada.');
    }

    public function update(Request $request)
    {
        $companyId = CompanyContext::id();
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
            'instagram_handle' => 'nullable|string|max:100',
            'tariff_notes' => 'nullable|string|max:4000',
            'collaborator_commission_pct' => 'nullable|numeric|min:0|max:100',
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
            'whatsapp_contact_number' => 'nullable|string|max:30',
            'ga4_measurement_id' => 'nullable|string|max:50',
            'meta_pixel_id' => 'nullable|string|max:30',
            'hotjar_id' => 'nullable|string|max:20',
            'google_tag_manager_id' => 'nullable|string|max:20',
            'email_sale_subject' => 'nullable|string|max:200',
            'email_sale_body' => 'nullable|string|max:3000',
            'email_quote_subject' => 'nullable|string|max:200',
            'email_quote_body' => 'nullable|string|max:3000',
            'email_payment_subject' => 'nullable|string|max:200',
            'email_payment_body' => 'nullable|string|max:3000',
            'chatbot_enabled' => 'nullable|boolean',
            'chatbot_provider' => 'required|string|in:claude',
            'chatbot_model' => 'nullable|string|max:120',
            'chatbot_openai_key' => 'nullable|string|max:255',
            'chatbot_anthropic_key' => 'nullable|string|max:500',
            'accounting_settings' => 'nullable|array',
            'accounting_settings.tax_regime' => 'nullable|string|in:responsable_inscripto,monotributista,exento,consumidor_final',
            'accounting_settings.vat_presentation' => 'nullable|string|in:iva_simple,libro_iva_digital,personalizado,no_aplica',
            'accounting_settings.vat_sales_book' => 'nullable|boolean',
            'accounting_settings.vat_purchases_book' => 'nullable|boolean',
            'accounting_settings.gross_income_regime' => 'nullable|string|in:local,convenio_multilateral,simplificado,exento,no_aplica',
            'accounting_settings.gross_income_jurisdiction' => 'nullable|string|max:120',
            'accounting_settings.withholding_agent_role' => 'nullable|string|in:none,retention,perception,both',
            'accounting_settings.employer_book_enabled' => 'nullable|boolean',
            'accounting_settings.accountant_notes' => 'nullable|string|max:3000',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'lab_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            if ($company->logo_url) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $company->logo_url));
            }

            $path = $request->file('logo')->store('logos', 'public');
            $validated['logo_url'] = '/storage/'.$path;
        }

        if ($request->hasFile('lab_logo')) {
            if ($company->lab_logo_url) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $company->lab_logo_url));
            }

            $path = $request->file('lab_logo')->store('logos', 'public');
            $validated['lab_logo_url'] = '/storage/'.$path;
        }

        unset($validated['logo']);
        unset($validated['lab_logo']);

        $validated['chatbot_enabled'] = $request->boolean('chatbot_enabled');
        $validated['chatbot_model'] = trim((string) ($validated['chatbot_model'] ?? '')) ?: null;
        $validated['accounting_settings'] = AccountingSettings::merge(
            $validated['accounting_settings'] ?? $company->accounting_settings,
            $company
        );

        $company->update($validated);

        return redirect()->back()->with('success', 'Configuración de la empresa actualizada exitosamente.');
    }
}
