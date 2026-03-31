<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use App\Services\EmailTemplateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class QuoteController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status', 'all');

        $query = Invoice::with('invoice_items')
            ->where('reference_type', 'quote')
            ->where('company_id', auth()->user()->company_id ?? 1);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('recipient_name', 'like', "%{$search}%")
                    ->orWhere('quote_number', 'like', "%{$search}%")
                    ->orWhere('recipient_cuit', 'like', "%{$search}%");
            });
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $items = $query->orderByDesc('id')->paginate(20)->withQueryString();

        return Inertia::render('Invoice/Index', [
            'items' => $items,
            'filters' => ['search' => $search, 'status' => $status],
        ]);
    }

    public function create()
    {
        $products = Product::with(['product_images'])
            ->where('is_active', 1)
            ->get(['id', 'name', 'sku', 'price', 'cost_price', 'tax_rate', 'track_stock'])
            ->map(function ($p) {
                $arr = $p->toArray();
                $arr['image'] = $p->product_images->first()?->image_url ?? null;

                return $arr;
            });

        $customers = Customer::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'dni', 'phone', 'email', 'address', 'cuit', 'iva_condition']);

        return Inertia::render('Invoice/Create', [
            'products' => $products,
            'customers' => $customers,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'recipient_name' => 'required|string|max:255',
            'recipient_cuit' => 'nullable|string|max:50',
            'recipient_phone' => 'nullable|string|max:50',
            'recipient_email' => 'nullable|email|max:255',
            'recipient_address' => 'nullable|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:0.001',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.total' => 'required|numeric|min:0',
            'subtotal' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'status' => 'nullable|string|in:draft,sent,accepted,expired,cancelled',
        ]);

        $companyId = auth()->user()->company_id ?? 1;

        // Quote number sequence: PRES-00001
        $sequence = Invoice::where('company_id', $companyId)
            ->where('reference_type', 'quote')
            ->count() + 1;
        $quoteNumber = 'PRES-'.str_pad($sequence, 5, '0', STR_PAD_LEFT);

        DB::beginTransaction();
        try {
            $notes = $request->notes ?? '';
            if ($request->recipient_phone) {
                $notes = 'Tel: '.$request->recipient_phone.($notes ? "\n".$notes : '');
            }
            if ($request->recipient_email) {
                $notes = 'Email: '.$request->recipient_email.($notes ? "\n".$notes : '');
            }

            $quote = Invoice::create([
                'company_id' => $companyId,
                'user_id' => auth()->id(),
                'reference_type' => 'quote',
                'invoice_type_id' => 1, // default type
                'recipient_name' => $request->recipient_name,
                'recipient_cuit' => $request->recipient_cuit,
                'recipient_iva' => $request->recipient_iva ?? 'Consumidor Final',
                'recipient_address' => $request->recipient_address,
                'subtotal' => $request->subtotal ?? 0,
                'discount' => $request->discount ?? 0,
                'tax_amount' => $request->tax_amount ?? 0,
                'total' => $request->total,
                'status' => $request->status ?? 'draft',
                'issued_at' => now(),
                'due_date' => $request->due_date,
                'notes' => $notes,
                'public_token' => Str::random(32),
                'quote_number' => $quoteNumber,
            ]);

            foreach ($request->items as $item) {
                $taxRate = (float) ($item['tax_rate'] ?? 0);
                $lineTotal = (float) $item['total'];
                $taxAmount = $taxRate > 0
                    ? round($lineTotal - ($lineTotal / (1 + $taxRate / 100)), 2)
                    : 0;

                InvoiceItem::create([
                    'invoice_id' => $quote->id,
                    'description' => $item['description'],
                    'quantity' => (float) $item['quantity'],
                    'unit_price' => (float) $item['unit_price'],
                    'tax_rate' => $taxRate,
                    'tax_amount' => $taxAmount,
                    'total' => $lineTotal,
                ]);
            }

            DB::commit();

            return redirect()->route('quotes.show', $quote->id)
                ->with('success', "Presupuesto {$quoteNumber} creado exitosamente.");

        } catch (\Throwable $e) {
            DB::rollBack();
            \Log::error('QuoteController@store: '.$e->getMessage());
            throw $e;
        }
    }

    public function show(Invoice $quote)
    {
        abort_unless($quote->reference_type === 'quote', 404);

        $quote->load('invoice_items', 'company');

        $shareUrl = route('quotes.public', $quote->public_token);

        return Inertia::render('Invoice/Show', [
            'item' => $quote,
            'shareUrl' => $shareUrl,
        ]);
    }

    public function destroy(Invoice $quote)
    {
        abort_unless($quote->reference_type === 'quote', 404);

        $quote->update(['status' => 'cancelled']);

        return redirect()->route('quotes.index')
            ->with('success', "Presupuesto {$quote->quote_number} cancelado.");
    }

    public function updateStatus(Request $request, Invoice $quote)
    {
        abort_unless($quote->reference_type === 'quote', 404);

        $request->validate([
            'status' => 'required|string|in:draft,sent,accepted,expired,cancelled',
        ]);

        $quote->update(['status' => $request->status]);

        return back()->with('success', 'Estado actualizado.');
    }

    public function sendEmail(Request $request, Invoice $quote): \Illuminate\Http\JsonResponse
    {
        abort_unless($quote->reference_type === 'quote', 404);

        $request->validate(['email' => 'required|email']);

        $company = Company::findOrFail(auth()->user()->company_id ?? 1);
        $shareUrl = route('quotes.public', $quote->public_token);

        $vars = [
            'empresa' => $company->fantasy_name ?: $company->name,
            'numero' => $quote->quote_number ?? $quote->id,
            'cliente' => $quote->recipient_name ?? 'Cliente',
            'total' => '$'.number_format((float) $quote->total, 2, ',', '.'),
            'fecha' => now()->format('d/m/Y'),
            'link' => $shareUrl,
        ];

        app(EmailTemplateService::class)->send('quote', $request->email, $company, $vars);

        return response()->json(['ok' => true]);
    }

    /** Public shareable view — no auth required */
    public function publicShow(string $token)
    {
        $quote = Invoice::with('invoice_items', 'company')
            ->where('public_token', $token)
            ->where('reference_type', 'quote')
            ->firstOrFail();

        return view('quotes.public', [
            'quote' => $quote,
        ]);
    }
}
