@echo off
REM Setup script for Windows - installs Node.js, FFmpeg, and yt-dlp
REM Run as Administrator

echo.
echo ======================================
echo Discord Music Bot - Windows Setup
echo ======================================
echo.

REM Check if running as admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Este script debe ejecutarse como Administrador
    echo Haz clic derecho en setup.bat y selecciona "Ejecutar como administrador"
    pause
    exit /b 1
)

REM Check if Node.js is installed
echo Verificando Node.js...
where node >nul 2>&1
if %errorLevel% equ 0 (
    echo ✓ Node.js ya está instalado
    node --version
) else (
    echo ✗ Node.js no encontrado. Descargando...
    echo Ve a: https://nodejs.org/
    echo Descarga la versión LTS e instala manualmente
    pause
    exit /b 1
)

REM Check if FFmpeg is installed
echo.
echo Verificando FFmpeg...
where ffmpeg >nul 2>&1
if %errorLevel% equ 0 (
    echo ✓ FFmpeg ya está instalado
    ffmpeg -version | findstr "ffmpeg version"
) else (
    echo ✗ FFmpeg no encontrado
    echo.
    echo Instalando FFmpeg...
    REM Try with chocolatey
    where choco >nul 2>&1
    if %errorLevel% equ 0 (
        echo Usando Chocolatey...
        choco install ffmpeg -y
    ) else (
        echo Descargando ffmpeg manualmente...
        echo Ve a: https://ffmpeg.org/download.html
        echo Extrae el ZIP a C:\ffmpeg
        echo Añade C:\ffmpeg\bin a PATH
        pause
    )
)

REM Check if yt-dlp is installed
echo.
echo Verificando yt-dlp...
where yt-dlp >nul 2>&1
if %errorLevel% equ 0 (
    echo ✓ yt-dlp ya está instalado
    yt-dlp --version
) else (
    echo ✗ yt-dlp no encontrado
    echo.
    echo Instalando yt-dlp con pip...
    pip install yt-dlp
    if %errorLevel% neq 0 (
        echo.
        echo ERROR: No se pudo instalar yt-dlp con pip
        echo Ve a: https://github.com/yt-dlp/yt-dlp/releases
        echo Descarga el ejecutable standalone y añádelo a PATH
        pause
        exit /b 1
    )
)

echo.
echo ======================================
echo ✓ Setup completado exitosamente
echo ======================================
echo.
echo Próximos pasos:
echo 1. Crea un archivo .env en la carpeta del proyecto con tu token
echo 2. Abre cmd en la carpeta del proyecto
echo 3. Ejecuta: npm install
echo 4. Ejecuta: npm run build
echo 5. Ejecuta run.bat
echo.
pause
