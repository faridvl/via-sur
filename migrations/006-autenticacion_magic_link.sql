-- =====================================================================
-- VíaSur — Autenticación por magic link (email) para dueños de negocio
-- =====================================================================
-- Agrega email a usuarios, y crea las tablas de enlaces de acceso
-- (magic links de un solo uso) y sesiones activas.
-- Re-ejecutable: usa "if not exists" / "add column if not exists".
-- =====================================================================

alter table usuarios
    add column if not exists email text unique;

-- ---------------------------------------------------------------------
-- Tabla: enlaces_acceso
-- ---------------------------------------------------------------------
-- Un enlace de acceso (magic link) de un solo uso, con expiración corta.
-- Se genera al solicitar login y se consume al hacer clic en el enlace.
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
-- Sesión activa de un usuario autenticado. El token se guarda en una
-- cookie httpOnly y se valida contra esta tabla en cada request.
-- ---------------------------------------------------------------------
create table if not exists sesiones (
    token       uuid primary key default gen_random_uuid(),
    usuario_id  uuid not null references usuarios(id),
    expira_en   timestamptz not null,
    created_at  timestamptz not null default now()
);

create index if not exists idx_sesiones_usuario_id on sesiones (usuario_id);
