-- =====================================================================
-- VíaSur — Imagen del negocio y tracking de interacciones
-- =====================================================================
-- imagen_url: foto real del negocio (Vercel Blob), reemplaza el
-- placeholder de gradiente cuando existe.
-- eventos_servicio: registro de visitas al detalle y clics de contacto
-- (WhatsApp/llamada), disparado de forma anónima desde el cliente.
-- Re-ejecutable.
-- =====================================================================

alter table servicios_locales
    add column if not exists imagen_url text;

create table if not exists eventos_servicio (
    id           uuid primary key default gen_random_uuid(),
    servicio_id  uuid not null references servicios_locales(id) on delete cascade,
    tipo_evento  text not null check (tipo_evento in ('visita', 'contacto', 'llamada')),
    created_at   timestamptz not null default now()
);

create index if not exists idx_eventos_servicio_servicio_id
    on eventos_servicio (servicio_id, tipo_evento);
