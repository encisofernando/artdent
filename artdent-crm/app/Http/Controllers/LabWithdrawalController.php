<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLabWithdrawalRequest;
use App\Models\Collaborator;
use App\Models\Company;
use App\Models\LabSupplyWithdrawal;
use App\Models\LabSupplyWithdrawalItem;
use App\Models\Product;
use App\Models\Warehouse;
use App\Services\LabWithdrawalService;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LabWithdrawalController extends Controller
{
    public function __construct(private readonly LabWithdrawalService $service) {}

    public function index(Request $request): Response
    {
        $companyId = CompanyContext::id();
        $search = $request->input('search');
        $collaboratorId = $request->input('collaborator_id');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $status = $request->input('status', 'all');

        $query = LabSupplyWithdrawal::query()
            ->with(['user', 'collaborator', 'warehouse'])
            ->where('company_id', $companyId);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('notes', 'like', "%{$search}%")
                    ->orWhere('external_person', 'like', "%{$search}%")
                    ->orWhereHas('collaborator', fn ($c) => $c->where('name', 'like', "%{$search}%"));
            });
        }

        if ($collaboratorId) {
            $query->where('collaborator_id', $collaboratorId);
        }

        if ($dateFrom) {
            $query->whereDate('withdrawn_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('withdrawn_at', '<=', $dateTo);
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $items = $query->orderByDesc('withdrawn_at')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        $collaborators = Collaborator::where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('LabWithdrawal/Index', [
            'items' => $items,
            'collaborators' => $collaborators,
            'filters' => [
                'search' => $search,
                'collaborator_id' => $collaboratorId,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'status' => $status,
            ],
        ]);
    }

    public function create(): Response
    {
        $companyId = CompanyContext::id();

        $warehouses = Warehouse::where('company_id', $companyId)
            ->orderBy('name')
            ->get(['id', 'name']);

        $collaborators = Collaborator::where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $products = Product::where('company_id', $companyId)
            ->where('is_active', true)
            ->with(['product_variants' => fn ($q) => $q->select('id', 'product_id', 'sku', 'barcode')->where('is_active', true)])
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'cost_price', 'has_variants']);

        return Inertia::render('LabWithdrawal/Create', [
            'warehouses' => $warehouses,
            'collaborators' => $collaborators,
            'products' => $products,
        ]);
    }

    public function store(StoreLabWithdrawalRequest $request): RedirectResponse
    {
        $companyId = CompanyContext::id();
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $companyId) {
            $totalCost = collect($validated['items'])->sum('total');

            $withdrawal = LabSupplyWithdrawal::create([
                'company_id' => $companyId,
                'warehouse_id' => $validated['warehouse_id'],
                'user_id' => auth()->id(),
                'collaborator_id' => $validated['collaborator_id'] ?? null,
                'external_person' => $validated['external_person'] ?? null,
                'status' => 'confirmed',
                'total_cost' => $totalCost,
                'withdrawn_at' => $validated['withdrawn_at'],
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $itemData) {
                LabSupplyWithdrawalItem::create([
                    'withdrawal_id' => $withdrawal->id,
                    'product_id' => $itemData['product_id'],
                    'variant_id' => $itemData['variant_id'] ?? null,
                    'quantity' => $itemData['quantity'],
                    'unit_cost' => $itemData['unit_cost'],
                    'total' => $itemData['total'],
                ]);
            }

            $this->service->confirm($withdrawal);
        });

        return redirect()->route('lab-withdrawals.index')
            ->with('success', 'Retiro registrado exitosamente.');
    }

    public function show(LabSupplyWithdrawal $labWithdrawal): Response
    {
        $labWithdrawal->load([
            'warehouse',
            'user',
            'collaborator',
            'items.product',
            'items.product.product_images',
            'items.variant',
        ]);

        return Inertia::render('LabWithdrawal/Show', [
            'withdrawal' => $labWithdrawal,
            'company' => Company::find(CompanyContext::id(), ['id', 'name', 'fantasy_name']),
        ]);
    }

    public function destroy(LabSupplyWithdrawal $labWithdrawal): RedirectResponse
    {
        if ($labWithdrawal->status === 'cancelled') {
            return back()->with('error', 'El retiro ya fue cancelado.');
        }

        DB::transaction(function () use ($labWithdrawal) {
            $this->service->cancel($labWithdrawal);
        });

        return redirect()->route('lab-withdrawals.index')
            ->with('success', 'Retiro cancelado y stock revertido.');
    }
}
