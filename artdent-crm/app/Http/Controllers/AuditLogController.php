<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = AuditLog::with('actor:id,name')->orderByDesc('id');

        if ($search = $request->string('search')->toString()) {
            $query->where('actor_name', 'like', "%{$search}%");
        }

        if ($action = $request->string('action')->toString()) {
            $query->where('action', $action);
        }

        return Inertia::render('AuditLog/Index', [
            'logs' => $query->paginate(25)->withQueryString(),
            'filters' => $request->only('search', 'action'),
            'actions' => AuditLog::query()->distinct()->orderBy('action')->pluck('action'),
        ]);
    }
}
