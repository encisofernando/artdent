<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\InvoiceType;
use App\Models\Sale;
use App\Services\EInvoicing\AfipWsClient;
use App\Services\EInvoicing\AfipQrService;

class InvoicesController extends Controller
{
    /**
     * Crea factura desde una venta y AUTORIZA en AFIP en el mismo paso.
     * Requiere: sale_id, invoice_type_code (A|B|C), pos_number
     */
    public function store(Request $r, AfipWsClient $afip)
    {
        $cid = $r->user()->company_id;
        $data = $r->validate([
            'sale_id'=>'required|integer',
            'invoice_type_code'=>'required|string',
            'pos_number'=>'required|integer'
        ]);

        $sale = Sale::where('company_id',$cid)->with(['items','customer'])->findOrFail($data['sale_id']);
        $type = InvoiceType::where('code',$data['invoice_type_code'])->firstOrFail();

        $cbteTipo = $this->mapCbteTipo($type->code); // 1=A,6=B,11=C

        // Calcular neto/iva simple (21%) a modo de ejemplo
        $impTotal = (float) $sale->total;
        $base21   = round($impTotal / 1.21, 2);
        $iva21    = round($impTotal - $base21, 2);

        // Llamar AFIP
        $resp = $afip->authorizeInvoice([
            'pos'       => (int)$data['pos_number'],
            'cbte_tipo' => (int)$cbteTipo,
            'concepto'  => 1,
            'doc_tipo'  => $sale->customer_id ? 80 : 99, // 80=CUIT, 99=CF
            'doc_nro'   => $sale->customer_id ? (int) preg_replace('/\D/','',$sale->customer->tax_id ?? '0') : 0,
            'imp_total' => $impTotal,
            'imp_neto'  => $base21,
            'imp_iva'   => $iva21,
            'iva'       => ['id'=>5,'base'=>$base21,'importe'=>$iva21], // 5=21%
        ]);

        if(($resp['status'] ?? 'rejected') !== 'authorized'){
            return response()->json(['message'=>'AFIP rechazó la solicitud','afip'=>$resp], 422);
        }

        // Crear factura local + items
        $inv = DB::transaction(function() use ($cid,$sale,$type,$data,$resp){
            $inv = Invoice::create([
                'company_id'      => $cid,
                'sale_id'         => $sale->id,
                'invoice_type_id' => $type->id,
                'pos_number'      => (int)$data['pos_number'],
                'invoice_number'  => (int)$resp['cbte_nro'],
                'issue_date'      => now(),
                'customer_name'   => $sale->customer_id ? ($sale->customer->name ?? 'Cliente') : 'Consumidor Final',
                'subtotal'        => (float)$sale->subtotal,
                'tax_total'       => (float)$sale->tax_total,
                'total'           => (float)$sale->total,
                'status'          => 'authorized',
                'cae'             => (string)$resp['cae'],
                'cae_due_date'    => (string)$resp['cae_due'],
                'arca_response'   => ['afip_raw'=>$resp['raw'] ?? null],
            ]);

            // Items (si tu tabla invoice_items existe y querés duplicar líneas de venta)
            if (method_exists($sale, 'items')) {
                foreach ($sale->items as $si) {
                    InvoiceItem::create([
                        'invoice_id' => $inv->id,
                        'product_id' => $si->product_id,
                        'qty'        => (float)$si->qty,
                        'unit_price' => (float)$si->unit_price,
                        'line_total' => (float)$si->line_total,
                        'tax_rate'   => 21.0,
                    ]);
                }
            }

            return $inv;
        });

        // Generar QR
        $qrUrl = AfipQrService::buildUrl([
            'fecha'     => now()->toDateString(),
            'cuit'      => (int) config('afip.cuit'),
            'pto_vta'   => (int) $data['pos_number'],
            'tipo_cmp'  => (int) $cbteTipo,
            'nro_cmp'   => (int) $inv->invoice_number,
            'importe'   => (float) $sale->total,
            'tipo_doc_rec' => $sale->customer_id ? 80 : 99,
            'nro_doc_rec'  => $sale->customer_id ? (int) preg_replace('/\D/','',$sale->customer->tax_id ?? '0') : 0,
            'cae'       => (string) $inv->cae,
        ]);

        // Guardar QR en arca_response
        $meta = (array) ($inv->arca_response ?? []);
        $meta['qr_url'] = $qrUrl;
        $inv->arca_response = $meta;
        $inv->save();

        return $inv->fresh()->load('items','type','sale');
    }

    /**
     * Autoriza una factura YA creada (por ejemplo, si antes estaba en pending).
     * Body: invoice_id (o sale_id + type + pv) — aquí implementamos por sale_id para simplicidad.
     */
    public function authorize(Request $r, AfipWsClient $afip)
    {
        // Para simplicidad, reusa el flujo de store si te pasan sale_id/type/pv
        return $this->store($r, $afip);
    }

    public function show(Request $r, Invoice $invoice){
        $cid = $r->user()->company_id;
        abort_unless($invoice->company_id == $cid, 403, 'Forbidden');
        return $invoice->load('items','type','sale');
    }

    private function mapCbteTipo(string $code): int
    {
        $code = strtoupper(trim($code));
        return match($code){
            'A' => 1,
            'B' => 6,
            'C' => 11,
            default => 11, // fallback Factura C
        };
    }
}
