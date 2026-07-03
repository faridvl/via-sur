# VíaSur

PWA / Mobile-First — directorio de servicios locales del sur de Costa Rica (Río Claro, Golfito, Ciudad Neily, Paso Canoas).

## Stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [TailwindCSS](https://tailwindcss.com/)
- [Neon](https://neon.tech/) (Postgres serverless) vía `@neondatabase/serverless`

## Arquitectura

Las localidades no son un ENUM fijo: viven en su propia tabla (`localidades`), lo que permite agregar, renombrar o desactivar localidades sin migraciones de esquema.

```
init.sql                      # Esquema de base de datos (tablas, enums, RPC)
types/viasur.ts                # Enums e interfaces del dominio
lib/db.ts                      # Cliente Neon (server-only, HTTP)
app/
  page.tsx                     # Landing
  registrar/page.tsx           # Formulario de registro de servicios
  api/
    localidades/route.ts       # GET localidades activas
    servicios/route.ts         # GET (listado diario por localidad) / POST (alta)
```

## Setup

```bash
npm install
cp .env.example .env.local   # completar DATABASE_URL
```

Ejecutar `init.sql` contra la instancia de Neon (SQL Editor del dashboard o `psql "$DATABASE_URL" -f init.sql`) para crear el esquema inicial y las localidades semilla.

```bash
npm run dev
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Connection string pooled de Neon (incluye `sslmode=require`) |
