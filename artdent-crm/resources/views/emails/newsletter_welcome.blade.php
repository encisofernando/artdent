@extends('emails._layout')

@section('title', '¡Te suscribiste a ARTDENT!')

@section('content')
  <h1 style="margin:0 0 8px;font-size:22px;color:#397B9C;">¡Estás dentro! 🦷</h1>
  <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.6;">
    @if($subscriberName)
    Hola <strong>{{ $subscriberName }}</strong>,
    @endif
    gracias por suscribirte a las novedades de <strong>ARTDENT</strong>.
  </p>

  <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.6;">
    A partir de ahora recibirás:
  </p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
    <tr>
      <td style="padding:12px 16px;background:#f0f8ff;border-left:4px solid #5AAD9C;border-radius:4px;font-size:14px;color:#444;">
        🏷️ <strong>Ofertas exclusivas</strong> y descuentos para suscriptores
      </td>
    </tr>
    <tr><td style="height:8px;"></td></tr>
    <tr>
      <td style="padding:12px 16px;background:#f0f8ff;border-left:4px solid #5AAD9C;border-radius:4px;font-size:14px;color:#444;">
        🆕 <strong>Nuevos productos</strong> y novedades del sector dental
      </td>
    </tr>
    <tr><td style="height:8px;"></td></tr>
    <tr>
      <td style="padding:12px 16px;background:#f0f8ff;border-left:4px solid #5AAD9C;border-radius:4px;font-size:14px;color:#444;">
        📢 <strong>Información útil</strong> para tu consultorio o laboratorio
      </td>
    </tr>
  </table>

  <p style="text-align:center;margin:0 0 8px;">
    <a href="{{ config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')) }}/productos"
       style="display:inline-block;background:#5AAD9C;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
      Ver catálogo
    </a>
  </p>

  <p style="margin:24px 0 0;font-size:12px;color:#bbb;text-align:center;">
    Para darte de baja respondé a este email con el asunto "baja".
  </p>
@endsection
