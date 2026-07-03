-- =====================================================================
-- VíaSur — Esquema inicial de base de datos (Neon / PostgreSQL)
-- =====================================================================
-- Normaliza "localidades" y "categorías" en tablas propias en lugar de
-- ENUMs, para permitir agregar/desactivar valores sin migraciones futuras.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Extensiones necesarias
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Tabla: localidades
-- ---------------------------------------------------------------------
create table if not exists localidades (
    id          serial primary key,
    nombre      text not null unique,
    activa      boolean not null default true,
    created_at  timestamptz not null default now()
);

insert into localidades (nombre) values
    ('Río Claro'),
    ('Golfito'),
    ('Ciudad Neily'),
    ('Paso Canoas')
on conflict (nombre) do nothing;

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

-- ---------------------------------------------------------------------
-- Tabla: usuarios
-- ---------------------------------------------------------------------
create table if not exists usuarios (
    id               uuid primary key default gen_random_uuid(),
    nombre_completo  text,
    celular          text,
    created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Tipo ENUM: cobertura
-- ---------------------------------------------------------------------
do $$
begin
    if not exists (select 1 from pg_type where typname = 'tipo_cobertura') then
        create type tipo_cobertura as enum ('Local', 'Regional');
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

create index if not exists idx_servicios_localidad_id on servicios_locales (localidad_id);
create index if not exists idx_servicios_categoria_id on servicios_locales (categoria_id);

-- ---------------------------------------------------------------------
-- Función RPC: obtener_servicios_por_dia
-- ---------------------------------------------------------------------
-- Devuelve el listado de servicios de una localidad y categoría,
-- priorizando los destacados y aleatorizando el resto de forma
-- determinística por día mediante una semilla (seed_value) calculada
-- en el backend a partir de la fecha (AAAAMMDD).
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
