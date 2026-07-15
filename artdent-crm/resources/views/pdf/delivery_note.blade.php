<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Remito de Entrega</title>
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
    font-size: 9pt;
    color: #1A202C;
    background: #fff;
}
strong { font-weight: 700; }
table { border-collapse: collapse; width: 100%; }
.card { border: 1px solid #DAE6F0; border-radius: 5px; margin: 0 12mm 3mm; overflow: hidden; }
.card-header { background: #124C69; color: #fff; padding: 4px 10px; font-weight: 700; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.4px; }
.card-body { padding: 8px 10px; }
.items-table th { background: #F0F5F9; color: #124C69; font-size: 7.5pt; text-transform: uppercase; text-align: left; padding: 5px 8px; border-bottom: 1px solid #DAE6F0; }
.items-table td { font-size: 8.5pt; padding: 5px 8px; border-bottom: 1px solid #EEF3F7; }
</style>
</head>
<body>

@php
    $fmtDate = fn ($d) => $d ? \Carbon\Carbon::parse($d)->format('d/m/Y') : '—';
    $cuitRaw = preg_replace('/\D/', '', $company->cuit ?? '');
    $cuitFmt = strlen($cuitRaw) === 11
        ? substr($cuitRaw, 0, 2).'-'.substr($cuitRaw, 2, 8).'-'.substr($cuitRaw, 10)
        : ($company->cuit ?? '—');

    $encodeImg = function (string $path, string $mime = 'image/png'): string {
        return file_exists($path)
            ? "data:{$mime};base64,".base64_encode(file_get_contents($path))
            : '';
    };
    $storedLogoUrl = $company->documentLogoUrl('general');
    $logoSrc = $storedLogoUrl ? $encodeImg(public_path(ltrim($storedLogoUrl, '/'))) : '';
@endphp

<div style="background: linear-gradient(135deg, #397B9C 0%, #49949C 55%, #5AAD9C 100%); height: 6px;"></div>

<div class="card" style="margin-top: 4mm;">
    <table>
        <tr>
            <td style="width: 58%; padding: 8px 10px; border-right: 1px solid #DAE6F0; vertical-align: top;">
                @if($logoSrc)
                    <img src="{{ $logoSrc }}" alt="{{ $company->name }}" style="height: 13mm; object-fit: contain; display: block; max-width: 55mm; margin-bottom: 3px;">
                @endif
                <div style="font-weight: 800; font-size: 13pt; color: #124C69; line-height: 1.15;">{{ $company->name }}</div>
                <div style="font-size: 7.5pt; color: #444; margin-top: 2px;">
                    <strong>C.U.I.T.:</strong> {{ $cuitFmt }} &nbsp;·&nbsp; {{ collect([$company->address, $company->city, $company->province])->filter()->join(', ') ?: '—' }}
                </div>
            </td>
            <td style="width: 42%; padding: 8px 10px; vertical-align: top;">
                <div style="font-size: 15pt; font-weight: 900; color: #397B9C; letter-spacing: -0.3px;">REMITO DE ENTREGA</div>
                <div style="font-size: 6.8pt; color: #888; margin-bottom: 4px;">Documento no válido como factura — acompaña la entrega de trabajos de laboratorio.</div>
                <div style="font-size: 7.5pt;">
                    <strong>N°:</strong> {{ $remitoNumero }} &nbsp;·&nbsp; <strong>Fecha:</strong> {{ $fmtDate(now()) }}
                </div>
            </td>
        </tr>
    </table>
</div>

<div class="card">
    <div class="card-header">Entregar a</div>
    <div class="card-body">
        <div style="font-weight: 700; font-size: 10pt; color: #124C69;">{{ $dentist->name }}</div>
        <div style="font-size: 8pt; color: #444; margin-top: 2px;">
            {{ collect([$dentist->address ?? null, $dentist->phone ?? null])->filter()->join(' · ') ?: '—' }}
        </div>
    </div>
</div>

<div class="card">
    <div class="card-header">Trabajos entregados ({{ $jobs->count() }})</div>
    <table class="items-table">
        <thead>
            <tr>
                <th>N° Orden</th>
                <th>Paciente</th>
                <th>Tipo de Trabajo</th>
                <th>Descripción</th>
                <th>Color</th>
            </tr>
        </thead>
        <tbody>
            @foreach($jobs as $job)
                <tr>
                    <td><strong>{{ $job->job_number }}</strong></td>
                    <td>{{ $job->patient?->name ?? '—' }}</td>
                    <td>{{ $job->job_type?->name ?? '—' }}</td>
                    <td>{{ $job->description ?? '—' }}</td>
                    <td>{{ $job->shade ?? '—' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>

<div class="card">
    <div class="card-body">
        <table>
            <tr>
                <td style="width: 50%; padding-top: 14mm; text-align: center; border-right: 1px solid #DAE6F0;">
                    <div style="border-top: 1px solid #1A202C; width: 70%; margin: 0 auto; padding-top: 4px; font-size: 7.5pt; color: #444;">
                        Firma y Aclaración — Retira
                    </div>
                </td>
                <td style="width: 50%; padding-top: 14mm; text-align: center;">
                    <div style="border-top: 1px solid #1A202C; width: 70%; margin: 0 auto; padding-top: 4px; font-size: 7.5pt; color: #444;">
                        Recibí conforme — {{ $dentist->name }}
                    </div>
                </td>
            </tr>
        </table>
    </div>
</div>

</body>
</html>
