<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Comprobante</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
}
body {
    font-family: 'Montserrat', 'Helvetica Neue', Arial, sans-serif;
    font-size: 10pt;
    color: #1A202C;
    background: #fff;
    width: 210mm;
    min-height: 297mm;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
}
strong { font-weight: 700; }
</style>
</head>
<body>

@php
    $invType = $invoice->invoice_type;
    $items   = $invoice->invoice_items;

    $receiptMap = [
        'FA'  => ['letter' => 'A', 'label' => 'FACTURA A',    'code' => '01'],
        'FB'  => ['letter' => 'B', 'label' => 'FACTURA B',    'code' => '06'],
        'FC'  => ['letter' => 'C', 'label' => 'FACTURA C',    'code' => '11'],
        'NCA' => ['letter' => 'A', 'label' => 'N. CRÉDITO A', 'code' => '02'],
        'NCB' => ['letter' => 'B', 'label' => 'N. CRÉDITO B', 'code' => '07'],
        'NCC' => ['letter' => 'C', 'label' => 'N. CRÉDITO C', 'code' => '12'],
    ];
    $typeName = $invType->name ?? 'FC';
    $receipt  = $receiptMap[$typeName] ?? ['letter' => 'C', 'label' => 'FACTURA C', 'code' => '11'];

    $pointSale = str_pad($invoice->point_sale, 5, '0', STR_PAD_LEFT);
    $number    = str_pad($invoice->number,     8, '0', STR_PAD_LEFT);

    $cuitRaw     = preg_replace('/\D/', '', $company->cuit ?? '');
    $cuitFmt     = strlen($cuitRaw) === 11
        ? substr($cuitRaw,0,2).'-'.substr($cuitRaw,2,8).'-'.substr($cuitRaw,10)
        : ($company->cuit ?? '—');
    $ivaLabels   = [
        'responsable_inscripto' => 'Responsable Inscripto',
        'monotributista'        => 'Responsable Monotributo',
        'exento'                => 'IVA Exento',
        'consumidor_final'      => 'Consumidor Final',
    ];
    $ivaVendedor       = $ivaLabels[$company->iva_condition ?? ''] ?? 'Responsable Inscripto';
    $recipientIvaLabel = $ivaLabels[$invoice->recipient_iva ?? ''] ?? 'Consumidor Final';
    // Nombre del receptor: primero el del invoice, si es genérico usar datos del pedido
    $recipientName = $invoice->recipient_name ?? '';
    if ((!$recipientName || $recipientName === 'Consumidor Final') && isset($order) && $order->exists) {
        $recipientName = $order->shipping_name ?? $order->customer?->name ?? '';
    }
    if (!$recipientName) { $recipientName = 'Consumidor Final'; }

    $recipDoc          = preg_replace('/\D/', '', $invoice->recipient_cuit ?? $order?->guest_cuit ?? $order?->guest_dni ?? '');
    $recipDocLabel     = strlen($recipDoc) === 11 ? 'CUIT' : (strlen($recipDoc) >= 7 ? 'DNI' : null);
    $direccion         = collect([$company->address, $company->city, $company->province])->filter()->join(', ') ?: 'Argentina';
    $inicioAct         = $company->start_date ? \Carbon\Carbon::parse($company->start_date)->format('j/n/Y') : null;

    $totalIva  = (float)($invoice->tax_amount ?? 0);
    $subtotal  = (float)($invoice->subtotal  ?? 0);
    $discount  = (float)($invoice->discount  ?? 0);
    $total     = (float)($invoice->total     ?? 0);
    // Para Transparencia Fiscal (Ley 27.743): siempre mostrar IVA contenido.
    // Si el comprobante no discrimina IVA (FC/monotributista), se retrocomputa del total al 21%.
    $ivaContenido = $totalIva > 0 ? $totalIva : round($total / 1.21 * 0.21, 2);

    $fmt     = fn($v) => number_format((float)($v ?? 0), 2, ',', '.');
    // j/n/Y → sin ceros (ej: 21/3/2026), igual que toLocaleDateString('es-AR')
    $fmtDate = fn($d) => $d ? \Carbon\Carbon::parse($d)->format('j/n/Y') : '—';
    // Hora en formato es-AR: "04:41 p. m."
    $fmtHora = function($d) {
        if (!$d) return '—';
        $c    = \Carbon\Carbon::parse($d);
        $ampm = $c->format('a') === 'am' ? 'a. m.' : 'p. m.';
        return $c->format('h:i') . ' ' . $ampm;
    };

    $medioPago = isset($order)
        ? ucfirst(str_replace('_', ' ', $order->selected_payment_method ?? 'Contado'))
        : 'Contado';

    // QR ARCA
    $qrData = [
        'ver'        => 1,
        'fecha'      => \Carbon\Carbon::parse($invoice->issued_at ?? now())->format('Y-m-d'),
        'cuit'       => (int)$cuitRaw,
        'ptoVta'     => (int)($invoice->point_sale ?? 1),
        'tipoCmp'    => (int)($invType->afip_code  ?? 11),
        'nroCmp'     => (int)($invoice->number     ?? 1),
        'importe'    => $total,
        'moneda'     => 'PES',
        'ctz'        => 1,
        'tipoCodAut' => 'E',
        'codAut'     => (int)($invoice->cae        ?? 0),
    ];
    if ($recipDoc && strlen($recipDoc) >= 7) {
        $qrData['tipoDocRec'] = strlen($recipDoc) === 11 ? 80 : 96;
        $qrData['nroDocRec']  = (int)$recipDoc;
    }
    $qrUrl = 'https://www.arca.gob.ar/fe/qr/?p=' . base64_encode(json_encode($qrData));

    $qrOpts = new \chillerlan\QRCode\QROptions;
    $qrOpts->outputInterface = \chillerlan\QRCode\Output\QRMarkupSVG::class;
    $qrOpts->eccLevel        = \chillerlan\QRCode\Common\EccLevel::M;
    $qrOpts->scale           = 4;
    $qrOpts->addQuietzone    = true;
    $qrOpts->quietzoneSize   = 2;
    $qrRaw = (new \chillerlan\QRCode\QRCode($qrOpts))->render($qrUrl);
    if (str_starts_with($qrRaw, 'data:image/svg+xml;base64,')) {
        $qrSvg = base64_decode(substr($qrRaw, strlen('data:image/svg+xml;base64,')));
    } else {
        $qrSvg = $qrRaw;
    }
    $qrSvg = preg_replace('/<svg([^>]*)>/', '<svg$1 width="76" height="76" style="display:block">', $qrSvg, 1);

    // Helper: convierte una ruta local a base64 data URI
    $encodeImg = function(string $path, string $mime = 'image/png'): string {
        return file_exists($path)
            ? "data:{$mime};base64," . base64_encode(file_get_contents($path))
            : '';
    };

    $storedLogoUrl = $company->documentLogoUrl('general');

    // Logo principal: primero lo que tenga la empresa en la DB, sino el asset estático
    if (!empty($storedLogoUrl)) {
        // logo_url puede ser '/storage/logos/file.png' → public_path('storage/logos/file.png')
        $dbLogoPath  = public_path(ltrim($storedLogoUrl, '/'));
        $logoColorSrc = $encodeImg($dbLogoPath);
    }
    if (empty($logoColorSrc)) {
        $logoColorSrc = $encodeImg(public_path('assets/artcode-horizontal-color.png'));
    }

    // Logo icono (footer): si la empresa tiene logo propio lo usa, si no el icono estático
    $logoIconSrc = !empty($logoColorSrc)
        ? $logoColorSrc
        : $encodeImg(public_path('assets/artcode-horizontal-color.png'));

    // Logo ARCA (JPEG)
    $arcaLogoSrc = $encodeImg(public_path('images/logo-arca.jpg'), 'image/jpeg');
