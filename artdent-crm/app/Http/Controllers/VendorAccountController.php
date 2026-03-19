<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\VendorAccount;
use App\Models\VendorAccountMove;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorAccountController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $search = $request->input('search');
        $companyId = auth()->user()->company_id ?? 1;

        $query = VendorAccount::query()
            ->with('vendor')
            ->where('company_id', $companyId);

        if ($search) {
            $query->whereHas('vendor', fn ($v) => $v->where('name', 'like', "%{$search}%")
                ->orWhere('cuit', 'like', "%{$search}%"));
        }

        $items = $query->orderByDesc('balance')
            ->paginate(20)
            ->withQueryString();

        // Totales del resumen
        $totalDebt = VendorAccount::where('company_id', $companyId)
            ->where('balance', '>', 0)
            ->sum('balance');

        $totalCredit = VendorAccount::where('company_id', $companyId)
            ->where('balance', '<', 0)
            ->sum('balance');

        return Inertia::render('VendorAccount/Index', [
            'items' => $items,
            'totalDebt' => $totalDebt,
            'totalCredit' => abs($totalCredit),
            'filters' => ['search' => $search],
        ]);
    }

    public function show(Request $request, Vendor $vendor): \Inertia\Response
    {
        $companyId = auth()->user()->company_id ?? 1;

        $account = VendorAccount::firstOrCreate(
            ['vendor_id' => $vendor->id],
            ['company_id' => $companyId, 'balance' => 0]
        );

        $moves = VendorAccountMove::where('vendor_account_id', $account->id)
            ->with('user')
            ->orderBy('move_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('VendorAccount/Show', [
            'vendor' => $vendor,
            'account' => $account,
            'moves' => $moves,
        ]);
    }
}
