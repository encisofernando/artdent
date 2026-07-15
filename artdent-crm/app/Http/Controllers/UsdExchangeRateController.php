<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Product;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UsdExchangeRateController extends Controller
{
    /**
     * Actualiza la cotización del dólar de la empresa y recalcula en el acto el costo
     * en pesos (`cost_price`) de todos los artículos cuyo costo está cargado en USD.
     */
    public function update(Request $request): RedirectResponse
    {
        $companyId = CompanyContext::id();

        $validated = $request->validate([
            'rate' => ['required', 'numeric', 'min:0.01'],
        ]);

        $company = Company::findOrFail($companyId);
        $company->update(['usd_exchange_rate' => $validated['rate']]);

        $updated = 0;
        Product::where('company_id', $companyId)
            ->where('cost_currency', 'USD')
            ->whereNotNull('cost_price_usd')
            ->get()
            ->each(function (Product $product) use ($validated, &$updated) {
                $product->update(['cost_price' => round($product->cost_price_usd * $validated['rate'], 2)]);
                $updated++;
            });

        return back()->with('success', "Cotización actualizada a \${$validated['rate']}. Se recalculó el costo de {$updated} artículo(s) en USD.");
    }
}
