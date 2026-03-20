<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Customer;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected string $apiUrl = 'https://graph.facebook.com/v19.0';
    protected ?string $phoneNumberId = null;
    protected ?string $accessToken = null;

    public function __construct(int $companyId = 1)
    {
        $company = Company::find($companyId);
        if ($company) {
            $this->phoneNumberId = $company->whatsapp_phone_number_id;
            $this->accessToken = $company->whatsapp_access_token;
        }
    }

    /**
     * Sends a transactional template message.
     * Implements BSUID logic: uses recipient ID if available, otherwise uses phone number ("to").
     */
    public function sendTemplate(Customer $customer, string $templateName, string $languageCode = 'es_AR', array $components = []): bool
    {
        if (!$this->phoneNumberId || !$this->accessToken) {
            Log::channel('whatsapp')->warning("Credenciales de WhatsApp no configuradas para la empresa.");
            return false;
        }

        // According to Meta's 2026 specs, use recipient (BSUID) if available, fallback to 'to' (phone)
        $payload = [
            'messaging_product' => 'whatsapp',
            'type' => 'template',
            'template' => [
                'name' => $templateName,
                'language' => ['code' => $languageCode],
                'components' => $components,
            ]
        ];

        if ($customer->whatsapp_bsuid) {
            $payload['recipient'] = $customer->whatsapp_bsuid;
            $payload['recipient_type'] = 'individual';
        } else {
            // Remove non-numeric characters from the phone
            $phone = preg_replace('/[^0-9]/', '', $customer->phone);
            if (empty($phone)) {
                Log::channel('whatsapp')->warning("Cliente ID {$customer->id} no tiene teléfono ni BSUID asigando.");
                return false;
            }
            $payload['to'] = $phone;
        }

        $endpoint = "{$this->apiUrl}/{$this->phoneNumberId}/messages";

        try {
            $response = Http::withToken($this->accessToken)
                ->post($endpoint, $payload);

            if ($response->successful()) {
                $data = $response->json();
                
                if (!$customer->whatsapp_bsuid && isset($data['contacts'][0]['user_id'])) {
                    $customer->whatsapp_bsuid = $data['contacts'][0]['user_id'];
                    $customer->save();
                    Log::channel('whatsapp')->info("BSUID capturado post-envío para cliente {$customer->id}");
                }

                Log::channel('whatsapp')->info("Template '{$templateName}' enviado correctamente al cliente {$customer->id}.");
                return true;
            }

            Log::channel('whatsapp')->error("Error al enviar template '{$templateName}' al cliente {$customer->id}", [
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return false;

        } catch (Exception $e) {
            Log::channel('whatsapp')->error("Excepción al comunicarse con la API de WhatsApp", [
                'message' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Sends a free-form text message (requires active 24h window).
     */
    public function sendTextMessage(Customer $customer, string $text): bool
    {
        if (!$this->phoneNumberId || !$this->accessToken) {
            return false;
        }

        $payload = [
            'messaging_product' => 'whatsapp',
            'type' => 'text',
            'text' => ['body' => $text]
        ];

        if ($customer->whatsapp_bsuid) {
            $payload['recipient'] = $customer->whatsapp_bsuid;
            $payload['recipient_type'] = 'individual';
        } else {
            $phone = preg_replace('/[^0-9]/', '', $customer->phone);
            if (empty($phone)) return false;
            $payload['to'] = $phone;
        }

        $endpoint = "{$this->apiUrl}/{$this->phoneNumberId}/messages";

        try {
            $response = Http::withToken($this->accessToken)->post($endpoint, $payload);
            return $response->successful();
        } catch (Exception $e) {
            return false;
        }
    }
}
