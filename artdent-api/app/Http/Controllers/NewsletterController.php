<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use App\Models\EmailCampaign;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;

class NewsletterController extends Controller
{
    /**
     * POST /api/newsletter/subscribe
     * Subscribe to newsletter
     */
    public function subscribe(Request $request)
    {
        $companyId = (int) ($request->query('company_id') ?? config('app.ecommerce_company_id', 1));
        
        $data = $request->validate([
            'email' => 'required|email',
            'name' => 'nullable|string|max:191',
            'preferences' => 'nullable|array',
        ]);

        // Check if already subscribed
        $existing = NewsletterSubscriber::where('email', $data['email'])
            ->where('company_id', $companyId)
            ->first();

        if ($existing) {
            if ($existing->is_active) {
                return response()->json([
                    'message' => 'Ya estás suscrito a nuestro newsletter.',
                ], 422);
            }

            // Reactivate subscription
            $existing->update([
                'is_active' => true,
                'name' => $data['name'] ?? $existing->name,
                'preferences' => $data['preferences'] ?? $existing->preferences,
                'unsubscribed_at' => null,
            ]);

            return response()->json([
                'message' => 'Suscripción reactivada exitosamente.',
                'subscriber' => $existing,
            ]);
        }

        // Create new subscription
        $subscriber = NewsletterSubscriber::create([
            'company_id' => $companyId,
            'user_id' => $request->user()?->id,
            'email' => $data['email'],
            'name' => $data['name'] ?? null,
            'preferences' => $data['preferences'] ?? null,
            'unsubscribe_token' => Str::random(32),
            'subscribed_at' => now(),
        ]);

        // TODO: Send welcome email
        // $this->sendWelcomeEmail($subscriber);

        return response()->json([
            'message' => '¡Gracias por suscribirte! Recibirás nuestras novedades.',
            'subscriber' => $subscriber,
        ], 201);
    }

    /**
     * POST /api/newsletter/unsubscribe
     * Unsubscribe from newsletter
     */
    public function unsubscribe(Request $request)
    {
        $data = $request->validate([
            'email' => 'required_without:token|email',
            'token' => 'required_without:email|string',
        ]);

        $query = NewsletterSubscriber::query();

        if (isset($data['token'])) {
            $query->where('unsubscribe_token', $data['token']);
        } else {
            $query->where('email', $data['email']);
        }

        $subscriber = $query->first();

        if (!$subscriber) {
            return response()->json([
                'message' => 'Suscripción no encontrada.',
            ], 404);
        }

        $subscriber->update([
            'is_active' => false,
            'unsubscribed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Has sido dado de baja del newsletter.',
        ]);
    }

    /**
     * PUT /api/newsletter/preferences
     * Update subscription preferences
     */
    public function updatePreferences(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'preferences' => 'required|array',
        ]);

        $subscriber = NewsletterSubscriber::where('email', $data['email'])->first();

        if (!$subscriber) {
            return response()->json([
                'message' => 'Suscripción no encontrada.',
            ], 404);
        }

        $subscriber->update([
            'preferences' => $data['preferences'],
        ]);

        return response()->json([
            'message' => 'Preferencias actualizadas.',
            'subscriber' => $subscriber,
        ]);
    }

    /**
     * GET /api/newsletter/subscribers (Admin)
     * Get all subscribers
     */
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;
        $perPage = min((int)$request->get('per_page', 20), 100);
        $active = $request->get('active');

        $query = NewsletterSubscriber::where('company_id', $companyId)
            ->orderBy('subscribed_at', 'desc');

        if ($active !== null) {
            $query->where('is_active', filter_var($active, FILTER_VALIDATE_BOOLEAN));
        }

        $subscribers = $query->paginate($perPage);

        return response()->json($subscribers);
    }

    /**
     * POST /api/newsletter/campaigns (Admin)
     * Create email campaign
     */
    public function createCampaign(Request $request)
    {
        $companyId = $request->user()->company_id;

        $data = $request->validate([
            'name' => 'required|string|max:191',
            'subject' => 'required|string|max:191',
            'content' => 'required|string',
            'scheduled_at' => 'nullable|date|after:now',
        ]);

        $campaign = EmailCampaign::create([
            'company_id' => $companyId,
            'name' => $data['name'],
            'subject' => $data['subject'],
            'content' => $data['content'],
            'status' => $data['scheduled_at'] ? 'scheduled' : 'draft',
            'scheduled_at' => $data['scheduled_at'] ?? null,
        ]);

        return response()->json($campaign, 201);
    }

    /**
     * POST /api/newsletter/campaigns/{campaign}/send (Admin)
     * Send campaign to all active subscribers
     */
    public function sendCampaign(Request $request, EmailCampaign $campaign)
    {
        if ($campaign->status === 'sent') {
            return response()->json([
                'message' => 'Esta campaña ya fue enviada.',
            ], 422);
        }

        // Get active subscribers
        $subscribers = NewsletterSubscriber::where('company_id', $campaign->company_id)
            ->where('is_active', true)
            ->get();

        $campaign->update([
            'status' => 'sending',
            'recipients_count' => $subscribers->count(),
        ]);

        // Send emails in background (use queue in production)
        foreach ($subscribers as $subscriber) {
            // TODO: Queue email job
            // SendNewsletterEmail::dispatch($subscriber, $campaign);
        }

        $campaign->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return response()->json([
            'message' => 'Campaña enviada a ' . $subscribers->count() . ' suscriptores.',
            'campaign' => $campaign,
        ]);
    }

    /**
     * GET /api/newsletter/campaigns (Admin)
     * Get all campaigns
     */
    public function getCampaigns(Request $request)
    {
        $companyId = $request->user()->company_id;
        $perPage = min((int)$request->get('per_page', 20), 50);

        $campaigns = EmailCampaign::where('company_id', $companyId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($campaigns);
    }

    /**
     * GET /api/newsletter/campaigns/{campaign}/stats (Admin)
     * Get campaign statistics
     */
    public function getCampaignStats(EmailCampaign $campaign)
    {
        $openRate = $campaign->recipients_count > 0
            ? ($campaign->opened_count / $campaign->recipients_count) * 100
            : 0;

        $clickRate = $campaign->recipients_count > 0
            ? ($campaign->clicked_count / $campaign->recipients_count) * 100
            : 0;

        return response()->json([
            'recipients' => $campaign->recipients_count,
            'opened' => $campaign->opened_count,
            'clicked' => $campaign->clicked_count,
            'open_rate' => round($openRate, 2),
            'click_rate' => round($clickRate, 2),
        ]);
    }

    /**
     * Private: Send welcome email
     */
    private function sendWelcomeEmail(NewsletterSubscriber $subscriber)
    {
        // TODO: Implement with Laravel Mail
        /*
        Mail::to($subscriber->email)->send(
            new WelcomeNewsletter($subscriber)
        );
        */
    }
}
