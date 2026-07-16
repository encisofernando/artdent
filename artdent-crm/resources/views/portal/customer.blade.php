<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/svg+xml" href="{{ asset('assets/artcode-icon-color.svg') }}">
    <link rel="shortcut icon" href="{{ asset('assets/artcode-icon-color.svg') }}">
    <link rel="apple-touch-icon" href="{{ asset('assets/artcode-icon-color.svg') }}">
    <title>Mi Portal — {{ $customer->name }}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
            --blue: #397B9C; --teal: #49949C; --green: #5AAD9C; --mint: #ACD6CE;
            --red: #E63946; --orange: #F4A261;
            --bg: #f0f4f8; --card: #fff; --border: #e2e8f0;
            --text: #1e293b; --muted: #64748b;
        }
        body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }

        /* Header */
        .header {
            background: linear-gradient(135deg, var(--blue) 0%, var(--teal) 55%, var(--green) 100%);
            color: #fff; padding: 28px 24px 56px;
        }
        .header-inner { max-width: 960px; margin: 0 auto; }
        .header h1 { font-size: 22px; font-weight: 800; }
        .header p  { font-size: 13px; opacity: .8; margin-top: 4px; }
        .header .chips { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
        .chip { background: rgba(255,255,255,.18); border-radius: 999px; padding: 4px 12px; font-size: 12px; font-weight: 600; }

        /* Main */
        .main { max-width: 960px; margin: -32px auto 40px; padding: 0 16px; }

        /* Balance card */
        .balance-card {
            background: var(--card); border-radius: 20px; border: 1px solid var(--border);
            padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,.08); margin-bottom: 24px;
            display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;
        }
        .balance-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); }
        .balance-amount { font-size: 36px; font-weight: 800; margin-top: 4px; }
        .balance-amount.debt   { color: var(--red); }
        .balance-amount.credit { color: var(--green); }
        .balance-amount.zero   { color: var(--teal); }
        .balance-note { font-size: 12px; color: var(--muted); margin-top: 4px; }

        /* Section */
        .section { background: var(--card); border-radius: 20px; border: 1px solid var(--border);
            box-shadow: 0 2px 12px rgba(0,0,0,.05); margin-bottom: 20px; overflow: hidden; }
        .section-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 8px; }
        .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); }
        .section-count { background: var(--bg); border-radius: 999px; padding: 2px 8px; font-size: 11px; font-weight: 700; color: var(--muted); }

        /* Table */
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { padding: 10px 16px; text-align: left; font-size: 10.5px; font-weight: 700; text-transform: uppercase;
             letter-spacing: .08em; color: var(--muted); background: #f8fafc; border-bottom: 1px solid var(--border); }
        td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #fafbfc; }
        .text-right { text-align: right; }
        .text-mono { font-family: monospace; font-weight: 600; }

        /* Status badges */
        .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .badge-green  { background: #d1fae5; color: #065f46; }
        .badge-blue   { background: #dbeafe; color: #1e40af; }
        .badge-yellow { background: #fef3c7; color: #92400e; }
        .badge-red    { background: #fee2e2; color: #991b1b; }
        .badge-gray   { background: #f1f5f9; color: #475569; }

        /* Move type */
        .move-payment { color: var(--green); font-weight: 700; }
        .move-charge  { color: var(--red);   font-weight: 700; }

        /* Empty */
        .empty { padding: 32px; text-align: center; color: var(--muted); font-size: 13px; }

        /* Link */
        a.view-link { color: var(--teal); text-decoration: none; font-size: 12px; font-weight: 600; }
        a.view-link:hover { text-decoration: underline; }

        /* Footer */
        .footer { text-align: center; padding: 24px; font-size: 12px; color: var(--muted); }

        @media (max-width: 640px) {
            th, td { padding: 10px 10px; font-size: 12px; }
            .balance-amount { font-size: 28px; }
            .hide-mobile { display: none; }
        }
    </style>
</head>
<body>

<div class="header">
    <div class="header-inner">
        <h1>Mi Portal de Cliente</h1>
        <p>{{ $customer->name }}</p>
        <div class="chips">
            @if($customer->email)  <span class="chip">✉ {{ $customer->email }}</span> @endif
            @if($customer->phone)  <span class="chip">☎ {{ $customer->phone }}</span> @endif
            @if($customer->dni)    <span class="chip">DNI {{ $customer->dni }}</span>  @endif
        </div>
    </div>
</div>

<div class="main">

    {{-- ── Balance ── --}}
    @php
        $bal = (float) $account->balance;
        $balClass = $bal > 0 ? 'debt' : ($bal < 0 ? 'credit' : 'zero');
        $balNote  = $bal > 0 ? 'Monto adeudado' : ($bal < 0 ? 'Saldo a tu favor' : 'Sin saldo pendiente');
        $balFmt   = '$ ' . number_format(abs($bal), 2, ',', '.');
    @endphp
    <div class="balance-card">
        <div>
            <div class="balance-label">Saldo en Cuenta Corriente</div>
            <div class="balance-amount {{ $balClass }}">{{ $balFmt }}</div>
            <div class="balance-note">{{ $balNote }}</div>
        </div>
        <div style="text-align:right">
            <div class="balance-label">Última actualización</div>
            <div style="font-size:13px;font-weight:600;margin-top:4px;color:var(--muted)">{{ now()->format('d/m/Y H:i') }}</div>
        </div>
    </div>

    {{-- ── Ventas ── --}}
    <div class="section">
        <div class="section-header">
            <span class="section-title">Mis Compras / Ventas</span>
            <span class="section-count">{{ count($sales) }}</span>
        </div>
        @if(count($sales) === 0)
            <div class="empty">Sin compras registradas.</div>
        @else
        <table>
            <thead>
                <tr>
                    <th>N° Comprobante</th>
                    <th>Fecha</th>
                    <th class="text-right">Total</th>
                    <th class="text-right hide-mobile">Cobrado</th>
                    <th class="text-right hide-mobile">Saldo</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                @foreach($sales as $sale)
                <tr>
                    <td class="text-mono">{{ $sale['number'] }}</td>
                    <td>{{ $sale['date'] }}</td>
                    <td class="text-right" style="font-weight:700">$ {{ number_format($sale['total'], 2, ',', '.') }}</td>
                    <td class="text-right hide-mobile" style="color:var(--green)">$ {{ number_format($sale['paid'], 2, ',', '.') }}</td>
                    <td class="text-right hide-mobile" style="color:{{ $sale['balance'] > 0 ? 'var(--red)' : 'var(--green)' }}">
                        $ {{ number_format($sale['balance'], 2, ',', '.') }}
                    </td>
                    <td>
                        @php
                            $statusMap = ['completed'=>'badge-green','paid'=>'badge-green','pending'=>'badge-yellow','cancelled'=>'badge-red','draft'=>'badge-gray'];
                            $sc = $statusMap[$sale['status']] ?? 'badge-gray';
                        @endphp
                        <span class="badge {{ $sc }}">{{ ucfirst($sale['status']) }}</span>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif
    </div>

    {{-- ── Presupuestos ── --}}
    @if(count($quotes) > 0)
    <div class="section">
        <div class="section-header">
            <span class="section-title">Mis Presupuestos</span>
            <span class="section-count">{{ count($quotes) }}</span>
        </div>
        <table>
            <thead>
                <tr>
                    <th>N° Presupuesto</th>
                    <th>Fecha</th>
                    <th class="text-right">Total</th>
                    <th>Estado</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                @foreach($quotes as $quote)
                <tr>
                    <td class="text-mono">{{ $quote['number'] }}</td>
                    <td>{{ $quote['date'] }}</td>
                    <td class="text-right" style="font-weight:700">$ {{ number_format($quote['total'], 2, ',', '.') }}</td>
                    <td>
                        @php
                            $qMap = ['accepted'=>'badge-green','sent'=>'badge-blue','draft'=>'badge-gray','expired'=>'badge-yellow','cancelled'=>'badge-red'];
                            $qc = $qMap[$quote['status']] ?? 'badge-gray';
                            $qLabels = ['accepted'=>'Aceptado','sent'=>'Enviado','draft'=>'Borrador','expired'=>'Vencido','cancelled'=>'Cancelado'];
                        @endphp
                        <span class="badge {{ $qc }}">{{ $qLabels[$quote['status']] ?? $quote['status'] }}</span>
                    </td>
                    <td>
                        @if($quote['share_url'])
                            <a href="{{ $quote['share_url'] }}" target="_blank" class="view-link">Ver →</a>
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    {{-- ── Pedidos E-commerce ── --}}
    @if(count($orders) > 0)
    <div class="section">
        <div class="section-header">
            <span class="section-title">Mis Pedidos Online</span>
            <span class="section-count">{{ count($orders) }}</span>
        </div>
        <table>
            <thead>
                <tr>
                    <th>N° Pedido</th>
                    <th>Fecha</th>
                    <th class="text-right">Total</th>
                    <th>Estado</th>
                    <th>Pago</th>
                </tr>
            </thead>
            <tbody>
                @foreach($orders as $order)
                <tr>
                    <td class="text-mono">{{ $order['number'] }}</td>
                    <td>{{ $order['date'] }}</td>
                    <td class="text-right" style="font-weight:700">$ {{ number_format($order['total'], 2, ',', '.') }}</td>
                    <td>
                        @php $oMap = ['delivered'=>'badge-green','processing'=>'badge-blue','pending'=>'badge-yellow','cancelled'=>'badge-red']; @endphp
                        <span class="badge {{ $oMap[$order['status']] ?? 'badge-gray' }}">{{ ucfirst($order['status']) }}</span>
                    </td>
                    <td>
                        @php $pMap = ['paid'=>'badge-green','pending'=>'badge-yellow','failed'=>'badge-red','refunded'=>'badge-gray']; @endphp
                        <span class="badge {{ $pMap[$order['payment_status']] ?? 'badge-gray' }}">{{ ucfirst($order['payment_status']) }}</span>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    {{-- ── Movimientos de cuenta ── --}}
    @if(count($recentMoves) > 0)
    <div class="section">
        <div class="section-header">
            <span class="section-title">Movimientos de Cuenta</span>
            <span class="section-count">{{ count($recentMoves) }}</span>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th class="text-right">Monto</th>
                    <th class="text-right hide-mobile">Saldo tras mov.</th>
                </tr>
            </thead>
            <tbody>
                @foreach($recentMoves as $move)
                <tr>
                    <td>{{ $move['move_date'] }}</td>
                    <td>
                        <span class="move-{{ $move['type'] }}">
                            {{ $move['type'] === 'payment' ? '− Pago' : ($move['type'] === 'charge' ? '+ Cargo' : 'Ajuste') }}
                        </span>
                    </td>
                    <td style="color:var(--muted)">{{ $move['description'] ?: '—' }}</td>
                    <td class="text-right">
                        <span class="{{ $move['type'] === 'payment' ? 'move-payment' : 'move-charge' }}">
                            $ {{ number_format($move['amount'], 2, ',', '.') }}
                        </span>
                    </td>
                    <td class="text-right hide-mobile" style="color:var(--muted)">
                        $ {{ number_format($move['balance_after'], 2, ',', '.') }}
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

</div>

<div class="footer">
    Portal de cliente · Este enlace es privado y único para tu cuenta · {{ now()->format('Y') }}
</div>

</body>
</html>
