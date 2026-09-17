<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Invoice;
use App\Models\InvoiceType;
use App\Models\User;
use App\Services\Afip\LibroIvaDigitalService;
use App\Support\TenantModuleResolver;
use Carbon\Carbon;
use Spatie\Permission\Models\Permission;
use Tests\Concerns\RefreshesTenantSchema;
use Tests\TestCase;

class LibroIvaDigitalTest extends TestCase
{
    use RefreshesTenantSchema;

    private Company $company;

    private User $user;

    private LibroIvaDigitalService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::factory()->create([
            'iva_condition' => 'responsable_inscripto',
            'cuit' => '30-71944407-1',
            'afip_point_sale' => 1,
        ]);

        $this->user = User::factory()->for($this->company)->create();
        $this->user->givePermissionTo(
            Permission::findOrCreate('reports.view', 'web'),
            Permission::findOrCreate('accounting.view', 'web'),
        );

        $this->service = new LibroIvaDigitalService;

        // Asegurar que TenantModuleResolver permita el módulo 'contabilidad' en el test
        $resolverMock = $this->createMock(TenantModuleResolver::class);
        $resolverMock->method('has')->willReturn(true);
        $resolverMock->method('enabledSlugs')->willReturn(['contabilidad', 'reportes', 'clientes']);
        $this->app->instance(TenantModuleResolver::class, $resolverMock);

