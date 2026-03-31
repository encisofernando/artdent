<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\EcommerceOrder;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\Job;
use App\Models\JobItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportExportController extends Controller
{
    /** Helper: stream a CSV to the browser. */
    private function streamCsv(string $filename, array $headers, iterable $rows): StreamedResponse
    {
        return response()->streamDownload(function () use ($headers, $rows) {
            $out = fopen('php://output', 'w');
            // UTF-8 BOM so Excel opens it correctly
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, $headers, ';');
            foreach ($rows as $row) {
                fputcsv($out, $row, ';');
            }
            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /** GET /export/sales */
    public function sales(Request $request): StreamedResponse
    {
        $companyId = auth()->user()->company_id ?? 1;
        $from = $request->input('from');
        $to = $request->input('to');

        $query = Sale::with('customer')
            ->where('company_id', $companyId)
            ->orderByDesc('sold_at');

        if ($from) {
            $query->where('sold_at', '>=', Carbon::parse($from)->startOfDay());
        }
        if ($to) {
            $query->where('sold_at', '<=', Carbon::parse($to)->endOfDay());
        }

        $sales = $query->get();

        $headers = ['N° Venta', 'Fecha', 'Cliente', 'Estado', 'Subtotal', 'Descuento', 'IVA', 'Total', 'Cobrado', 'Saldo'];

        $rows = $sales->map(fn ($s) => [
            $s->sale_number,
            $s->sold_at ? Carbon::parse($s->sold_at)->format('d/m/Y H:i') : '',
            $s->customer?->name ?? 'Consumidor Final',
            $s->status,
            number_format((float) $s->subtotal, 2, ',', '.'),
            number_format((float) $s->discount_amount, 2, ',', '.'),
            number_format((float) $s->tax_amount, 2, ',', '.'),
            number_format((float) $s->total, 2, ',', '.'),
            number_format((float) $s->paid_amount, 2, ',', '.'),
            number_format((float) $s->total - (float) $s->paid_amount, 2, ',', '.'),
        ]);

        return $this->streamCsv("ventas_{$this->today()}.csv", $headers, $rows);
    }

    /** GET /export/customers */
    public function customers(Request $request): StreamedResponse
    {
        $customers = Customer::with('customer_account')->orderBy('name')->get();

        $headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'DNI', 'CUIT', 'Condición IVA', 'Ciudad', 'Provincia', 'Saldo Cuenta', 'Activo', 'Fecha Alta'];

        $rows = $customers->map(fn ($c) => [
            $c->id,
            $c->name,
            $c->email ?? '',
            $c->phone ?? '',
            $c->dni ?? '',
            $c->cuit ?? '',
            $c->iva_condition ?? '',
            $c->city ?? '',
            $c->province ?? '',
            number_format((float) ($c->customer_account?->balance ?? 0), 2, ',', '.'),
            $c->is_active ? 'Sí' : 'No',
            $c->created_at?->format('d/m/Y') ?? '',
        ]);

        return $this->streamCsv("clientes_{$this->today()}.csv", $headers, $rows);
    }

    /** GET /export/quotes */
    public function quotes(Request $request): StreamedResponse
    {
        $companyId = auth()->user()->company_id ?? 1;
        $from = $request->input('from');
        $to = $request->input('to');

        $query = Invoice::where('company_id', $companyId)
            ->where('reference_type', 'quote')
            ->orderByDesc('created_at');

        if ($from) {
            $query->where('created_at', '>=', Carbon::parse($from)->startOfDay());
        }
        if ($to) {
            $query->where('created_at', '<=', Carbon::parse($to)->endOfDay());
        }

        $quotes = $query->get();

        $headers = ['N° Presupuesto', 'Fecha', 'Cliente', 'Email', 'Estado', 'Subtotal', 'Descuento', 'IVA', 'Total', 'Vencimiento'];

        $rows = $quotes->map(fn ($q) => [
            $q->quote_number,
            $q->issued_at ? Carbon::parse($q->issued_at)->format('d/m/Y') : $q->created_at?->format('d/m/Y'),
            $q->recipient_name,
            $this->extractEmailFromNotes($q->notes),
            $q->status,
            number_format((float) $q->subtotal, 2, ',', '.'),
            number_format((float) $q->discount, 2, ',', '.'),
            number_format((float) $q->tax_amount, 2, ',', '.'),
            number_format((float) $q->total, 2, ',', '.'),
            $q->due_date ? Carbon::parse($q->due_date)->format('d/m/Y') : '',
        ]);

        return $this->streamCsv("presupuestos_{$this->today()}.csv", $headers, $rows);
    }

    /** GET /export/expenses */
    public function expenses(Request $request): StreamedResponse
    {
        $companyId = auth()->user()->company_id ?? 1;
        $from = $request->input('from');
        $to = $request->input('to');

        $query = Expense::with('expense_category')
            ->where('company_id', $companyId)
            ->orderByDesc('expense_date');

        if ($from) {
            $query->where('expense_date', '>=', Carbon::parse($from)->startOfDay());
        }
        if ($to) {
            $query->where('expense_date', '<=', Carbon::parse($to)->endOfDay());
        }

        $expenses = $query->get();

        $headers = ['Fecha', 'Categoría', 'Descripción', 'Monto', 'IVA', 'Total', 'Referencia', 'Notas'];

        $rows = $expenses->map(fn ($e) => [
            $e->expense_date ? Carbon::parse($e->expense_date)->format('d/m/Y') : '',
            $e->expense_category?->name ?? '',
            $e->description ?? '',
            number_format((float) $e->amount, 2, ',', '.'),
            number_format((float) $e->tax_amount, 2, ',', '.'),
            number_format((float) $e->amount + (float) $e->tax_amount, 2, ',', '.'),
            $e->reference ?? '',
            $e->notes ?? '',
        ]);

        return $this->streamCsv("gastos_{$this->today()}.csv", $headers, $rows);
    }

    /** GET /export/iva — Libro IVA Ventas */
    public function ivaVentas(Request $request): StreamedResponse
    {
        $companyId = auth()->user()->company_id ?? 1;
        $from = $request->input('from', Carbon::now()->startOfMonth()->toDateString());
        $to = $request->input('to', Carbon::now()->toDateString());

        $invoices = Invoice::with('invoice_type')
            ->where('company_id', $companyId)
            ->where(fn ($q) => $q->where('reference_type', '!=', 'quote')->orWhereNull('reference_type'))
            ->where(fn ($q) => $q
                ->whereBetween('issued_at', [Carbon::parse($from)->startOfDay(), Carbon::parse($to)->endOfDay()])
                ->orWhere(fn ($q2) => $q2
                    ->whereNull('issued_at')
                    ->whereBetween('created_at', [Carbon::parse($from)->startOfDay(), Carbon::parse($to)->endOfDay()])
                )
            )
            ->orderByRaw('COALESCE(issued_at, created_at) ASC')
            ->get();

        $headers = ['Fecha', 'Tipo Comp.', 'Punto Venta', 'N° Comprobante', 'CAE', 'CUIT Cliente', 'Razón Social', 'Condición IVA', 'Neto Gravado', 'IVA', 'Total'];

        $rows = $invoices->map(fn ($inv) => [
            ($inv->issued_at ?? $inv->created_at)?->format('d/m/Y') ?? '',
            $inv->invoice_type?->name ?? ($inv->invoice_type_id ?? ''),
            str_pad((string) ($inv->point_sale ?? ''), 4, '0', STR_PAD_LEFT),
            str_pad((string) ($inv->number ?? ''), 8, '0', STR_PAD_LEFT),
            $inv->cae ?? '',
            $inv->recipient_cuit ?? '',
            $inv->recipient_name ?? '',
            $inv->recipient_iva ?? '',
            number_format((float) $inv->subtotal - (float) $inv->discount, 2, ',', '.'),
            number_format((float) $inv->tax_amount, 2, ',', '.'),
            number_format((float) $inv->total, 2, ',', '.'),
        ]);

        return $this->streamCsv("libro_iva_ventas_{$from}_{$to}.csv", $headers, $rows);
    }

    /** GET /export/income-statement — Estado de resultados */
    public function incomeStatement(Request $request): StreamedResponse
    {
        $companyId = auth()->user()->company_id ?? 1;
        $from = $request->input('from', Carbon::now()->startOfMonth()->toDateString());
        $to = $request->input('to', Carbon::now()->toDateString());

        $start = Carbon::parse($from)->startOfDay();
        $end = Carbon::parse($to)->endOfDay();

        $posRevenue = (float) Sale::where('company_id', $companyId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('sold_at', [$start, $end])
            ->sum('total');

        $ecoRevenue = (float) EcommerceOrder::where('company_id', $companyId)
            ->where('payment_status', 'paid')
            ->whereBetween('created_at', [$start, $end])
            ->sum('total');

        $expensesByCategory = Expense::with('expense_category')
            ->where('company_id', $companyId)
            ->whereBetween('expense_date', [$start, $end])
            ->get()
            ->groupBy(fn ($e) => $e->expense_category?->name ?? 'Sin categoría')
            ->map(fn ($group) => $group->sum('amount'));

        $totalExpenses = $expensesByCategory->sum();
        $grossProfit = $posRevenue + $ecoRevenue;
        $netResult = $grossProfit - $totalExpenses;

        $rows = [
            ['ESTADO DE RESULTADOS', '', ''],
            ['Período', "{$from} al {$to}", ''],
            ['', '', ''],
            ['INGRESOS', '', ''],
            ['  Ventas POS', number_format($posRevenue, 2, ',', '.'), ''],
            ['  Ventas E-commerce', number_format($ecoRevenue, 2, ',', '.'), ''],
            ['TOTAL INGRESOS', number_format($grossProfit, 2, ',', '.'), ''],
            ['', '', ''],
            ['GASTOS', '', ''],
        ];

        foreach ($expensesByCategory as $cat => $amount) {
            $rows[] = ["  {$cat}", number_format($amount, 2, ',', '.'), ''];
        }

        $rows[] = ['TOTAL GASTOS', number_format($totalExpenses, 2, ',', '.'), ''];
        $rows[] = ['', '', ''];
        $rows[] = ['RESULTADO NETO', number_format($netResult, 2, ',', '.'), $netResult >= 0 ? 'GANANCIA' : 'PÉRDIDA'];

        return $this->streamCsv("estado_resultados_{$from}_{$to}.csv", ['Concepto', 'Importe', 'Observación'], $rows);
    }

    private function today(): string
    {
        return Carbon::now()->format('Y-m-d');
    }

    private function extractEmailFromNotes(?string $notes): string
    {
        if (! $notes) {
            return '';
        }
        $line = collect(explode("\n", $notes))->first(fn ($l) => str_starts_with($l, 'Email:'));

        return $line ? trim(str_replace('Email:', '', $line)) : '';
    }

    /** GET /export/jobs — Trabajos del laboratorio */
    public function exportJobs(Request $request): StreamedResponse
    {
        $companyId = auth()->user()->company_id ?? 1;
        $from = $request->input('from');
        $to = $request->input('to');

        $query = Job::with(['dentist:id,name', 'job_type:id,name', 'user:id,name'])
            ->where('company_id', $companyId)
            ->orderByDesc('received_at');

        if ($from) {
            $query->where('received_at', '>=', Carbon::parse($from)->startOfDay());
        }
        if ($to) {
            $query->where('received_at', '<=', Carbon::parse($to)->endOfDay());
        }

        $jobs = $query->get();

        $headers = ['N° Trabajo', 'Fecha Recepción', 'Odontólogo', 'Tipo', 'Estado', 'Prioridad', 'Subtotal', 'Descuento', 'Total', 'Fecha Entrega', 'Rehecho'];

        $rows = $jobs->map(fn ($j) => [
            $j->job_number,
            $j->received_at ? Carbon::parse($j->received_at)->format('d/m/Y') : '',
            $j->dentist?->name ?? '',
            $j->job_type?->name ?? '',
            $j->status ?? '',
            $j->priority ?? '',
            number_format((float) $j->subtotal, 2, ',', '.'),
            number_format((float) $j->discount_amount, 2, ',', '.'),
            number_format((float) $j->total, 2, ',', '.'),
            $j->delivered_at ? Carbon::parse($j->delivered_at)->format('d/m/Y') : '',
            $j->remake_of_job_id ? 'Sí' : 'No',
        ]);

        return $this->streamCsv("trabajos_{$this->today()}.csv", $headers, $rows);
    }

    /** GET /export/dentists — Ranking de odontólogos */
    public function exportDentists(Request $request): StreamedResponse
    {
        $companyId = auth()->user()->company_id ?? 1;
        $from = $request->input('from');
        $to = $request->input('to');

        $query = Job::where('company_id', $companyId)
            ->where('status', '!=', 'cancelled')
            ->select(
                'dentist_id',
                \Illuminate\Support\Facades\DB::raw('COUNT(*) as job_count'),
                \Illuminate\Support\Facades\DB::raw('SUM(total) as revenue')
            )
            ->groupBy('dentist_id')
            ->orderByDesc('revenue')
            ->with('dentist:id,name,city,zone,phone,email');

        if ($from) {
            $query->where('received_at', '>=', Carbon::parse($from)->startOfDay());
        }
        if ($to) {
            $query->where('received_at', '<=', Carbon::parse($to)->endOfDay());
        }

        $rows = $query->get()->map(fn ($row) => [
            $row->dentist?->name ?? '—',
            $row->dentist?->city ?? '',
            $row->dentist?->zone ?? '',
            $row->dentist?->phone ?? '',
            $row->dentist?->email ?? '',
            (int) $row->job_count,
            number_format((float) $row->revenue, 2, ',', '.'),
        ]);

        $headers = ['Odontólogo', 'Ciudad', 'Zona', 'Teléfono', 'Email', 'Cantidad Trabajos', 'Revenue Total'];

        return $this->streamCsv("ranking_odontologos_{$this->today()}.csv", $headers, $rows);
    }

    /** GET /export/tariffs — Aranceles más usados */
    public function exportTariffs(Request $request): StreamedResponse
    {
        $companyId = auth()->user()->company_id ?? 1;
        $from = $request->input('from');
        $to = $request->input('to');

        $query = JobItem::select(
            'tariff_id',
            \Illuminate\Support\Facades\DB::raw('SUM(quantity) as qty_used'),
            \Illuminate\Support\Facades\DB::raw('SUM(total) as revenue'),
            \Illuminate\Support\Facades\DB::raw('COUNT(DISTINCT job_id) as job_count')
        )
            ->whereHas('job', function ($q) use ($companyId, $from, $to) {
                $q->where('company_id', $companyId)->where('status', '!=', 'cancelled');
                if ($from) {
                    $q->where('received_at', '>=', Carbon::parse($from)->startOfDay());
                }
                if ($to) {
                    $q->where('received_at', '<=', Carbon::parse($to)->endOfDay());
                }
            })
            ->whereNotNull('tariff_id')
            ->groupBy('tariff_id')
            ->orderByDesc('revenue')
            ->with('tariff:id,name,category,lab_sector,price');

        $rows = $query->get()->map(fn ($row) => [
            $row->tariff?->name ?? '—',
            $row->tariff?->category ?? '',
            $row->tariff?->lab_sector ?? '',
            number_format((float) $row->tariff?->price, 2, ',', '.'),
            number_format((float) $row->qty_used, 2, ',', '.'),
            (int) $row->job_count,
            number_format((float) $row->revenue, 2, ',', '.'),
        ]);

        $headers = ['Arancel', 'Categoría', 'Sector Lab', 'Precio Unitario', 'Cantidad Usada', 'N° Trabajos', 'Revenue Total'];

        return $this->streamCsv("aranceles_{$this->today()}.csv", $headers, $rows);
    }
}
