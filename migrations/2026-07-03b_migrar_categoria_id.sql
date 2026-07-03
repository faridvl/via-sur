-- =====================================================================
-- VíaSur — Migración: tipo_categoria (ENUM) → categoria_id (FK)
-- =====================================================================
-- Esta base tenía un esquema previo donde servicios_locales guardaba la
-- categoría como ENUM (`tipo_categoria` / tipo `categoria_servicio`) en
-- lugar de la FK `categoria_id` hacia la tabla `categorias` que usa el
-- código actual (app/api/servicios/route.ts, types/viasur.ts).
--
-- Idempotente: puede correrse varias veces sin duplicar ni romper nada.
-- =====================================================================

-- 1. Agregar categoria_id (nullable por ahora, se resuelve NOT NULL al final)
do $$
begin
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'servicios_locales' and column_name = 'categoria_id'
    ) then
        alter table servicios_locales add column categoria_id int references categorias(id);
    end if;
end
$$;

-- 2. Mapear valores viejos de tipo_categoria → categoria_id, solo donde
--    categoria_id todavía esté sin resolver.
do $$
begin
    if exists (
        select 1 from information_schema.columns
        where table_name = 'servicios_locales' and column_name = 'tipo_categoria'
    ) then
        update servicios_locales sl
        set categoria_id = c.id
        from categorias c
        where sl.categoria_id is null
          and c.nombre = case sl.tipo_categoria::text
                when 'Comida'     then 'Comida / Sodas'
                when 'Barberia'   then 'Barbería y Estética'
                when 'Transporte' then 'Taxis y Fletes'
                when 'Express'    then 'Mandados / Express'
                when 'Salud'      then 'Enfermería y Salud'
                when 'Shows'      then 'Música y Shows'
                when 'Comercio'   then 'Tiendas y Minisupers'
                when 'Otros'      then 'Otros Oficios'
              end;
    end if;
end
$$;

-- 3. Una vez mapeados los datos existentes, exigir categoria_id en filas
--    nuevas (solo si no hay ninguna fila que quedó sin mapear).
do $$
begin
    if not exists (select 1 from servicios_locales where categoria_id is null) then
        alter table servicios_locales alter column categoria_id set not null;
    end if;
end
$$;

create index if not exists idx_servicios_categoria_id on servicios_locales (categoria_id);

-- 3b. tipo_categoria queda en desuso (reemplazada por categoria_id). Se le
--     quita el NOT NULL para no bloquear inserts nuevos, que ya no la usan.
do $$
begin
    if exists (
        select 1 from information_schema.columns
        where table_name = 'servicios_locales'
          and column_name = 'tipo_categoria'
          and is_nullable = 'NO'
    ) then
        alter table servicios_locales alter column tipo_categoria drop not null;
    end if;
end
$$;

-- 4. Columna tipo_categoria queda en desuso. No se elimina automáticamente
--    en este script (cambio destructivo) — hacerlo en un paso aparte una
--    vez confirmado que categoria_id está poblado correctamente:
--    alter table servicios_locales drop column tipo_categoria;
