<?php

namespace Tests\Unit;

use App\Models\Company;
use App\Models\Invoice;
use App\Models\InvoiceType;
use App\Services\Afip\AfipService;
use Tests\TestCase;

class AfipComplianceTest extends TestCase
{
    public function test_cbte_tipo_codes_match_official_arca_table(): void
    {
        $ref = new \ReflectionClass(AfipService::class);
        $cbteTipo = $ref->getConstant('CBTE_TIPO');

        $this->assertSame(1, $cbteTipo['FA'], 'Factura A debe ser código 1');
        $this->assertSame(2, $cbteTipo['NDA'], 'Nota de Débito A debe ser código 2');
        $this->assertSame(3, $cbteTipo['NCA'], 'Nota de Crédito A debe ser código 3');
        $this->assertSame(6, $cbteTipo['FB'], 'Factura B debe ser código 6');
        $this->assertSame(7, $cbteTipo['NDB'], 'Nota de Débito B debe ser código 7');
        $this->assertSame(8, $cbteTipo['NCB'], 'Nota de Crédito B debe ser código 8');
        $this->assertSame(11, $cbteTipo['FC'], 'Factura C debe ser código 11');
        $this->assertSame(12, $cbteTipo['NDC'], 'Nota de Débito C debe ser código 12');
        $this->assertSame(13, $cbteTipo['NCC'], 'Nota de Crédito C debe ser código 13');
    }

    public function test_allowed_receipt_keys_for_ri_and_monotributo(): void
    {
        $riKeys = AfipService::allowedReceiptKeys('responsable_inscripto');
        $this->assertContains('FA', $riKeys);
        $this->assertContains('FB', $riKeys);
        $this->assertContains('NCA', $riKeys);
        $this->assertContains('NDA', $riKeys);

        $monoKeys = AfipService::allowedReceiptKeys('monotributista');
        $this->assertContains('FC', $monoKeys);
        $this->assertContains('NCC', $monoKeys);
        $this->assertContains('NDC', $monoKeys);
        $this->assertNotContains('FA', $monoKeys);
    }

    public function test_cf_identification_limit_is_updated(): void
    {
        $limit = config('afip.cf_identification_limit');
        $this->assertSame(344488, (int) $limit);
    }

    public function test_invoice_blade_template_renders_complying_with_arca_rules(): void
    {
        $company = new Company([
            'name' => 'EMPRESA TEST S.A.',
            'cuit' => '30-71944407-1',
            'iva_condition' => 'responsable_inscripto',
            'iibb' => '30719444071',
            'address' => 'Av. Corrientes 1234',
            'city' => 'CABA',
            'province' => 'Buenos Aires',
            'start_date' => '2024-01-01',
        ]);

        $invTypeA = new InvoiceType(['name' => 'FA', 'afip_code' => 1]);
        $invTypeB = new InvoiceType(['name' => 'FB', 'afip_code' => 6]);

        $item1 = (object) [
            'sku' => 'ART-001',
            'description' => 'Servicio Odontológico',
            'quantity' => 1,
            'unit_price' => 1210.0,
            'discount' => 0,
            'tax_rate' => 21.0,
            'total' => 1210.0,
        ];

        // 1. Factura A a Monotributista: DEBE contener leyenda Ley 27.618 y NO contener Transparencia Fiscal
        $invoiceA = new Invoice([
            'point_sale' => 2,
            'number' => 15,
            'recipient_name' => 'Dr. Pérez Juan',
            'recipient_cuit' => '20301234567',
            'recipient_iva' => 'monotributista',
            'recipient_address' => 'Calle Falsa 123',
            'subtotal' => 1000.0,
            'tax_amount' => 210.0,
            'total' => 1210.0,
            'issued_at' => now(),
            'cae' => '74123456789012',
            'cae_expiry' => now()->addDays(10),
        ]);
        $invoiceA->setRelation('invoice_type', $invTypeA);
        $invoiceA->setRelation('invoice_items', collect([$item1]));

        $htmlA = view('pdf.invoice_afip', ['invoice' => $invoiceA, 'company' => $company])->render();

        // Verificaciones Factura A
        $this->assertStringContainsString('00002-00000015', $htmlA, 'Punto de venta debe tener 5 dígitos');
        $this->assertStringContainsString('Calle Falsa 123', $htmlA, 'Debe mostrar domicilio del receptor');
        $this->assertStringContainsString('Ley Nº 27.618', $htmlA, 'Factura A a Monotributista debe contener leyenda Ley 27.618');
        $this->assertStringNotContainsString('Régimen de Transparencia Fiscal al Consumidor', $htmlA, 'Factura A NO debe tener leyenda de consumidor final');
        $this->assertStringContainsString('P. Unit. Neto', $htmlA, 'Factura A debe mostrar columna de precio neto');

        // 2. Factura B a Consumidor Final: DEBE contener Transparencia Fiscal y NO contener Ley 27.618
        $invoiceB = new Invoice([
            'point_sale' => 2,
            'number' => 16,
            'recipient_name' => 'Consumidor Final',
            'recipient_cuit' => null,
            'recipient_iva' => 'consumidor_final',
            'recipient_address' => null,
            'subtotal' => 1000.0,
            'tax_amount' => 210.0,
            'total' => 1210.0,
            'issued_at' => now(),
            'cae' => '74123456789013',
            'cae_expiry' => now()->addDays(10),
        ]);
        $invoiceB->setRelation('invoice_type', $invTypeB);
        $invoiceB->setRelation('invoice_items', collect([$item1]));

        $htmlB = view('pdf.invoice_afip', ['invoice' => $invoiceB, 'company' => $company])->render();

        // Verificaciones Factura B
        $this->assertStringContainsString('00002-00000016', $htmlB, 'Punto de venta debe tener 5 dígitos');
        $this->assertStringContainsString('Régimen de Transparencia Fiscal al Consumidor (Ley 27.743)', $htmlB, 'Factura B a CF debe tener Transparencia Fiscal');
        $this->assertStringNotContainsString('Ley Nº 27.618', $htmlB, 'Factura B NO debe contener leyenda Ley 27.618');
    }
}
