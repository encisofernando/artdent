<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/svg+xml" href="{{ asset('assets/artcode-icon-color.svg') }}">
    <link rel="shortcut icon" href="{{ asset('assets/artcode-icon-color.svg') }}">
    <link rel="apple-touch-icon" href="{{ asset('assets/artcode-icon-color.svg') }}">
    <title>Mi Portal — {{ $dentist->name }}</title>
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

        .header {
            background: linear-gradient(135deg, var(--blue) 0%, var(--teal) 55%, var(--green) 100%);
            color: #fff; padding: 28px 24px 56px;
        }
        .header-inner { max-width: 960px; margin: 0 auto; }
        .header h1 { font-size: 22px; font-weight: 800; }
        .header p  { font-size: 13px; opacity: .8; margin-top: 4px; }
        .header .chips { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
        .chip { background: rgba(255,255,255,.18); border-radius: 999px; padding: 4px 12px; font-size: 12px; font-weight: 600; }

        .main { max-width: 960px; margin: -32px auto 40px; padding: 0 16px; }

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

        .pickup-card {
            background: linear-gradient(135deg, var(--teal), var(--green)); border-radius: 20px;
            padding: 20px 24px; margin-bottom: 24px; color: #fff;
            display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
        }
        .pickup-card h3 { font-size: 15px; font-weight: 800; }
        .pickup-card p { font-size: 12.5px; opacity: .9; margin-top: 2px; }
        .btn-pickup {
            background: #fff; color: var(--teal); border: none; border-radius: 999px;
            padding: 10px 20px; font-size: 13px; font-weight: 700; cursor: pointer;
        }
        .btn-pickup:disabled { opacity: .6; cursor: default; }

        .flash-success {
            background: #d1fae5; color: #065f46; border-radius: 14px; padding: 14px 18px;
            font-size: 13px; font-weight: 600; margin-bottom: 20px;
        }

        .section { background: var(--card); border-radius: 20px; border: 1px solid var(--border);
            box-shadow: 0 2px 12px rgba(0,0,0,.05); margin-bottom: 20px; overflow: hidden; }
        .section-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 8px; }
        .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); }
        .section-count { background: var(--bg); border-radius: 999px; padding: 2px 8px; font-size: 11px; font-weight: 700; color: var(--muted); }

        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { padding: 10px 16px; text-align: left; font-size: 10.5px; font-weight: 700; text-transform: uppercase;
             letter-spacing: .08em; color: var(--muted); background: #f8fafc; border-bottom: 1px solid var(--border); }
        td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #fafbfc; }
        .text-right { text-align: right; }
        .text-mono { font-family: monospace; font-weight: 600; }

        .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .badge-green  { background: #d1fae5; color: #065f46; }
        .badge-blue   { background: #dbeafe; color: #1e40af; }
        .badge-yellow { background: #fef3c7; color: #92400e; }
        .badge-red    { background: #fee2e2; color: #991b1b; }
        .badge-gray   { background: #f1f5f9; color: #475569; }

        .move-payment { color: var(--green); font-weight: 700; }
        .move-charge  { color: var(--red);   font-weight: 700; }

        .empty { padding: 32px; text-align: center; color: var(--muted); font-size: 13px; }

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
    <div class="header-inner" style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap;">
        <div>
            <h1>Mi Portal — Odontólogos</h1>
            <p>{{ $dentist->name }}</p>
            <div class="chips">
                @if($dentist->email) <span class="chip">✉ {{ $dentist->email }}</span> @endif
                @if($dentist->phone) <span class="chip">☎ {{ $dentist->phone }}</span> @endif
                @if($dentist->code)  <span class="chip">Cód. {{ $dentist->code }}</span> @endif
            </div>
        </div>
        <form method="POST" action="{{ route('dentist-portal.logout') }}">
            @csrf
            <button type="submit" style="background: rgba(255,255,255,.18); color:#fff; border:none; border-radius:999px; padding:8px 16px; font-size:12px; font-weight:700; cursor:pointer;">
                Cerrar sesión
            </button>
        </form>
    </div>
</div>

<div class="main">

    @if(session('success'))
        <div class="flash-success">{{ session('success') }}</div>
    @endif

    @php
        $bal = (float) $account->balance;
        $balClass = $bal > 0 ? 'debt' : ($bal < 0 ? 'credit' : 'zero');
        $balNote  = $bal > 0 ? 'Monto adeudado al laboratorio' : ($bal < 0 ? 'Saldo a tu favor' : 'Sin saldo pendiente');
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

    <div class="pickup-card">
        <div>
            <h3>{{ $readyCount > 0 ? "Tenés {$readyCount} trabajo(s) listo(s) para retirar" : 'Trabajos listos para retirar' }}</h3>
            <p>Avisale al laboratorio que vas a pasar a buscarlos.</p>
        </div>
        <form method="POST" action="{{ route('dentist-portal.request-pickup', $dentist->portal_token) }}">
            @csrf
            <button type="submit" class="btn-pickup">Pedir retiro</button>
        </form>
    </div>

    <div class="section">
        <div class="section-header">
            <span class="section-title">Mis Órdenes</span>
            <span class="section-count">{{ count($jobs) }}</span>
        </div>
        @if(count($jobs) === 0)
            <div class="empty">Todavía no tenés órdenes registradas.</div>
        @else
        <table>
            <thead>
                <tr>
                    <th>N° Orden</th>
                    <th class="hide-mobile">Paciente</th>
                    <th class="hide-mobile">Trabajo</th>
                    <th>Entrega estimada</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                @foreach($jobs as $job)
                <tr>
                    <td class="text-mono">{{ $job['number'] }}</td>
                    <td class="hide-mobile">{{ $job['patient'] ?? '—' }}</td>
                    <td class="hide-mobile">{{ $job['job_type'] ?? '—' }}</td>
                    <td>{{ $job['delivered_at'] ?? $job['due_date'] ?? '—' }}</td>
                    <td>
                        @php
                            $statusMap = ['ready'=>'badge-green','delivered'=>'badge-blue','in_progress'=>'badge-yellow','quality_check'=>'badge-yellow','received'=>'badge-gray','cancelled'=>'badge-red'];
                            $sc = $statusMap[$job['status']] ?? 'badge-gray';
                        @endphp
                        <span class="badge {{ $sc }}">{{ $job['status_label'] }}</span>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif
    </div>

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
                    <th></th>
                </tr>
            </thead>
            <tbody>
                @php
                    $moveLabels = ['charge'=>'+ Cargo','payment'=>'− Pago','adjustment'=>'Ajuste','note_credit'=>'Nota de Crédito','note_debit'=>'Nota de Débito'];
                    $moveIsCredit = ['payment', 'note_credit'];
                @endphp
                @foreach($recentMoves as $move)
                <tr>
                    <td>{{ $move['move_date'] }}</td>
                    <td>
                        <span class="{{ in_array($move['type'], $moveIsCredit) ? 'move-payment' : 'move-charge' }}">
                            {{ $moveLabels[$move['type']] ?? ucfirst($move['type']) }}
                        </span>
                    </td>
                    <td style="color:var(--muted)">{{ $move['description'] ?: '—' }}</td>
                    <td class="text-right">
                        <span class="{{ in_array($move['type'], $moveIsCredit) ? 'move-payment' : 'move-charge' }}">
                            $ {{ number_format($move['amount'], 2, ',', '.') }}
                        </span>
                    </td>
                    <td class="text-right hide-mobile" style="color:var(--muted)">
                        $ {{ number_format($move['balance_after'], 2, ',', '.') }}
                    </td>
                    <td>
                        @if($move['downloadable'])
                            <a href="{{ route('dentist-portal.move-pdf', $move['id']) }}" target="_blank" class="view-link">Comprobante →</a>
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

</div>

<div class="footer">
    Portal del odontólogo · Este enlace es privado y único para tu cuenta · {{ now()->format('Y') }}
</div>

</body>
</html>
