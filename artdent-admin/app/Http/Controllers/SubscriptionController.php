<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Subscription::query()->with(['tenant:id,name', 'plan:id,name,slug'])->orderByDesc('created_at');

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        return Inertia::render('Subscriptions/Index', [
            'subscriptions' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only('status'),
        ]);
    }
}
