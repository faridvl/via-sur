-- =====================================================================
-- VíaSur — Esquema inicial de base de datos (Supabase / PostgreSQL)
-- =====================================================================
-- Normaliza "localidades" en una tabla propia en lugar de un ENUM,
-- para permitir agregar/desactivar localidades sin migraciones futuras.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Extensiones necesarias (Supabase las trae, pero se declaran por si acaso)
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
-- Tabla: usuarios
-- ---------------------------------------------------------------------
create table if not exists usuarios (
    id               uuid primary key default gen_random_uuid(),
    nombre_completo  text,
    celular          text,
    created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Tipos ENUM: cobertura y categoría de servicio
-- ---------------------------------------------------------------------
do $$
begin
    if not exists (select 1 from pg_type where typname = 'tipo_cobertura') then
        create type tipo_cobertura as enum ('Local', 'Regional');
    end if;
end
$$;

do $$
begin
    if not exists (select 1 from pg_type where typname = 'categoria_servicio') then
        create type categoria_servicio as enum (
            'Comida',
            'Barberia',
            'Transporte',
            'Express',
            'Salud',
            'Shows',
            'Comercio',
            'Otros'
        );
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
    tipo_categoria   categoria_servicio not null,
    localidad_id     int not null references localidades(id),
    cobertura        tipo_cobertura not null default 'Local',
    direccion_exacta text,
    whatsapp         text,
    descripcion      text,
    es_destacado     boolean not null default false,
    created_at       timestamptz not null default now()
);

create index if not exists idx_servicios_localidad_id on servicios_locales (localidad_id);
create index if not exists idx_servicios_tipo_categoria on servicios_locales (tipo_categoria);

-- ---------------------------------------------------------------------
-- Función RPC: obtener_servicios_por_dia
-- ---------------------------------------------------------------------
-- Devuelve el listado de servicios de una localidad, priorizando los
-- destacados y aleatorizando el resto de forma determinística por día
-- mediante una semilla (seed_value) calculada en el backend.
-- ---------------------------------------------------------------------
create or replace function obtener_servicios_por_dia(seed_value int, p_localidad_id int)
returns setof servicios_locales
language plpgsql
as $$
begin
    perform setseed(seed_value::float8 / 2147483647);

    return query
        select *
        from servicios_locales
        where localidad_id = p_localidad_id
        order by es_destacado desc, random();
end;
$$;
