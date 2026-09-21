# VíaSur

PWA / Mobile-First — directorio de servicios locales del sur de Costa Rica (Río Claro, Golfito, Ciudad Neily, Paso Canoas).

## Stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [TailwindCSS](https://tailwindcss.com/)
- [Neon](https://neon.tech/) (Postgres serverless) vía `@neondatabase/serverless`
- [Resend](https://resend.com/) para el login por enlace mágico (sin contraseña)
- [Cloudflare R2](https://developers.cloudflare.com/r2/) (S3-compatible) para las fotos de los servicios

## Funcionalidad

- **Home**: listado de servicios por localidad, filtro por categoría, buscador con panel embebido (historial de búsquedas recientes + resultados), sección de destacados siempre visible.
- **Detalle de servicio**: fotos, dirección, cobertura, contacto, horario de atención (por días + apertura/cierre), botones de WhatsApp y llamada.
- **Favoritos**: anónimos, guardados en `localStorage`.
- **Login**: enlace mágico por email (sin contraseña), vía Resend.
- **Mis Servicios**: alta/edición del propio negocio, carga de fotos, estadísticas de visitas/contactos/llamadas.

## Arquitectura

Las localidades no son un ENUM fijo: viven en su propia tabla (`localidades`), lo que permite agregar, renombrar o desactivar localidades sin migraciones de esquema. `tipo_cobertura` y `categoria_servicio` sí son ENUMs de Postgres, reflejados a mano en `types/viasur.ts`.

El listado de servicios usa una semilla diaria determinística (`obtener_servicios_por_dia` en `init.sql` + `calcularSemillaDiaria` en el route handler) para mostrar un orden "aleatorio" que es estable durante todo el día pero cambia entre días. Los destacados siempre van primero.

```
init.sql                          # Esquema de base de datos (tablas, enums, RPC)
types/viasur.ts                   # Enums e interfaces del dominio
lib/db.ts                         # Cliente Neon (server-only, lazy singleton)
lib/auth.ts                       # Resolución de usuario desde la cookie de sesión
lib/favoritos.ts                  # Hook de favoritos anónimos (localStorage)
lib/busquedasRecientes.ts         # Hook de búsquedas recientes anónimas (localStorage)
app/
  page.tsx                        # Home: listado, categorías, buscador
  login/page.tsx                  # Login por enlace mágico
  mis-servicios/page.tsx          # Alta/edición del servicio propio
  favoritos/page.tsx              # Servicios marcados como favoritos
  servicio/[id]/page.tsx          # Detalle de un servicio
  api/
    localidades/route.ts          # GET localidades activas
    categorias/route.ts           # GET categorías activas
    servicios/route.ts            # GET (listado diario) / POST / PATCH / DELETE
    servicios/[id]/route.ts       # GET detalle de un servicio
    servicios/[id]/imagenes/      # Fotos del servicio (alta/baja)
    servicios/[id]/evento/        # Registro de eventos (visita/contacto/llamada)
    buscar/route.ts               # Búsqueda global por nombre (unaccent)
    upload/route.ts               # Subida de fotos a Cloudflare R2
    auth/                         # Enlace mágico, verificación, sesión
```

## Setup

```bash
npm install
cp .env.example .env.local   # completar las variables de entorno
```

Ejecutar `init.sql` contra la instancia de Neon (SQL Editor del dashboard o `psql "$DATABASE_URL" -f init.sql`) para crear el esquema inicial y las localidades/categorías semilla. Es seguro volver a correrlo: usa `if not exists` / `on conflict do nothing`.

```bash
npm run dev
```

No hay suite de tests configurada. Para verificar tipos sin levantar un build completo: `npx tsc --noEmit`.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Connection string pooled de Neon (incluye `sslmode=require`) |
| `RESEND_API_KEY` | API key de Resend, usada para enviar los enlaces mágicos de login |
| `RESEND_FROM_EMAIL` | Dirección remitente de los correos de enlace mágico |
| `R2_ACCOUNT_ID` | ID de cuenta de Cloudflare — arma el endpoint S3-compatible de R2 |
| `R2_ACCESS_KEY_ID` | Access key del token de API de R2 (Object Read & Write) |
| `R2_SECRET_ACCESS_KEY` | Secret key del token de API de R2 |
| `R2_BUCKET_NAME` | Bucket de R2 donde se guardan las fotos de los servicios |
| `R2_PUBLIC_URL` | URL pública base del bucket (subdominio r2.dev o dominio propio) |
