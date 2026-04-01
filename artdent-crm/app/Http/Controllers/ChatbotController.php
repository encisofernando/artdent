<?php

namespace App\Http\Controllers;

use App\Models\ChatbotConversation;
use App\Models\User;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Throwable;

class ChatbotController extends Controller
{
    public function __construct(protected ChatbotService $chatbotService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        if (! $this->chatbotStorageReady()) {
            return response()->json(['conversations' => []]);
        }

        $conversations = ChatbotConversation::where('company_id', $request->user()->company_id)
            ->where('user_id', $request->user()->id)
            ->orderByDesc('last_message_at')
            ->get(['id', 'title', 'last_message_at']);

        return response()->json([
            'conversations' => $conversations,
        ]);
    }

    public function history(Request $request, $id = null): JsonResponse
    {
        if (! $this->chatbotStorageReady()) {
            return response()->json([
                'messages' => [],
                'meta' => $this->chatbotService->getFrontendConfig(),
                'storage_ready' => false,
            ]);
        }

        $conversation = $id 
            ? ChatbotConversation::where('company_id', $request->user()->company_id)
                ->where('user_id', $request->user()->id)
                ->find($id)
            : $this->resolveConversation($request->user(), false);

        return response()->json([
            'messages' => $this->serializeMessages($conversation),
            'meta' => $this->chatbotService->getFrontendConfig(),
            'conversation_id' => $conversation?->id,
            'storage_ready' => true,
        ]);
    }

    public function handle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'nullable|string|max:2000',
            'messages' => 'nullable|array',
            'messages.*.role' => 'required_with:messages|in:user,assistant',
            'messages.*.content' => 'required_with:messages|string',
        ]);

        if (! $this->chatbotService->isEnabled()) {
            return response()->json([
                'message' => 'El chatbot está deshabilitado para esta empresa.',
            ], 422);
        }

        $userMessage = trim((string) ($validated['message'] ?? ''));

        if ($userMessage === '') {
            $userMessage = $this->extractLatestUserMessage($validated['messages'] ?? []);
        }

        if ($userMessage === '') {
            return response()->json([
                'message' => 'Escribí un mensaje para continuar.',
            ], 422);
        }

        if (! $this->chatbotStorageReady()) {
            return response()->json([
                'message' => $this->chatbotService->generateResponse([
                    [
                        'role' => 'user',
                        'content' => $userMessage,
                    ],
                ], $userMessage),
                'meta' => $this->chatbotService->getFrontendConfig(),
                'storage_ready' => false,
            ]);
        }

        try {
            /** @var User $user */
            $user = $request->user();
            $conversationId = $request->input('conversation_id');
            
            if ($conversationId) {
                $conversation = ChatbotConversation::where('company_id', $user->company_id)
                    ->where('user_id', $user->id)
                    ->findOrFail($conversationId);
            } else {
                $conversation = $this->resolveConversation($user, true);
            }

            $historyMessages = $conversation->messages()
                ->orderBy('id')
                ->get(['role', 'content'])
                ->map(fn ($message) => [
                    'role' => $message->role,
                    'content' => $message->content,
                ])
                ->all();

            $historyMessages[] = [
                'role' => 'user',
                'content' => $userMessage,
            ];

            $response = $this->chatbotService->generateResponse($historyMessages, $userMessage);

            DB::transaction(function () use ($conversation, $userMessage, $response): void {
                $conversation->messages()->create([
                    'role' => 'user',
                    'content' => $userMessage,
                ]);

                $conversation->messages()->create([
                    'role' => 'assistant',
                    'content' => $response,
                ]);

                $updateData = ['last_message_at' => now()];
                
                // Generar titulo si es el primer mensaje
                if (!$conversation->title || $conversation->title === 'Nueva Conversación') {
                    $updateData['title'] = mb_strimwidth($userMessage, 0, 40, '...');
                }

                $conversation->update($updateData);
            });

            $conversation->load(['messages' => fn ($query) => $query->orderBy('id')]);

            return response()->json([
                'message' => $response,
                'messages' => $this->serializeMessages($conversation),
                'conversation_id' => $conversation->id,
                'meta' => $this->chatbotService->getFrontendConfig(),
                'storage_ready' => true,
            ]);
        } catch (Throwable $e) {
            Log::error('ChatbotController Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Ocurrió un error al procesar tu consulta. Inténtalo de nuevo.',
            ], 500);
        }
    }

    public function reset(Request $request): JsonResponse
    {
        if (! $this->chatbotStorageReady()) {
            return response()->json(['message' => 'Storage not ready'], 500);
        }

        $conversation = ChatbotConversation::query()->firstOrCreate([
            'company_id' => $request->user()->company_id,
            'user_id' => $request->user()->id,
        ], [
            'title' => 'Nueva Conversación',
            'last_message_at' => now(),
        ]);

        $conversation->messages()->delete();
        $conversation->forceFill([
            'title' => 'Nueva Conversación',
            'last_message_at' => now(),
        ])->save();

        return response()->json([
            'message' => 'Nueva conversación iniciada.',
            'conversation_id' => $conversation->id,
            'messages' => [],
            'meta' => $this->chatbotService->getFrontendConfig(),
            'storage_ready' => true,
        ]);
    }

    protected function chatbotStorageReady(): bool
    {
        return Schema::hasTable('chatbot_conversations')
            && Schema::hasTable('chatbot_messages');
    }

    protected function resolveConversation(?User $user, bool $createIfMissing): ?ChatbotConversation
    {
        if (! $user) {
            return null;
        }

        $query = ChatbotConversation::query()
            ->where('company_id', $user->company_id)
            ->where('user_id', $user->id);

        if (! $createIfMissing) {
            return $query->first();
        }

        return $query->firstOrCreate([
            'company_id' => $user->company_id,
            'user_id' => $user->id,
        ], [
            'title' => 'Nueva Conversación',
            'last_message_at' => now(),
        ]);
    }

    protected function serializeMessages(?ChatbotConversation $conversation): array
    {
        if (! $conversation) {
            return [];
        }

        return $conversation->relationLoaded('messages')
            ? $conversation->messages->map(fn ($message) => [
                'role' => $message->role,
                'content' => $message->content,
            ])->all()
            : $conversation->messages()
                ->orderBy('id')
                ->get(['role', 'content'])
                ->map(fn ($message) => [
                    'role' => $message->role,
                    'content' => $message->content,
                ])
                ->all();
    }

    protected function extractLatestUserMessage(array $messages): string
    {
        for ($index = count($messages) - 1; $index >= 0; $index--) {
            if (($messages[$index]['role'] ?? null) === 'user') {
                return trim((string) ($messages[$index]['content'] ?? ''));
            }
        }

        return '';
    }
}
