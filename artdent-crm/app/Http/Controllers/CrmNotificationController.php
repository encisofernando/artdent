<?php

namespace App\Http\Controllers;

use App\Models\CrmNotification;
use Illuminate\Http\JsonResponse;

class CrmNotificationController extends Controller
{
    public function index(): JsonResponse
    {
        $notifications = CrmNotification::query()
            ->whereNull('read_at')
            ->orderByDesc('created_at')
            ->limit(40)
            ->get();

        return response()->json($notifications);
    }

    public function markRead(CrmNotification $crmNotification): JsonResponse
    {
        $crmNotification->update(['read_at' => now()]);

        return response()->json(['ok' => true]);
    }

    public function markAllRead(): JsonResponse
    {
        CrmNotification::query()->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['ok' => true]);
    }
}
