<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class ClaudeService
{
    public const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

    protected const REQUEST_TIMEOUT = 25;

    protected const API_BASE = 'https://api.anthropic.com/v1';

    protected const API_VERSION = '2023-06-01';

    public function __construct(
        private readonly string $apiKey,
        private readonly string $model = self::DEFAULT_MODEL,
    ) {}

    /**
     * Send a chat request to Claude. The static system prompt is marked for Anthropic
     * prompt caching (cache_control: ephemeral) — cache hits cost ~10% of input tokens.
     * Dynamic context (real-time DB data) is appended as a second system block, uncached.
     *
     * @param  string  $staticSystemPrompt  Static instructions — shared across requests (cached).
     * @param  string  $dynamicContext  Per-request data injected at query time (uncached).
     * @param  array  $messages  Chat history: [{role: user|assistant, content: string}, ...].
     */
    public function chat(string $staticSystemPrompt, string $dynamicContext, array $messages): string
    {
        $system = [
            [
                'type' => 'text',
                'text' => $staticSystemPrompt,
                'cache_control' => ['type' => 'ephemeral'],
            ],
        ];

        if ($dynamicContext !== '') {
            $system[] = [
                'type' => 'text',
                'text' => $dynamicContext,
            ];
        }

        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'anthropic-version' => self::API_VERSION,
                'anthropic-beta' => 'prompt-caching-2024-07-31',
                'content-type' => 'application/json',
            ])
                ->timeout(self::REQUEST_TIMEOUT)
                ->retry(2, 500, throw: false)
                ->post(self::API_BASE.'/messages', [
                    'model' => $this->model,
                    'max_tokens' => 1024,
                    'temperature' => 0.3,
                    'system' => $system,
                    'messages' => $messages,
                ]);

            if (! $response->successful()) {
                Log::error('Claude API error', [
                    'model' => $this->model,
                    'status' => $response->status(),
                    'body' => Str::limit($response->body(), 2000),
                ]);

                return 'No pude conectarme con el asistente de IA en este momento. Intentá de nuevo en unos segundos.';
            }

            $content = data_get($response->json(), 'content.0.text');

            if (! is_string($content) || blank($content)) {
                Log::warning('Claude devolvió una respuesta vacía.', ['payload' => $response->json()]);

                return 'Recibí una respuesta vacía. Reformulá la consulta e intentá de nuevo.';
            }

            return trim($content);
        } catch (Throwable $e) {
            Log::error('Excepción al consultar Claude.', ['message' => $e->getMessage()]);

            return 'Ocurrió un error inesperado al consultar el asistente. Intentá de nuevo.';
        }
    }
}