@endphp

{{-- ── Franja superior ──────────────────────────────────────────────────── --}}
<div style="background: linear-gradient(135deg, #397B9C 0%, #49949C 55%, #5AAD9C 100%); height: 8px; flex-shrink: 0;"></div>

{{-- ── HEADER ───────────────────────────────────────────────────────────── --}}
<div style="display: grid; grid-template-columns: 1fr 90px 1fr; gap: 0; align-items: start; padding: 6mm 15mm 5mm; border-bottom: 2px solid #222; flex-shrink: 0;">

    {{-- Izquierda: todos los datos del emisor --}}
    <div style="display: flex; flex-direction: column; gap: 2px;">
        @if($logoColorSrc)
            <img src="{{ $logoColorSrc }}" alt="{{ $company->name }}" style="height: 22mm; object-fit: contain; display: block; max-width: 78mm; margin-bottom: 4px;">
        @endif
        {{-- Siempre se muestra la razón social (name), nunca el nombre de fantasía --}}
        <div style="font-weight: 800; font-size: {{ $logoColorSrc ? '9pt' : '16pt' }}; color: #111; line-height: 1.2;">
            {{ $company->name }}
        </div>
        <div style="font-size: 7.5pt; color: #444; line-height: 1.75; margin-top: 2px;">
            @if($company->address)<div>{{ $company->address }}</div>@endif
            @if($company->city || $company->province)
                <div>{{ collect([$company->city, $company->province])->filter()->join(' - ') }}</div>
            @endif
            @if($company->phone)<div>Teléfono: {{ $company->phone }}</div>@endif
            @if($company->email)<div>{{ $company->email }}</div>@endif
            <div style="margin-top: 3px;">{{ $ivaVendedor }}</div>
        </div>
    </div>

    {{-- Centro: letra AFIP --}}
    <div style="text-align: center; border: 2.5px solid #222; padding: 4px 0; align-self: stretch; display: flex; flex-direction: column; justify-content: center;">
        <div style="font-size: 42pt; font-weight: 900; line-height: 1; letter-spacing: -2px; color: #111;">{{ $receipt['letter'] }}</div>
        <div style="border-top: 1.5px solid #222; margin-top: 4px; padding-top: 4px; font-size: 7pt; font-weight: 700; letter-spacing: 0.5px;">
            COD. {{ $receipt['code'] }}
        </div>
        <div style="font-size: 7pt; font-weight: 700; letter-spacing: 0.5px;">ORIGINAL</div>
    </div>

    {{-- Derecha: tipo + número + fecha + datos fiscales --}}
    <div style="text-align: right; padding-left: 12px;">
        <div style="font-size: 20pt; font-weight: 900; color: #397B9C; letter-spacing: -0.5px;">
            {{ $receipt['label'] }}
        </div>
        <div style="font-size: 11.5pt; font-weight: 700; color: #222; margin-top: 2px;">
            Nº {{ $pointSale }}-{{ $number }}
        </div>
        <div style="font-size: 8pt; color: #444; margin-top: 5px; line-height: 1.9;">
            <div><strong>Fecha:</strong> {{ $fmtDate($invoice->issued_at) }}</div>
            @if($company->cuit)<div><strong>C.U.I.T.:</strong> {{ $cuitFmt }}</div>@endif
            @if($company->iibb)<div><strong>Ing. Brutos:</strong> {{ $company->iibb }}</div>@endif
            @if($inicioAct)<div><strong>Inicio de Actividades:</strong> {{ $inicioAct }}</div>@endif
        </div>
    </div>

