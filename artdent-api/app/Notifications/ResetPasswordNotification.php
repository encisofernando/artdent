<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
// Si no usás colas, podés quitar ShouldQueue y Queueable.
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public string $token;

    public function __construct(string $token)
    {
        $this->token = $token;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $frontend = config('app.frontend_url', env('FRONTEND_URL', 'https://artdent.com.ar'));

        $url = rtrim($frontend, '/').'/crear-contraseña?token=' . urlencode($this->token)
             . '&email=' . urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('ARTDENT • Restablecé tu contraseña')
            ->view('emails.auth.password_reset', [
                'url'   => $url,
                'email' => $notifiable->getEmailForPasswordReset(),
                'brand' => [
                    'blue'  => '#397B9C',
                    'green' => '#5AAD9C',
                    'teal'  => '#49949C',
                    'mint'  => '#ACD6CE',
                ],
                'logo'  => config('app.brand_logo', env('BRAND_LOGO', 'https://artdent.com.ar/static/logo-artdent.png')),
            ]);
    }

    public function toArray($notifiable): array
    {
        return [];
    }
}
