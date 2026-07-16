<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/svg+xml" href="{{ asset('assets/artcode-icon-color.svg') }}">
    <title>Ingresar — Portal del Odontólogo</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --blue: #397B9C; --teal: #49949C; --green: #5AAD9C; --bg: #f0f4f8; --card: #fff; --border: #e2e8f0; --text: #1e293b; --muted: #64748b; --red: #E63946; }
        body {
            font-family: 'Inter', sans-serif; background: linear-gradient(135deg, var(--blue) 0%, var(--teal) 55%, var(--green) 100%);
            min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px;
        }
        .card { background: var(--card); border-radius: 20px; padding: 36px 32px; width: 100%; max-width: 380px; box-shadow: 0 20px 50px rgba(0,0,0,.2); }
        .logo { display: flex; justify-content: center; margin-bottom: 20px; }
        .logo img { height: 32px; }
        h1 { font-size: 18px; font-weight: 800; color: var(--text); text-align: center; margin-bottom: 4px; }
        p.subtitle { font-size: 13px; color: var(--muted); text-align: center; margin-bottom: 24px; }
        label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); margin-bottom: 6px; }
        input[type=email] {
            width: 100%; padding: 12px 14px; border-radius: 12px; border: 1.5px solid var(--border);
            font-size: 14px; color: var(--text); margin-bottom: 16px;
        }
        input[type=email]:focus { outline: none; border-color: var(--teal); }
        button {
            width: 100%; background: linear-gradient(90deg, var(--blue), var(--teal)); color: #fff; border: none;
            border-radius: 12px; padding: 13px; font-size: 14px; font-weight: 700; cursor: pointer;
        }
        .error { background: #fee2e2; color: #991b1b; border-radius: 10px; padding: 10px 14px; font-size: 12.5px; margin-bottom: 16px; }
        .success { background: #d1fae5; color: #065f46; border-radius: 10px; padding: 10px 14px; font-size: 12.5px; margin-bottom: 16px; }
        .footer { text-align: center; margin-top: 20px; font-size: 11.5px; color: var(--muted); }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo"><img src="{{ asset('assets/artcode-icon-color.svg') }}" alt="ArtCode"></div>
        <h1>Portal del Odontólogo</h1>
        <p class="subtitle">Ingresá tu email y te mandamos un código de acceso.</p>

        @if(session('success'))
            <div class="success">{{ session('success') }}</div>
        @endif
        @if($errors->any())
            <div class="error">{{ $errors->first() }}</div>
        @endif

        <form method="POST" action="{{ route('dentist-portal.login.send') }}">
            @csrf
            <label for="email">Correo electrónico</label>
            <input type="email" id="email" name="email" value="{{ request()->query('email') }}" placeholder="tu@email.com" required autofocus>
            <button type="submit">Enviar código</button>
        </form>

        <div class="footer">ArtCode · Acceso exclusivo para odontólogos</div>
    </div>
</body>
</html>
