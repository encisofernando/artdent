<?php

namespace App\Http\Controllers;

use App\Models\AfipIssuerSetting;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\SubscriptionInvoice;
use App\Models\Tenant;
use App\Models\TenantPayment;
use App\Services\Afip\SubscriptionInvoiceService;
use App\Support\SuperadminAudit;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TenantPaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = TenantPayment::query()
            ->with([
                'tenant:id,name,email,plan,status',
                'plan:id,name,slug,price',
                'invoice:id,tenant_payment_id,receipt_type,point_sale,number,cae,cae_expiry,status,total,issued_at',
                'creator:id,name,email',
            ])
            ->orderByDesc('paid_at')
            ->orderByDesc('id');

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('tenant_id', 'like', "%{$search}%")
                    ->orWhere('reference', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('tenant', fn ($tq) => $tq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($method = $request->string('payment_method')->toString()) {
            $query->where('payment_method', $method);
        }

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        if ($invoiced = $request->string('invoiced')->toString()) {
            if ($invoiced === 'yes') {
                $query->whereHas('invoice', fn ($iq) => $iq->where('status', 'authorized'));
            } elseif ($invoiced === 'no') {
                $query->where(function ($q) {
                    $q->whereNull('subscription_invoice_id')
                        ->orWhereDoesntHave('invoice');
                });
            } elseif ($invoiced === 'failed') {
                $query->whereHas('invoice', fn ($iq) => $iq->where('status', 'failed'));
            }
        }

        if ($dateFrom = $request->string('date_from')->toString()) {
            $query->whereDate('paid_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->string('date_to')->toString()) {
            $query->whereDate('paid_at', '<=', $dateTo);
        }

        $now = Carbon::now();
        $monthStart = $now->copy()->startOfMonth();
        $monthEnd = $now->copy()->endOfMonth();

        $metrics = [
            'total_month' => (float) TenantPayment::whereBetween('paid_at', [$monthStart, $monthEnd])->where('status', 'approved')->sum('amount'),
            'transfer_month' => (float) TenantPayment::whereBetween('paid_at', [$monthStart, $monthEnd])->where('payment_method', TenantPayment::METHOD_TRANSFER)->where('status', 'approved')->sum('amount'),
            'qr_month' => (float) TenantPayment::whereBetween('paid_at', [$monthStart, $monthEnd])->where('payment_method', TenantPayment::METHOD_QR)->where('status', 'approved')->sum('amount'),
            'cash_month' => (float) TenantPayment::whereBetween('paid_at', [$monthStart, $monthEnd])->where('payment_method', TenantPayment::METHOD_CASH)->where('status', 'approved')->sum('amount'),
            'pending_invoices_count' => TenantPayment::where('status', 'approved')
                ->where(function ($q) {
                    $q->whereNull('subscription_invoice_id')
                        ->orWhereHas('invoice', fn ($iq) => $iq->where('status', '!=', 'authorized'));
                })->count(),
        ];

        $issuer = AfipIssuerSetting::current();
        $isIssuerReady = $issuer && ! empty($issuer->cuit) && file_exists($issuer->certPath()) && file_exists($issuer->key_path);

        return Inertia::render('Payments/Index', [
            'payments' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only('search', 'payment_method', 'status', 'invoiced', 'date_from', 'date_to'),
            'metrics' => $metrics,
            'methods' => TenantPayment::METHODS,
            'tenants' => Tenant::orderBy('name')->get(['id', 'name', 'plan', 'status']),
            'plans' => Plan::orderBy('price')->get(['id', 'name', 'slug', 'price']),
            'issuerConfigured' => $isIssuerReady,
            'issuer' => $issuer ? [
                'name' => $issuer->name,
                'cuit' => $issuer->cuit,
                'iva_condition' => $issuer->iva_condition,
                'point_sale' => $issuer->point_sale,
                'environment' => $issuer->environment,
            ] : null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tenant_id' => ['required', 'string', 'exists:tenants,id'],
            'plan_id' => ['nullable', 'integer', 'exists:plans,id'],
            'payment_method' => ['required', 'string', 'in:transfer,qr,cash,mercadopago,other'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'paid_at' => ['required', 'date'],
            'reference' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'extend_subscription' => ['nullable', 'boolean'],
            'next_payment_date' => ['nullable', 'date'],
            'emit_invoice' => ['nullable', 'boolean'],
            'receipt_type' => ['nullable', 'string', 'in:auto,FA,FB,FC'],
            'recipient_name' => ['nullable', 'string', 'max:255'],
            'recipient_cuit' => ['nullable', 'string', 'max:20'],
            'recipient_iva' => ['nullable', 'string', 'in:responsable_inscripto,consumidor_final,monotributista,exento'],
            'invoice_description' => ['nullable', 'string', 'max:255'],
        ]);

        $tenant = Tenant::findOrFail($validated['tenant_id']);
        $plan = ! empty($validated['plan_id'])
            ? Plan::find($validated['plan_id'])
            : Plan::where('slug', $tenant->plan)->first();

        $paidAt = Carbon::parse($validated['paid_at']);
        $extendSubscription = $request->boolean('extend_subscription', true);
        $emitInvoice = $request->boolean('emit_invoice', false);

        // 1. Obtener o crear suscripción
        $subscription = $tenant->activeSubscription() ?: $tenant->subscriptions()->latest()->first();

        // 2. Crear registro de pago
        $payment = TenantPayment::create([
            'tenant_id' => $tenant->id,
            'tenant_subscription_id' => $subscription?->id,
            'plan_id' => $plan?->id,
            'payment_method' => $validated['payment_method'],
            'amount' => (float) $validated['amount'],
            'currency' => 'ARS',
            'paid_at' => $paidAt,
            'reference' => $validated['reference'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'status' => 'approved',
            'created_by_user_id' => auth()->id(),
        ]);

        // 3. Extender suscripción si está marcado
        if ($extendSubscription) {
            $nextPaymentDate = ! empty($validated['next_payment_date'])
                ? Carbon::parse($validated['next_payment_date'])
                : $paidAt->copy()->addMonth();

            $tenant->update([
                'status' => 'active',
                'activated_at' => $tenant->activated_at ?: now(),
            ]);

            if ($subscription) {
                $subscription->update([
                    'status' => 'authorized',
                    'plan_id' => $plan?->id ?: $subscription->plan_id,
                    'amount' => (float) $validated['amount'],
                    'last_payment_date' => $paidAt,
                    'next_payment_date' => $nextPaymentDate,
                ]);
            } else {
                $subscription = Subscription::create([
                    'tenant_id' => $tenant->id,
                    'plan_id' => $plan?->id ?: 1,
                    'status' => 'authorized',
                    'amount' => (float) $validated['amount'],
                    'last_payment_date' => $paidAt,
                    'next_payment_date' => $nextPaymentDate,
                ]);
            }

            $payment->update(['tenant_subscription_id' => $subscription->id]);
        }

        SuperadminAudit::log('payment.created', $tenant, [
            'payment_id' => $payment->id,
            'amount' => $payment->amount,
            'payment_method' => $payment->payment_method,
            'reference' => $payment->reference,
            'extended_subscription' => $extendSubscription,
        ]);

        // 4. Emitir factura electrónica si se solicitó
        if ($emitInvoice) {
            try {
                $invoiceService = app(SubscriptionInvoiceService::class);
                $options = [
                    'amount' => $payment->amount,
                    'description' => $validated['invoice_description'] ?: "Suscripción {$plan?->name} — ".$paidAt->translatedFormat('F Y'),
                    'receipt_type' => ($validated['receipt_type'] ?? 'auto') === 'auto' ? null : $validated['receipt_type'],
                    'recipient_name' => $validated['recipient_name'] ?: $tenant->name,
                    'recipient_cuit' => $validated['recipient_cuit'] ?? null,
                    'recipient_iva' => $validated['recipient_iva'] ?? 'consumidor_final',
                ];

                $invoice = $invoiceService->generateForTenantPayment($payment, $options);

                SuperadminAudit::log('invoice.generated', $tenant, [
                    'payment_id' => $payment->id,
                    'invoice_id' => $invoice->id,
                    'cae' => $invoice->cae,
                    'number' => $invoice->number,
                    'receipt_type' => $invoice->receipt_type,
                ]);

                return redirect()->route('payments.index')->with(
                    'success',
                    "Pago registrado y Factura Electrónica emitida con éxito (Comprobante {$invoice->receipt_type} Nº {$invoice->number} — CAE: {$invoice->cae})."
                );
            } catch (\Throwable $e) {
                return redirect()->route('payments.index')->with(
                    'warning',
                    "Pago registrado correctamente. Sin embargo, no se pudo emitir la factura AFIP: {$e->getMessage()}. Podés reintentarla desde la lista de pagos."
                );
            }
        }

        return redirect()->route('payments.index')->with('success', 'Pago manual registrado correctamente.');
    }

    public function generateInvoice(TenantPayment $payment, Request $request): RedirectResponse
    {
        if ($payment->invoice && $payment->invoice->status === 'authorized') {
            return back()->with('error', 'Este pago ya tiene una factura electrónica autorizada por AFIP.');
        }

        $validated = $request->validate([
            'receipt_type' => ['nullable', 'string', 'in:auto,FA,FB,FC'],
            'recipient_name' => ['nullable', 'string', 'max:255'],
            'recipient_cuit' => ['nullable', 'string', 'max:20'],
            'recipient_iva' => ['nullable', 'string', 'in:responsable_inscripto,consumidor_final,monotributista,exento'],
            'invoice_description' => ['nullable', 'string', 'max:255'],
        ]);

        $tenant = $payment->tenant ?: Tenant::findOrFail($payment->tenant_id);
        $plan = $payment->plan;
        $paidAt = $payment->paid_at ?: now();

        try {
            $invoiceService = app(SubscriptionInvoiceService::class);
            $options = [
                'amount' => $payment->amount,
                'description' => $validated['invoice_description'] ?: "Suscripción {$plan?->name} — ".$paidAt->translatedFormat('F Y'),
                'receipt_type' => ($validated['receipt_type'] ?? 'auto') === 'auto' ? null : $validated['receipt_type'],
                'recipient_name' => $validated['recipient_name'] ?: $tenant->name,
                'recipient_cuit' => $validated['recipient_cuit'] ?? null,
                'recipient_iva' => $validated['recipient_iva'] ?? 'consumidor_final',
            ];

            $invoice = $invoiceService->generateForTenantPayment($payment, $options);

            SuperadminAudit::log('invoice.generated', $tenant, [
                'payment_id' => $payment->id,
                'invoice_id' => $invoice->id,
                'cae' => $invoice->cae,
                'number' => $invoice->number,
                'receipt_type' => $invoice->receipt_type,
            ]);

            return back()->with('success', "Factura AFIP emitida con éxito (Comprobante {$invoice->receipt_type} Nº {$invoice->number} — CAE: {$invoice->cae}).");
        } catch (\Throwable $e) {
            return back()->with('error', "Error al emitir factura AFIP: {$e->getMessage()}");
        }
    }

    public function showInvoice(SubscriptionInvoice $invoice): JsonResponse
    {
        $invoice->load(['tenant:id,name,email', 'payment', 'subscription.plan']);
        $issuer = AfipIssuerSetting::current();

        $cuitNum = (int) preg_replace('/\D/', '', $issuer?->cuit ?? '');
        $cbteTipo = SubscriptionInvoiceService::CBTE_TIPO[$invoice->receipt_type] ?? 11;

        // Construir payload oficial para el QR de ARCA (RG 4291 / 5040)
        $qrData = [
            'ver' => 1,
            'fecha' => ($invoice->issued_at ?: $invoice->created_at)->format('Y-m-d'),
            'cuit' => $cuitNum,
            'ptoVta' => $invoice->point_sale,
            'tipoCmp' => $cbteTipo,
            'nroCmp' => (int) ($invoice->number ?: 1),
            'importe' => (float) $invoice->total,
            'moneda' => 'PES',
            'ctz' => 1,
            'tipoCodAut' => 'E',
            'codAut' => (int) ($invoice->cae ?: 0),
        ];

        if ($invoice->recipient_cuit) {
            $rawDoc = preg_replace('/\D/', '', $invoice->recipient_cuit);
            if (strlen($rawDoc) >= 7) {
                $qrData['tipoDocRec'] = strlen($rawDoc) === 11 ? 80 : 96;
                $qrData['nroDocRec'] = (int) $rawDoc;
            }
        }

        $qrUrl = 'https://www.arca.gob.ar/fe/qr/?p='.base64_encode(json_encode($qrData));

        return response()->json([
            'invoice' => $invoice,
            'issuer' => $issuer,
            'qr_data' => $qrData,
            'qr_url' => $qrUrl,
        ]);
    }
}
