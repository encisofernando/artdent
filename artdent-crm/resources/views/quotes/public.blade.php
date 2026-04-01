@php
    $company = $quote->company;
    $companyDisplayName = $company?->fantasy_name ?: $company?->name ?: 'ArtDent';
    $companyLegalName = $company?->name ?: $companyDisplayName;
    $companyLocation = collect([$company?->city, $company?->province, $company?->country])->filter()->join(' - ') ?: 'Argentina';
    $companyIvaLabels = [
        'responsable_inscripto' => 'Responsable Inscripto',
        'monotributista' => 'Monotributista',
        'exento' => 'Exento',
        'consumidor_final' => 'Consumidor final',
    ];
    $companyIva = $companyIvaLabels[$company?->iva_condition ?? ''] ?? ($company?->iva_condition ?: 'Monotributista');
    $companyLogo = $company?->documentLogoUrl('lab') ?: '/assets/logo-artdent-color.png';
    $companyFooterLogo = $company?->documentLogoUrl('lab') ?: '/assets/logo-artdent-icon.png';
@endphp
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="{{ asset('assets/logo-artdent-icon.png') }}">
    <link rel="shortcut icon" href="{{ asset('assets/logo-artdent-icon.png') }}">
    <link rel="apple-touch-icon" href="{{ asset('assets/logo-artdent-icon.png') }}">
    <title>Presupuesto {{ $quote->quote_number }} — ArtDent</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Montserrat', sans-serif;
            background: #e8edf2;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 24px 12px 48px;
        }

        .toolbar {
            width: 100%;
            max-width: 850px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }

        .toolbar-brand {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .toolbar-brand img { height: 44px; object-fit: contain; }

        .toolbar-brand span {
            font-size: 13px;
            font-weight: 700;
            color: #397B9C;
            letter-spacing: 0.3px;
        }

        .toolbar-actions { display: flex; gap: 8px; flex-wrap: wrap; }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 9px 18px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            border: none;
            text-decoration: none;
            transition: opacity .15s;
        }
        .btn:hover { opacity: .88; }
        .btn-primary { background: linear-gradient(90deg, #397B9C, #49949C); color: #fff; }
        .btn-whatsapp { background: #25D366; color: #fff; }
        .btn-outline { background: #fff; color: #397B9C; border: 2px solid #397B9C; }

        /* ── A4 paper ── */
        .paper {
            width: 210mm;
            min-height: 297mm;
            background: #fff;
            display: flex;
            flex-direction: column;
            box-shadow: 0 8px 40px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.08);
            border-radius: 4px;
            overflow: hidden;
        }

        .top-stripe { height: 8px; background: linear-gradient(135deg, #397B9C 0%, #49949C 55%, #5AAD9C 100%); flex-shrink: 0; }
        .bottom-stripe { height: 5px; background: linear-gradient(90deg, #397B9C, #49949C, #5AAD9C); flex-shrink: 0; }

        /* Header */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 8mm 15mm 6mm;
            border-bottom: 1px solid #DAE6F0;
            flex-shrink: 0;
        }

        .header-logo img { height: 22mm; max-width: 78mm; object-fit: contain; }

        .header-badge {
            text-align: center;
            border: 2.5px solid #222;
            padding: 6px 18px;
            min-width: 108px;
            align-self: center;
        }
        .header-badge .big-letter { font-size: 28px; font-weight: 900; line-height: 1; }
        .header-badge .badge-sub { border-top: 1px solid #222; margin-top: 3px; padding-top: 3px; font-size: 7px; font-weight: 700; letter-spacing: 1px; }

        .header-info { text-align: right; }
        .header-info .doc-type { font-size: 20px; font-weight: 900; color: #397B9C; letter-spacing: -0.5px; }
        .header-info .doc-num { font-size: 13px; font-weight: 700; color: #222; margin-top: 2px; }
        .header-info .doc-meta { font-size: 8.5px; color: #555; margin-top: 5px; line-height: 1.8; }

        /* Emisor */
        .emisor {
            padding: 5mm 15mm;
            border-bottom: 1px solid #DAE6F0;
            flex-shrink: 0;
        }
        .emisor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; }
        .emisor-name { font-weight: 800; font-size: 10.5px; color: #111; margin-bottom: 2px; }
        .emisor-detail { font-size: 8.5px; line-height: 1.8; color: #333; }

        /* Cliente */
        .cliente {
            padding: 4mm 15mm;
            border-bottom: 1px solid #DAE6F0;
            flex-shrink: 0;
            background: #fafcfe;
        }
        .cliente-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; }
        .field-label { font-weight: 700; font-size: 8.5px; }
        .field-value { font-size: 8.5px; line-height: 1.9; color: #333; }

        /* Validez */
        .validez {
            padding: 3mm 15mm;
            border-bottom: 1px solid #DAE6F0;
            flex-shrink: 0;
            display: flex;
            gap: 24px;
            font-size: 8.5px;
            color: #555;
        }
        .validez strong { color: #222; }

        /* Tabla ítems */
        .items-section { padding: 5mm 15mm 0; flex-shrink: 0; }

        .items-table { width: 100%; border-collapse: collapse; font-size: 8.5px; }
        .items-table thead tr { background: #397B9C; color: #fff; }
        .items-table th { padding: 5px 8px; font-weight: 700; font-size: 7.5px; text-transform: uppercase; letter-spacing: 0.3px; }
        .items-table th:not(:first-child) { border-left: 1px solid rgba(255,255,255,.15); }
        .items-table td { padding: 6px 8px; border-bottom: 1px solid #DAE6F0; }
        .items-table tbody tr:nth-child(even) { background: #f5f9fc; }
        .items-table .col-desc { text-align: left; width: 44%; font-weight: 600; }
        .items-table .col-qty  { text-align: center; width: 10%; }
        .items-table .col-um   { text-align: center; width: 10%; color: #666; }
        .items-table .col-price{ text-align: right;  width: 15%; }
        .items-table .col-disc { text-align: right;  width: 8%;  color: #666; }
        .items-table .col-total{ text-align: right;  width: 13%; font-weight: 700; color: #397B9C; }

        /* Spacer */
        .spacer { flex: 1; min-height: 8mm; }

        /* Totales + footer */
        .bottom-block { flex-shrink: 0; }

        .totals-section {
            padding: 0 15mm 5mm;
            border-top: 1px solid #DAE6F0;
        }
        .totals-inner {
            display: flex;
            justify-content: flex-end;
            padding-top: 5mm;
        }
        .totals-box { width: 72mm; }
        .totals-table { width: 100%; border-collapse: collapse; font-size: 8.5px; border: 1px solid #DAE6F0; }
        .totals-table th { padding: 4px 8px; text-align: left; font-weight: 700; font-size: 7.5px; text-transform: uppercase; letter-spacing: 0.3px; background: #f0f4f8; }
        .totals-table th:last-child { text-align: right; }
        .totals-table td { padding: 4px 8px; font-size: 8.5px; border-top: 1px solid #DAE6F0; }
        .totals-table td:last-child { text-align: right; }
        .total-final {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            padding: 5px 8px;
            background: #397B9C;
            color: #fff;
            border-radius: 0 0 4px 4px;
        }
        .total-final .label { font-weight: 900; font-size: 10px; letter-spacing: 0.5px; }
        .total-final .value { font-weight: 900; font-size: 13px; }

        .notes-section {
            margin: 6px 15mm 0;
            font-size: 8px;
            color: #555;
            line-height: 1.6;
        }
        .notes-section strong { color: #333; }

        /* Footer institucional */
        .footer {
            padding: 4mm 15mm;
            border-top: 1px solid #DAE6F0;
            background: #fafcfe;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .footer-left { display: flex; align-items: center; gap: 10px; }
        .footer-logo img { height: 10mm; max-width: 20mm; object-fit: contain; }
        .footer-slogan { font-size: 7.5px; color: #49949C; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .footer-right { text-align: right; font-size: 7px; color: #bbb; line-height: 1.7; }

        /* ── Estado badge ── */
        .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 6px;
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 6px;
        }
        .status-draft    { background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; }
        .status-sent     { background: #eff6ff; color: #3b82f6; border: 1px solid #bfdbfe; }
        .status-accepted { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .status-expired  { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }
        .status-cancelled{ background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

        @media print {
            body { background: #fff; padding: 0; }
            .toolbar { display: none; }
            .paper { box-shadow: none; border-radius: 0; width: 100%; }
        }

        @media (max-width: 220mm) {
            .paper { width: 100%; min-height: auto; }
        }
    </style>
</head>
<body>

    <!-- Toolbar -->
    <div class="toolbar">
        <div class="toolbar-brand">
            <img src="{{ $companyLogo }}" alt="{{ $companyDisplayName }}" onerror="this.style.display='none'">
            <span>{{ $companyDisplayName }}</span>
        </div>
        <div class="toolbar-actions">
            <button onclick="window.print()" class="btn btn-primary">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Imprimir / Guardar PDF
            </button>
            <a href="https://wa.me/?text={{ urlencode('Hola! Te comparto el presupuesto ' . $quote->quote_number . ' de ' . $companyDisplayName . '. Podés verlo aquí: ' . route('quotes.public', $quote->public_token)) }}"
               target="_blank" class="btn btn-whatsapp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Compartir por WhatsApp
            </a>
        </div>
    </div>

    <!-- Paper A4 -->
    <div class="paper">
        <div class="top-stripe"></div>

        <!-- Header -->
        <div class="header">
            <div class="header-logo">
                <img src="{{ $companyLogo }}" alt="{{ $companyDisplayName }}" onerror="this.style.display='none'">
            </div>
            <div class="header-badge">
                <div class="big-letter">P</div>
                <div class="badge-sub">PRESUPUESTO</div>
                <div class="badge-sub">ORIGINAL</div>
            </div>
            <div class="header-info">
                <div class="doc-type">PRESUPUESTO</div>
                <div class="doc-num">{{ $quote->quote_number }}</div>
                <div class="doc-meta">
                    <div><strong>Fecha de Emisión:</strong> {{ $quote->issued_at ? $quote->issued_at->format('d/m/Y') : now()->format('d/m/Y') }}</div>
                    @if($quote->due_date)
                    <div><strong>Válido hasta:</strong> {{ $quote->due_date instanceof \Carbon\Carbon ? $quote->due_date->format('d/m/Y') : \Carbon\Carbon::parse($quote->due_date)->format('d/m/Y') }}</div>
                    @endif
                </div>
                @php
                    $statusLabels = ['draft'=>'Borrador','sent'=>'Enviado','accepted'=>'Aceptado','expired'=>'Vencido','cancelled'=>'Cancelado'];
                    $statusCss = ['draft'=>'status-draft','sent'=>'status-sent','accepted'=>'status-accepted','expired'=>'status-expired','cancelled'=>'status-cancelled'];
                @endphp
                <span class="status-badge {{ $statusCss[$quote->status] ?? 'status-draft' }}">
                    {{ $statusLabels[$quote->status] ?? $quote->status }}
                </span>
            </div>
        </div>

        <!-- Emisor -->
        <div class="emisor">
            <div class="emisor-grid">
                <div>
                    <div class="emisor-name">{{ $companyLegalName }}</div>
                    <div class="emisor-detail">
                        @if($company?->address)
                            {{ $company->address }}<br>
                        @endif
                        {{ $companyLocation }}
                    </div>
                </div>
                <div class="emisor-detail" style="text-align:right;">
                    <div><strong>Condición IVA:</strong> {{ $companyIva }}</div>
                    @if($company?->cuit)
                        <div><strong>CUIT:</strong> {{ $company->cuit }}</div>
                    @endif
                </div>
            </div>
        </div>

        <!-- Cliente -->
        <div class="cliente">
            <div class="cliente-grid">
                <div>
                    <div class="field-value">
                        <span class="field-label">Cliente: </span>{{ $quote->recipient_name }}<br>
                        @if($quote->recipient_cuit)
                            <span class="field-label">CUIT/DNI: </span>{{ $quote->recipient_cuit }}<br>
                        @endif
                        @if($quote->recipient_iva)
                            <span class="field-label">Cond. IVA: </span>{{ $quote->recipient_iva }}<br>
                        @endif
                        @if($quote->recipient_address)
                            <span class="field-label">Dirección: </span>{{ $quote->recipient_address }}
                        @endif
                    </div>
                </div>
                <div class="field-value" style="text-align:right;">
                    @php
                        $notesLines = explode("\n", $quote->notes ?? '');
                        foreach($notesLines as $line) {
                            if(str_starts_with($line, 'Tel:') || str_starts_with($line, 'Email:')) {
                                echo '<div>' . e($line) . '</div>';
                            }
                        }
                    @endphp
                    <div><span class="field-label">Cond. Venta: </span>A convenir</div>
                </div>
            </div>
        </div>

        @if($quote->due_date)
        <div class="validez">
            <div><strong>Presupuesto válido hasta:</strong> {{ $quote->due_date instanceof \Carbon\Carbon ? $quote->due_date->format('d/m/Y') : \Carbon\Carbon::parse($quote->due_date)->format('d/m/Y') }}</div>
            <div><strong>Precios sujetos a variación.</strong></div>
        </div>
        @endif

        <!-- Ítems -->
        <div class="items-section">
            <table class="items-table">
                <thead>
                    <tr>
                        <th class="col-desc" style="text-align:left;">Descripción</th>
                        <th class="col-qty">Cantidad</th>
                        <th class="col-um">U. Medida</th>
                        <th class="col-price" style="text-align:right;">P. Unit.</th>
                        <th class="col-total" style="text-align:right;">Importe</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($quote->invoice_items as $item)
                    <tr>
                        <td class="col-desc">{{ $item->description }}</td>
                        <td class="col-qty" style="text-align:center;">{{ number_format($item->quantity, 0, ',', '.') }}</td>
                        <td class="col-um" style="text-align:center;">Unid.</td>
                        <td class="col-price" style="text-align:right;">$ {{ number_format($item->unit_price, 2, ',', '.') }}</td>
                        <td class="col-total" style="text-align:right;">$ {{ number_format($item->total, 2, ',', '.') }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="spacer"></div>

        <!-- Totales + Footer -->
        <div class="bottom-block">
            <div class="totals-section">
                <div class="totals-inner">
                    <div class="totals-box">
                        <table class="totals-table">
                            <thead>
                                <tr>
                                    <th>Descripción</th>
                                    <th>Importe</th>
                                </tr>
                            </thead>
                            <tbody>
                                @if($quote->subtotal && $quote->subtotal != $quote->total)
                                <tr>
                                    <td>Subtotal:</td>
                                    <td>$ {{ number_format($quote->subtotal, 2, ',', '.') }}</td>
                                </tr>
                                @endif
                                @if($quote->discount && $quote->discount > 0)
                                <tr>
                                    <td>Descuento:</td>
                                    <td style="color:#dc2626;">- $ {{ number_format($quote->discount, 2, ',', '.') }}</td>
                                </tr>
                                @endif
                                @if($quote->tax_amount && $quote->tax_amount > 0)
                                <tr>
                                    <td>IVA:</td>
                                    <td>$ {{ number_format($quote->tax_amount, 2, ',', '.') }}</td>
                                </tr>
                                @endif
                            </tbody>
                        </table>
                        <div class="total-final">
                            <span class="label">IMPORTE TOTAL: $</span>
                            <span class="value">{{ number_format($quote->total, 2, ',', '.') }}</span>
                        </div>
                    </div>
                </div>

                @php
                    $extraNotes = collect(explode("\n", $quote->notes ?? ''))
                        ->filter(fn($l) => !str_starts_with($l, 'Tel:') && !str_starts_with($l, 'Email:'))
                        ->implode("\n");
                @endphp
                @if(trim($extraNotes))
                <div class="notes-section">
                    <strong>Notas:</strong> {{ trim($extraNotes) }}
                </div>
                @endif
            </div>

            <div class="footer">
                <div class="footer-left">
                    <div class="footer-logo">
                        <img src="{{ $companyFooterLogo }}" alt="{{ $companyDisplayName }}" onerror="this.style.display='none'">
                    </div>
                    <span class="footer-slogan">Tu sonrisa, es nuestra prioridad.</span>
                </div>
                <div class="footer-right">
                    <div>Este presupuesto no constituye factura</div>
                    <div>ArtDent CRM — {{ now()->format('d/m/Y') }}</div>
                </div>
            </div>
            <div class="bottom-stripe"></div>
        </div>
    </div>

</body>
</html>
