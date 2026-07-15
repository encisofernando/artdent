<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, Helvetica, Arial, sans-serif; background:#E6F5F2; padding:32px; margin:0;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
        <p style="color:#397B9C;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 12px;">ArtCode · Soporte</p>
        <h1 style="color:#0F2C3A;font-size:20px;margin:0 0 16px;">Nueva respuesta en tu ticket</h1>
        <p style="color:#334155;line-height:1.6;margin:0 0 8px;">
            <strong>{{ $ticket->subject }}</strong> (#{{ $ticket->id }})
        </p>
        <div style="background:#E6F5F2;border-radius:10px;padding:16px 20px;margin:0 0 24px;">
            <p style="color:#0F2C3A;line-height:1.6;margin:0;white-space:pre-wrap;">{{ $message->body }}</p>
        </div>
        <p style="margin:0 0 24px;">
            <a href="{{ config('tenancy.crm_login_url') }}" style="background:#17B3A3;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
                Ver el ticket
            </a>
        </p>
        <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0;">
            Respondé desde tu panel de ArtCode para continuar la conversación.
        </p>
    </div>
</body>
</html>
