# ArtDent CRM + POS + Laboratorio — Pack de migración (overlay)

Este ZIP NO es un proyecto Laravel completo. Es un **overlay** para copiar dentro de tu proyecto Laravel 12.

## 1) Copiar archivos
Copiar el contenido del ZIP en la raíz de tu Laravel, respetando rutas.

## 2) Dependencias (frontend)
```bash
npm i
npm i @inertiajs/react react react-dom
npm i -D tailwindcss postcss autoprefixer @vitejs/plugin-react
```

## 3) Dependencias (backend)
```bash
composer require inertiajs/inertia-laravel
php artisan inertia:middleware
```

## 4) Tailwind
Si tu proyecto no tiene Tailwind inicializado:
```bash
npx tailwindcss init -p
```

## 5) Inertia layout
Asegurate de tener el layout Blade de Inertia (por ejemplo resources/views/app.blade.php).
Si estás usando Breeze/Jetstream, ya viene resuelto.

## 6) Auth
Las rutas están protegidas con `auth`.
Si no tenés auth instalado, instalá Breeze:
```bash
composer require laravel/breeze --dev
php artisan breeze:install react
php artisan migrate
npm i && npm run build
```

Luego, reemplazá recursos `resources/js` por los del pack (o mergeá).

## 7) Probar
```bash
php artisan serve
npm run dev
```

## Nota
Las pantallas son **stubs** (estructura + UI base). La lógica de negocio (AFIP, stock real, jobs reales) se conecta en controllers/services.
