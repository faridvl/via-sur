# VíaSur

PWA / Mobile-First — directorio de servicios locales del sur de Costa Rica (Río Claro, Golfito, Ciudad Neily, Paso Canoas).

## Stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [TailwindCSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (Postgres + RPC)

## Arquitectura

Las localidades no son un ENUM fijo: viven en su propia tabla (`localidades`), lo que permite agregar, renombrar o desactivar localidades sin migraciones de esquema.

```
init.sql                      # Esquema de base de datos (tablas, enums, RPC)
types/viasur.ts                # Enums e interfaces del dominio
lib/supabase/server.ts         # Cliente Supabase (server-only, service role)
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
cp .env.example .env.local   # completar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
```

Ejecutar `init.sql` contra la instancia de Supabase (SQL Editor o `psql`) para crear el esquema inicial y las localidades semilla.

```bash
npm run dev
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `SUPABASE_URL` | URL del proyecto de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (uso exclusivo server-side) |
