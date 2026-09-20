-- =====================================================================
-- VíaSur — Múltiples imágenes por servicio
-- =====================================================================
-- Reemplaza la columna única servicios_locales.imagen_url (de la
-- migración 008) por una tabla propia: un negocio puede tener varias
-- fotos, cada una administrable de forma independiente (agregar,
-- quitar, reordenar). La de menor `orden` es la portada.
-- Re-ejecutable.
-- =====================================================================

alter table servicios_locales
    drop column if exists imagen_url;

create table if not exists imagenes_servicio (
    id           uuid primary key default gen_random_uuid(),
    servicio_id  uuid not null references servicios_locales(id) on delete cascade,
    url          text not null,
    orden        int not null default 0,
    created_at   timestamptz not null default now()
);

create index if not exists idx_imagenes_servicio_servicio_id
    on imagenes_servicio (servicio_id, orden);
