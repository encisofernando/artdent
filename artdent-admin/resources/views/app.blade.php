<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#0f2c3a">
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAuMCAzNDAuMCIgd2lkdGg9IjI0MC4wIiBoZWlnaHQ9IjM0MC4wIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLDApIj48Zz4KICA8cmVjdCB4PSIyNCIgeT0iMjIiIHdpZHRoPSIxOTIiIGhlaWdodD0iMjk2IiByeD0iOTYiIHJ5PSI5NiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzk3QjlDIiBzdHJva2Utd2lkdGg9IjI0Ii8+CiAgPHBvbHlsaW5lIHBvaW50cz0iMTA0LDEzNCA4MSwxNzEgMTA0LDIwOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTdCM0EzIiBzdHJva2Utd2lkdGg9IjIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICA8cG9seWxpbmUgcG9pbnRzPSIxMzYsMTM0IDE1OSwxNzEgMTM2LDIwOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTdCM0EzIiBzdHJva2Utd2lkdGg9IjIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICA8bGluZSB4MT0iMTMxIiB5MT0iMTI2IiB4Mj0iMTA5IiB5Mj0iMjE2IiBzdHJva2U9IiMzOTdCOUMiIHN0cm9rZS13aWR0aD0iMjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L2c+PC9nPjwvc3ZnPg==">

        <title inertia>{{ config('app.name', 'ArtCode Admin') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=montserrat:400,500,600,700,800,900|jetbrains-mono:400,500,600&display=swap" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
