# Discord Music Bot - Windows Setup

Esta carpeta contiene todo lo necesario para ejecutar el bot en Windows.

## Requisitos Previos

- **Windows 10/11**
- **Acceso a Internet**
- **Permisos de administrador** (para instalar software)

## Paso 1: Instalar Dependencias Globales

### Opción A: Automático (recomendado)
Haz doble clic en `setup.bat` — instalará automáticamente:
- Node.js
- FFmpeg
- yt-dlp

### Opción B: Manual
Si prefieres hacerlo a mano:

**Node.js:**
1. Descarga desde https://nodejs.org/ (LTS version)
2. Instala con los valores por defecto
3. Verifica: abre cmd y escribe `node --version`

**FFmpeg:**
1. Descarga desde https://ffmpeg.org/download.html
2. Extrae el ZIP a `C:\ffmpeg`
3. Añade a PATH:
   - Presiona `Win + X` → "Sistema"
   - Variables de entorno → Variable de entorno PATH
   - Añade `C:\ffmpeg\bin`

**yt-dlp:**
1. Abre PowerShell como admin
2. Ejecuta: `pip install yt-dlp` (o descarga desde https://github.com/yt-dlp/yt-dlp/releases)
3. Verifica: `yt-dlp --version`

## Paso 2: Clonar/Copiar el Proyecto

El proyecto debe estar en:
```
C:\Users\[TU_USUARIO]\music-bot
```
o donde prefieras. **Anota la ruta** — la necesitarás después.

## Paso 3: Configurar Variables de Entorno

1. Ve a la carpeta del proyecto en Windows
2. Crea un archivo `.env` (texto plano, sin extensión)
3. Copia esto y **reemplaza los valores**:

```
DISCORD_TOKEN=tu_token_aqui
DISCORD_CLIENT_ID=tu_client_id_aqui
```

Cómo obtener token y client ID:
- Ve a https://discord.com/developers/applications
- Crea o selecciona tu aplicación
- "Bot" → "Add Bot" → copia el token
- General info → copia el Application ID

## Paso 4: Instalar Dependencias del Proyecto

1. Abre cmd o PowerShell en la carpeta del proyecto
2. Ejecuta:
```bash
npm install
npm run build
```

## Paso 5: Ejecutar el Bot

### Opción Simple (ejecutable una sola vez)
Haz doble clic en `run.bat`

El bot debería arrancar y mostrar:
```
✅ Loaded command: play
✅ Loaded command: pause
[INFO] Bot is ready! Logged in as musik#XXXX
```

### Opción Avanzada (ejecutar como servicio Windows permanente)

Si quieres que el bot se inicie automáticamente al arrancar Windows:

1. Haz doble clic en `install-as-service.bat` (como administrador)
2. El bot se ejecutará automáticamente al arrancar
3. Para parar: abre Servicios (Services) y busca "DiscordMusicBot"

**Comandos útiles:**
```bash
# Ver estado del servicio
sc query DiscordMusicBot

# Parar el servicio
net stop DiscordMusicBot

# Iniciar el servicio
net start DiscordMusicBot

# Desinstalar el servicio
nssm remove DiscordMusicBot confirm
```

## Solución de Problemas

### "ffmpeg is not recognized"
- FFmpeg no está en PATH
- Solución: reinstala FFmpeg e añade `C:\ffmpeg\bin` a PATH
- Verifica: abre cmd nuevo y escribe `ffmpeg -version`

### "yt-dlp is not recognized"
- yt-dlp no está en PATH
- Solución: instala con `pip install yt-dlp` o descarga binario standalone
- Verifica: `yt-dlp --version`

### "Cannot find module 'discord.js'"
- Las dependencias npm no están instaladas
- Solución: en la carpeta del proyecto, ejecuta `npm install`

### El bot no responde en Discord
- Verifica que el token sea correcto en `.env`
- Verifica que el bot tenga permisos en el servidor Discord
- Revisa los logs en `logs/out.log`

### "Port already in use" o "Already running"
- El bot ya está corriendo en otra instancia
- Solución: abre Task Manager → busca "node" → termina el proceso
- O usa: `taskkill /F /IM node.exe`

## Logs y Debugging

Los logs se guardan en:
```
logs/out.log      (salida normal)
logs/error.log    (errores)
```

Abre estos archivos con Bloc de Notas para ver qué está pasando.

## Actualizar el Bot

Si hay cambios en el código:
```bash
git pull
npm install
npm run build
# Luego reinicia con run.bat
```

## Soporte

Si algo no funciona:
1. Verifica los logs en `logs/error.log`
2. Confirma que Node.js, FFmpeg y yt-dlp están en PATH
3. Intenta reinstalar dependencias: `npm install`
4. Reinicia Windows y vuelve a intentar
