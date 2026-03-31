<?php

namespace App\Support;

use App\Models\Company;

class AccountingSettings
{
    public static function defaults(?Company $company = null): array
    {
        $taxRegime = $company?->iva_condition ?: 'responsable_inscripto';

        return [
            'tax_regime' => $taxRegime,
            'vat_presentation' => $taxRegime === 'responsable_inscripto' ? 'iva_simple' : 'no_aplica',
            'vat_sales_book' => $taxRegime === 'responsable_inscripto',
            'vat_purchases_book' => $taxRegime === 'responsable_inscripto',
            'gross_income_regime' => 'local',
            'gross_income_jurisdiction' => '',
            'withholding_agent_role' => 'none',
            'employer_book_enabled' => false,
            'accountant_notes' => '',
        ];
    }

    public static function merge(?array $settings, ?Company $company = null): array
    {
        $defaults = static::defaults($company);
        $settings = is_array($settings) ? $settings : [];

        return [
            'tax_regime' => static::sanitizeString($settings['tax_regime'] ?? $defaults['tax_regime'], $defaults['tax_regime']),
            'vat_presentation' => static::sanitizeString($settings['vat_presentation'] ?? $defaults['vat_presentation'], $defaults['vat_presentation']),
            'vat_sales_book' => static::sanitizeBool($settings['vat_sales_book'] ?? $defaults['vat_sales_book']),
            'vat_purchases_book' => static::sanitizeBool($settings['vat_purchases_book'] ?? $defaults['vat_purchases_book']),
            'gross_income_regime' => static::sanitizeString($settings['gross_income_regime'] ?? $defaults['gross_income_regime'], $defaults['gross_income_regime']),
            'gross_income_jurisdiction' => static::sanitizeString($settings['gross_income_jurisdiction'] ?? $defaults['gross_income_jurisdiction']),
            'withholding_agent_role' => static::sanitizeString($settings['withholding_agent_role'] ?? $defaults['withholding_agent_role'], $defaults['withholding_agent_role']),
            'employer_book_enabled' => static::sanitizeBool($settings['employer_book_enabled'] ?? $defaults['employer_book_enabled']),
            'accountant_notes' => static::sanitizeString($settings['accountant_notes'] ?? $defaults['accountant_notes']),
        ];
    }

    public static function buildObligations(Company $company, ?array $settings = null): array
    {
        $settings = static::merge($settings ?? $company->accounting_settings, $company);

        $obligations = [
            [
                'key' => 'afip_invoicing',
                'label' => 'Facturacion electronica / CAE',
                'description' => 'Comprobantes emitidos para insumos, ecommerce y laboratorio.',
                'status' => 'active',
            ],
        ];

        if ($settings['vat_sales_book']) {
            $obligations[] = [
                'key' => 'vat_sales_book',
                'label' => 'Libro IVA Ventas',
                'description' => 'Registro de comprobantes emitidos con neto, IVA y total.',
                'status' => 'active',
            ];
        }

        if ($settings['vat_purchases_book']) {
            $obligations[] = [
                'key' => 'vat_purchases_book',
                'label' => 'Libro IVA Compras',
                'description' => 'Registro de compras a proveedores, credito fiscal y estado del comprobante.',
                'status' => 'active',
            ];
        }

        if ($settings['vat_presentation'] !== 'no_aplica') {
            $obligations[] = [
                'key' => 'vat_return',
                'label' => 'Presentacion IVA',
                'description' => $settings['vat_presentation'] === 'iva_simple'
                    ? 'Seguimiento para IVA Simple / portal de presentacion.'
                    : 'Seguimiento del esquema de presentacion definido por el estudio contable.',
                'status' => 'active',
            ];
        }

        if ($settings['gross_income_regime'] !== 'exento' && $settings['gross_income_regime'] !== 'no_aplica') {
            $obligations[] = [
                'key' => 'gross_income',
                'label' => $settings['gross_income_regime'] === 'convenio_multilateral'
                    ? 'Ingresos Brutos / Convenio Multilateral'
                    : 'Ingresos Brutos jurisdiccional',
                'description' => filled($settings['gross_income_jurisdiction'])
                    ? 'Jurisdiccion principal: '.$settings['gross_income_jurisdiction']
                    : 'Configurar jurisdiccion o ente recaudador.',
                'status' => filled($settings['gross_income_jurisdiction']) ? 'active' : 'attention',
            ];
        }

        if ($settings['withholding_agent_role'] !== 'none') {
            $obligations[] = [
                'key' => 'withholdings',
                'label' => 'Retenciones / percepciones',
                'description' => match ($settings['withholding_agent_role']) {
                    'retention' => 'Control de retenciones practicadas.',
                    'perception' => 'Control de percepciones emitidas.',
                    default => 'Control combinado de retenciones y percepciones.',
                },
                'status' => 'active',
            ];
        }

        if ($settings['employer_book_enabled']) {
            $obligations[] = [
                'key' => 'payroll',
                'label' => 'Libro sueldo y cargas sociales',
                'description' => 'Seguimiento de recibos, aportes y obligaciones laborales.',
                'status' => 'active',
            ];
        }

        return $obligations;
    }

    private static function sanitizeBool(mixed $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? false;
    }

    private static function sanitizeString(mixed $value, string $fallback = ''): string
    {
        if (! is_scalar($value)) {
            return $fallback;
        }

        $sanitized = trim((string) $value);

        return $sanitized !== '' ? $sanitized : $fallback;
    }
}
