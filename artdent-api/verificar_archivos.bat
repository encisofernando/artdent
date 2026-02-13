@echo off
REM Script verificador - Revisa qué archivos faltan
echo ================================================
echo   VERIFICADOR DE ARCHIVOS - RoleMiddleware
echo ================================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "app\Http\Kernel.php" (
    echo [X] ERROR: No estás en la raíz de artdent-api
    echo     Debes ejecutar este script desde: C:\Users\Usuario\Documents\SOFTWARE\artdent\artdent-api
    pause
    exit /b 1
)

echo [✓] Directorio correcto detectado
echo.
echo Verificando archivos necesarios...
echo.

REM Verificar cada archivo
set TODOS_OK=1

if exist "app\Http\Middleware\RoleMiddleware.php" (
    echo [✓] RoleMiddleware.php - OK
) else (
    echo [X] RoleMiddleware.php - FALTA
    set TODOS_OK=0
)

if exist "app\Traits\HasRoles.php" (
    echo [✓] HasRoles.php - OK
) else (
    echo [X] HasRoles.php - FALTA
    set TODOS_OK=0
)

if exist "app\Models\Role.php" (
    echo [✓] Role.php - OK
) else (
    echo [X] Role.php - FALTA
    set TODOS_OK=0
)

echo.
echo Verificando User.php...
findstr /C:"use App\Traits\HasRoles" app\Models\User.php >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [✓] User.php contiene "use App\Traits\HasRoles"
) else (
    echo [X] User.php NO tiene "use App\Traits\HasRoles"
    set TODOS_OK=0
)

findstr /C:"use HasApiTokens, Notifiable, HasRoles" app\Models\User.php >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [✓] User.php usa el trait HasRoles
) else (
    echo [X] User.php NO usa el trait HasRoles
    set TODOS_OK=0
)

echo.
echo ================================================

if %TODOS_OK% EQU 1 (
    echo.
    echo [✓✓✓] TODOS LOS ARCHIVOS ESTÁN CORRECTOS
    echo.
    echo Ahora ejecuta:
    echo   1. php artisan optimize:clear
    echo   2. Reinicia el servidor ^(Ctrl+C y php artisan serve^)
    echo.
) else (
    echo.
    echo [!!!] FALTAN ARCHIVOS O CONFIGURACIONES
    echo.
    echo Por favor, revisa los archivos marcados con [X]
    echo y sigue las instrucciones de GUIA_RAPIDA.md
    echo.
)

pause
