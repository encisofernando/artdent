@echo off
tasklist /fi "ImageName eq ArtDentPrint.exe" /nh | find /i "ArtDentPrint.exe" > nul
if %errorlevel% equ 1 (
    echo Iniciando ArtDent Print Service...
    start "" "ArtDentPrint.exe"
) else (
    echo El servicio ya esta en ejecucion.
)