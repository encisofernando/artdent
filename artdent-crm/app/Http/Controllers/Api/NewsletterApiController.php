<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewsletterWelcome;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class NewsletterApiController extends Controller
{
    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        $subscriber = NewsletterSubscriber::query()
            ->where('email', $validated['email'])
            ->first();

        if ($subscriber) {
            if (! $subscriber->is_active) {
                $subscriber->update(['is_active' => true, 'name' => $validated['name'] ?? $subscriber->name]);
                Mail::to($validated['email'])->queue(new NewsletterWelcome($validated['name'] ?? '', $validated['email']));
            }

            return response()->json(['message' => 'Ya estás suscripto/a a nuestras novedades.']);
        }

        NewsletterSubscriber::create([
            'email' => $validated['email'],
            'name' => $validated['name'] ?? null,
            'is_active' => true,
        ]);

        Mail::to($validated['email'])->queue(new NewsletterWelcome($validated['name'] ?? '', $validated['email']));

        return response()->json(['message' => '¡Suscripción exitosa! Revisá tu email.'], 201);
    }
}