        $this->actingAs($this->user);
    }

    protected function tearDown(): void
    {
        $this->app->forgetInstance(TenantModuleResolver::class);

        parent::tearDown();
    }

    public function test_ventas_cbte_line_is_exactly_266_characters(): void
    {
        $invType = InvoiceType::firstOrCreate(['afip_code' => 1], ['name' => 'Factura A', 'is_active' => true]);

        $invoice = Invoice::create([
            'company_id' => $this->company->id,
            'invoice_type_id' => $invType->id,
            'user_id' => $this->user->id,
            'point_sale' => 1,
            'number' => 124,
            'recipient_name' => 'EMPRESA CLIENTE S.A.',
            'recipient_cuit' => '30712345678',
            'recipient_iva' => 'responsable_inscripto',
            'subtotal' => 100000.0,
            'tax_amount' => 21000.0,
            'total' => 121000.0,
            'cae' => '76123456789012',
            'cae_expiry' => Carbon::now()->addDays(10),
            'issued_at' => Carbon::now(),
            'status' => 'authorized',
            'afip_request' => [
                'doc_tipo' => 80,
                'doc_nro' => '30712345678',
                'iva_items' => [
                    ['Id' => 5, 'BaseImp' => 100000.0, 'Importe' => 21000.0],
                ],
            ],
        ]);

        $line = $this->service->formatCbteLine($invoice);

        $this->assertSame(266, strlen($line), 'La línea de Comprobantes debe medir exactamente 266 caracteres (longitud obtenida: '.strlen($line).')');
    }

    public function test_ventas_alicuota_line_is_exactly_62_characters(): void
    {
        $invType = InvoiceType::firstOrCreate(['afip_code' => 1], ['name' => 'Factura A', 'is_active' => true]);

        $invoice = Invoice::create([
            'company_id' => $this->company->id,
            'invoice_type_id' => $invType->id,
            'point_sale' => 1,
            'number' => 124,
            'recipient_name' => 'Cliente Test',
            'total' => 121000.0,
        ]);

        $aliData = [
            'Id' => 5, // 21%
            'BaseImp' => 100000.0,
            'Importe' => 21000.0,
        ];

        $line = $this->service->formatAlicuotaLine($invoice, $aliData);

        $this->assertSame(62, strlen($line), 'La línea de Alícuotas debe medir exactamente 62 caracteres (longitud obtenida: '.strlen($line).')');
    }

    public function test_factura_c_does_not_generate_alicuotas(): void
    {
        $invType = InvoiceType::firstOrCreate(['afip_code' => 11], ['name' => 'Factura C', 'is_active' => true]);

        $invoice = Invoice::create([
            'company_id' => $this->company->id,
            'invoice_type_id' => $invType->id,
            'point_sale' => 2,
            'number' => 50,
            'recipient_name' => 'Juan Perez',
            'recipient_cuit' => '20301234567',
            'recipient_iva' => 'consumidor_final',
            'subtotal' => 5000.0,
            'tax_amount' => 0.0,
            'total' => 5000.0,
            'cae' => '76123456789013',
            'issued_at' => Carbon::now(),
            'status' => 'authorized',
        ]);

        $cbteTxt = $this->service->buildVentasCbte(collect([$invoice]));
        $aliTxt = $this->service->buildVentasAlicuotas(collect([$invoice]));

        $this->assertNotEmpty($cbteTxt);
        $this->assertSame('', $aliTxt, 'Factura C no debe generar registros en el archivo de alícuotas');

        // En la cabecera, la cantidad de alícuotas (pos 242) debe ser 0
        $line = trim($cbteTxt);
        $this->assertSame('0', substr($line, 241, 1), 'El campo Cantidad de Alícuotas de Factura C debe ser 0');
    }

    public function test_multi_alicuota_invoice_generates_multiple_alicuota_lines(): void
    {
        $invType = InvoiceType::firstOrCreate(['afip_code' => 1], ['name' => 'Factura A', 'is_active' => true]);

        $invoice = Invoice::create([
            'company_id' => $this->company->id,
            'invoice_type_id' => $invType->id,
            'point_sale' => 1,
            'number' => 125,
            'recipient_name' => 'EMPRESA MULTI S.A.',
            'recipient_cuit' => '30999888776',
            'subtotal' => 150000.0,
            'tax_amount' => 26250.0,
            'total' => 176250.0,
            'issued_at' => Carbon::now(),
            'afip_request' => [
                'doc_tipo' => 80,
                'doc_nro' => '30999888776',
                'iva_items' => [
                    ['Id' => 5, 'BaseImp' => 100000.0, 'Importe' => 21000.0], // 21%
                    ['Id' => 4, 'BaseImp' => 50000.0, 'Importe' => 5250.0],   // 10.5%
                ],
            ],
        ]);

        $cbteTxt = $this->service->buildVentasCbte(collect([$invoice]));
        $aliTxt = $this->service->buildVentasAlicuotas(collect([$invoice]));

        $line = trim($cbteTxt);
        $this->assertSame('2', substr($line, 241, 1), 'El campo Cantidad de Alícuotas debe ser 2');

        $aliLines = array_filter(explode("\r\n", $aliTxt));
        $this->assertCount(2, $aliLines, 'Debe haber exactamente 2 líneas de alícuotas');
        foreach ($aliLines as $l) {
            $this->assertSame(62, strlen($l));
        }
    }

    public function test_accountant_csv_rows_contain_all_required_columns(): void
    {
        $invType = InvoiceType::firstOrCreate(['afip_code' => 1], ['name' => 'Factura A', 'is_active' => true]);

        $invoice = Invoice::create([
            'company_id' => $this->company->id,
            'invoice_type_id' => $invType->id,
            'point_sale' => 1,
            'number' => 124,
            'recipient_name' => 'EMPRESA CLIENTE S.A.',
            'recipient_cuit' => '30712345678',
            'recipient_iva' => 'responsable_inscripto',
            'subtotal' => 100000.0,
            'tax_amount' => 21000.0,
            'total' => 121000.0,
            'cae' => '76123456789012',
            'cae_expiry' => Carbon::now()->addDays(10),
            'issued_at' => Carbon::now(),
            'status' => 'authorized',
            'afip_request' => [
                'doc_tipo' => 80,
                'doc_nro' => '30712345678',
                'iva_items' => [
                    ['Id' => 5, 'BaseImp' => 100000.0, 'Importe' => 21000.0],
                ],
            ],
        ]);

        $rows = $this->service->buildAccountantCsvRows(collect([$invoice]));
        $this->assertCount(1, $rows);

        $row = $rows[0];
        // 18 columnas: Fecha, PuntoVenta, Numero, TipoComprobante, CAE, VencimientoCAE, DocTipo, DocNro, ClienteRazonSocial, CondicionIVA, NetoGravado, NetoNoGravado, Exento, IVA_21, IVA_105, IVA_27, PercepcionIIBB, Total
        $this->assertCount(18, $row);
        $this->assertSame('00001', $row[1]);
        $this->assertSame('00000124', $row[2]);
        $this->assertSame('76123456789012', $row[4]);
        $this->assertSame('CUIT', $row[6]);
        $this->assertSame('30712345678', $row[7]);
        $this->assertSame('100.000,00', $row[10]); // NetoGravado
        $this->assertSame('21.000,00', $row[13]); // IVA_21
        $this->assertSame('121.000,00', $row[17]); // Total
    }

    public function test_export_iva_digital_endpoint_streams_valid_zip_rg4597(): void
    {
        $response = $this->get(route('export.iva-digital', [
            'from' => Carbon::now()->startOfMonth()->toDateString(),
            'to' => Carbon::now()->toDateString(),
            'format' => 'rg4597',
        ]));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/zip');
    }

    public function test_export_iva_digital_endpoint_streams_valid_zip_rg3685(): void
    {
        $response = $this->get(route('export.iva-digital', [
            'from' => Carbon::now()->startOfMonth()->toDateString(),
            'to' => Carbon::now()->toDateString(),
            'format' => 'rg3685',
        ]));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/zip');
    }

    public function test_export_iva_ventas_endpoint_streams_csv(): void
    {
        $response = $this->get(route('export.iva-ventas', [
            'from' => Carbon::now()->startOfMonth()->toDateString(),
            'to' => Carbon::now()->toDateString(),
        ]));

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
    }
}
