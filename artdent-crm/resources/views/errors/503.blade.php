<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="30" />
    <title>ArtDent CRM — Mantenimiento</title>
    <style>
        * { box-sizing: border-box; }
        html, body {
            height: 100%;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        body {
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(180deg, #0e1a24 0%, #111f2c 100%);
            color: #e6eef2;
            text-align: center;
            padding: 24px;
        }
        .card {
            max-width: 420px;
        }
        .logo {
            height: 56px;
            width: auto;
            margin-bottom: 28px;
        }
        h1 {
            font-size: 22px;
            font-weight: 800;
            margin: 0 0 10px;
            letter-spacing: -0.3px;
        }
        p {
            font-size: 15px;
            line-height: 1.5;
            color: #9fb2bd;
            margin: 0 0 22px;
        }
        .dots {
            display: inline-flex;
            gap: 6px;
        }
        .dots span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: linear-gradient(90deg, #397B9C, #5AAD9C);
            animation: pulse 1.2s ease-in-out infinite;
        }
        .dots span:nth-child(2) { animation-delay: .2s; }
        .dots span:nth-child(3) { animation-delay: .4s; }
        @keyframes pulse {
            0%, 80%, 100% { opacity: .25; transform: scale(0.85); }
            40% { opacity: 1; transform: scale(1); }
        }
    </style>
</head>
<body>
    <div class="card">
        <img class="logo" src="/brand/logo-artdent-blanco.png" alt="ArtDent" />
        <h1>Estamos actualizando el sistema</h1>
        <p>Volvemos enseguida. Esta página se va a actualizar sola en unos segundos.</p>
        <div class="dots"><span></span><span></span><span></span></div>
    </div>
</body>
</html>
