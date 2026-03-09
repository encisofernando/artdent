@echo off
TITLE Configurando Firewall - ArtDent Print Service

:: Verificar privilegios de administrador
net session >nul 2>&1
if %errorLevel% == 0 (
    goto :admin
) else (
    echo =====================================================
    echo ERROR: Se requieren permisos de Administrador.
    echo Intentando elevar privilegios...
    echo =====================================================
    powershell -Command "Start-Process '%0' -Verb RunAs"
    exit /b
)

:admin
echo Configurando regla de entrada para el puerto 1234...
echo.

:: Comando para abrir el puerto TCP 1234
netsh advfirewall firewall add rule name="ArtDent Print Service" dir=in action=allow protocol=TCP localport=1234

echo.
echo =====================================================
echo REGLA APLICADA CORRECTAMENTE
echo El puerto 1234 ya esta abierto para impresion local.
echo =====================================================
pause
exit