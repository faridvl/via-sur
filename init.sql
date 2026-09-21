-- =====================================================================
-- TicoRed — Esquema inicial de base de datos (Neon / PostgreSQL)
-- =====================================================================
-- Normaliza "localidades" y "categorías" en tablas propias en lugar de
-- ENUMs, para permitir agregar/desactivar valores sin migraciones futuras.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Extensiones necesarias
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";
-- Permite comparar texto ignorando tildes/diacríticos (unaccent('Café') = 'Cafe'),
-- usado en la búsqueda de servicios para que "barberia" encuentre "Barbería".
create extension if not exists "unaccent";

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
    email            text unique,
    created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Tabla: enlaces_acceso
-- ---------------------------------------------------------------------
-- Magic link de un solo uso para iniciar sesión (login por email).
-- ---------------------------------------------------------------------
create table if not exists enlaces_acceso (
    token       uuid primary key default gen_random_uuid(),
    email       text not null,
    expira_en   timestamptz not null,
    usado       boolean not null default false,
    created_at  timestamptz not null default now()
);

create index if not exists idx_enlaces_acceso_email on enlaces_acceso (email);

-- ---------------------------------------------------------------------
-- Tabla: sesiones
-- ---------------------------------------------------------------------
-- Sesión activa de un usuario autenticado (cookie httpOnly + esta tabla).
-- ---------------------------------------------------------------------
create table if not exists sesiones (
    token       uuid primary key default gen_random_uuid(),
    usuario_id  uuid not null references usuarios(id),
    expira_en   timestamptz not null,
    created_at  timestamptz not null default now()
);

create index if not exists idx_sesiones_usuario_id on sesiones (usuario_id);

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
    nombre_contacto  text,
    telefono_alternativo text,
    descripcion      text,
    dias_atencion    text[],
    hora_apertura    time,
    hora_cierre      time,
    es_destacado     boolean not null default false,
    created_at       timestamptz not null default now()
);

alter table servicios_locales drop column if exists horario_texto;
alter table servicios_locales add column if not exists dias_atencion text[];
alter table servicios_locales add column if not exists hora_apertura time;
alter table servicios_locales add column if not exists hora_cierre time;

create index if not exists idx_servicios_localidad_id on servicios_locales (localidad_id);
create index if not exists idx_servicios_categoria_id on servicios_locales (categoria_id);

-- ---------------------------------------------------------------------
-- Tabla: eventos_servicio
-- ---------------------------------------------------------------------
-- Tracking anónimo de interacciones en la vista pública de un servicio
-- (visita al detalle, clic en WhatsApp, clic en llamar). No cuenta las
-- visitas del propio dueño a su servicio (filtrado en el backend).
-- ---------------------------------------------------------------------
create table if not exists eventos_servicio (
    id           uuid primary key default gen_random_uuid(),
    servicio_id  uuid not null references servicios_locales(id) on delete cascade,
    tipo_evento  text not null check (tipo_evento in ('visita', 'contacto', 'llamada')),
    created_at   timestamptz not null default now()
);

create index if not exists idx_eventos_servicio_servicio_id
    on eventos_servicio (servicio_id, tipo_evento);

-- ---------------------------------------------------------------------
-- Tabla: imagenes_servicio
-- ---------------------------------------------------------------------
-- Un servicio puede tener varias fotos, administrables por separado.
-- La de menor `orden` es la portada mostrada en listados/carrusel.
-- ---------------------------------------------------------------------
create table if not exists imagenes_servicio (
    id           uuid primary key default gen_random_uuid(),
    servicio_id  uuid not null references servicios_locales(id) on delete cascade,
    url          text not null,
    orden        int not null default 0,
    created_at   timestamptz not null default now()
);

create index if not exists idx_imagenes_servicio_servicio_id
    on imagenes_servicio (servicio_id, orden);

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
