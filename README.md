# ArtistApp

Red social y tienda para artistas independientes: compartir obras, descubrir perfiles, organizar eventos y vender piezas físicas o digitales.

## Stack actual

- **Frontend:** Angular 22 en `frontend/`, componentes standalone, rutas con carga diferida y proxy de desarrollo para `/api` y `/storage`.
- **Backend:** Laravel 13 en `backend/`, API JSON, autenticación Sanctum y compatibilidad de inicio de sesión con contraseñas MD5 antiguas (se convierten a hash seguro al entrar).
- **Datos:** MySQL con el esquema histórico de `BaseDeDatos/vrb_artistapp.sql`. La migración de Laravel crea las tablas que falten sin reemplazar ni borrar las existentes.
- **Archivos:** imágenes públicas en el frontend y archivos digitales privados en `backend/storage/app/private/archivos`.

La aplicación activa está formada por `frontend/` (Angular) y `backend/` (Laravel). Se conservan `BaseDeDatos/` para importar el esquema y los recursos multimedia heredados que la aplicación sigue mostrando.

En el volcado actual, `tipo_usuario` asigna **1 administrador, 3 organizador, 5 artista y 7 visitante**. Las publicaciones no tienen una tabla `tipo_publicaciones`: su campo `publicaciones.tipo` guarda `public` o `private`; la tienda sí usa `tipo_producto` (1 físico, 2 digital). La aplicación y los formularios usan esas columnas y valores existentes.

## Requisitos

- Node.js 24.15+ y npm.
- PHP 8.3+ con extensiones PDO MySQL, Mbstring, OpenSSL, Fileinfo, Tokenizer, XML y Ctype.
- Composer 2 y MySQL 8 (o MariaDB compatible).

## Inicialización

### 1. Base de datos y API Laravel

Desde PowerShell:

```powershell
cd .\backend
Copy-Item .env.example .env
composer install
```

Edita `backend/.env` para indicar el host, base de datos y credenciales MySQL. Para conservar los datos actuales, crea `vrb_artistapp` e importa `BaseDeDatos/vrb_artistapp.sql`; no ejecutes `migrate:fresh`.

La copia de `.env` se hace directamente desde PowerShell (`Copy-Item .env.example .env`), sin anteponer `php.exe`. Si partes de una base vacía y quieres crear el acceso de administración, rellena `ADMIN_NAME`, `ADMIN_USERNAME`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` en `backend/.env` antes de ejecutar el seeder. Para una base importada, el usuario administrador existente conserva su rol.

```powershell
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

La migración detecta las tablas históricas y las deja intactas, y crea las tablas de Sanctum y recuperación de contraseñas si faltan. En una base nueva, crea primero `vrb_artistapp` vacía y usa los mismos comandos. El correo de recuperación se escribe en `backend/storage/logs/laravel.log` por defecto; configura SMTP en `.env` para enviarlo realmente.

### 2. Frontend Angular

En otra terminal:

```powershell
cd .\frontend
npm install
npm start
```

Abre **http://localhost:4200**. El servidor Angular reenvía API y almacenamiento a Laravel en `127.0.0.1:8000`, por lo que el desarrollo no necesita relajar CORS. Si cambias puertos/orígenes, actualiza `frontend/proxy.conf.json` y `backend/.env` (`FRONTEND_URL`).

Para generar los archivos de publicación:

```powershell
npm run build
```

## Áreas migradas

- Inicio de sesión, registro y recuperación de contraseña.
- Descubrimiento público de obras, artistas, eventos y avisos; likes, favoritos y solicitudes de participación autenticadas.
- Catálogo público y gestión de productos; cesta, checkout, pedidos y descarga privada de productos digitales ya comprados.
- Perfil, publicaciones, avisos, eventos y participantes.
- Panel de administración: cuentas, obras, productos, eventos, avisos, categorías, pedidos e informes.

Los avisos se consultan dentro de ArtistApp desde el menú superior. Se generan al crear la cuenta, al recibir novedades de artistas seguidos y cuando hay actividad relevante sobre informes o mensajes. Las tablas para avisos internos, comentarios y chats se crean con migraciones de Laravel; ejecuta `php artisan migrate` desde `backend/` después de actualizar.

## Solución de problemas

- **Error CORS:** arranca Angular con `npm start` y Laravel en el puerto 8000; no abras HTML con `file://` ni uses Live Server. La configuración local permite `localhost:4200` y `127.0.0.1:4200`. Si cambias el origen, actualiza `FRONTEND_URL` y ejecuta `php artisan config:clear` desde `backend/`.
- **No aparece Administración:** cierra sesión y vuelve a entrar para refrescar el rol guardado en el navegador. La cuenta debe tener `id_tipo=1`; en una base vacía, configura las variables `ADMIN_*` antes de ejecutar `php artisan migrate --seed`.
- **Error de conexión MySQL:** verifica que MySQL esté activo y que `backend/.env` tenga los datos correctos.
- **Imágenes/archivos no encontrados:** las imágenes heredadas deben existir bajo `frontend/public/`; las nuevas cargas públicas se sirven con `php artisan storage:link`. Los digitales se sirven solo tras validar la compra.
- **Recuperación no llega al correo:** en local se registra en `backend/storage/logs/laravel.log`; configura `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` y `MAIL_FROM_ADDRESS`.

Proyecto final de ciclo de Desarrollo de Aplicaciones Web, creado por Vanesa Ribera Bautista.

