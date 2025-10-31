<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Obtener notificaciones del usuario
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $notifications = Notification::forUser($user->id)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();
        
        $unreadCount = Notification::forUser($user->id)->unread()->count();
        
        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Marcar notificación como leída
     */
    public function markAsRead(Request $request, Notification $notification)
    {
        $user = $request->user();
        
        if ($notification->user_id !== $user->id) {
            abort(403);
        }
        
        $notification->markAsRead();
        
        return response()->json(['success' => true]);
    }

    /**
     * Marcar todas como leídas
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        
        Notification::forUser($user->id)
            ->unread()
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        
        return response()->json(['success' => true]);
    }

    /**
     * Obtener contador de no leídas
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();
        
        $count = Notification::forUser($user->id)->unread()->count();
        
        return response()->json(['count' => $count]);
    }
}
