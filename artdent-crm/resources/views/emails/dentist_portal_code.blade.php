@extends('emails._layout')

@section('title', 'Tu código de acceso · ARTDENT')

@section('content')
  <h1 style="margin:0 0 8px;font-size:22px;color:#397B9C;">Tu código de acceso</h1>
  <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.6;">
    Hola <strong>{{ $dentist->name }}</strong>, usá este código para ingresar a tu portal:
  </p>

  <p style="text-align:center;margin:0 0 28px;">
    <span style="display:inline-block;background:#f0f5f8;color:#397B9C;letter-spacing:8px;font-size:34px;font-weight:800;padding:16px 28px;border-radius:12px;">
      {{ $code }}
    </span>
  </p>

  <p style="margin:0 0 12px;font-size:13px;color:#888;text-align:center;">
    Este código vence en 10 minutos y solo se puede usar una vez.
  </p>

  <p style="margin:0;font-size:13px;color:#999;text-align:center;border-top:1px solid #eee;padding-top:16px;">
    Si no solicitaste este código, ignorá este email.
  </p>
@endsection
