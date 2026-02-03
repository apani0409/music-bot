@echo off
REM Run script for Windows - starts the Discord Music Bot

echo.
echo ======================================
echo Discord Music Bot - Iniciando...
echo ======================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo ERROR: Archivo .env no encontrado
    echo Copia .env.example a .env y llena tus credenciales
    pause
    exit /b 1
)

REM Check if dist folder exists
if not exist "dist" (
    echo ERROR: Carpeta dist no encontrada
    echo Ejecuta primero: npm install && npm run build
    pause
    exit /b 1
)

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

REM Start the bot
echo Iniciando el bot...
echo.
echo Presiona Ctrl+C para parar el bot
echo.

node dist/index.js

if %errorLevel% neq 0 (
    echo.
    echo ERROR: El bot se detuvo inesperadamente
    echo Verifica los logs en logs/error.log
    pause
)
