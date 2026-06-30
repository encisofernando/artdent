<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Customer;
use App\Models\WhatsappConversation;
use App\Models\WhatsappMessage;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    private string $phoneNumberId;

    private string $accessToken;

    private string $endpoint;

    public function __construct(private readonly Company $company)
    {
        $this->phoneNumberId = $company->whatsapp_phone_number_id ?? '';
        $this->accessToken = $company->whatsapp_access_token ?? '';

        $base = config('services.whatsapp.base_url');
        $version = config('services.whatsapp.api_version');
        $this->endpoint = "{$base}/{$version}/{$this->phoneNumberId}/messages";
    }

    /**
     * @param  array<int, array<string, mixed>>  $components
     */
    public function sendTemplate(Customer $customer, string $templateName, string $languageCode = 'es_AR', array $components = []): bool
    {
        if (! $this->hasCredentials()) {
            Log::channel('whatsapp')->warning('Credenciales de WhatsApp no configuradas.', [
                'company_id' => $this->company->id,
            ]);

            return false;
        }

        $payload = [
            'messaging_product' => 'whatsapp',
            'type' => 'template',
            'template' => [
                'name' => $templateName,
                'language' => ['code' => $languageCode],
                'components' => $components,
            ],
        ];

        $payload = $this->applyRecipient($payload, $customer);

        if ($payload === null) {
            return false;
        }

        $response = $this->post($payload);

        if (! $response->successful()) {
            Log::channel('whatsapp')->error("Error al enviar template '{$templateName}'.", [
                'company_id' => $this->company->id,
                'customer_id' => $customer->id,
                'status' => $response->status(),
                'response' => $response->json(),
            ]);

            return false;
        }

        $data = $response->json();

        $this->captureBsuid($customer, $data);
        $this->recordOutgoingMessage($customer->phone, 'template', $payload, $data);

        Log::channel('whatsapp')->info("Template '{$templateName}' enviado.", [
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'wa_message_id' => $data['messages'][0]['id'] ?? null,
        ]);

        return true;
    }

    /**
     * Envía un mensaje de texto libre a un número de teléfono.
     * Solo funciona dentro de la ventana de 24hs iniciada por el cliente.
     */
    public function sendText(string $to, string $text): bool
    {
        if (! $this->hasCredentials()) {
            Log::channel('whatsapp')->warning('Credenciales de WhatsApp no configuradas.', [
                'company_id' => $this->company->id,
            ]);

            return false;
        }

        $phone = $this->normalizePhone($to);

        if ($phone === '') {
            Log::channel('whatsapp')->warning('Número de teléfono inválido para sendText.', ['to' => $to]);

            return false;
        }

        $payload = [
            'messaging_product' => 'whatsapp',
            'to' => $phone,
            'type' => 'text',
            'text' => ['body' => $text, 'preview_url' => false],
        ];

        $response = $this->post($payload);

        if (! $response->successful()) {
            Log::channel('whatsapp')->error('Error al enviar mensaje de texto.', [
                'company_id' => $this->company->id,
                'to' => $phone,
                'status' => $response->status(),
                'response' => $response->json(),
            ]);

            return false;
        }

        $data = $response->json();

        $this->recordOutgoingMessage($phone, 'text', $payload, $data);

        return true;
    }

    /**
     * Envía un texto libre a un Customer (requiere ventana de 24hs activa).
     */
    public function sendTextMessage(Customer $customer, string $text): bool
    {
        $phone = $this->normalizePhone($customer->phone ?? '');

        if ($phone === '') {
            return false;
        }

        return $this->sendText($phone, $text);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function hasCredentials(): bool
    {
        return $this->phoneNumberId !== '' && $this->accessToken !== '';
    }

    private function normalizePhone(string $phone): string
    {
        return preg_replace('/[^0-9]/', '', $phone) ?? '';
    }

    /**
     * Aplica recipient (BSUID) o to (teléfono) según disponibilidad.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>|null null si no hay teléfono válido
     */
    private function applyRecipient(array $payload, Customer $customer): ?array
    {
        if ($customer->whatsapp_bsuid) {
            $payload['recipient'] = $customer->whatsapp_bsuid;
            $payload['recipient_type'] = 'individual';

            return $payload;
        }

        $phone = $this->normalizePhone($customer->phone ?? '');

        if ($phone === '') {
            Log::channel('whatsapp')->warning('Cliente sin teléfono ni BSUID.', [
                'customer_id' => $customer->id,
            ]);

            return null;
        }

        $payload['to'] = $phone;

        return $payload;
    }

    /** Guarda el BSUID del cliente si Meta lo devuelve en la respuesta. */
    private function captureBsuid(Customer $customer, array $data): void
    {
        if (! $customer->whatsapp_bsuid && isset($data['contacts'][0]['user_id'])) {
            $customer->whatsapp_bsuid = $data['contacts'][0]['user_id'];
            $customer->save();

            Log::channel('whatsapp')->info('BSUID capturado.', ['customer_id' => $customer->id]);
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  array<string, mixed>  $responseData
     */
    private function recordOutgoingMessage(string $phone, string $type, array $payload, array $responseData): void
    {
        $conversation = WhatsappConversation::firstOrCreate(
            ['company_id' => $this->company->id, 'phone' => $phone],
            ['last_message_at' => now(), 'window_expires_at' => now()->addHours(24)],
        );

        $conversation->update(['last_message_at' => now()]);

        WhatsappMessage::create([
            'conversation_id' => $conversation->id,
            'direction' => 'out',
            'wa_message_id' => $responseData['messages'][0]['id'] ?? null,
            'type' => $type,
            'payload' => $payload,
            'status' => 'sent',
        ]);
    }

    /** @param array<string, mixed> $payload */
    private function post(array $payload): Response
    {
        return Http::withToken($this->accessToken)
            ->timeout(15)
            ->post($this->endpoint, $payload);
    }
}
