# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

VíaSur — PWA / mobile-first directory of local services for southern Costa Rica (Río Claro, Golfito, Ciudad Neily, Paso Canoas). Next.js 14 (App Router) + TypeScript + TailwindCSS, backed by Neon (serverless Postgres). All UI copy, code comments, and domain/table/column names are in Spanish — keep new code consistent with this.

## Commands

```bash
npm run dev     # start dev server
npm run build   # production build (also run to typecheck route handlers)
npm run start   # run production build
npm run lint    # next lint
```

There is no test suite configured in this repo.

### Database setup

The schema lives in `init.sql` (not migrations). Apply it directly against the Neon instance:

```bash
psql "$DATABASE_URL" -f init.sql
```

Re-running `init.sql` is safe — it uses `create table if not exists` / `create type if not exists` / `on conflict do nothing`.

## Architecture

**Localidades are data, not an enum.** Unlike `tipo_cobertura` and `categoria_servicio` (real Postgres ENUMs, mirrored in `types/viasur.ts`), localidades live in their own `localidades` table so they can be added/renamed/deactivated without a schema migration. Always join/reference by `localidad_id`, and only show localidades where `activa = true`.

**Daily deterministic shuffle via Postgres RPC.** `GET /api/servicios` doesn't just `ORDER BY random()` — it calls the `obtener_servicios_por_dia(seed_value, localidad_id)` function defined in `init.sql`. The route handler computes `seed_value` from the current UTC date (`app/api/servicios/route.ts`'s `calcularSemillaDiaria`), so the "random" ordering is stable for all users for the whole day but changes daily. Featured services (`es_destacado`) always sort first. If you touch this flow, keep the seed calculation and the SQL function in sync.

**Neon client is a lazy singleton (`lib/db.ts`).** `getDb()` instantiates the Neon HTTP client on first call rather than at module load. This is deliberate: Next.js imports route handlers at build time to collect metadata, and `DATABASE_URL` isn't guaranteed to exist yet in that phase (Vercel build environment). Don't move the `neon(...)` call to module scope.

**Route handlers must opt out of static rendering.** Both `app/api/*/route.ts` files set `export const dynamic = "force-dynamic"`. Neither route reads cookies/request data in a way Next.js auto-detects as dynamic, so without this flag Next tries to prerender them at build time and fails when `DATABASE_URL` is absent. Any new Route Handler that touches the database needs this same export.

**Types mirror the DB schema by hand.** `types/viasur.ts` has no generation step — `TipoCobertura`/`CategoriaServicio` enums and the `Localidad`/`Usuario`/`ServicioLocal` interfaces must be kept manually in sync with `init.sql` whenever the schema changes.

**Path alias:** `@/*` maps to the repo root (see `tsconfig.json`), e.g. `@/lib/db`, `@/types/viasur`.

### Request flow

```
app/registrar/page.tsx (client component)
  → GET  /api/localidades         → lib/db.ts → localidades table
  → POST /api/servicios           → lib/db.ts → servicios_locales table

(future) listing page
  → GET /api/servicios?localidad_id=N → obtener_servicios_por_dia() RPC
```

API routes do manual validation against the enum value lists (`Object.values(CategoriaServicio)`, etc.) before hitting the DB — follow this pattern rather than introducing a validation library for a single field check.

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon pooled connection string, includes `sslmode=require` |
