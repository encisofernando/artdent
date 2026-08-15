<?php

namespace App\Support;

use App\Exceptions\PlanLimitExceededException;
use App\Models\ChatbotMessage;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;

/**
 * Verifica los límites numéricos del plan activo (max_users, max_products,
 * max_sales_per_month) antes de crear un recurso. Un límite null en el plan
 * significa "sin límite".
 */
class PlanLimitService
{
    public function __construct(private readonly TenantModuleResolver $modules) {}

    public function assertCanAddUser(): void
    {
        $this->assertUnder('usuarios', $this->modules->currentPlan()?->max_users, User::count());
    }

    public function assertCanAddProduct(): void
    {
        // withoutCompanyScope(): los límites de plan aplican a todo el
        // tenant (modo owner), no a una sola empresa dentro de él —
        // mismo criterio que User::count() arriba (User no tiene el
        // scope de company en absoluto, ver App\Models\User).
        $this->assertUnder('productos', $this->modules->currentPlan()?->max_products, Product::withoutCompanyScope()->count());
    }

    public function assertCanRecordSale(): void
    {
        $count = Sale::withoutCompanyScope()
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->count();

        $this->assertUnder('ventas de este mes', $this->modules->currentPlan()?->max_sales_per_month, $count);
    }

    public function assertCanSendChatMessage(): void
    {
        $count = ChatbotMessage::where('role', 'user')
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->count();

        $this->assertUnder('mensajes de chat IA de este mes', $this->modules->currentPlan()?->max_chat_messages_per_month, $count);
    }

    private function assertUnder(string $resource, ?int $max, int $current): void
    {
        if ($max !== null && $current >= $max) {
            throw new PlanLimitExceededException($resource, $max);
        }
    }
}
