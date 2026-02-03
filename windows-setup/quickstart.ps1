# Discord Music Bot - Windows Quick Start (PowerShell)
# Ejecuta: powershell -ExecutionPolicy Bypass -File quickstart.ps1

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "Discord Music Bot - Windows Quick Start" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Check admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "ERROR: Este script debe ejecutarse como Administrador" -ForegroundColor Red
    Write-Host "Haz clic derecho en PowerShell y selecciona 'Ejecutar como administrador'" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Check Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Cyan
$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
    Write-Host "✓ Node.js encontrado" -ForegroundColor Green
    & node --version
} else {
    Write-Host "✗ Node.js no encontrado" -ForegroundColor Red
    Write-Host "Descargalo de https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Check FFmpeg
Write-Host ""
Write-Host "Verificando FFmpeg..." -ForegroundColor Cyan
$ffmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
if ($ffmpeg) {
    Write-Host "✓ FFmpeg encontrado" -ForegroundColor Green
} else {
    Write-Host "✗ FFmpeg no encontrado" -ForegroundColor Red
    Write-Host "Descargalo de https://ffmpeg.org/download.html" -ForegroundColor Yellow
}

# Check yt-dlp
Write-Host ""
Write-Host "Verificando yt-dlp..." -ForegroundColor Cyan
$ytdlp = Get-Command yt-dlp -ErrorAction SilentlyContinue
if ($ytdlp) {
    Write-Host "✓ yt-dlp encontrado" -ForegroundColor Green
    & yt-dlp --version
} else {
    Write-Host "✗ yt-dlp no encontrado" -ForegroundColor Red
    Write-Host "Instalando con pip..." -ForegroundColor Yellow
    & pip install yt-dlp -q
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ yt-dlp instalado" -ForegroundColor Green
    } else {
        Write-Host "✗ No se pudo instalar yt-dlp" -ForegroundColor Red
        Write-Host "Descargalo de https://github.com/yt-dlp/yt-dlp/releases" -ForegroundColor Yellow
    }
}

# Check .env
Write-Host ""
Write-Host "Verificando configuración..." -ForegroundColor Cyan
if (Test-Path ".env") {
    Write-Host "✓ Archivo .env encontrado" -ForegroundColor Green
} else {
    Write-Host "✗ Archivo .env no encontrado" -ForegroundColor Red
    Write-Host "Copia .env.example a .env y llena tus credenciales" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "Instalando dependencias npm..." -ForegroundColor Cyan
& npm install --silent
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error instalando npm" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}
Write-Host "✓ Dependencias instaladas" -ForegroundColor Green

# Build
Write-Host ""
Write-Host "Compilando TypeScript..." -ForegroundColor Cyan
& npm run build --silent
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error compilando" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}
Write-Host "✓ Compilación exitosa" -ForegroundColor Green

# Start bot
Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "Iniciando el bot..." -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Presiona Ctrl+C para parar" -ForegroundColor Yellow
Write-Host ""

& node dist/index.js

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "✗ El bot se detuvo inesperadamente" -ForegroundColor Red
    Write-Host "Revisa los logs en logs/error.log" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
}
