<?php

namespace App\Http\Controllers;

use App\Models\Collaborator;
use App\Models\CollaboratorAttendance;
use App\Models\CollaboratorDiscount;
use App\Models\CollaboratorExtra;
use App\Models\CollaboratorReceipt;
use Illuminate\Http\Request;

class CollaboratorReceiptsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function generate(Request $request)
    {
        $data = $request->validate([
            'collaborator_id' => ['required','integer','exists:collaborators,id'],
            'period_from' => ['required','date'],
            'period_to' => ['required','date','after_or_equal:period_from'],
            'ticket_width_mm' => ['nullable','integer','in:80'],
        ]);

        $user = $request->user();
        $companyId = $user->company_id ?? null;

        $collab = Collaborator::findOrFail($data['collaborator_id']);
        $this->authorizeCompany($companyId, $collab->company_id);

        $from = $data['period_from'];
        $to = $data['period_to'];

        $att = CollaboratorAttendance::query()
            ->where('collaborator_id', $collab->id)
            ->when($companyId, fn($q) => $q->where('company_id', $companyId))
            ->whereDate('work_date', '>=', $from)
            ->whereDate('work_date', '<=', $to)
            ->get();

        $hours = round((float)$att->sum('hours'), 2);
        $gross = round((float)$att->sum('amount'), 2);

        $extras = CollaboratorExtra::query()
            ->where('collaborator_id', $collab->id)
            ->when($companyId, fn($q) => $q->where('company_id', $companyId))
            ->whereDate('date', '>=', $from)
            ->whereDate('date', '<=', $to)
            ->orderBy('date')
            ->get();

        $discounts = CollaboratorDiscount::query()
            ->where('collaborator_id', $collab->id)
            ->when($companyId, fn($q) => $q->where('company_id', $companyId))
            ->whereDate('date', '>=', $from)
            ->whereDate('date', '<=', $to)
            ->orderBy('date')
            ->get();

        $extrasTotal = round((float)$extras->sum('amount'), 2);
        $discountsTotal = round((float)$discounts->sum('amount'), 2);
        $net = round($gross + $extrasTotal - $discountsTotal, 2);

        $receipt = CollaboratorReceipt::create([
            'company_id' => $companyId,
            'collaborator_id' => $collab->id,
            'period_from' => $from,
            'period_to' => $to,
            'hours' => $hours,
            'gross' => $gross,
            'extras_total' => $extrasTotal,
            'discounts_total' => $discountsTotal,
            'net' => $net,
            'created_by' => $user->id,
        ]);

        // Empresa: tomamos la ruta existente company (fallback)
        $company = [
            'name' => $request->header('x-company-name') ?: 'Mi Empresa',
            'tax_id' => $request->header('x-company-tax-id') ?: '',
            'address' => $request->header('x-company-address') ?: '',
        ];

        $payload = [
            'receipt' => $receipt,
            'collaborator' => $collab,
            'company' => $company,
            'details' => [
                'extras' => $extras,
                'discounts' => $discounts,
            ],
        ];

        return response()->json([
            'data' => $payload,
            'html_ticket_80' => $this->buildHtml($payload, 80),
            'html_a5' => $this->buildHtmlA5($payload),
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $receipt = CollaboratorReceipt::with('collaborator')->findOrFail($id);
        $companyId = optional($request->user())->company_id;
        $this->authorizeCompany($companyId, $receipt->company_id);
        return response()->json($receipt);
    }

    private function buildHtml(array $payload, int $widthMm): string
    {
        $r = $payload['receipt'];
        $c = $payload['company'];
        $col = $payload['collaborator'];

        $extrasRows = '';
        foreach ($payload['details']['extras'] as $e) {
            $extrasRows .= '<tr><td>'.e($e->date->format('d/m/Y')).'</td><td>'.e($e->concept).'</td><td class="right">$ '.number_format((float)$e->amount,2,',','.').'</td></tr>';
        }
        $discRows = '';
        foreach ($payload['details']['discounts'] as $d) {
            $discRows .= '<tr><td>'.e($d->date->format('d/m/Y')).'</td><td>'.e($d->concept).'</td><td class="right">$ '.number_format((float)$d->amount,2,',','.').'</td></tr>';
        }

        $from = $r->period_from->format('d/m/Y');
        $to = $r->period_to->format('d/m/Y');

        return "<!DOCTYPE html>
<html>
<head>
<meta charset=\"UTF-8\">
<title>Ticket {$widthMm}mm</title>
<link href=\"https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap\" rel=\"stylesheet\">
<style>
@page { size:{$widthMm}mm auto; margin:0; }
body { width:{$widthMm}mm; font-family:'Montserrat',sans-serif; font-size:11pt; margin:0; }
.wrap{padding:6px}
.center{text-align:center}.bold{font-weight:700}
.right{text-align:right}
hr{border:0;border-top:1px dashed #000;margin:6px 0}
table{width:100%; border-collapse:collapse}
td{padding:2px 0}
</style>
</head>
<body>
<div class=\"wrap\">
  <div class=\"center bold\">RECIBO DE PAGO A COLABORADOR</div>
  <div class=\"center bold\">".e($c['name'])."</div>
  <div class=\"center\">CUIT: ".e($c['tax_id'])."</div>
  <div class=\"center\">".e($c['address'])."</div>
  <hr>
  <div>Colaborador: <b>".e($col->name)."</b></div>
  <div>Desde: {$from} &nbsp;&nbsp; Hasta: {$to}</div>
  <hr>
  <table>
    <tr><td>Horas</td><td class=\"right\">".number_format((float)$r->hours,2,',','.')."</td></tr>
    <tr><td>Importe bruto</td><td class=\"right\">$ ".number_format((float)$r->gross,2,',','.')."</td></tr>
    <tr><td>Total extras</td><td class=\"right\">$ ".number_format((float)$r->extras_total,2,',','.')."</td></tr>
    <tr><td>Descuentos</td><td class=\"right\">$ ".number_format((float)$r->discounts_total,2,',','.')."</td></tr>
    <tr><td class=\"bold\">NETO</td><td class=\"right bold\">$ ".number_format((float)$r->net,2,',','.')."</td></tr>
  </table>
".
($extrasRows ? "  <hr><div class=\"bold\">Extras</div><table>{$extrasRows}</table>" : "") .
($discRows ? "  <hr><div class=\"bold\">Descuentos</div><table>{$discRows}</table>" : "") .
"  <hr><div class=\"center\">Gracias por todo el apoyo</div>
</div>
</body>
</html>";
    }

    private function buildHtmlA5(array $payload): string
    {
        $r = $payload['receipt'];
        $c = $payload['company'];
        $col = $payload['collaborator'];

        $extrasRows = '';
        foreach ($payload['details']['extras'] as $e) {
            $extrasRows .= '<tr><td>'.e($e->date->format('d/m/Y')).'</td><td>'.e($e->concept).'</td><td class="right">$ '.number_format((float)$e->amount,2,',','.').'</td></tr>';
        }
        $discRows = '';
        foreach ($payload['details']['discounts'] as $d) {
            $discRows .= '<tr><td>'.e($d->date->format('d/m/Y')).'</td><td>'.e($d->concept).'</td><td class="right">$ '.number_format((float)$d->amount,2,',','.').'</td></tr>';
        }

        $from = $r->period_from->format('d/m/Y');
        $to = $r->period_to->format('d/m/Y');

        return "<!DOCTYPE html>
<html>
<head>
<meta charset=\"UTF-8\">
<title>Recibo A5</title>
<link href=\"https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap\" rel=\"stylesheet\">
<style>
@page { size: A5 portrait; margin: 10mm; }
html, body { margin: 0; padding: 0; }
body { font-family: 'Montserrat', sans-serif; font-size: 11.5pt; line-height: 1.3; }
.center { text-align: center; }
.bold { font-weight: 700; }
.right { text-align: right; }
hr { border: 0; border-top: 1px dashed #000; margin: 8px 0; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 2px 0; vertical-align: top; }
.small { font-size: 10.5pt; }
</style>
</head>
<body>
  <div class=\"center bold\">RECIBO DE PAGO A COLABORADOR</div>
  <div class=\"center bold\">".e($c['name'])."</div>
  <div class=\"center small\">CUIT: ".e($c['tax_id'])."</div>
  <div class=\"center small\">".e($c['address'])."</div>
  <hr>
  <div>Colaborador: <b>".e($col->name)."</b></div>
  <div>Desde: {$from} &nbsp;&nbsp; Hasta: {$to}</div>
  <hr>
  <table>
    <tr><td>Horas</td><td class=\"right\">".number_format((float)$r->hours,2,',','.')."</td></tr>
    <tr><td>Importe bruto</td><td class=\"right\">$ ".number_format((float)$r->gross,2,',','.')."</td></tr>
    <tr><td>Total de extras</td><td class=\"right\">$ ".number_format((float)$r->extras_total,2,',','.')."</td></tr>
    <tr><td>Descuentos</td><td class=\"right\">$ ".number_format((float)$r->discounts_total,2,',','.')."</td></tr>
    <tr><td class=\"bold\">NETO</td><td class=\"right bold\">$ ".number_format((float)$r->net,2,',','.')."</td></tr>
  </table>
".
($extrasRows ? "  <hr><div class=\"bold\">Detalle de extras</div><table><thead><tr><th>Fecha</th><th>Concepto</th><th class=\"right\">Monto</th></tr></thead><tbody>{$extrasRows}</tbody></table>" : "") .
($discRows ? "  <hr><div class=\"bold\">Detalle de descuentos</div><table><thead><tr><th>Fecha</th><th>Concepto</th><th class=\"right\">Monto</th></tr></thead><tbody>{$discRows}</tbody></table>" : "") .
"  <hr><div class=\"center small\">Gracias por todo el apoyo</div>
</body>
</html>";
    }

    private function authorizeCompany($userCompanyId, $resourceCompanyId): void
    {
        if ($userCompanyId && $resourceCompanyId && (int)$userCompanyId !== (int)$resourceCompanyId) {
            abort(403, 'No autorizado.');
        }
    }
}
