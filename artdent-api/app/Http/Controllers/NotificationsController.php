<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $perPage = min((int)$request->get('per_page', 20), 50);

        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($notifications);
    }

    public function unreadCount(Request $request)
    {
        $user = $request->user();
        $count = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    public function markAsRead(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json($notification);
    }

    public function markAllAsRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json(['message' => 'Todas las notificaciones marcadas como leídas']);
    }

    public function destroy(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $notification->delete();

        return response()->json(['message' => 'Notificación eliminada']);
    }

    public function getPreferences(Request $request)
    {
        $user = $request->user();
        // TODO: Implement user notification preferences
        return response()->json([]);
    }

    public function updatePreferences(Request $request)
    {
        // TODO: Implement preferences update
        return response()->json(['message' => 'Preferencias actualizadas']);
    }
}
