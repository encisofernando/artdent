@php
  // Emails enviados en nombre de un tenant (venta, pedido, portal, etc.) reciben
  // $company y muestran su propio logo/nombre. Emails de la plataforma (soporte,
  // tickets) no pasan $company y caen al branding de ArtCode.
  $company ??= null;
  $brandName = $company?->fantasy_name ?: $company?->name ?: config('mail.from.name', 'ArtCode');
  $brandLogo = $company?->logo_url
      ? config('app.url').$company->logo_url
      : config('app.url').'/brand/artcode-horizontal-white.png';
@endphp
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>@yield('title', $brandName)</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:Arial,Helvetica,sans-serif;color:#333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px;">

          {{-- Header --}}
          <tr>
            <td style="background:#397B9C;border-radius:12px 12px 0 0;padding:24px 32px;text-align:center;">
              <img
                src="{{ $brandLogo }}"
                alt="{{ $brandName }}"
                width="160"
                style="display:block;margin:0 auto;max-width:160px;height:auto;"
              />
            </td>
          </tr>

          {{-- Body --}}
          <tr>
            <td style="background:#fff;padding:36px 32px;">
              @yield('content')
            </td>
          </tr>

          {{-- Footer --}}
          <tr>
            <td style="background:#f0f5f8;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#888;">© {{ date('Y') }} {{ $brandName }} · Todos los derechos reservados</p>
              <p style="margin:6px 0 0;font-size:12px;color:#aaa;">Este email fue enviado automáticamente. Por favor no respondas a este mensaje.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
