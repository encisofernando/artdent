<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reporte ArtDent · {{ $periodLabel }}</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }

body {
  font-family: DejaVu Sans, Arial, sans-serif;
  font-size: 10px;
  color: #1e293b;
  background: #f8fafc;
}

/* ── Header ── */
.header {
  background: #1a3a4e;
  padding: 0;
}
.header-top {
  background: linear-gradient(135deg, #1a3a4e 0%, #2d6080 50%, #397B9C 100%);
  padding: 22px 32px 18px;
  display: table;
  width: 100%;
}
.header-left  { display: table-cell; vertical-align: middle; width: 50%; }
.header-right { display: table-cell; vertical-align: middle; text-align: right; width: 50%; }
.brand-name {
  font-size: 26px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 1.5px;
}
.brand-sub {
  font-size: 9px;
  color: rgba(255,255,255,0.6);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 2px;
}
.report-title {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
}
.report-period {
  font-size: 10px;
  color: rgba(255,255,255,0.75);
  margin-top: 3px;
}
.header-accent {
  height: 4px;
  background: linear-gradient(90deg, #5AAD9C 0%, #ACD6CE 50%, #49949C 100%);
}
.header-meta {
  background: #13293a;
  padding: 7px 32px;
  display: table;
  width: 100%;
}
.header-meta-left  { display: table-cell; color: rgba(255,255,255,0.5); font-size: 9px; }
.header-meta-right { display: table-cell; text-align: right; }
.period-badge {
  display: inline-block;
  background: #5AAD9C;
  color: #fff;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 2px 10px;
  border-radius: 20px;
}

/* ── Page body ── */
.body { padding: 20px 32px 0; }

/* ── Section titles ── */
.section-title {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #64748b;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #e2e8f0;
}
.section-gap { margin-top: 18px; }

/* ── KPI grid (2 rows × 4 cols using table) ── */
.kpi-table {
  width: 100%;
  border-spacing: 8px;
  border-collapse: separate;
  margin-left: -8px;
  width: calc(100% + 16px);
}
.kpi-card {
  display: table-cell;
  width: 25%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 14px;
  vertical-align: top;
  position: relative;
}
.kpi-accent {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: 8px 8px 0 0;
}
.kpi-label {
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  margin-bottom: 5px;
  margin-top: 4px;
}
.kpi-value {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}
.kpi-value-sm { font-size: 15px; }
.kpi-trend {
  font-size: 8px;
  font-weight: 700;
  margin-top: 4px;
}
.up   { color: #16a34a; }
.down { color: #dc2626; }
.flat { color: #94a3b8; }
.kpi-sub {
  font-size: 8px;
  color: #cbd5e1;
  margin-top: 2px;
}

/* ── Summary row (ingresos vs gastos) ── */
.summary-table {
  width: 100%;
  border-spacing: 8px;
  border-collapse: separate;
  margin-left: -8px;
  width: calc(100% + 16px);
}
.summary-card {
  display: table-cell;
  width: 33.33%;
  border-radius: 8px;
  padding: 12px 16px;
  vertical-align: middle;
}
.summary-card.income  { background: #f0fdf4; border: 1px solid #bbf7d0; }
.summary-card.expense { background: #fff7ed; border: 1px solid #fed7aa; }
.summary-card.flow    { background: #eff6ff; border: 1px solid #bfdbfe; }
.summary-card.flow.negative { background: #fff1f2; border: 1px solid #fecdd3; }
.summary-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; }
.summary-value { font-size: 19px; font-weight: 800; margin-top: 3px; }
.summary-card.income  .summary-value { color: #16a34a; }
.summary-card.expense .summary-value { color: #ea580c; }
.summary-card.flow    .summary-value { color: #2563eb; }
.summary-card.flow.negative .summary-value { color: #dc2626; }
.summary-sub { font-size: 8px; color: #94a3b8; margin-top: 2px; }

/* ── Channel split ── */
.channel-table {
  width: 100%;
  border-spacing: 8px;
  border-collapse: separate;
  margin-left: -8px;
  width: calc(100% + 16px);
}
.channel-card {
  display: table-cell;
  width: 50%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 11px 14px;
  vertical-align: top;
}
.channel-label { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; }
.channel-badge {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 8px;
  font-weight: 700;
  margin-left: 4px;
}
.badge-pos  { background: #dbeafe; color: #1d4ed8; }
.badge-eco  { background: #dcfce7; color: #166534; }
.channel-value { font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 3px; }
.channel-count { font-size: 8px; color: #94a3b8; margin-top: 2px; }

/* ── Bar chart ── */
.chart-wrap {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px;
}
.chart-bars-table {
  width: 100%;
  border-collapse: collapse;
}
.chart-bars-table td {
  padding: 0 2px;
  vertical-align: bottom;
}
.bar-wrap {
  position: relative;
  height: 70px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 1px;
}
.bar-rev {
  background: linear-gradient(180deg, #5AAD9C, #397B9C);
  border-radius: 2px 2px 0 0;
  width: 60%;
  min-height: 2px;
  display: inline-block;
}
.bar-exp {
  background: #fed7aa;
  border-radius: 2px 2px 0 0;
  width: 40%;
  min-height: 2px;
  display: inline-block;
  margin-left: 1px;
}
.bars-group {
  display: flex;
  align-items: flex-end;
  gap: 1px;
  width: 100%;
  justify-content: center;
}
.bar-lbl {
  font-size: 7px;
  color: #94a3b8;
  text-align: center;
  padding-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  max-width: 32px;
}
.chart-legend {
  display: table;
  margin-top: 8px;
  font-size: 8px;
  color: #64748b;
}
.legend-item { display: table-cell; padding-right: 16px; }
.legend-dot  { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 3px; vertical-align: middle; }
.dot-rev { background: #5AAD9C; }
.dot-exp { background: #fed7aa; }

/* ── Two-column layout ── */
.two-col {
  display: table;
  width: 100%;
  border-spacing: 8px;
  border-collapse: separate;
  margin-left: -8px;
  width: calc(100% + 16px);
}
.col-left  { display: table-cell; width: 50%; vertical-align: top; }
.col-right { display: table-cell; width: 50%; vertical-align: top; }

/* ── Top lists ── */
.top-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
.top-card-header {
  background: #f8fafc;
  padding: 8px 12px;
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}
.top-row {
  display: table;
  width: 100%;
  border-bottom: 1px solid #f1f5f9;
}
.top-row:last-child { border-bottom: none; }
.top-rank  { display: table-cell; width: 24px; padding: 7px 0 7px 10px; font-size: 9px; font-weight: 800; color: #cbd5e1; vertical-align: middle; }
.top-name  { display: table-cell; padding: 7px 6px; font-size: 9px; color: #1e293b; vertical-align: middle; }
.top-meta  { display: table-cell; text-align: right; padding: 7px 10px; vertical-align: middle; }
.top-value { font-size: 10px; font-weight: 800; color: #397B9C; }
.top-sub   { font-size: 7px; color: #94a3b8; margin-top: 1px; }
.rank-1 { color: #f59e0b; }
.rank-2 { color: #94a3b8; }
.rank-3 { color: #cd7c2d; }

/* ── Expenses by category ── */
.cat-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
.cat-header {
  background: #f8fafc;
  padding: 8px 12px;
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}
.cat-row {
  display: table;
  width: 100%;
  padding: 6px 12px;
  border-bottom: 1px solid #f1f5f9;
}
.cat-row:last-child { border-bottom: none; }
.cat-name  { display: table-cell; font-size: 9px; color: #334155; vertical-align: middle; width: 40%; }
.cat-bar-wrap { display: table-cell; vertical-align: middle; padding: 0 8px; }
.cat-bar-bg { background: #f1f5f9; border-radius: 4px; height: 6px; }
.cat-bar-fill { background: linear-gradient(90deg, #f97316, #fbbf24); border-radius: 4px; height: 6px; }
.cat-amount { display: table-cell; text-align: right; font-size: 9px; font-weight: 700; color: #ea580c; vertical-align: middle; white-space: nowrap; }

/* ── Transactions table ── */
.tx-wrap {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
.tx-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
}
.tx-table thead tr { background: #1a3a4e; }
.tx-table thead th {
  padding: 8px 10px;
  font-weight: 600;
  text-align: left;
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.8);
}
.tx-table thead th:last-child, .tx-table thead th:nth-last-child(2) { text-align: right; }
.tx-table tbody tr:nth-child(even) { background: #f8fafc; }
.tx-table tbody td {
  padding: 6px 10px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}
.tx-table tbody td:last-child { text-align: right; font-weight: 700; color: #5AAD9C; }
.tx-table tbody td:nth-last-child(2) { text-align: right; color: #94a3b8; }
.src-pos { display: inline-block; background: #dbeafe; color: #1d4ed8; padding: 1px 6px; border-radius: 8px; font-size: 7px; font-weight: 700; }
.src-eco { display: inline-block; background: #dcfce7; color: #166534; padding: 1px 6px; border-radius: 8px; font-size: 7px; font-weight: 700; }

/* ── Stock alerts ── */
.stock-card {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  overflow: hidden;
}
.stock-header {
  background: #ffedd5;
  padding: 8px 12px;
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #9a3412;
  border-bottom: 1px solid #fed7aa;
}
.stock-row {
  display: table;
  width: 100%;
  padding: 6px 12px;
  border-bottom: 1px solid #fed7aa;
}
.stock-row:last-child { border-bottom: none; }
.stock-name { display: table-cell; font-size: 9px; color: #431407; font-weight: 600; vertical-align: middle; }
.stock-qty  { display: table-cell; text-align: right; font-size: 9px; font-weight: 800; color: #dc2626; vertical-align: middle; white-space: nowrap; }

/* ── Pending collections callout ── */
.pending-box {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 12px 16px;
  display: table;
  width: 100%;
}
.pending-left  { display: table-cell; vertical-align: middle; }
.pending-right { display: table-cell; text-align: right; vertical-align: middle; }
.pending-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #1d4ed8; }
.pending-desc  { font-size: 8px; color: #60a5fa; margin-top: 2px; }
.pending-value { font-size: 22px; font-weight: 800; color: #1d4ed8; }

/* ── Footer ── */
.footer {
  margin-top: 20px;
  background: #1a3a4e;
  padding: 10px 32px;
  display: table;
  width: 100%;
}
.footer-left  { display: table-cell; color: rgba(255,255,255,0.5); font-size: 8px; vertical-align: middle; }
.footer-right { display: table-cell; text-align: right; color: rgba(255,255,255,0.35); font-size: 8px; vertical-align: middle; }
.footer strong { color: rgba(255,255,255,0.85); }
</style>
</head>
<body>

{{-- ══════════════════════════════════════════ HEADER ══ --}}
<div class="header">
  <div class="header-top">
    <div class="header-left">
      <div class="brand-name">ArtDent</div>
      <div class="brand-sub">Sistema de Gestión</div>
    </div>
    <div class="header-right">
      <div class="report-title">Reporte de Gestión</div>
      <div class="report-period">{{ $company->fantasy_name ?? $company->name }} &nbsp;·&nbsp; {{ $periodLabel }}</div>
    </div>
  </div>
  <div class="header-accent"></div>
  <div class="header-meta">
    <div class="header-meta-left">Generado el {{ now()->format('d/m/Y') }} a las {{ now()->format('H:i') }} · por {{ $userName }}</div>
    <div class="header-meta-right"><span class="period-badge">{{ strtoupper($periodKey) }}</span></div>
  </div>
</div>

<div class="body">

  {{-- ══════════════════════════════ RESUMEN FINANCIERO ══ --}}
  <div class="section-gap">
    <div class="section-title">Resumen financiero del período</div>
    <table class="summary-table">
      <tr>
        <td class="summary-card income">
          <div class="summary-label">Ingresos totales</div>
          <div class="summary-value">${{ number_format($stats['current']['revenue'], 0, ',', '.') }}</div>
          @php $t = $stats['trends']['revenue']; @endphp
          <div class="summary-sub">
            {{ $t >= 0 ? '▲' : '▼' }} {{ abs($t) }}% vs período anterior
          </div>
        </td>
        <td class="summary-card expense">
          <div class="summary-label">Gastos totales</div>
          <div class="summary-value">${{ number_format($stats['current']['expenses'], 0, ',', '.') }}</div>
          @php $t = $stats['trends']['expenses']; @endphp
          <div class="summary-sub">
            {{ $t >= 0 ? '▲' : '▼' }} {{ abs($t) }}% vs período anterior
          </div>
        </td>
        @php $cf = $stats['current']['cashflow']; @endphp
        <td class="summary-card flow {{ $cf < 0 ? 'negative' : '' }}">
          <div class="summary-label">Flujo de caja</div>
          <div class="summary-value">${{ number_format(abs($cf), 0, ',', '.') }}{{ $cf < 0 ? ' ▼' : '' }}</div>
          @php $t = $stats['trends']['cashflow']; @endphp
          <div class="summary-sub">
            {{ $t >= 0 ? '▲' : '▼' }} {{ abs($t) }}% vs período anterior
          </div>
        </td>
      </tr>
    </table>
  </div>

  {{-- ══════════════════════════════ KPIs ══ --}}
  <div class="section-gap">
    <div class="section-title">Indicadores de operación</div>
    <table class="kpi-table">
      <tr>
        <td class="kpi-card">
          <div class="kpi-accent" style="background:#397B9C;"></div>
          <div class="kpi-label">Ventas totales</div>
          <div class="kpi-value">{{ number_format($stats['current']['total_sales']) }}</div>
          @php $t = $stats['trends']['sales']; @endphp
          <div class="kpi-trend {{ $t >= 0 ? 'up' : 'down' }}">{{ $t >= 0 ? '▲' : '▼' }} {{ abs($t) }}%</div>
          <div class="kpi-sub">vs período anterior</div>
        </td>
        <td class="kpi-card">
          <div class="kpi-accent" style="background:#5AAD9C;"></div>
          <div class="kpi-label">Ticket promedio</div>
          <div class="kpi-value kpi-value-sm">${{ number_format($stats['current']['avg_ticket'], 0, ',', '.') }}</div>
          @php $t = $stats['trends']['avg_ticket']; @endphp
          <div class="kpi-trend {{ $t >= 0 ? 'up' : 'down' }}">{{ $t >= 0 ? '▲' : '▼' }} {{ abs($t) }}%</div>
          <div class="kpi-sub">por operación</div>
        </td>
        <td class="kpi-card">
          <div class="kpi-accent" style="background:#49949C;"></div>
          <div class="kpi-label">Nuevos clientes</div>
          <div class="kpi-value">{{ number_format($stats['current']['new_customers']) }}</div>
          @php $t = $stats['trends']['customers']; @endphp
          <div class="kpi-trend {{ $t >= 0 ? 'up' : 'down' }}">{{ $t >= 0 ? '▲' : '▼' }} {{ abs($t) }}%</div>
          <div class="kpi-sub">altas del período</div>
        </td>
        <td class="kpi-card">
          <div class="kpi-accent" style="background:#1d4ed8;"></div>
          <div class="kpi-label">Cobros pendientes</div>
          <div class="kpi-value kpi-value-sm" style="color:#1d4ed8;">${{ number_format($stats['current']['pending_collections'], 0, ',', '.') }}</div>
          <div class="kpi-sub">cuentas corrientes</div>
        </td>
      </tr>
    </table>
  </div>

  {{-- ══════════════════════════════ CANALES ══ --}}
  <div class="section-gap">
    <div class="section-title">Desglose por canal de venta</div>
    <table class="channel-table">
      <tr>
        <td class="channel-card">
          <div class="channel-label">Canal POS <span class="channel-badge badge-pos">POS</span></div>
          <div class="channel-value">${{ number_format($stats['current']['pos_revenue'], 0, ',', '.') }}</div>
          <div class="channel-count">{{ number_format($stats['current']['pos_count']) }} operaciones</div>
        </td>
        <td class="channel-card">
          <div class="channel-label">E-commerce <span class="channel-badge badge-eco">ONLINE</span></div>
          <div class="channel-value">${{ number_format($stats['current']['eco_revenue'], 0, ',', '.') }}</div>
          <div class="channel-count">{{ number_format($stats['current']['eco_count']) }} pedidos</div>
        </td>
      </tr>
    </table>
  </div>

  {{-- ══════════════════════════════ GRÁFICO ══ --}}
  @if(count($chartData) > 0)
  <div class="section-gap">
    <div class="section-title">Evolución de ingresos y gastos</div>
    <div class="chart-wrap">
      @php
        $maxVal = max(collect($chartData)->max('revenue'), collect($chartData)->max('expenses'), 1);
        $barH   = 60;
        $limit  = count($chartData) > 31 ? 31 : count($chartData);
        $slice  = array_slice($chartData, 0, $limit);
      @endphp
      <table class="chart-bars-table">
        <tr>
          @foreach($slice as $point)
          <td>
            <div class="bar-wrap">
              <div class="bars-group">
                <div class="bar-rev" style="height:{{ max(2, round(($point['revenue'] / $maxVal) * $barH)) }}px;"></div>
                @if($point['expenses'] > 0)
                <div class="bar-exp" style="height:{{ max(2, round(($point['expenses'] / $maxVal) * $barH)) }}px;"></div>
                @endif
              </div>
            </div>
            <div class="bar-lbl">{{ $point['label'] }}</div>
          </td>
          @endforeach
        </tr>
      </table>
      <div class="chart-legend">
        <span class="legend-item"><span class="legend-dot dot-rev"></span>Ingresos</span>
        <span class="legend-item"><span class="legend-dot dot-exp"></span>Gastos</span>
      </div>
    </div>
  </div>
  @endif

  {{-- ══════════════════════════════ TOP PRODUCTOS + CLIENTES ══ --}}
  @if(count($topProducts) > 0 || count($topCustomers) > 0)
  <div class="section-gap">
    <div class="section-title">Rankings del período</div>
    <table class="two-col">
      <tr>
        {{-- Top Productos --}}
        <td class="col-left">
          <div class="top-card">
            <div class="top-card-header">Top productos por ingresos</div>
            @foreach($topProducts as $i => $prod)
            <div class="top-row">
              <div class="top-rank {{ $i === 0 ? 'rank-1' : ($i === 1 ? 'rank-2' : ($i === 2 ? 'rank-3' : '')) }}">#{{ $i + 1 }}</div>
              <div class="top-name">{{ Str::limit($prod['name'], 28) }}</div>
              <div class="top-meta">
                <div class="top-value">${{ number_format($prod['revenue'], 0, ',', '.') }}</div>
                <div class="top-sub">{{ number_format($prod['qty'], 0) }} unid.</div>
              </div>
            </div>
            @endforeach
            @if(count($topProducts) === 0)
            <div style="padding:12px;color:#94a3b8;font-size:9px;text-align:center;">Sin datos</div>
            @endif
          </div>
        </td>

        {{-- Top Clientes --}}
        <td class="col-right">
          <div class="top-card">
            <div class="top-card-header">Top clientes por ingresos</div>
            @foreach($topCustomers as $i => $cust)
            <div class="top-row">
              <div class="top-rank {{ $i === 0 ? 'rank-1' : ($i === 1 ? 'rank-2' : ($i === 2 ? 'rank-3' : '')) }}">#{{ $i + 1 }}</div>
              <div class="top-name">{{ Str::limit($cust['name'], 22) }}</div>
              <div class="top-meta">
                <div class="top-value">${{ number_format($cust['revenue'], 0, ',', '.') }}</div>
                <div class="top-sub">{{ $cust['orders'] }} venta{{ $cust['orders'] !== 1 ? 's' : '' }}</div>
              </div>
            </div>
            @endforeach
            @if(count($topCustomers) === 0)
            <div style="padding:12px;color:#94a3b8;font-size:9px;text-align:center;">Sin datos</div>
            @endif
          </div>
        </td>
      </tr>
    </table>
  </div>
  @endif

  {{-- ══════════════════════════════ GASTOS POR CATEGORÍA + STOCK BAJO ══ --}}
  <div class="section-gap">
    <table class="two-col">
      <tr>
        {{-- Gastos por categoría --}}
        <td class="col-left">
          @if(count($expensesByCategory) > 0)
          @php $maxExp = collect($expensesByCategory)->max('total') ?: 1; @endphp
          <div class="cat-card">
            <div class="cat-header">Gastos por categoría</div>
            @foreach($expensesByCategory as $cat)
            <div class="cat-row">
              <div class="cat-name">{{ Str::limit($cat['category'], 20) }}</div>
              <div class="cat-bar-wrap">
                <div class="cat-bar-bg">
                  <div class="cat-bar-fill" style="width:{{ round(($cat['total'] / $maxExp) * 100) }}%;"></div>
                </div>
              </div>
              <div class="cat-amount">${{ number_format($cat['total'], 0, ',', '.') }}</div>
            </div>
            @endforeach
          </div>
          @else
          <div class="cat-card">
            <div class="cat-header">Gastos por categoría</div>
            <div style="padding:12px;color:#94a3b8;font-size:9px;text-align:center;">Sin gastos registrados</div>
          </div>
          @endif
        </td>

        {{-- Stock bajo --}}
        <td class="col-right">
          @if(count($lowStock) > 0)
          <div class="stock-card">
            <div class="stock-header">⚠ Alertas de stock bajo</div>
            @foreach($lowStock as $item)
            <div class="stock-row">
              <div class="stock-name">
                {{ Str::limit($item['name'], 28) }}
                @if($item['sku'])<div style="font-size:7px;color:#9a3412;font-weight:400;">SKU: {{ $item['sku'] }}</div>@endif
              </div>
              <div class="stock-qty">
                {{ $item['quantity'] }} / {{ $item['min'] }} mín
              </div>
            </div>
            @endforeach
          </div>
          @else
          <div class="stock-card" style="background:#f0fdf4;border-color:#bbf7d0;">
            <div class="stock-header" style="background:#dcfce7;color:#166534;border-color:#bbf7d0;">Stock normal</div>
            <div style="padding:12px;color:#16a34a;font-size:9px;text-align:center;">Sin alertas de stock bajo</div>
          </div>
          @endif
        </td>
      </tr>
    </table>
  </div>

  {{-- ══════════════════════════════ TRANSACCIONES ══ --}}
  @if(count($transactions) > 0)
  <div class="section-gap">
    <div class="section-title">Últimas transacciones del período</div>
    <div class="tx-wrap">
      <table class="tx-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Comprobante</th>
            <th>Cliente</th>
            <th>Canal</th>
            <th>Fecha</th>
            <th>Cobrado</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          @foreach($transactions as $i => $tx)
          <tr>
            <td style="color:#cbd5e1;">{{ $i + 1 }}</td>
            <td style="font-weight:700;">{{ $tx['txId'] }}</td>
            <td>{{ Str::limit($tx['user'], 22) }}</td>
            <td>
              @if($tx['source'] === 'ecommerce')
                <span class="src-eco">E-commerce</span>
              @else
                <span class="src-pos">POS</span>
              @endif
            </td>
            <td style="color:#94a3b8;">{{ $tx['date'] }}</td>
            <td>${{ number_format($tx['paid'], 0, ',', '.') }}</td>
            <td>${{ number_format($tx['cost'], 0, ',', '.') }}</td>
          </tr>
          @endforeach
        </tbody>
      </table>
    </div>
  </div>
  @endif

</div>

{{-- ══════════════════════════════ FOOTER ══ --}}
<div class="footer">
  <div class="footer-left">
    <strong>{{ $company->name }}</strong>
    @if($company->cuit) &nbsp;·&nbsp; CUIT: {{ $company->cuit }} @endif
    @if($company->address) &nbsp;·&nbsp; {{ $company->address }}@if($company->city), {{ $company->city }}@endif @endif
  </div>
  <div class="footer-right">
    Documento confidencial &nbsp;·&nbsp; ArtDent CRM &nbsp;·&nbsp; {{ now()->format('d/m/Y') }}
  </div>
</div>

</body>
</html>
