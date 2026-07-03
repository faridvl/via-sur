-- =====================================================================
-- VíaSur — Migración incremental idempotente (Neon / PostgreSQL)
-- =====================================================================
-- Este script puede ejecutarse múltiples veces sin romper nada ni
-- duplicar datos. Verifica estructura existente antes de modificarla
-- y usa ON CONFLICT DO NOTHING para todos los seeds.
--
-- Uso:
--   psql "$DATABASE_URL" -f migrations/2026-07-03_update_and_seed.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- Extensiones necesarias
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Tipo ENUM: tipo_cobertura (creación segura)
-- ---------------------------------------------------------------------
do $$
begin
    if not exists (select 1 from pg_type where typname = 'tipo_cobertura') then
        create type tipo_cobertura as enum ('Local', 'Regional');
    end if;
end
$$;

-- ---------------------------------------------------------------------
-- Tabla: localidades
-- ---------------------------------------------------------------------
create table if not exists localidades (
    id          serial primary key,
    nombre      text not null unique,
    activa      boolean not null default true,
    created_at  timestamptz not null default now()
);

-- Verificación de columnas críticas por si la tabla ya existía con un
-- esquema más viejo.
do $$
begin
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'localidades' and column_name = 'activa'
    ) then
        alter table localidades add column activa boolean not null default true;
    end if;

    if not exists (
        select 1 from information_schema.columns
        where table_name = 'localidades' and column_name = 'created_at'
    ) then
        alter table localidades add column created_at timestamptz not null default now();
    end if;
end
$$;

-- ---------------------------------------------------------------------
-- Tabla: categorias
-- ---------------------------------------------------------------------
create table if not exists categorias (
    id          serial primary key,
    nombre      text not null unique,
    icono       text,
    activa      boolean not null default true,
    created_at  timestamptz not null default now()
);

do $$
begin
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'categorias' and column_name = 'icono'
    ) then
        alter table categorias add column icono text;
    end if;

    if not exists (
        select 1 from information_schema.columns
        where table_name = 'categorias' and column_name = 'activa'
    ) then
        alter table categorias add column activa boolean not null default true;
    end if;

    if not exists (
        select 1 from information_schema.columns
        where table_name = 'categorias' and column_name = 'created_at'
    ) then
        alter table categorias add column created_at timestamptz not null default now();
    end if;
end
$$;

-- ---------------------------------------------------------------------
-- Tabla: usuarios
-- ---------------------------------------------------------------------
create table if not exists usuarios (
    id               uuid primary key default gen_random_uuid(),
    nombre_completo  text,
    celular          text,
    created_at       timestamptz not null default now()
);

do $$
begin
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'usuarios' and column_name = 'nombre_completo'
    ) then
        alter table usuarios add column nombre_completo text;
    end if;

    if not exists (
        select 1 from information_schema.columns
        where table_name = 'usuarios' and column_name = 'celular'
    ) then
        alter table usuarios add column celular text;
    end if;

    if not exists (
        select 1 from information_schema.columns
        where table_name = 'usuarios' and column_name = 'created_at'
    ) then
        alter table usuarios add column created_at timestamptz not null default now();
    end if;
end
$$;

-- ---------------------------------------------------------------------
-- Tabla: servicios_locales
-- ---------------------------------------------------------------------
create table if not exists servicios_locales (
    id               uuid primary key default gen_random_uuid(),
    usuario_id       uuid references usuarios(id),
    nombre_servicio  text not null,
    categoria_id     int not null references categorias(id),
    localidad_id     int not null references localidades(id),
    cobertura        tipo_cobertura not null default 'Local',
    direccion_exacta text,
    whatsapp         text,
    descripcion      text,
    es_destacado     boolean not null default false,
    created_at       timestamptz not null default now()
);

-- Verificación dinámica de columnas críticas (incluye 'es_destacado' y
-- 'cobertura', explícitamente pedidas como caso de prueba).
do $$
begin
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'servicios_locales' and column_name = 'cobertura'
    ) then
        alter table servicios_locales add column cobertura tipo_cobertura not null default 'Local';
    end if;

    if not exists (
        select 1 from information_schema.columns
        where table_name = 'servicios_locales' and column_name = 'es_destacado'
    ) then
        alter table servicios_locales add column es_destacado boolean not null default false;
    end if;

    if not exists (
        select 1 from information_schema.columns
        where table_name = 'servicios_locales' and column_name = 'direccion_exacta'
    ) then
        alter table servicios_locales add column direccion_exacta text;
    end if;

    if not exists (
        select 1 from information_schema.columns
        where table_name = 'servicios_locales' and column_name = 'whatsapp'
    ) then
        alter table servicios_locales add column whatsapp text;
    end if;

    if not exists (
        select 1 from information_schema.columns
        where table_name = 'servicios_locales' and column_name = 'descripcion'
    ) then
        alter table servicios_locales add column descripcion text;
    end if;
