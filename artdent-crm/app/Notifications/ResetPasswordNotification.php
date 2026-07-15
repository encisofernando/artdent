<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Reemplaza la notificación de reset de contraseña por defecto de Laravel
 * (en inglés, sin estilo) por el email con marca ArtCode. Ver
 * App\Models\User::sendPasswordResetNotification().
 */
class ResetPasswordNotification extends ResetPassword
{
    public function toMail($notifiable): MailMessage
    {
        $url = $this->resetUrl($notifiable);

        return (new MailMessage)
            ->subject('Restablecer tu contraseña · ArtCode')
            ->view('emails.user_reset_password', [
                'name' => $notifiable->name ?? null,
                'email' => $notifiable->getEmailForPasswordReset(),
                'resetUrl' => $url,
                'expireMinutes' => (int) config('auth.passwords.'.config('auth.defaults.passwords').'.expire'),
            ]);
    }
}