</div>

{{-- ── RECEPTOR ─────────────────────────────────────────────────────────── --}}
<div style="padding: 3.5mm 15mm; border-bottom: 1px solid #DAE6F0; flex-shrink: 0;">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6mm;">
        <div style="font-size: 8.5pt; line-height: 1.9;">
            <div><strong>Nombre y Apellido o Razón Social:</strong> {{ $recipientName }}</div>
            @if($recipDocLabel && $invoice->recipient_cuit)
                <div><strong>{{ $recipDocLabel }}:</strong> {{ $invoice->recipient_cuit }}</div>
            @endif
        </div>
        <div style="font-size: 8.5pt; line-height: 1.9; text-align: right;">
            <div><strong>Cond. IVA:</strong> {{ $recipientIvaLabel }}</div>
            <div><strong>Condición de Venta:</strong> {{ $medioPago }}</div>
            @if(isset($order) && $order->order_number)
                <div><strong>Pedido:</strong> {{ $order->order_number }}</div>
            @endif
        </div>
    </div>
</div>

{{-- ── TABLA DE ÍTEMS ───────────────────────────────────────────────────── --}}
<div style="padding: 5mm 15mm 0; position: relative; z-index: 1; flex-shrink: 0;">
    <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt;">
        <thead>
            <tr style="background: #397B9C; color: #fff;">
                <th style="padding: 5px 8px; text-align: left;   font-weight: 700; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.3px; width: 14%;">Código</th>
                <th style="padding: 5px 8px; text-align: left;   font-weight: 700; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.3px; width: 36%; border-left: 1px solid rgba(255,255,255,0.15);">Descripción</th>
                <th style="padding: 5px 8px; text-align: center; font-weight: 700; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.3px; width: 10%; border-left: 1px solid rgba(255,255,255,0.15);">Cantidad</th>
                <th style="padding: 5px 8px; text-align: center; font-weight: 700; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.3px; width: 10%; border-left: 1px solid rgba(255,255,255,0.15);">U. Medida</th>
                <th style="padding: 5px 8px; text-align: right;  font-weight: 700; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.3px; width: 13%; border-left: 1px solid rgba(255,255,255,0.15);">P. Unit.</th>
                <th style="padding: 5px 8px; text-align: right;  font-weight: 700; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.3px; width: 8%;  border-left: 1px solid rgba(255,255,255,0.15);">%<br>Bonif.</th>
                <th style="padding: 5px 8px; text-align: right;  font-weight: 700; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.3px; width: 9%;  border-left: 1px solid rgba(255,255,255,0.15);">Importe</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $i => $item)
                <tr style="background: {{ $i % 2 === 0 ? '#fff' : '#f5f9fc' }}; border-bottom: 1px solid #DAE6F0;">
                    <td style="padding: 6px 8px; color: #666; font-size: 8pt;">{{ $item->sku ?? '—' }}</td>
                    <td style="padding: 6px 8px; font-weight: 600; font-size: 9pt;">{{ $item->description }}</td>
                    <td style="padding: 6px 8px; text-align: center; font-size: 9pt;">{{ number_format((float)$item->quantity, 0) }}</td>
                    <td style="padding: 6px 8px; text-align: center; font-size: 8.5pt; color: #666;">Unid.</td>
                    <td style="padding: 6px 8px; text-align: right; font-size: 9pt;">{{ $fmt($item->unit_price) }}</td>
                    <td style="padding: 6px 8px; text-align: right; font-size: 9pt; color: {{ (float)($item->discount ?? 0) > 0 ? '#c00' : '#999' }};">
                        {{ (float)($item->discount ?? 0) > 0
                            ? $fmt((float)$item->discount / (float)$item->unit_price * 100).'%'
                            : '0,00' }}
                    </td>
                    <td style="padding: 6px 8px; text-align: right; font-weight: 700; font-size: 9pt; color: #397B9C;">{{ $fmt($item->total) }}</td>
                </tr>
            @endforeach
            @if(isset($order) && (float)($order->shipping_cost ?? 0) > 0)
                <tr style="background: {{ $items->count() % 2 === 0 ? '#fff' : '#f5f9fc' }}; border-bottom: 1px solid #DAE6F0;">
                    <td style="padding: 6px 8px; color: #666; font-size: 8pt;">—</td>
                    <td style="padding: 6px 8px; font-weight: 600; font-size: 9pt;">Costo de envío</td>
                    <td style="padding: 6px 8px; text-align: center;">1</td>
                    <td style="padding: 6px 8px; text-align: center; color: #666;">—</td>
                    <td style="padding: 6px 8px; text-align: right;">{{ $fmt($order->shipping_cost) }}</td>
                    <td style="padding: 6px 8px; text-align: right; color: #999;">0,00</td>
                    <td style="padding: 6px 8px; text-align: right; font-weight: 700; color: #397B9C;">{{ $fmt($order->shipping_cost) }}</td>
                </tr>
            @endif
        </tbody>
    </table>
