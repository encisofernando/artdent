<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer contraseña · ArtCode</title>
</head>
<body style="margin:0;padding:0;background:#E6F5F2;font-family:'Montserrat',Helvetica,Arial,sans-serif;color:#0F2C3A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#E6F5F2;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;">

          {{-- Header --}}
          <tr>
            <td style="background:#0F2C3A;border-radius:16px 16px 0 0;padding:32px;text-align:center;">
              <img
                src="{{ config('app.url') }}/brand/artcode-horizontal-white.png"
                alt="ArtCode"
                width="150"
                style="display:block;margin:0 auto;max-width:150px;height:auto;"
              />
            </td>
          </tr>

          {{-- Body --}}
          <tr>
            <td style="background:#ffffff;padding:40px 36px;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#17B3A3;">
                Seguridad de tu cuenta
              </p>
              <h1 style="margin:0 0 20px;font-size:22px;color:#0F2C3A;">
                Restablecer tu contraseña
              </h1>

              <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#334155;">
                Hola @if($name) <strong>{{ $name }}</strong> @endif,
              </p>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.65;color:#334155;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>ArtCode</strong>
                ({{ $email }}). Hacé clic en el botón de abajo para elegir una nueva contraseña.
                Este enlace es válido por <strong>{{ $expireMinutes }} minutos</strong>.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:0 0 28px;">
                    <a href="{{ $resetUrl }}"
                       style="display:inline-block;background:#17B3A3;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:700;">
                      Restablecer contraseña
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-align:center;">
                Si el botón no funciona, copiá y pegá este enlace en tu navegador:
              </p>
              <p style="margin:0 0 28px;font-size:12px;color:#94a3b8;text-align:center;word-break:break-all;">
                <a href="{{ $resetUrl }}" style="color:#397B9C;">{{ $resetUrl }}</a>
              </p>

              <div style="background:#E6F5F2;border-radius:10px;padding:16px 20px;margin:0 0 4px;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:#0F2C3A;">
                  <strong>¿No pediste este cambio?</strong> Podés ignorar este correo con tranquilidad —
                  tu contraseña actual sigue funcionando y no se realizó ningún cambio en tu cuenta.
                </p>
              </div>
            </td>
          </tr>

          {{-- Footer --}}
          <tr>
            <td style="background:#0F2C3A;border-radius:0 0 16px 16px;padding:24px 32px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#ACD6CE;">
                © {{ date('Y') }} ArtCode · Software para laboratorios y clínicas
              </p>
              <p style="margin:0;font-size:12px;color:#5AAD9C;">
                ¿Necesitás ayuda? Escribinos a
                <a href="mailto:soporte@artcode.com.ar" style="color:#5AAD9C;">soporte@artcode.com.ar</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
