<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactFormSubmitted extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Los datos del formulario de contacto
     *
     * @var array
     */
    public $formData;

    /**
     * Create a new message instance.
     */
    public function __construct(array $formData)
    {
        $this->formData = $formData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(
                config('mail.from.address'),
                config('mail.from.name')
            ),
            replyTo: [
                new Address(
                    $this->formData['email'],
                    $this->formData['name']
                ),
            ],
            subject: '📧 Nuevo mensaje de contacto - ' . $this->formData['subjectLabel'],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtmlContent(),
        );
    }

    /**
     * Construir el contenido HTML del email
     *
     * @return string
     */
    private function buildHtmlContent(): string
    {
        $name = htmlspecialchars($this->formData['name']);
        $email = htmlspecialchars($this->formData['email']);
        $phone = htmlspecialchars($this->formData['phone']);
        $subjectLabel = htmlspecialchars($this->formData['subjectLabel']);
        $message = nl2br(htmlspecialchars($this->formData['message']));
        $timestamp = $this->formData['timestamp'];
        $messageId = $this->formData['messageId'] ?? '';

        return <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo mensaje de contacto - ARTDENT</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .email-header {
            background: linear-gradient(135deg, #397B9C 0%, #5AAD9C 100%);
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }
        .email-header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .email-body {
            padding: 30px 20px;
        }
        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #397B9C;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-row {
            margin: 12px 0;
        }
        .info-label {
            font-weight: 600;
            color: #397B9C;
            display: inline-block;
            min-width: 100px;
        }
        .info-value {
            color: #333333;
        }
        .message-box {
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            padding: 20px;
            margin: 20px 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .cta-button {
            display: inline-block;
            background-color: #397B9C;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
        }
        .cta-button:hover {
            background-color: #2d6380;
        }
        .email-footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666666;
            font-size: 14px;
            border-top: 1px solid #e0e0e0;
        }
        .timestamp {
            color: #999999;
            font-size: 12px;
            margin-top: 10px;
        }
        .reference {
            background-color: #e3f2fd;
            color: #1976d2;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <h1>📧 Nuevo mensaje de contacto</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">ARTDENT E-commerce</p>
        </div>

        <!-- Body -->
        <div class="email-body">
            <p>Hola equipo,</p>
            <p>Se ha recibido un nuevo mensaje desde el formulario de contacto del sitio web.</p>

            <div style="text-align: center; margin: 15px 0;">
                <span class="reference">ID: {$messageId}</span>
            </div>

            <!-- Información del contacto -->
            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Nombre:</span>
                    <span class="info-value">{$name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">
                        <a href="mailto:{$email}" style="color: #397B9C; text-decoration: none;">
                            {$email}
                        </a>
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Teléfono:</span>
                    <span class="info-value">
                        <a href="tel:{$phone}" style="color: #397B9C; text-decoration: none;">
                            {$phone}
                        </a>
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Asunto:</span>
                    <span class="info-value">{$subjectLabel}</span>
                </div>
            </div>

            <!-- Mensaje -->
            <div style="margin: 20px 0;">
                <strong style="color: #397B9C; font-size: 16px;">Mensaje:</strong>
                <div class="message-box">{$message}</div>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:{$email}?subject=Re: {$subjectLabel}" class="cta-button">
                    Responder por email
                </a>
            </div>

            <p class="timestamp">
                Recibido el {$timestamp}
            </p>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <p style="margin: 0 0 10px 0;">
                <strong>ARTDENT</strong><br>
                Tu sonrisa, es nuestra prioridad
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
                Av. Ejemplo 1234, CABA, Buenos Aires, Argentina<br>
                Tel: +54 11 XXXX-XXXX | Email: info@artdent.com.ar
            </p>
            <p style="margin: 15px 0 5px 0; font-size: 11px; color: #999999;">
                Este es un email automático. Por favor, no respondas a este mensaje.
            </p>
        </div>
    </div>
</body>
</html>
HTML;
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