</div>

{{-- ── SPACER ───────────────────────────────────────────────────────────── --}}
<div style="flex: 1; min-height: 8mm;"></div>

{{-- ── BLOQUE INFERIOR ──────────────────────────────────────────────────── --}}
<div style="position: relative; z-index: 1; flex-shrink: 0;">

    {{-- Totales --}}
    <div style="padding: 0 15mm 5mm; border-top: 1px solid #DAE6F0;">
        <div style="display: flex; justify-content: flex-end; padding-top: 5mm;">
            <div style="width: 72mm;">
                <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt; border: 1px solid #DAE6F0; border-bottom: none;">
                    <thead>
                        <tr style="background: #f0f4f8;">
                            <th style="padding: 4px 8px; text-align: left;  font-weight: 700; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.3px;">Descripción</th>
                            <th style="padding: 4px 8px; text-align: right; font-weight: 700; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.3px;">Importe</th>
                        </tr>
                    </thead>
                    <tbody>
                        @if($totalIva > 0)
                            <tr style="border-top: 1px solid #DAE6F0;">
                                <td style="padding: 4px 8px; font-size: 8.5pt;">Importe Neto Gravado:</td>
                                <td style="padding: 4px 8px; text-align: right; font-size: 8.5pt;">{{ $fmt($subtotal > 0 ? $subtotal : $total - $totalIva) }}</td>
                            </tr>
                            <tr style="border-top: 1px solid #DAE6F0;">
                                <td style="padding: 4px 8px; font-size: 8.5pt;">IVA 21,00 %:</td>
                                <td style="padding: 4px 8px; text-align: right; font-size: 8.5pt;">{{ $fmt($totalIva) }}</td>
                            </tr>
                        @endif
                        @if($discount > 0)
                            <tr style="border-top: 1px solid #DAE6F0;">
                                <td style="padding: 4px 8px; font-size: 8.5pt;">Descuento:</td>
                                <td style="padding: 4px 8px; text-align: right; font-size: 8.5pt; color: #c00;">-{{ $fmt($discount) }}</td>
                            </tr>
                        @endif
                    </tbody>
                    {{-- Barra TOTAL dentro de la tabla para que el border sea continuo --}}
                    <tfoot>
                        <tr style="background: #397B9C;">
                            <td style="padding: 5px 8px; color: #fff; font-weight: 900; font-size: 10pt; letter-spacing: 0.5px; border-radius: 0 0 0 4px;">IMPORTE TOTAL: $</td>
                            <td style="padding: 5px 8px; color: #fff; font-weight: 900; font-size: 13pt; text-align: right; border-radius: 0 0 4px 0;">{{ $fmt($total) }}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>

        {{-- Transparencia Fiscal --}}
        <div style="margin-top: 8px; font-size: 7.5pt; line-height: 1.7; color: #444;">
            <div style="font-weight: 700;">Régimen de Transparencia Fiscal al Consumidor (Ley 27.743)</div>
            <div style="display: flex; gap: 24px;">
                <span>IVA Contenido: $ {{ $fmt($ivaContenido) }}</span>
                <span>Otros Impuestos Nacionales Indirectos: $ 0,00</span>
            </div>
        </div>

        {{-- Son / Recibido --}}
        <div style="margin-top: 6px; font-size: 8pt; color: #555;">
            <strong>Son:</strong>
            <em>{{ $fmt($total) }} pesos argentinos</em>
            &nbsp;&nbsp;&nbsp;
            <strong>Recibido:</strong> ${{ $fmt($total) }}
        </div>
    </div>

    {{-- Footer AFIP: QR + Logo ARCA + CAE --}}
    @if($invoice->cae)
    <div style="padding: 3mm 15mm; border-top: 2px solid #222; display: flex; align-items: center; gap: 14px; background: #fff;">
        {{-- QR --}}
        <div style="width: 76px; height: 76px; flex-shrink: 0;">{!! $qrSvg !!}</div>

        {{-- Logo ARCA + leyenda --}}
        <div style="flex: 1; display: flex; flex-direction: column; gap: 3px;">
            @if($arcaLogoSrc)
                <img src="{{ $arcaLogoSrc }}" alt="ARCA" style="height: 28px; width: auto; object-fit: contain; object-position: left; display: block;">
            @endif
            <div style="font-weight: 800; font-size: 9pt; color: #111;">Comprobante Autorizado</div>
            <div style="font-size: 6.5pt; color: #555; line-height: 1.5; max-width: 240px;">
                Esta Administración Federal no se responsabiliza por los datos ingresados en el detalle de la operación.
            </div>
        </div>

        {{-- CAE + Vto --}}
        <div style="text-align: right; font-size: 8.5pt; line-height: 1.9; white-space: nowrap;">
            <div><strong>CAE Nº:</strong> {{ $invoice->cae }}</div>
            <div><strong>Fecha Vto. de CAE:</strong> {{ $fmtDate($invoice->cae_expiry) }}</div>
        </div>
    </div>
    @endif

    {{-- Footer institucional --}}
    <div style="padding: 3mm 15mm; border-top: 1px solid #DAE6F0; background: #fafcfe;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
                @if($logoIconSrc)
                    <img src="{{ $logoIconSrc }}" alt="ArtCode" style="height: 10mm; object-fit: contain; display: block; max-width: 20mm;">
                @endif
                <span style="font-size: 7.5pt; color: #49949C; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                    {{ $company->name }} — Tu sonrisa, es nuestra prioridad.
                </span>
            </div>
            <div style="text-align: right; font-size: 7pt; color: #bbb; line-height: 1.7;">
                <div>Generado por ArtCode CRM — {{ now()->format('d/m/Y') }}</div>
            </div>
        </div>
    </div>

</div>

</body>
</html>
