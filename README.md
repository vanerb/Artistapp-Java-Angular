# ArtistApp

> **Una comunidad para compartir arte, descubrir talento independiente y encontrarse alrededor de la creatividad.**

ArtistApp es una plataforma web que reúne una red social para artistas, una agenda de eventos y una tienda de piezas físicas y digitales. El proyecto transforma una aplicación heredada en una arquitectura separada de frontend y API, conservando la base de datos existente.

## El proyecto

ArtistApp conecta a artistas, organizadores y amantes del arte en un mismo espacio. Cada perfil puede mostrar obra, avisos y actividad; la comunidad permite descubrir creadores, conversar y participar en eventos. Quienes venden pueden gestionar sus productos y pedidos desde el mismo entorno.

### Funcionalidades

- **Descubrir:** explorar obras, artistas, eventos y avisos con búsqueda, filtros y paginación.
- **Perfiles y comunidad:** perfiles públicos, biografías, seguidores y seguidos, favoritos y likes persistentes.
- **Publicaciones:** compartir y gestionar obras, controlar su visibilidad y conversar mediante comentarios.
- **Eventos:** crear y editar encuentros, gestionar solicitudes de participación y abrir un chat para asistentes aceptados.
- **Mensajería:** conversaciones directas con artistas y chats grupales de eventos en una bandeja unificada.
- **Tienda:** catálogo de productos físicos y digitales, cesta, checkout, pedidos y descargas digitales protegidas.
- **Avisos internos:** centro de notificaciones para actividad de la comunidad y comunicaciones importantes de administración.
- **Administración:** panel protegido para gestionar cuentas, obras, tienda, eventos, avisos, categorías, pedidos e informes.
- **Cuenta:** registro, acceso, recuperación y cambio de contraseña; las cuentas antiguas pueden iniciar sesión y migrar su contraseña a hash seguro.

### Permisos por tipo de cuenta

| Cuenta | Capacidades principales |
| --- | --- |
| Administrador | Acceso al panel y gestión de recursos de la plataforma. |
| Artista | Publicar obras, gestionar su perfil y vender productos. |
| Organizador de eventos | Crear eventos y gestionar productos de tienda. |
| Amante del arte | Descubrir, seguir perfiles, dar likes, comprar y participar en eventos. |

Los identificadores de tipo de cuenta se conservan del esquema histórico: `1` administrador, `3` organizador, `5` artista y `7` visitante/amante del arte.

## Tecnologías

- **Frontend:** Angular 22, componentes standalone, signals, rutas con carga diferida, signals y formularios de Angular.
- **Backend:** Laravel 13, API REST en JSON y autenticación con Laravel Sanctum.
- **Persistencia:** MySQL o MariaDB compatible con el esquema histórico de ArtistApp.
- **Archivos:** recursos estáticos en `frontend/public`, cargas públicas en el almacenamiento de Laravel y descargas digitales en almacenamiento privado.

## Arquitectura

```text
Navegador
   │
   ▼
Angular · localhost:4200
   │  proxy /api y /storage
   ▼
Laravel · localhost:8000
   │
   ├── MySQL · vrb_artistapp
   ├── storage público · imágenes nuevas
   └── storage privado · descargas compradas
```

El desarrollo local usa el proxy de Angular para enviar `/api` y `/storage` a Laravel, sin abrir el frontend mediante `file://` ni depender de CORS permisivo. Las migraciones complementan las tablas que faltan y mantienen intactas las tablas históricas. El SQL de referencia está en `BaseDeDatos/vrb_artistapp.sql`.

## Puesta en marcha local

### Requisitos

- Node.js 24.15 o superior y npm.
- PHP 8.3 o superior con PDO MySQL, Mbstring, OpenSSL, Fileinfo, Tokenizer, XML y Ctype.
- Composer 2.
- MySQL 8 o MariaDB compatible.

### 1. Preparar Laravel

En PowerShell, desde la raíz del proyecto:

```powershell
cd .\backend
Copy-Item .env.example .env
composer install
```

Configura en `backend/.env` la conexión a MySQL. Para conservar la base de datos anterior, crea o selecciona `vrb_artistapp` e importa `BaseDeDatos/vrb_artistapp.sql`. **No ejecutes `migrate:fresh`** si quieres preservar sus datos.

Para una instalación vacía con administrador inicial, configura `ADMIN_NAME`, `ADMIN_USERNAME`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` en `.env`. Después ejecuta:

```powershell
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

Si PowerShell no encuentra `php` o `composer`, instala esas herramientas o añade sus directorios al `PATH` (por ejemplo, desde Laragon).

### 2. Preparar Angular

En otra terminal, desde la raíz:

```powershell
cd .\frontend
npm install
npm start
```

Abre [http://localhost:4200](http://localhost:4200). Laravel debe seguir activo en `http://127.0.0.1:8000`.

Para generar la compilación de producción:

```powershell
npm run build
```

### Correo de recuperación

Por defecto, Laravel registra los correos en `backend/storage/logs/laravel.log`. Configura SMTP en `.env` para enviarlos realmente.

## Estructura del repositorio

```text
frontend/                 Aplicación Angular
  public/                 Recursos estáticos y multimedia
  src/app/                Páginas, componentes y servicios
backend/                  API Laravel
  app/Http/Controllers/   Controladores REST
  database/migrations/     Esquema y funciones de comunidad
BaseDeDatos/              Volcado SQL histórico para importar
archivos/                 Archivos digitales históricos de referencia
```

## Estado técnico

La aplicación Angular compila con `npm run build`. La API expone rutas para autenticación, perfiles, comunidad, publicaciones, eventos, tienda, pedidos, avisos, informes y administración. La verificación funcional completa requiere configurar MySQL y probar con una base de datos local.

## Autora

**Vanesa Ribera Bautista** · Proyecto final de ciclo de Desarrollo de Aplicaciones Web.

