<?php

namespace App\Services;

use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * MercadoPagoReportService
 *
 * Provides a professional integration with the Mercado Pago Reports API (v1).
 * Specifically implemented for 'Releases' (Liquidaciones) report.
 *
 * @see https://www.mercadopago.com.ar/developers/es/reference/reports/_account_release_report/post
 */
class MercadoPagoReportService
{
    protected string $baseUrl = 'https://api.mercadopago.com';

    protected string $accessToken;

    public function __construct()
    {
        $this->resolveAccessToken();
    }

    protected function resolveAccessToken(): void
    {
        $mpConfig = \App\Models\EcommercePaymentConfig::query()
            ->where('type', 'mercadopago')
            ->first();

        if ($mpConfig) {
            $token = $mpConfig->configValue('access_token');

            if (! empty($token)) {
                $this->accessToken = $token;
            } else {
                $this->accessToken = config('services.mercadopago.access_token', '');
            }
        } else {
            $this->accessToken = config('services.mercadopago.access_token', '');
        }

        if (empty($this->accessToken)) {
            throw new Exception('Mercado Pago Access Token is not configured in DB or services.php');
        }
    }

    /**
     * Request a new Releases (Liquidaciones) report.
     *
     * @return array Raw response from Mercado Pago
     *
     * @throws Exception
     */
    public function generateReleasesReport(Carbon $beginDate, Carbon $endDate): array
    {
        $this->validateDates($beginDate, $endDate);

        // Official Requirement: ISO 8601 format with UTC ('Z')
        // Begin: 00:00:00, End: 23:59:59
        $payload = [
            'begin_date' => $beginDate->copy()->startOfDay()->setTimezone('UTC')->format('Y-m-d\TH:i:s\Z'),
            'end_date' => $endDate->copy()->endOfDay()->setTimezone('UTC')->format('Y-m-d\TH:i:s\Z'),
        ];

        try {
            $response = Http::withToken($this->accessToken)
                ->asJson() // Explicitly send as application/json
                ->timeout(30)
                ->post("{$this->baseUrl}/v1/account/release_report", $payload);

            if ($response->failed()) {
                $this->handleErrorResponse($response);
            }

            return $response->json();
        } catch (Exception $e) {
            Log::error('MercadoPago Report Error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Get the raw content of a specific report file.
     *
     * @return string Raw CSV content
     */
    public function getReportContent(string $fileName): string
    {
        $response = Http::withToken($this->accessToken)
            ->get("{$this->baseUrl}/v1/account/release_report/{$fileName}");

        if ($response->failed()) {
            $this->handleErrorResponse($response);
        }

        return $response->body();
    }

    /**
     * List all generated release reports.
     */
    public function listReports(): array
    {
        $response = Http::withToken($this->accessToken)
            ->get("{$this->baseUrl}/v1/account/release_report/list");

        if ($response->failed()) {
            $this->handleErrorResponse($response);
        }

        return $response->json();
    }

    /**
     * Validate business and technical constraints for report dates.
     */
    protected function validateDates(Carbon $begin, Carbon $end): void
    {
        if ($begin->isAfter($end)) {
            throw new Exception('The begin date must precede the end date.');
        }

        // Official Constraint: Maximum 60 days
        if ($begin->diffInDays($end) > 60) {
            throw new Exception('The maximum allowed period for reports is 60 days.');
        }
    }

    /**
     * Structured error handling for Mercado Pago API status codes.
     */
    protected function handleErrorResponse($response): void
    {
        $status = $response->status();
        $body = $response->json();
        $message = $body['message'] ?? 'Unknown Error';

        $errorMap = [
            400 => "Bad Request: Check parameters. Detail: {$message}",
            401 => 'Unauthorized: Invalid Access Token.',
            403 => 'Forbidden: Insufficient permissions for reports.',
            404 => 'Not Found: The requested report or endpoint does not exist.',
            500 => 'Internal Server Error: Mercado Pago side failure.',
        ];

        throw new Exception($errorMap[$status] ?? "API Error ({$status}): {$message}");
    }
}
