@extends('emails._layout')

@section('title', 'Recuperá tu contraseña · ARTDENT')

@section('content')
  <h1 style="margin:0 0 8px;font-size:22px;color:#397B9C;">Recuperar contraseña</h1>
  <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.6;">
    Hola <strong>{{ $customer->name }}</strong>, recibimos una solicitud para restablecer la contraseña de tu cuenta.
  </p>

  <p style="margin:0 0 28px;font-size:14px;color:#555;line-height:1.6;">
    Hacé clic en el botón para crear una nueva contraseña. Este enlace expira en <strong>60 minutos</strong>.
  </p>

  <p style="text-align:center;margin:0 0 28px;">
    <a href="{{ $resetUrl }}"
       style="display:inline-block;background:#397B9C;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
      Restablecer contraseña
    </a>
  </p>

  <p style="margin:0 0 12px;font-size:13px;color:#888;text-align:center;">
    O copiá y pegá este enlace en tu navegador:
  </p>
  <p style="margin:0 0 24px;font-size:12px;color:#aaa;text-align:center;word-break:break-all;">
    {{ $resetUrl }}
  </p>

  <p style="margin:0;font-size:13px;color:#999;text-align:center;border-top:1px solid #eee;padding-top:16px;">
    Si no solicitaste este cambio, ignorá este email. Tu contraseña no cambiará.
  </p>
@endsection
