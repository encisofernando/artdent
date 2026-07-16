<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Recibo de Haberes</title>
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
    font-size: 8pt;
    color: #1A202C;
    background: #fff;
    width: 210mm;
    min-height: 297mm;
    position: relative;
}
strong { font-weight: 700; }
table { border-collapse: collapse; width: 100%; }
.card { border: 1px solid #DAE6F0; border-radius: 5px; margin: 0 12mm 2.2mm; overflow: hidden; }
.card-header { background: #124C69; color: #fff; padding: 3px 10px; font-weight: 700; font-size: 7pt; text-transform: uppercase; letter-spacing: 0.4px; }
.card-body { padding: 6px 10px; }
.stat-label { font-size: 6pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; color: #7A8A9A; }
.stat-value { font-size: 7.8pt; font-weight: 600; color: #1A202C; margin-bottom: 3px; }
</style>
</head>
<body>

@php
    $employee = $receipt->employee;
    $user = $employee->user;
    $category = $employee->laborAgreementCategory;
    $laborAgreement = $category?->laborAgreement;
    $scale = $category?->currentScale();

    $fmt = fn ($v) => number_format((float) ($v ?? 0), 2, ',', '.');
    $fmtDate = fn ($d) => $d ? \Carbon\Carbon::parse($d)->format('d/m/Y') : '—';

    $cuitRaw = preg_replace('/\D/', '', $company->cuit ?? '');
    $cuitFmt = strlen($cuitRaw) === 11
        ? substr($cuitRaw, 0, 2).'-'.substr($cuitRaw, 2, 8).'-'.substr($cuitRaw, 10)
        : ($company->cuit ?? '—');

    $antiguedad = $employee->hire_date
        ? $employee->hire_date->diff(\Carbon\Carbon::parse($receipt->period_to))
        : null;
    $antiguedadAnios = $employee->hire_date
        ? (int) $employee->hire_date->diffInYears(\Carbon\Carbon::parse($receipt->period_to))
        : 0;
    $diasPeriodo = \Carbon\Carbon::parse($receipt->period_from)->diffInDays(\Carbon\Carbon::parse($receipt->period_to)) + 1;

    $lines = $receipt->lines ?? collect();
    $haberLines = $lines->whereIn('type', ['remunerative', 'non_remunerative']);
    $descuentoLines = $lines->whereIn('type', ['deduction', 'contribution']);
    $contribucionLines = $lines->where('type', 'employer_contribution');
    $contribucionesTotal = $contribucionLines->sum('amount');

    $remunerativo = $receipt->salary_gross + $receipt->commission_gross
        + $haberLines->where('type', 'remunerative')->sum('amount');
    $noRemunerativo = $haberLines->where('type', 'non_remunerative')->sum('amount');
    $sueldoBruto = $remunerativo + $noRemunerativo;
    $descuentosMotor = $descuentoLines->sum('amount');
    $descuentosTotal = $receipt->discounts_total + $descuentosMotor;
    $costoTotalEmpleador = $sueldoBruto + $receipt->extras_total + $contribucionesTotal;

    // Unidad de medida + base de cálculo por concepto (Decreto 407/2026, Anexo I art. 5:
    // "indicación clara de su base de cálculo, unidad de medida y monto resultante").
    $unidadDe = function ($line) use ($fmt, $antiguedadAnios) {
        if (! $line->concept) {
            return ['unit' => '—', 'base' => '—'];
        }

        // Antigüedad se paga por año de antigüedad: la "unidad" es la cantidad de años, no
        // la fórmula interna.
        if ($line->concept->code === '144') {
            return ['unit' => (string) $antiguedadAnios, 'base' => '—'];
        }

        return match ($line->concept->calculation_type) {
            'percentage' => ['unit' => $line->rate !== null ? number_format($line->rate, 2, ',', '.').'%' : '—', 'base' => $line->base_amount !== null ? '$ '.$fmt($line->base_amount) : '—'],
            'fixed' => ['unit' => '—', 'base' => '—'],
            default => ['unit' => 'Fórmula', 'base' => '—'],
        };
    };

    // "Costo Total Empleador": listado plano de contribuciones patronales (ART, jubilación,
    // obra social, seguro de vida, conceptos derivados del CCT, etc.), tal como en el Anexo III.
    $filasContribuciones = $contribucionLines->map(fn ($line) => [
        'label' => $line->label,
        ...$unidadDe($line),
        'amount' => $line->amount,
    ]);

    // Filas combinadas de la liquidación (Sueldo Bruto: haberes y descuentos en una sola tabla)
    $filas = collect();
    $filas->push(['code' => '100', 'label' => 'Sueldo Básico Mensual', 'unit' => number_format($diasPeriodo, 2, ',', '.'), 'base' => '—', 'haber' => $receipt->salary_gross, 'descuento' => null]);
    if ($receipt->commission_gross > 0) {
        $filas->push(['code' => '150', 'label' => 'Comisión sobre ventas', 'unit' => $employee->commission_pct > 0 ? number_format($employee->commission_pct, 2, ',', '.').'%' : '—', 'base' => $receipt->sales_total > 0 ? '$ '.$fmt($receipt->sales_total) : '—', 'haber' => $receipt->commission_gross, 'descuento' => null]);
    }
    foreach ($haberLines as $line) {
        $filas->push([...['code' => $line->concept?->code ?? '—', 'label' => $line->label.($line->type === 'non_remunerative' ? ' (no remun.)' : ''), 'haber' => $line->amount, 'descuento' => null], ...$unidadDe($line)]);
    }
    if ($receipt->extras_total > 0) {
        $filas->push(['code' => '190', 'label' => 'Extras / Adicionales', 'unit' => '—', 'base' => '—', 'haber' => $receipt->extras_total, 'descuento' => null]);
    }
    foreach ($descuentoLines as $line) {
        $filas->push([...['code' => $line->concept?->code ?? '—', 'label' => $line->label, 'haber' => null, 'descuento' => $line->amount], ...$unidadDe($line)]);
    }
    if ($receipt->discounts_total > 0) {
        $filas->push(['code' => '890', 'label' => 'Descuentos manuales', 'unit' => '—', 'base' => '—', 'haber' => null, 'descuento' => $receipt->discounts_total]);
    }

    // Detalle de la composición salarial: cada categoría de carga social discriminada en
    // Empleador vs. Trabajador, tal como el Anexo III. Requisito legal Decreto 407/2026
    // (reglamentario Ley 27.802), Anexo I art. 5 y Anexo III, vigente desde 01/06/2026.
    $categoriaLabels = [
        'sindical' => 'Sindical',
        'seguridad_social' => 'Seguridad Social',
        'obra_social' => 'Obra Social',
        'inssjp' => 'INSSJP',
        'art' => 'A.R.T.',
        'camaras_empresariales' => 'Cámaras Empresariales',
        'seguro_vida' => 'Seguro de Vida (SCVO)',
        'otros' => 'Otros Rubros',
    ];
    $composicionSalarial = collect();
    foreach ($categoriaLabels as $key => $label) {
        $catEmpleador = $contribucionLines->filter(fn ($l) => $l->concept?->category === $key)->sum('amount');
        $catTrabajador = $descuentoLines->filter(fn ($l) => $l->concept?->category === $key)->sum('amount');
        $catTotal = $catEmpleador + $catTrabajador;
        if ($catTotal > 0) {
            $composicionSalarial->push(['label' => $label, 'empleador' => $catEmpleador, 'trabajador' => $catTrabajador, 'total' => $catTotal]);
        }
    }

    // Gráfico de torta de composición del costo laboral total (Anexo III: "Costo total
    // empleador"), agrupado como mínimo en sindical/seguridad social/obra social/INSSJP/ART/
    // cámaras empresariales/otros rubros. dompdf no soporta canvas/JS. El SVG inline resultó
    // poco confiable en la ruta de descarga real (funcionaba al generar el PDF por CLI pero no
    // siempre al servirlo por HTTP), así que se dibuja como PNG con GD y se embebe como imagen
    // base64 — dompdf renderiza imágenes de forma mucho más consistente que SVG inline.
    // Paleta con tonos bien diferenciados entre sí (no solo tonos de marca) para que las
    // porciones del gráfico se distingan a simple vista incluso a tamaño reducido.
    $paletaCategorias = ['#E8A33D', '#B23A3A', '#7C5CBF', '#3D8B6B', '#49949C', '#8BB8C4', '#C9A227'];
    $composicion = collect([['label' => 'Sueldo Neto', 'value' => $receipt->net, 'color' => '#397B9C']])
        ->merge($composicionSalarial->map(fn ($c, $i) => ['label' => $c['label'], 'value' => $c['total'], 'color' => $paletaCategorias[$i % count($paletaCategorias)]]))
        ->filter(fn ($c) => $c['value'] > 0)
        ->values();
    $composicionTotal = $composicion->sum('value') ?: 1;

    $renderPieChartPng = function ($slices, int $size = 140): string {
        $img = imagecreatetruecolor($size, $size);
        imagefill($img, 0, 0, imagecolorallocate($img, 255, 255, 255));

        $cx = $size / 2;
        $cy = $size / 2;
        $d = $size - 6;
        $total = array_sum(array_column($slices, 'value')) ?: 1;

        $start = 0.0;
        foreach ($slices as $slice) {
            $fraccion = $slice['value'] / $total;
            $end = $start + $fraccion * 360;
            sscanf($slice['color'], '#%02x%02x%02x', $r, $g, $b);
            $color = imagecolorallocate($img, $r, $g, $b);

            $startDeg = (int) round($start);
            $endDeg = (int) round($end);

            if ($fraccion >= 0.999) {
                imagefilledellipse($img, (int) $cx, (int) $cy, $d, $d, $color);
            } elseif ($endDeg > $startDeg) {
                // GD interpreta start==end como un círculo completo (barre 360°), no como un
                // sector de ancho cero — sin este resguardo, una porción minúscula (ej. Seguro
                // de Vida, un monto fijo chico) pisa por completo todas las porciones anteriores.
                imagefilledarc($img, (int) $cx, (int) $cy, $d, $d, $startDeg, $endDeg, $color, IMG_ARC_PIE);
            }

            $start = $end;
        }

        ob_start();
        imagepng($img);
        $data = ob_get_clean();
        imagedestroy($img);

        return 'data:image/png;base64,'.base64_encode($data);
    };

    $pieChartDataUri = $renderPieChartPng($composicion->map(fn ($c) => ['value' => $c['value'], 'color' => $c['color']])->all());

    $montoEnLetras = \App\Support\NumberToWordsEs::pesos($receipt->net);

    $encodeImg = function (string $path, string $mime = 'image/png'): string {
        return file_exists($path)
            ? "data:{$mime};base64,".base64_encode(file_get_contents($path))
            : '';
    };

    // Logo del encabezado: el de la empresa (tenant) si tiene uno cargado; si no, solo texto.
    // El logo de ArtCode queda reservado para el pie de página, como atribución del software (igual que invoice_afip).
    $storedLogoUrl = $company->documentLogoUrl('general');
    $logoSrc = $storedLogoUrl ? $encodeImg(public_path(ltrim($storedLogoUrl, '/'))) : '';
    $logoIconSrc = $encodeImg(public_path('assets/artcode-horizontal-color.png'));

    $recibNumero = str_pad((string) $receipt->id, 8, '0', STR_PAD_LEFT);
    $mesLiquidacion = \Carbon\Carbon::parse($receipt->period_to)->locale('es')->translatedFormat('F');
    $remAsignada = $scale->base_amount ?? $receipt->salary_gross;
    $mesDeposito = $receipt->paid_at ? \Carbon\Carbon::parse($receipt->paid_at)->locale('es')->translatedFormat('F') : '—';
    $fechaDeposito = $receipt->paid_at ? \Carbon\Carbon::parse($receipt->paid_at)->format('d/m/Y') : '—';
@endphp

{{-- ── Franja superior ──────────────────────────────────────────────────── --}}
<div style="background: linear-gradient(135deg, #397B9C 0%, #49949C 55%, #5AAD9C 100%); height: 6px;"></div>

{{-- ── HEADER: Empresa | Recibo ─────────────────────────────────────────── --}}
<div class="card" style="margin-top: 4mm;">
    <table>
        <tr>
            <td style="width: 58%; padding: 7px 10px; border-right: 1px solid #DAE6F0; vertical-align: top;">
                @if($logoSrc)
                    <img src="{{ $logoSrc }}" alt="{{ $company->name }}" style="height: 12mm; object-fit: contain; display: block; max-width: 55mm; margin-bottom: 3px;">
                @endif
                <div style="font-weight: 800; font-size: 12pt; color: #124C69; line-height: 1.15;">{{ $company->name }}</div>
                <div style="font-size: 7pt; color: #444; margin-top: 2px;">
                    <strong>C.U.I.T.:</strong> {{ $cuitFmt }} &nbsp;·&nbsp; {{ collect([$company->address, $company->city, $company->province])->filter()->join(', ') ?: '—' }}
                </div>
            </td>
            <td style="width: 42%; padding: 7px 10px; vertical-align: top;">
                <div style="font-size: 14pt; font-weight: 900; color: #397B9C; letter-spacing: -0.3px;">RECIBO DE HABERES</div>
                <div style="font-size: 6.3pt; color: #888; margin-bottom: 3px;">Ajustado al modelo Anexo III — Decreto 407/2026 (Ley 27.802). No válido como factura.</div>
                <div style="font-size: 7pt;">
                    <strong>N° Recibo:</strong> {{ $recibNumero }} &nbsp;·&nbsp; <strong>Emisión:</strong> {{ $fmtDate($receipt->created_at) }}
                </div>
            </td>
        </tr>
    </table>
</div>

{{-- ── DATOS DEL EMPLEADOR Y TRABAJADOR (Anexo III) ─────────────────────── --}}
<div class="card">
    <div class="card-header">Datos del Empleador y del Trabajador</div>
    <table style="font-size: 7.5pt;">
        <tr style="background: #f7fafc;">
            <td style="padding: 3px 8px; border-right: 1px solid #DAE6F0;"><span class="stat-label">Mes</span><br>{{ ucfirst($mesLiquidacion) }}</td>
            <td style="padding: 3px 8px; border-right: 1px solid #DAE6F0;"><span class="stat-label">Año</span><br>{{ \Carbon\Carbon::parse($receipt->period_to)->year }}</td>
            <td style="padding: 3px 8px; border-right: 1px solid #DAE6F0;"><span class="stat-label">Apellido y Nombre</span><br><strong>{{ $user->name ?? '—' }}</strong></td>
            <td style="padding: 3px 8px; border-right: 1px solid #DAE6F0;"><span class="stat-label">N° Legajo</span><br>{{ str_pad((string) $employee->id, 4, '0', STR_PAD_LEFT) }}</td>
            <td style="padding: 3px 8px; border-right: 1px solid #DAE6F0;"><span class="stat-label">Rem. Asignada</span><br>$ {{ $fmt($remAsignada) }}</td>
            <td style="padding: 3px 8px;"><span class="stat-label">Antigüedad</span><br>{{ $antiguedad ? "{$antiguedad->y} Años, {$antiguedad->m} Meses" : '—' }}</td>
        </tr>
        <tr style="border-top: 1px solid #DAE6F0;">
            <td colspan="2" style="padding: 3px 8px; border-right: 1px solid #DAE6F0;"><span class="stat-label">Fecha Ingreso</span><br>{{ $fmtDate($employee->hire_date) }}</td>
            <td style="padding: 3px 8px; border-right: 1px solid #DAE6F0;"><span class="stat-label">Categoría Laboral</span><br>{{ $laborAgreement ? "{$laborAgreement->name} — {$category->name}" : ($employee->position ?? '—') }}</td>
            <td style="padding: 3px 8px; border-right: 1px solid #DAE6F0;"><span class="stat-label">C.U.I.L.</span><br>{{ $employee->cuil ?? '—' }}</td>
            <td style="padding: 3px 8px;"><span class="stat-label">Banco</span><br>{{ $employee->bank_name ?? '—' }}</td>
        </tr>
        <tr style="border-top: 1px solid #DAE6F0; background: #f7fafc;">
            <td colspan="2" style="padding: 3px 8px; border-right: 1px solid #DAE6F0;"><span class="stat-label">CBU</span><br>{{ $employee->bank_cbu ?? '—' }}</td>
            <td style="padding: 3px 8px; border-right: 1px solid #DAE6F0;"><span class="stat-label">Mes de Depósito</span><br>{{ ucfirst($mesDeposito) }}</td>
            <td style="padding: 3px 8px;"><span class="stat-label">Fecha</span><br>{{ $fechaDeposito }}</td>
        </tr>
    </table>
</div>

{{-- ── COSTO TOTAL EMPLEADOR (Anexo III) ────────────────────────────────── --}}
@if($filasContribuciones->count() > 0)
<div class="card">
    <div class="card-header" style="background: #397B9C;">Costo Total Empleador — $ {{ $fmt($costoTotalEmpleador) }}</div>
    <table style="font-size: 7.5pt;">
        <thead>
            <tr style="background: #f0f4f8;">
                <th style="padding: 2.5px 8px; text-align: left; font-weight: 700; font-size: 6.3pt; text-transform: uppercase; color: #666;">Concepto</th>
                <th style="padding: 2.5px 8px; text-align: right; font-weight: 700; font-size: 6.3pt; text-transform: uppercase; color: #666; width: 15%;">Unidad</th>
                <th style="padding: 2.5px 8px; text-align: right; font-weight: 700; font-size: 6.3pt; text-transform: uppercase; color: #666; width: 20%;">Base</th>
                <th style="padding: 2.5px 8px; text-align: right; font-weight: 700; font-size: 6.3pt; text-transform: uppercase; color: #666; width: 18%;">Monto</th>
            </tr>
        </thead>
        <tbody>
            @foreach($filasContribuciones as $fc)
                <tr style="border-top: 1px solid #DAE6F0;">
                    <td style="padding: 2.5px 8px;">{{ $fc['label'] }}</td>
                    <td style="padding: 2.5px 8px; text-align: right; color: #666;">{{ $fc['unit'] }}</td>
                    <td style="padding: 2.5px 8px; text-align: right; color: #666;">{{ $fc['base'] }}</td>
                    <td style="padding: 2.5px 8px; text-align: right;">$ {{ $fmt($fc['amount']) }}</td>
                </tr>
            @endforeach
            <tr style="background: #f0f4f8;">
                <td colspan="3" style="padding: 3px 8px; font-weight: 700;">Sub Total Contribuciones Empleador</td>
                <td style="padding: 3px 8px; text-align: right; font-weight: 700;">$ {{ $fmt($contribucionesTotal) }}</td>
            </tr>
        </tbody>
    </table>
</div>
@endif

{{-- ── SUELDO BRUTO: Haberes y Descuentos ───────────────────────────────── --}}
<div class="card">
    <div class="card-header" style="background: #124C69;">Sueldo Bruto — $ {{ $fmt($sueldoBruto) }}</div>
    <table style="font-size: 7.5pt;">
        <thead>
            <tr style="background: #f0f4f8;">
                <th style="padding: 3px 8px; text-align: left; font-weight: 700; font-size: 6.3pt; text-transform: uppercase; color: #666; width: 8%;">Código</th>
                <th style="padding: 3px 8px; text-align: left; font-weight: 700; font-size: 6.3pt; text-transform: uppercase; color: #666;">Concepto</th>
                <th style="padding: 3px 8px; text-align: right; font-weight: 700; font-size: 6.3pt; text-transform: uppercase; color: #666; width: 11%;">Unidad</th>
                <th style="padding: 3px 8px; text-align: right; font-weight: 700; font-size: 6.3pt; text-transform: uppercase; color: #666; width: 15%;">Base</th>
                <th style="padding: 3px 8px; text-align: right; font-weight: 700; font-size: 6.3pt; text-transform: uppercase; color: #3D8B6B; width: 15%;">Haberes</th>
                <th style="padding: 3px 8px; text-align: right; font-weight: 700; font-size: 6.3pt; text-transform: uppercase; color: #B23A3A; width: 15%;">Descuentos</th>
            </tr>
        </thead>
        <tbody>
            @foreach($filas as $fila)
                <tr style="border-top: 1px solid #EEF3F7; background: {{ $fila['haber'] !== null ? '#F5FBF7' : '#FDF6F6' }};">
                    <td style="padding: 3px 8px; color: #888;">{{ $fila['code'] }}</td>
                    <td style="padding: 3px 8px;">{{ $fila['label'] }}</td>
                    <td style="padding: 3px 8px; text-align: right; color: #666;">{{ $fila['unit'] }}</td>
                    <td style="padding: 3px 8px; text-align: right; color: #666;">{{ $fila['base'] }}</td>
                    <td style="padding: 3px 8px; text-align: right; color: #2E7048;">{{ $fila['haber'] !== null ? '$ '.$fmt($fila['haber']) : '' }}</td>
                    <td style="padding: 3px 8px; text-align: right; color: #B00020;">{{ $fila['descuento'] !== null ? '$ '.$fmt($fila['descuento']) : '' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>

{{-- ── COMPOSICIÓN SALARIAL + NETO (en una sola franja) ─────────────────── --}}
<table style="margin: 0 12mm 2.2mm; width: calc(100% - 24mm);">
    <tr>
        <td style="width: 60%; border: 1px solid #DAE6F0; border-radius: 5px; padding: 6px 10px; vertical-align: middle;">
            <table>
                <tr>
                    <td style="text-align: center; border-right: 1px solid #DAE6F0;">
                        <span class="stat-label">Remunerativo</span><div style="font-size: 9pt; font-weight: 800;">$ {{ $fmt($remunerativo) }}</div>
                    </td>
                    <td style="text-align: center; border-right: 1px solid #DAE6F0;">
                        <span class="stat-label">No Remunerativo</span><div style="font-size: 9pt; font-weight: 800;">$ {{ $fmt($noRemunerativo) }}</div>
                    </td>
                    <td style="text-align: center;">
                        <span class="stat-label">Descuentos</span><div style="font-size: 9pt; font-weight: 800; color: #B00020;">- $ {{ $fmt($descuentosTotal) }}</div>
                    </td>
                </tr>
            </table>
        </td>
        <td style="width: 4%;"></td>
        <td style="width: 36%; background: #3D8B6B; border-radius: 5px; padding: 8px 12px; vertical-align: middle;">
            <table>
                <tr>
                    <td style="color: #EAF6EF; font-weight: 800; font-size: 7.8pt; letter-spacing: 0.3px; vertical-align: middle;">SUELDO NETO</td>
                    <td style="color: #fff; font-weight: 900; font-size: 17pt; text-align: right; vertical-align: middle;">$ {{ $fmt($receipt->net) }}</td>
                </tr>
            </table>
        </td>
    </tr>
</table>
<table style="margin: 0 12mm 2.2mm; width: calc(100% - 24mm);">
    <tr>
        <td style="width: 60%; vertical-align: top; font-size: 7pt; color: #444; padding-top: 2px;">
            <strong>Son pesos:</strong> {{ $montoEnLetras }}<br>
            <strong>Lugar y fecha:</strong> {{ $company->city ?? '—' }}, {{ now()->format('d/m/Y') }}
        </td>
        <td style="width: 4%;"></td>
        <td style="width: 36%; text-align: center; vertical-align: top; padding-top: 8px;">
            <div style="display: inline-block; text-align: center; width: 100%; border-top: 1px solid #222; padding-top: 2px; font-size: 7pt; color: #444;">Firma del Empleado</div>
        </td>
    </tr>
</table>

{{-- ── DETALLE DE LA COMPOSICIÓN SALARIAL + Costo total empleador (torta) ── --}}
@if($composicionSalarial->count() > 0)
<div class="card">
    <div class="card-header" style="background: #397B9C;">Detalle de la Composición Salarial</div>
    <table style="font-size: 7.3pt;">
        <tr>
            <td style="width: 55%; vertical-align: top; border-right: 1px solid #DAE6F0;">
                <table>
                    <thead>
                        <tr style="background: #f0f4f8;">
                            <th style="padding: 2.5px 8px; text-align: left; font-weight: 700; font-size: 6.3pt; text-transform: uppercase; color: #666;">Categoría</th>
                            <th style="padding: 2.5px 8px; text-align: right; font-weight: 700; font-size: 6.3pt; text-transform: uppercase; color: #666; width: 26%;">Empleador</th>
                            <th style="padding: 2.5px 8px; text-align: right; font-weight: 700; font-size: 6.3pt; text-transform: uppercase; color: #666; width: 26%;">Trabajador</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($composicionSalarial as $cat)
                            <tr style="border-top: 1px solid #DAE6F0;">
                                <td style="padding: 2.5px 8px;">{{ $cat['label'] }}</td>
                                <td style="padding: 2.5px 8px; text-align: right;">{{ $cat['empleador'] > 0 ? $fmt($cat['empleador']) : '—' }}</td>
                                <td style="padding: 2.5px 8px; text-align: right;">{{ $cat['trabajador'] > 0 ? $fmt($cat['trabajador']) : '—' }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
                <div style="font-size: 6pt; color: #999; padding: 4px 8px 0;">Nota: Seguridad Social del empleador incluye SIPA, Fondo Nacional de Empleo y Asignaciones Familiares.</div>
            </td>
            <td style="width: 45%; vertical-align: top; padding: 6px 10px;">
                <div style="font-size: 6.3pt; font-weight: 700; text-transform: uppercase; color: #666; margin-bottom: 4px; text-align: center;">Costo Total Empleador</div>
                <table>
                    <tr>
                        <td style="width: 18mm; vertical-align: middle;">
                            <img src="{{ $pieChartDataUri }}" width="64" height="64" style="display: block;">
                        </td>
                        <td style="vertical-align: middle; padding-left: 6px;">
                            <table>
                                @foreach($composicion as $c)
                                    <tr>
                                        <td style="padding: 1px 0; width: 10px;"><div style="width: 7px; height: 7px; background: {{ $c['color'] }};"></div></td>
                                        <td style="padding: 1px 6px 1px 0; font-size: 6.3pt; color: #333;">{{ $c['label'] }}</td>
                                        <td style="padding: 1px 0; font-size: 6.3pt; font-weight: 700; text-align: right;">{{ round($c['value'] / $composicionTotal * 100) }}%</td>
                                    </tr>
                                @endforeach
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</div>
@endif

{{-- ── OBSERVACIONES ────────────────────────────────────────────────────── --}}
@if($receipt->notes)
<div class="card">
    <div class="card-header" style="background: #7A8A9A;">Observaciones</div>
    <div class="card-body" style="font-size: 7.5pt; color: #444;">{{ $receipt->notes }}</div>
</div>
@endif


{{-- ── FOOTER INSTITUCIONAL ─────────────────────────────────────────────── --}}
<div style="margin-top: 5mm; padding: 3mm 12mm; border-top: 1px solid #DAE6F0; background: #fafcfe;">
    <table>
        <tr>
            <td style="vertical-align: middle;">
                <table>
                    <tr>
                        <td style="width: 12mm; vertical-align: middle;">
                            @if($logoIconSrc)
                                <img src="{{ $logoIconSrc }}" alt="ArtCode" style="height: 8mm; object-fit: contain; display: block;">
                            @endif
                        </td>
                        <td style="vertical-align: middle; font-size: 6.8pt; color: #444; line-height: 1.4;">
                            Documento generado electrónicamente por ArtCode CRM.<br>
                            <span style="color: #49949C; font-weight: 600;">{{ $company->name }}</span>
                        </td>
                    </tr>
                </table>
            </td>
            <td style="text-align: right; font-size: 6.5pt; color: #999; line-height: 1.5; vertical-align: middle;">
                <div>Recibo N° {{ $recibNumero }} — Generado el {{ now()->format('d/m/Y H:i') }}</div>
            </td>
        </tr>
    </table>
</div>

</body>
</html>
