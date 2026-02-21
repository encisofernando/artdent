<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactFormSubmitted;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class ContactController extends Controller
{
    /**
     * Almacenar un nuevo mensaje de contacto
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Rate limiting: máximo 3 mensajes por hora por IP
        $key = 'contact-form:' . $request->ip();
        
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            
            throw ValidationException::withMessages([
                'email' => [
                    "Demasiados intentos. Por favor, intenta nuevamente en {$seconds} segundos."
                ],
            ])->status(429);
        }

        // Validación
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'subject' => 'required|string|in:consulta-producto,cotizacion,pedido,facturacion,soporte-tecnico,otro',
            'message' => 'required|string|min:10|max:2000',
        ], [
            'name.required' => 'El nombre es obligatorio',
            'email.required' => 'El email es obligatorio',
            'email.email' => 'El email debe ser válido',
            'phone.required' => 'El teléfono es obligatorio',
            'subject.required' => 'El asunto es obligatorio',
            'subject.in' => 'El asunto seleccionado no es válido',
            'message.required' => 'El mensaje es obligatorio',
            'message.min' => 'El mensaje debe tener al menos 10 caracteres',
            'message.max' => 'El mensaje no puede superar los 2000 caracteres',
        ]);

        try {
            // Guardar en base de datos
            $contactMessage = ContactMessage::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'subject' => $validated['subject'],
                'message' => $validated['message'],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'status' => 'pending', // pending, read, replied
            ]);

            // Mapear asunto a texto legible
            $subjectLabels = [
                'consulta-producto' => 'Consulta sobre producto',
                'cotizacion' => 'Solicitud de cotización',
                'pedido' => 'Estado de pedido',
                'facturacion' => 'Facturación',
                'soporte-tecnico' => 'Soporte técnico',
                'otro' => 'Otro',
            ];

            // Enviar email de notificación al equipo
            Mail::to(config('mail.contact_recipient', 'info@artdent.com.ar'))
                ->send(new ContactFormSubmitted([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'],
                    'subject' => $validated['subject'],
                    'subjectLabel' => $subjectLabels[$validated['subject']],
                    'message' => $validated['message'],
                    'timestamp' => now()->format('d/m/Y H:i'),
                    'messageId' => $contactMessage->id,
                ]));

            // Email de confirmación al usuario (opcional)
            // Mail::to($validated['email'])
            //     ->send(new ContactFormConfirmation($validated));

            // Incrementar rate limiter
            RateLimiter::hit($key, 3600); // 1 hora

            return response()->json([
                'success' => true,
                'message' => 'Mensaje enviado correctamente. Te responderemos a la brevedad.',
                'data' => [
                    'id' => $contactMessage->id,
                    'reference' => 'CONT-' . str_pad($contactMessage->id, 6, '0', STR_PAD_LEFT),
                ],
            ], 201);

        } catch (\Exception $e) {
            // Log del error
            \Log::error('Error al procesar formulario de contacto', [
                'error' => $e->getMessage(),
                'data' => $validated,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al procesar tu mensaje. Por favor, intenta nuevamente o contactanos por teléfono.',
            ], 500);
        }
    }

    /**
     * Listar mensajes de contacto (para admin)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Verificar permisos de admin
        // $this->authorize('viewAny', ContactMessage::class);

        $perPage = $request->input('per_page', 15);
        $status = $request->input('status'); // pending, read, replied
        $search = $request->input('search');

        $query = ContactMessage::query()
            ->orderBy('created_at', 'desc');

        // Filtrar por estado
        if ($status) {
            $query->where('status', $status);
        }

        // Buscar por nombre o email
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $messages = $query->paginate($perPage);

        return response()->json($messages);
    }

    /**
     * Ver un mensaje específico
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        // Verificar permisos de admin
        // $this->authorize('view', ContactMessage::class);

        $message = ContactMessage::findOrFail($id);

        // Marcar como leído
        if ($message->status === 'pending') {
            $message->update(['status' => 'read']);
        }

        return response()->json([
            'success' => true,
            'data' => $message,
        ]);
    }

    /**
     * Actualizar estado de un mensaje
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id)
    {
        // Verificar permisos de admin
        // $this->authorize('update', ContactMessage::class);

        $validated = $request->validate([
            'status' => 'required|in:pending,read,replied',
        ]);

        $message = ContactMessage::findOrFail($id);
        $message->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => 'Estado actualizado correctamente',
            'data' => $message,
        ]);
    }

    /**
     * Eliminar un mensaje
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        // Verificar permisos de admin
        // $this->authorize('delete', ContactMessage::class);

        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return response()->json([
            'success' => true,
            'message' => 'Mensaje eliminado correctamente',
        ]);
    }

    /**
     * Obtener estadísticas de mensajes
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function stats()
    {
        // Verificar permisos de admin
        // $this->authorize('viewAny', ContactMessage::class);

        $stats = [
            'total' => ContactMessage::count(),
            'pending' => ContactMessage::where('status', 'pending')->count(),
            'read' => ContactMessage::where('status', 'read')->count(),
            'replied' => ContactMessage::where('status', 'replied')->count(),
            'today' => ContactMessage::whereDate('created_at', today())->count(),
            'this_week' => ContactMessage::whereBetween('created_at', [
                now()->startOfWeek(),
                now()->endOfWeek()
            ])->count(),
            'this_month' => ContactMessage::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
