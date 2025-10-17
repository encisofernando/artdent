@php
  $blue  = $brand['blue']  ?? '#397B9C';
  $green = $brand['green'] ?? '#5AAD9C';
  $teal  = $brand['teal']  ?? '#49949C';
  $mint  = $brand['mint']  ?? '#ACD6CE';
@endphp
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>ARTDENT • Restablecer contraseña</title>
</head>
<body style="margin:0;padding:0;background:#F6F9FC;font-family:Montserrat, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F6F9FC;">
    <tr>
      <td align="center" style="padding:24px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid rgba(0,0,0,.06);">
          <tr>
            <td style="background: linear-gradient(135deg, {{ $blue }}, {{ $teal }}); padding:24px;" align="center">
              <img src="{{ $logo }}" alt="ARTDENT" style="max-height:56px; display:block; filter: drop-shadow(0 2px 4px rgba(0,0,0,.25));">
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px 28px;">
              <h1 style="margin:0 0 8px 0; font-size:22px; color:#1A202C;">Restablecé tu contraseña</h1>
              <p style="margin:0; font-size:14px; color:#4A5568;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta ({{ $email }}).
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 28px 24px 28px;">
              <p style="margin:0 0 18px 0; font-size:14px; color:#4A5568;">
                Hacé clic en el botón para crear una nueva contraseña. Por tu seguridad, este enlace puede caducar.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" bgcolor="{{ $blue }}" style="border-radius:30px;">
                    <a href="{{ $url }}" style="display:inline-block; padding:12px 22px; font-weight:700; text-decoration:none; color:#ffffff;">
                      Crear nueva contraseña
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:18px 0 0 0; font-size:12px; color:#718096;">
                Si no solicitaste este cambio, ignorá este mensaje. Tu contraseña actual seguirá siendo válida.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:{{ $mint }}33; padding:18px 28px;">
              <p style="margin:0; font-size:12px; color:#274F65;">
                © {{ date('Y') }} ARTDENT. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:14px 0 0 0; font-size:11px; color:#718096;">
          Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br>
          <a href="{{ $url }}" style="color:#397B9C; word-break:break-all;">{{ $url }}</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
