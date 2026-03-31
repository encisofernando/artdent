<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\EcommerceOrder;
use App\Models\Expense;
use App\Models\IncomeRecord;
use App\Models\Invoice;
use App\Models\Job;
use App\Models\Purchase;
use App\Models\Sale;
use App\Support\AccountingSettings;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountingController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = auth()->user()->company_id ?? 1;
        $company = Company::findOrFail($companyId);
        $settings = $company->normalizedAccountingSettings();

        $from = Carbon::parse($request->input('from', now()->startOfMonth()->toDateString()))->startOfDay();
        $to = Carbon::parse($request->input('to', now()->toDateString()))->endOfDay();

        $invoiceQuery = Invoice::query()
            ->with('invoice_type')
            ->where('company_id', $companyId)
            ->where(function ($query): void {
                $query->where('reference_type', '!=', 'quote')->orWhereNull('reference_type');
            })
            ->where(function ($query) use ($from, $to): void {
                $query->whereBetween('issued_at', [$from, $to])
                    ->orWhere(function ($nested) use ($from, $to): void {
                        $nested->whereNull('issued_at')
                            ->whereBetween('created_at', [$from, $to]);
                    });
            });

        $purchaseQuery = Purchase::query()
            ->with('vendor')
            ->where('company_id', $companyId)
            ->whereBetween('purchased_at', [$from->toDateString(), $to->toDateString()]);

        $expenseQuery = Expense::query()
            ->with(['expense_category', 'vendor'])
            ->where('company_id', $companyId)
            ->whereBetween('expense_date', [$from, $to]);

        $incomeQuery = IncomeRecord::query()
            ->with(['category', 'paymentMethod'])
            ->where('company_id', $companyId)
            ->whereBetween('income_date', [$from, $to]);

        $recentInvoices = (clone $invoiceQuery)
            ->orderByRaw('COALESCE(issued_at, created_at) DESC')
            ->limit(10)
            ->get()
            ->map(fn (Invoice $invoice) => [
                'id' => $invoice->id,
                'source' => $this->resolveInvoiceSource($invoice->reference_type),
                'document' => trim(($invoice->invoice_type?->name ?? 'Comprobante').' '.str_pad((string) ($invoice->point_sale ?? 0), 4, '0', STR_PAD_LEFT).'-'.str_pad((string) ($invoice->number ?? $invoice->id), 8, '0', STR_PAD_LEFT)),
                'recipient_name' => $invoice->recipient_name,
                'recipient_cuit' => $invoice->recipient_cuit,
                'status' => $invoice->status,
                'cae' => $invoice->cae,
                'tax_amount' => (float) $invoice->tax_amount,
                'total' => (float) $invoice->total,
                'issued_at' => ($invoice->issued_at ?? $invoice->created_at)?->toDateString(),
            ]);

        $recentPurchases = (clone $purchaseQuery)
            ->orderByDesc('purchased_at')
            ->orderByDesc('id')
            ->limit(10)
            ->get()
            ->map(fn (Purchase $purchase) => [
                'id' => $purchase->id,
                'vendor_name' => $purchase->vendor?->name,
                'vendor_cuit' => $purchase->vendor?->cuit,
                'status' => $purchase->status,
                'invoice_label' => trim(($purchase->invoice_type ?: 'Comp.').' '.($purchase->invoice_number ?: $purchase->reference_no ?: $purchase->id)),
                'tax_amount' => (float) $purchase->tax_amount,
                'total' => (float) $purchase->total,
                'purchased_at' => $purchase->purchased_at?->toDateString(),
            ]);

        $recentMovements = collect()
            ->merge(
                (clone $incomeQuery)
                    ->orderByDesc('income_date')
                    ->limit(8)
                    ->get()
                    ->map(fn (IncomeRecord $income) => [
                        'type' => 'income',
                        'label' => $income->description,
                        'category' => $income->category?->name ?? 'Ingreso',
                        'scope' => $this->humanizeScope($income->scope),
                        'amount' => (float) $income->amount,
                        'tax_amount' => 0.0,
                        'date' => $income->income_date?->toDateString(),
                    ])
            )
            ->merge(
                (clone $expenseQuery)
                    ->orderByDesc('expense_date')
                    ->limit(8)
                    ->get()
                    ->map(fn (Expense $expense) => [
                        'type' => 'expense',
                        'label' => $expense->description,
                        'category' => $expense->expense_category?->name ?? 'Gasto',
                        'scope' => $this->humanizeScope($expense->scope),
                        'amount' => (float) $expense->amount,
                        'tax_amount' => (float) $expense->tax_amount,
                        'date' => $expense->expense_date?->toDateString(),
                    ])
            )
            ->sortByDesc('date')
            ->take(12)
            ->values();

        $invoiceTotalsBySource = (clone $invoiceQuery)
            ->get()
            ->groupBy(fn (Invoice $invoice) => $this->resolveInvoiceSourceKey($invoice->reference_type))
            ->map(fn ($items, $key) => [
                'key' => $key,
                'label' => $this->resolveInvoiceSourceLabel($key),
                'count' => $items->count(),
                'total' => round((float) $items->sum('total'), 2),
            ])
            ->values();

        $totalInvoices = round((float) (clone $invoiceQuery)->sum('total'), 2);
        $totalVatSales = round((float) (clone $invoiceQuery)->sum('tax_amount'), 2);
        $totalPurchases = round((float) (clone $purchaseQuery)->sum('total'), 2);
        $totalVatPurchases = round((float) (clone $purchaseQuery)->sum('tax_amount'), 2);
        $totalExpenses = round((float) (clone $expenseQuery)->sum(\Illuminate\Support\Facades\DB::raw('amount + COALESCE(tax_amount, 0)')), 2);
        $totalIncomes = round((float) (clone $incomeQuery)->sum('amount'), 2);

        return Inertia::render('Accounting/Index', [
            'company' => [
                'name' => $company->name,
                'fantasy_name' => $company->fantasy_name,
                'cuit' => $company->cuit,
                'iva_condition' => $company->iva_condition,
            ],
            'filters' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'accountingSettings' => $settings,
            'obligations' => AccountingSettings::buildObligations($company, $settings),
            'summary' => [
                'total_invoices' => $totalInvoices,
                'authorized_invoices' => (int) (clone $invoiceQuery)->whereNotNull('cae')->count(),
                'vat_sales' => $totalVatSales,
                'vat_purchases' => $totalVatPurchases,
                'vat_position' => round($totalVatSales - $totalVatPurchases, 2),
                'total_purchases' => $totalPurchases,
                'pending_purchases' => (int) (clone $purchaseQuery)->whereIn('status', ['pending', 'partial'])->count(),
                'total_expenses' => $totalExpenses,
                'total_incomes' => $totalIncomes,
                'operating_result' => round(($totalInvoices + $totalIncomes) - ($totalPurchases + $totalExpenses), 2),
            ],
            'invoiceTotalsBySource' => $invoiceTotalsBySource,
            'recentInvoices' => $recentInvoices,
            'recentPurchases' => $recentPurchases,
            'recentMovements' => $recentMovements,
        ]);
    }

    private function resolveInvoiceSource(?string $referenceType): string
    {
        return $this->resolveInvoiceSourceLabel($this->resolveInvoiceSourceKey($referenceType));
    }

    private function resolveInvoiceSourceKey(?string $referenceType): string
    {
        return match ($referenceType) {
            Sale::class => 'supplies',
            EcommerceOrder::class => 'ecommerce',
            Job::class => 'lab',
            default => 'manual',
        };
    }

    private function resolveInvoiceSourceLabel(string $key): string
    {
        return match ($key) {
            'supplies' => 'Insumos / POS',
            'ecommerce' => 'E-commerce',
            'lab' => 'Laboratorio',
            default => 'Manual / general',
        };
    }

    private function humanizeScope(?string $scope): string
    {
        return match ($scope) {
            'lab', 'laboratory' => 'Laboratorio',
            'ecommerce' => 'E-commerce',
            'supplies', 'inventory', 'products' => 'Insumos',
            default => $scope ? ucfirst(str_replace('_', ' ', $scope)) : 'General',
        };
    }
}