end
$$;

-- Constraint de unicidad temporal sobre nombre_servicio, necesaria para
-- poder usar ON CONFLICT en el seed de negocios sin duplicar filas en
-- corridas repetidas del script.
do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'servicios_locales_nombre_servicio_key'
    ) then
        alter table servicios_locales
            add constraint servicios_locales_nombre_servicio_key unique (nombre_servicio);
    end if;
end
$$;

create index if not exists idx_servicios_localidad_id on servicios_locales (localidad_id);
create index if not exists idx_servicios_categoria_id on servicios_locales (categoria_id);

-- ---------------------------------------------------------------------
-- Función RPC: obtener_servicios_por_dia (última lógica, sin errores)
-- ---------------------------------------------------------------------
create or replace function obtener_servicios_por_dia(
    seed_value int,
    p_localidad_id int,
    p_categoria_id int default null
)
returns setof servicios_locales
language plpgsql
as $$
begin
    perform setseed(seed_value::float8 / 100000000.0);

    return query
        select *
        from servicios_locales
        where localidad_id = p_localidad_id
          and (p_categoria_id is null or categoria_id = p_categoria_id)
        order by es_destacado desc, random();
end;
$$;

-- =====================================================================
-- SEED: datos maestros (localidades y categorías)
-- =====================================================================
insert into localidades (nombre) values
    ('Río Claro'),
    ('Golfito'),
    ('Ciudad Neily'),
    ('Paso Canoas')
on conflict (nombre) do nothing;

insert into categorias (nombre, icono) values
    ('Comida / Sodas', '🍔'),
    ('Barbería y Estética', '💈'),
    ('Taxis y Fletes', '🚖'),
    ('Mandados / Express', '🏍️'),
    ('Enfermería y Salud', '🩺'),
    ('Música y Shows', '🎵'),
    ('Tiendas y Minisupers', '🛍️'),
    ('Otros Oficios', '🛠️')
on conflict (nombre) do nothing;

-- =====================================================================
-- SEED: usuario de prueba (login / administración)
-- =====================================================================
insert into usuarios (id, nombre_completo, celular)
values ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Juan Pérez', '88888888')
on conflict (id) do nothing;

-- =====================================================================
-- SEED: negocios destacados (suscripción ₡4,000 activa)
-- =====================================================================
insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Soda El Buen Sabor',
    (select id from categorias where nombre = 'Comida / Sodas'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Frente a la escuela, Río Claro centro',
    '88881111',
    'Comida típica casera, almuerzos ejecutivos y batidos naturales.',
    true
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Barbería VIP',
    (select id from categorias where nombre = 'Barbería y Estética'),
    (select id from localidades where nombre = 'Golfito'),
    'Local'::tipo_cobertura,
    'Barrio El Progreso, Golfito',
    '88882222',
    'Cortes modernos, diseño de barba y tratamientos capilares.',
    true
on conflict (nombre_servicio) do nothing;

-- =====================================================================
-- SEED: negocios gratuitos (para probar el barajado aleatorio diario)
-- =====================================================================
insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Taxi Express Neily',
    (select id from categorias where nombre = 'Taxis y Fletes'),
    (select id from localidades where nombre = 'Ciudad Neily'),
    'Regional'::tipo_cobertura,
    'Parada central, Ciudad Neily',
    '88883333',
    'Servicio de taxi las 24 horas, viajes dentro y fuera de la ciudad.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Mandados Paso Canoas',
    (select id from categorias where nombre = 'Mandados / Express'),
    (select id from localidades where nombre = 'Paso Canoas'),
    'Local'::tipo_cobertura,
    'Zona fronteriza, Paso Canoas',
    '88884444',
    'Entrega de encomiendas, trámites y compras en frontera.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Minisuper La Esquina',
    (select id from categorias where nombre = 'Tiendas y Minisupers'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Calle principal, Río Claro',
    '88885555',
    'Abarrotes, snacks y productos de primera necesidad.',
    false
on conflict (nombre_servicio) do nothing;
