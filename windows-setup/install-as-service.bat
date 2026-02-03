@echo off
REM Install as Windows Service - requires NSSM

echo.
echo ======================================
echo Discord Music Bot - Instalar como Servicio
echo ======================================
echo.

REM Check if running as admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Este script debe ejecutarse como Administrador
    echo Haz clic derecho y selecciona "Ejecutar como administrador"
    pause
    exit /b 1
)

REM Get the current directory (project root)
setlocal enabledelayedexpansion
set "PROJECT_DIR=%cd%"

REM Check if NSSM is available
where nssm >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: NSSM no está instalado
    echo.
    echo Para instalar como servicio, necesitas NSSM:
    echo 1. Ve a: https://nssm.cc/download
    echo 2. Descarga nssm-2.24-101-g897c7ad.zip (o más nuevo)
    echo 3. Extrae nssm.exe a C:\nssm
    echo 4. Añade C:\nssm a PATH (o copia nssm.exe a C:\Windows\System32)
    echo 5. Vuelve a ejecutar este script
    pause
    exit /b 1
)

REM Check if .env exists
if not exist ".env" (
    echo ERROR: Archivo .env no encontrado
    echo Crea .env con tus credenciales antes de instalar el servicio
    pause
    exit /b 1
)

REM Create the service
echo Creando servicio "DiscordMusicBot"...
nssm install DiscordMusicBot node.exe !PROJECT_DIR!\dist\index.js

if %errorLevel% neq 0 (
    echo ERROR: No se pudo crear el servicio
    pause
    exit /b 1
)

REM Set working directory
nssm set DiscordMusicBot AppDirectory !PROJECT_DIR!

REM Set environment for the service
nssm set DiscordMusicBot AppEnvironmentExtra NODE_ENV=production

REM Set log files
nssm set DiscordMusicBot AppStdout !PROJECT_DIR!\logs\out.log
nssm set DiscordMusicBot AppStderr !PROJECT_DIR!\logs\error.log

REM Set restart on failure
nssm set DiscordMusicBot AppRestartDelay 4000

REM Start the service
echo.
echo Iniciando servicio...
net start DiscordMusicBot

if %errorLevel% equ 0 (
    echo.
    echo ======================================
    echo ✓ Servicio instalado y iniciado correctamente
    echo ======================================
    echo.
    echo El bot ahora se ejecutará automáticamente al arrancar Windows
    echo.
    echo Comandos útiles:
    echo   Ver estado: sc query DiscordMusicBot
    echo   Parar: net stop DiscordMusicBot
    echo   Iniciar: net start DiscordMusicBot
    echo   Desinstalar: nssm remove DiscordMusicBot confirm
    echo.
) else (
    echo ERROR: No se pudo iniciar el servicio
    echo Desinstalando...
    nssm remove DiscordMusicBot confirm
    pause
    exit /b 1
)

pause
