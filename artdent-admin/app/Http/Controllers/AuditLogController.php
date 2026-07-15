<?php

namespace App\Http\Controllers;

use App\Models\SuperadminAuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = SuperadminAuditLog::with('actor:id,name,email')->orderByDesc('id');

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('tenant_id', 'like', "%{$search}%")
                    ->orWhere('tenant_name', 'like', "%{$search}%")
                    ->orWhere('actor_email', 'like', "%{$search}%");
            });
        }

        if ($action = $request->string('action')->toString()) {
            $query->where('action', $action);
        }

        return Inertia::render('AuditLogs/Index', [
            'logs' => $query->paginate(25)->withQueryString(),
            'filters' => $request->only('search', 'action'),
            'actions' => SuperadminAuditLog::query()->distinct()->orderBy('action')->pluck('action'),
        ]);
    }
}
