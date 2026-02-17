<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Dashboard Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.6;
        }

        .header {
            background: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 30px;
        }

        .header h1 {
            font-size: 24px;
            margin-bottom: 5px;
        }

        .header p {
            font-size: 14px;
            opacity: 0.9;
        }

        .company-info {
            background: #f5f5f5;
            padding: 10px 20px;
            margin-bottom: 20px;
            text-align: center;
            border-left: 4px solid #4CAF50;
        }

        .period {
            background: #e8f5e9;
            padding: 10px 20px;
            margin-bottom: 20px;
            text-align: center;
            font-size: 13px;
            font-weight: bold;
        }

        .stats-grid {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }

        .stat-card {
            display: table-cell;
            width: 25%;
            padding: 15px;
            text-align: center;
            border: 1px solid #e0e0e0;
        }

        .stat-card .label {
            color: #666;
            font-size: 11px;
            text-transform: uppercase;
            margin-bottom: 8px;
        }

        .stat-card .value {
            font-size: 20px;
            font-weight: bold;
            color: #4CAF50;
            margin-bottom: 5px;
        }

        .stat-card .subtitle {
            color: #999;
            font-size: 10px;
        }

        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #4CAF50;
        }

        .transactions-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .transactions-table th {
            background: #4CAF50;
            color: white;
            padding: 10px;
            text-align: left;
            font-size: 11px;
            font-weight: bold;
        }

        .transactions-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 11px;
        }

        .transactions-table tr:nth-child(even) {
            background: #f9f9f9;
        }

        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #999;
            font-size: 10px;
        }

        .amount {
            color: #4CAF50;
            font-weight: bold;
        }

        .text-right {
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Dashboard Report</h1>
        <p>Análisis de Ventas y Estadísticas</p>
    </div>

    <div class="company-info">
        <strong>{{ $company->name }}</strong>
    </div>

    <div class="period">
        Período: {{ $start_date }} - {{ $end_date }}
    </div>

    <div class="section-title">Estadísticas Principales</div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="label">Total Ventas</div>
            <div class="value">{{ number_format($stats['total_sales']) }}</div>
            <div class="subtitle">operaciones</div>
        </div>

        <div class="stat-card">
            <div class="label">Ingresos</div>
            <div class="value">${{ number_format($stats['revenue'], 2) }}</div>
            <div class="subtitle">período actual</div>
        </div>

        <div class="stat-card">
            <div class="label">Nuevos Clientes</div>
            <div class="value">{{ number_format($stats['new_customers']) }}</div>
            <div class="subtitle">este período</div>
        </div>

        <div class="stat-card">
            <div class="label">Ticket Promedio</div>
            <div class="value">${{ number_format($stats['avg_ticket'], 2) }}</div>
            <div class="subtitle">por operación</div>
        </div>
    </div>

    @if(count($transactions) > 0)
    <div class="section-title">Transacciones Recientes ({{ count($transactions) }})</div>

    <table class="transactions-table">
        <thead>
            <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $transaction)
            <tr>
                <td>{{ $transaction->number }}</td>
                <td>{{ $transaction->customer }}</td>
                <td>{{ \Carbon\Carbon::parse($transaction->sale_date)->format('d/m/Y H:i') }}</td>
                <td class="amount text-right">${{ number_format($transaction->total, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr style="background: #f5f5f5; font-weight: bold;">
                <td colspan="3" style="text-align: right; padding: 10px;">TOTAL:</td>
                <td class="amount text-right" style="padding: 10px;">${{ number_format($transactions->sum('total'), 2) }}</td>
            </tr>
        </tfoot>
    </table>
    @endif

    <div class="footer">
        <p>Generado el {{ $generated_at }}</p>
        <p>{{ $company->name }} - Sistema de Gestión ArtDent</p>
    </div>
</body>
</html>
