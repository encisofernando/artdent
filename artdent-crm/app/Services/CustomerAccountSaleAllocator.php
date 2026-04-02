<?php

namespace App\Services;

use App\Models\CustomerAccount;
use App\Models\CustomerAccountMove;
use App\Models\Sale;
use App\Models\SalePayment;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;

class CustomerAccountSaleAllocator
{
    public function outstandingAmount(Sale $sale): float
    {
        return max(round((float) ($sale->total ?? 0) - (float) ($sale->paid_amount ?? 0), 2), 0.0);
    }

    public function salePaymentReference(CustomerAccountMove $move, Sale $sale): string
    {
        return "customer-account-move:{$move->id}:sale:{$sale->id}";
    }

    public function allocatedAmountForMove(CustomerAccountMove $move): float
    {
        return round((float) SalePayment::query()
            ->where('reference', 'like', "customer-account-move:{$move->id}:%")
            ->sum('amount'), 2);
    }

    public function syncSale(Sale $sale, ?float $paidAmount = null): void
    {
        $paid = round($paidAmount ?? (float) $sale->sale_payments()->sum('amount'), 2);
        $status = $paid + 0.00001 >= (float) ($sale->total ?? 0) ? 'completed' : 'pending';

        $sale->forceFill([
            'paid_amount' => $paid,
            'status' => $status,
        ])->save();
    }

    public function getOpenSales(
        int $customerId,
        ?int $companyId = null,
        ?string $asOfDate = null,
        bool $lockForUpdate = false
    ): EloquentCollection {
        $query = Sale::query()
            ->where('customer_id', $customerId)
            ->where('status', '!=', 'cancelled')
            ->whereRaw('COALESCE(total, 0) > COALESCE(paid_amount, 0)');

        if ($companyId !== null) {
            $query->where('company_id', $companyId);
        }

        if ($asOfDate) {
            $query->where(function ($dateQuery) use ($asOfDate) {
                $dateQuery->whereDate('sold_at', '<=', $asOfDate)
                    ->orWhere(function ($fallbackQuery) use ($asOfDate) {
                        $fallbackQuery->whereNull('sold_at')
                            ->whereDate('created_at', '<=', $asOfDate);
                    });
            });
        }

        if ($lockForUpdate) {
            $query->lockForUpdate();
        }

        return $query
            ->orderByRaw('COALESCE(sold_at, created_at)')
            ->orderBy('id')
            ->get();
    }

    public function applyMoveToSales(
        CustomerAccountMove $move,
        ?Sale $preferredSale = null,
        ?int $companyId = null,
        bool $respectMoveDate = true,
        bool $autoDistributeRemainder = true
    ): Collection {
        $customerId = CustomerAccount::query()
            ->whereKey($move->customer_account_id)
            ->value('customer_id');

        if (! $customerId) {
            return collect();
        }

        $remainingToApply = round((float) $move->amount - $this->allocatedAmountForMove($move), 2);
        if ($remainingToApply <= 0.0) {
            return collect();
        }

        $appliedSales = collect();

        if ($preferredSale && (int) $preferredSale->customer_id === (int) $customerId) {
            $preferredQuery = Sale::query()->whereKey($preferredSale->id);

            if ($companyId !== null) {
                $preferredQuery->where('company_id', $companyId);
            }

            $lockedPreferredSale = $preferredQuery->lockForUpdate()->first();

            if ($lockedPreferredSale) {
                $remainingToApply = $this->applyAmountToSale(
                    $lockedPreferredSale,
                    $move,
                    $remainingToApply,
                    $appliedSales
                );
            }
        }

        if ($autoDistributeRemainder && $remainingToApply > 0.0) {
            $asOfDate = $respectMoveDate ? optional($move->move_date)->toDateString() : null;
            $openSales = $this->getOpenSales($customerId, $companyId, $asOfDate, true);

            foreach ($openSales as $sale) {
                if ($preferredSale && $sale->id === $preferredSale->id) {
                    continue;
                }

                if ($remainingToApply <= 0.0) {
                    break;
                }

                $remainingToApply = $this->applyAmountToSale($sale, $move, $remainingToApply, $appliedSales);
            }
        }

        if (
            ! $move->reference_type
            && ! $move->reference_id
            && $appliedSales->count() === 1
            && abs((float) $appliedSales->sum('amount') - (float) $move->amount) < 0.01
        ) {
            $move->forceFill([
                'reference_type' => 'sale',
                'reference_id' => $appliedSales->first()['sale_id'],
            ])->save();
        }

        return $appliedSales;
    }

    public function reconcileUnlinkedPaymentsForCustomer(int $customerId, ?int $companyId = null): Collection
    {
        $accountId = CustomerAccount::query()
            ->where('customer_id', $customerId)
            ->value('id');

        if (! $accountId) {
            return collect();
        }

        $moves = CustomerAccountMove::query()
            ->where('customer_account_id', $accountId)
            ->where('type', CustomerAccountMove::TYPE_PAYMENT)
            ->whereNull('reference_type')
            ->whereNull('reference_id')
            ->orderBy('move_date')
            ->orderBy('id')
            ->get();

        $appliedSales = collect();

        foreach ($moves as $move) {
            $appliedSales = $appliedSales->concat(
                $this->applyMoveToSales($move, null, $companyId, true, true)
            );
        }

        return $appliedSales;
    }

    private function applyAmountToSale(
        Sale $sale,
        CustomerAccountMove $move,
        float $remainingToApply,
        Collection $appliedSales
    ): float {
        $outstanding = $this->outstandingAmount($sale);
        if ($outstanding <= 0.0) {
            return $remainingToApply;
        }

        $reference = $this->salePaymentReference($move, $sale);
        if (SalePayment::query()->where('reference', $reference)->exists()) {
            return $remainingToApply;
        }

        $amountToApply = round(min($remainingToApply, $outstanding), 2);
        if ($amountToApply <= 0.0) {
            return $remainingToApply;
        }

        SalePayment::create([
            'sale_id' => $sale->id,
            'payment_method_id' => $move->payment_method_id,
            'amount' => $amountToApply,
            'reference' => $reference,
            'paid_at' => $move->move_date ?? $move->created_at ?? now(),
        ]);

        $newPaidAmount = round((float) $sale->paid_amount + $amountToApply, 2);
        $this->syncSale($sale, $newPaidAmount);

        $appliedSales->push([
            'sale_id' => $sale->id,
            'sale_number' => $sale->sale_number,
            'amount' => $amountToApply,
            'remaining_amount' => max(round((float) $sale->total - $newPaidAmount, 2), 0.0),
        ]);

        return round($remainingToApply - $amountToApply, 2);
    }
}
