# ARTDENT Storefront (Front e-commerce)

Frontend React + Vite + Tailwind, diseñado para integrarse con tu backend Laravel (Sanctum Bearer).

## Requisitos
- Node 18+
- Backend corriendo (ej: `http://127.0.0.1:8000`)

## Instalación
```bash
cp .env.example .env
npm install
npm run dev
```

## Conexión al backend
- Configurá `VITE_API_BASE_URL`.
- El front guarda el token en `localStorage` (`artdent_token`) y lo envía en `Authorization: Bearer ...`.

## Rutas
- `/iniciar-sesion`
- `/registrarme`
- `/productos` (protegida)
- `/productos/:id` (protegida)
- `/mi-cuenta` (protegida)

## Notas importantes sobre tu backend
- La ruta de forgot password parece estar mal definida y queda doble `auth` (ver `routes/api.php`).
- `categories/vendors/promotions` están como mocks (closures). Para e-commerce real hay que exponer modelos.
