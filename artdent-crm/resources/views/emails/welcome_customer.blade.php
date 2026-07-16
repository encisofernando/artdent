@extends('emails._layout')

@php $company ??= null; $companyName = $company?->fantasy_name ?: $company?->name ?: 'ArtCode'; @endphp

@section('title', "¡Bienvenido/a a {$companyName}!")

@section('content')
  <h1 style="margin:0 0 8px;font-size:22px;color:#397B9C;">¡Bienvenido/a, {{ $customer->name }}!</h1>
  <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.6;">
    Tu cuenta en <strong>{{ $companyName }}</strong> fue creada exitosamente. A partir de ahora podés:
  </p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
    <tr>
      <td style="padding:12px 16px;background:#f0f8ff;border-left:4px solid #5AAD9C;border-radius:4px;margin-bottom:10px;font-size:14px;color:#444;">
        🛒 <strong>Comprar en cuotas</strong> con precios exclusivos para profesionales
      </td>
    </tr>
    <tr><td style="height:8px;"></td></tr>
    <tr>
      <td style="padding:12px 16px;background:#f0f8ff;border-left:4px solid #5AAD9C;border-radius:4px;font-size:14px;color:#444;">
        📦 <strong>Seguir tus pedidos</strong> en tiempo real desde tu panel de cliente
      </td>
    </tr>
    <tr><td style="height:8px;"></td></tr>
    <tr>
      <td style="padding:12px 16px;background:#f0f8ff;border-left:4px solid #5AAD9C;border-radius:4px;font-size:14px;color:#444;">
        📍 <strong>Guardar tus direcciones</strong> para agilizar futuras compras
      </td>
    </tr>
  </table>

  <p style="text-align:center;margin:0 0 28px;">
    <a href="{{ config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')) }}/productos"
       style="display:inline-block;background:#397B9C;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
      Ver catálogo
    </a>
  </p>

  <p style="margin:0;font-size:13px;color:#999;text-align:center;">
    Si no creaste esta cuenta, ignorá este email.
  </p>
@endsection
