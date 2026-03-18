<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reporte ArtDent · {{ $periodLabel }}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: DejaVu Sans, Arial, sans-serif;
    font-size: 11px;
    color: #1e293b;
    background: #ffffff;
  }

  /* ── Header ── */
  .header {
    background: linear-gradient(135deg, #1a3a4e 0%, #397B9C 60%, #49949C 100%);
    padding: 28px 36px 24px;
    color: white;
    position: relative;
    overflow: hidden;
  }
  .header-inner {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .header-logo img {
    height: 48px;
    width: auto;
  }
  .header-title {
    text-align: right;
  }
  .header-title h1 {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
  .header-title p {
    font-size: 11px;
    opacity: 0.8;
    margin-top: 3px;
  }
  .header-bar {
    height: 4px;
    background: linear-gradient(90deg, #5AAD9C, #ACD6CE);
    margin-top: 18px;
    border-radius: 2px;
  }

  /* ── Meta info ── */
  .meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 36px;
    background: #f0f7fc;
    border-bottom: 1px solid #dbeafe;
    font-size: 10px;
    color: #475569;
  }
  .badge {
    display: inline-block;
    padding: 2px 10px;
    background: #397B9C;
    color: white;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 600;
  }

  /* ── Content ── */
  .content {
    padding: 24px 36px;
  }

  /* ── Section title ── */
  .section-title {
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 2px solid #397B9C;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-title span.dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #5AAD9C;
  }

  /* ── Stat cards ── */
  .stat-grid {
    display: table;
    width: 100%;
    border-spacing: 10px;
    margin-bottom: 24px;
  }
  .stat-row {
    display: table-row;
  }
  .stat-card {
    display: table-cell;
    width: 25%;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 14px 16px;
    vertical-align: top;
    position: relative;
    overflow: hidden;
  }
  .stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
  }
  .stat-card.blue::before  { background: #397B9C; }
  .stat-card.green::before { background: #5AAD9C; }
  .stat-card.teal::before  { background: #49949C; }
  .stat-card.soft::before  { background: #7CA5C3; }
  .stat-label {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #64748b;
    margin-bottom: 6px;
  }
  .stat-value {
    font-size: 20px;
    font-weight: 800;
    color: #1e293b;
    line-height: 1.1;
  }
  .stat-sub {
    font-size: 9px;
    color: #94a3b8;
    margin-top: 4px;
  }
  .trend-positive { color: #16a34a; font-weight: 700; font-size: 10px; }
  .trend-negative { color: #dc2626; font-weight: 700; font-size: 10px; }
  .trend-neutral  { color: #94a3b8; font-weight: 700; font-size: 10px; }

  /* ── Divider ── */
  .section-gap { margin-top: 26px; }

  /* ── Chart table ── */
  .chart-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 6px;
  }
  .chart-row td {
    padding: 0 4px;
    vertical-align: bottom;
  }
  .chart-bar-wrap {
    position: relative;
    height: 90px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
  }
  .chart-bar {
    background: linear-gradient(180deg, #5AAD9C, #397B9C);
    border-radius: 3px 3px 0 0;
    width: 100%;
    min-height: 2px;
  }
  .chart-label {
    font-size: 8px;
    color: #64748b;
    text-align: center;
    padding-top: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 36px;
  }
  .chart-amount {
    font-size: 7px;
    color: #94a3b8;
    text-align: center;
    margin-bottom: 2px;
  }

  /* ── Transactions table ── */
  .tx-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10px;
  }
  .tx-table thead tr {
    background: #1a3a4e;
    color: white;
  }
  .tx-table thead th {
    padding: 8px 10px;
    font-weight: 600;
    text-align: left;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .tx-table thead th:last-child { text-align: right; }
  .tx-table tbody tr:nth-child(even) { background: #f8fafc; }
  .tx-table tbody tr:nth-child(odd)  { background: #ffffff; }
  .tx-table tbody td {
    padding: 7px 10px;
    border-bottom: 1px solid #f1f5f9;
    color: #1e293b;
  }
  .tx-table tbody td:last-child {
    text-align: right;
    font-weight: 700;
    color: #5AAD9C;
  }
  .source-badge {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 10px;
    font-size: 8px;
    font-weight: 600;
  }
  .source-pos      { background: #dbeafe; color: #1e40af; }
  .source-ecommerce { background: #dcfce7; color: #166534; }

  /* ── Footer ── */
  .footer {
    margin-top: 30px;
    padding: 14px 36px;
    background: #1a3a4e;
    color: rgba(255,255,255,0.6);
    font-size: 9px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .footer strong { color: rgba(255,255,255,0.9); }

  /* ── Comparison row ── */
  .compare-grid {
    display: table;
    width: 100%;
    border-spacing: 10px;
    margin-bottom: 8px;
  }
  .compare-card {
    display: table-cell;
    width: 33.33%;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 14px;
    vertical-align: top;
    font-size: 10px;
  }
  .compare-label { color: #64748b; margin-bottom: 3px; }
  .compare-curr  { font-size: 15px; font-weight: 800; color: #1e293b; }
  .compare-prev  { color: #94a3b8; font-size: 9px; margin-top: 2px; }
</style>
</head>
<body>

{{-- ── Header ── --}}
<div class="header">
  <div class="header-inner">
    <div class="header-logo">
      <img src="{{ public_path('brand/logo-artdent-blanco.png') }}" alt="ArtDent">
    </div>
    <div class="header-title">
      <h1>Reporte de Gestión</h1>
      <p>{{ $company->fantasy_name ?? $company->name }} &nbsp;·&nbsp; {{ $periodLabel }}</p>
    </div>
  </div>
  <div class="header-bar"></div>
</div>

{{-- ── Meta ── --}}
<div class="meta-row">
  <span>Generado el {{ now()->format('d/m/Y H:i') }} · por {{ $userName }}</span>
  <span class="badge">PERÍODO: {{ strtoupper($periodKey) }}</span>
</div>

<div class="content">

  {{-- ── KPIs ── --}}
  <div class="section-title"><span class="dot"></span> Indicadores del período</div>

  <table class="stat-grid">
    <tr class="stat-row">
      <td class="stat-card blue">
        <div class="stat-label">Total Ventas</div>
        <div class="stat-value">{{ number_format($stats['current']['total_sales']) }}</div>
        <div class="stat-sub">Operaciones</div>
        @php $t = $stats['trends']['sales'] @endphp
        <div class="{{ $t >= 0 ? 'trend-positive' : 'trend-negative' }}">
          {{ $t >= 0 ? '▲' : '▼' }} {{ abs($t) }}% vs período anterior
        </div>
      </td>
      <td class="stat-card green">
        <div class="stat-label">Ingresos</div>
        <div class="stat-value">${{ number_format($stats['current']['revenue'], 0, ',', '.') }}</div>
        <div class="stat-sub">Total del período</div>
        @php $t = $stats['trends']['revenue'] @endphp
        <div class="{{ $t >= 0 ? 'trend-positive' : 'trend-negative' }}">
          {{ $t >= 0 ? '▲' : '▼' }} {{ abs($t) }}% vs período anterior
        </div>
      </td>
      <td class="stat-card teal">
        <div class="stat-label">Nuevos Clientes</div>
        <div class="stat-value">{{ number_format($stats['current']['new_customers']) }}</div>
        <div class="stat-sub">Altas del período</div>
        @php $t = $stats['trends']['customers'] @endphp
        <div class="{{ $t >= 0 ? 'trend-positive' : 'trend-negative' }}">
          {{ $t >= 0 ? '▲' : '▼' }} {{ abs($t) }}% vs período anterior
        </div>
      </td>
      <td class="stat-card soft">
        <div class="stat-label">Ticket Promedio</div>
        <div class="stat-value">${{ number_format($stats['current']['avg_ticket'], 0, ',', '.') }}</div>
        <div class="stat-sub">Por operación</div>
        @php $t = $stats['trends']['avg_ticket'] @endphp
        <div class="{{ $t >= 0 ? 'trend-positive' : 'trend-negative' }}">
          {{ $t >= 0 ? '▲' : '▼' }} {{ abs($t) }}% vs período anterior
        </div>
      </td>
    </tr>
  </table>

  {{-- ── Ingresos por período (gráfico de barras simple) ── --}}
  @if(count($chartData) > 0)
  <div class="section-gap">
    <div class="section-title"><span class="dot"></span> Evolución de ingresos</div>

    @php
      $maxRevenue = collect($chartData)->max('revenue') ?: 1;
      $barMaxH = 80; // px
    @endphp

    <table class="chart-table">
      <tr class="chart-row">
        @foreach($chartData as $point)
        <td>
          <div class="chart-amount">${{ number_format($point['revenue'], 0, ',', '.') }}</div>
          <div class="chart-bar-wrap">
            <div class="chart-bar"
              style="height: {{ max(2, round(($point['revenue'] / $maxRevenue) * $barMaxH)) }}px;">
            </div>
          </div>
          <div class="chart-label">{{ $point['label'] }}</div>
        </td>
        @endforeach
      </tr>
    </table>
  </div>
  @endif

  {{-- ── Transacciones recientes ── --}}
  @if(count($transactions) > 0)
  <div class="section-gap">
    <div class="section-title"><span class="dot"></span> Transacciones recientes</div>

    <table class="tx-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Comprobante</th>
          <th>Cliente</th>
          <th>Canal</th>
          <th>Fecha</th>
          <th>Importe</th>
        </tr>
      </thead>
      <tbody>
        @foreach($transactions as $i => $tx)
        <tr>
          <td style="color:#94a3b8;">{{ $i + 1 }}</td>
          <td style="font-weight:600;">{{ $tx['txId'] }}</td>
          <td>{{ $tx['user'] }}</td>
          <td>
            @if($tx['source'] === 'ecommerce')
              <span class="source-badge source-ecommerce">E-commerce</span>
            @else
              <span class="source-badge source-pos">POS</span>
            @endif
          </td>
          <td style="color:#64748b;">{{ $tx['date'] }}</td>
          <td>${{ number_format($tx['cost'], 0, ',', '.') }}</td>
        </tr>
        @endforeach
      </tbody>
    </table>
  </div>
  @endif

</div>

{{-- ── Footer ── --}}
<div class="footer">
  <div>
    <strong>{{ $company->name }}</strong>
    @if($company->cuit) &nbsp;·&nbsp; CUIT: {{ $company->cuit }} @endif
    @if($company->address) &nbsp;·&nbsp; {{ $company->address }}@if($company->city), {{ $company->city }}@endif @endif
  </div>
  <div>
    Documento confidencial &nbsp;·&nbsp; ArtDent CRM
  </div>
</div>

</body>
</html>
