-- =====================================================================
-- VíaSur — Seed extendido para simular datos de producción
-- =====================================================================
-- Idempotente: usa ON CONFLICT DO NOTHING sobre nombre_servicio
-- (constraint única creada en 2026-07-03_update_and_seed.sql). Puede
-- correrse múltiples veces sin duplicar filas.
--
-- Cobertura:
--   - Usuario de prueba fijo con un servicio propio registrado.
--   - Mínimo 5 negocios por cada una de las 4 localidades oficiales,
--     repartidos en distintas categorías.
--   - Río Claro y Golfito con 2 negocios destacados (es_destacado=true)
--     cada una, para ejercitar la semilla diaria con datos mixtos.
--
-- Uso:
--   psql "$DATABASE_URL" -f migrations/2026-07-03c_seed_produccion.sql
-- =====================================================================

insert into usuarios (id, nombre_completo, celular)
values ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Juan Pérez', '88888888')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Río Claro (ya tiene "Soda El Buen Sabor" destacado y "Minisuper La
-- Esquina" del seed anterior) — se agrega 1 destacado más y 3 gratuitos
-- para llegar a 5 negocios en total.
-- ---------------------------------------------------------------------
insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Farmacia San Rafael',
    (select id from categorias where nombre = 'Enfermería y Salud'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Costado norte del parque, Río Claro',
    '88886001',
    'Medicamentos, inyecciones y control de presión. Atención rápida.',
    true
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Barbería Río Claro Style',
    (select id from categorias where nombre = 'Barbería y Estética'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Barrio Fátima, Río Claro',
    '88886002',
    'Cortes clásicos y modernos, ambiente familiar.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Taxi Río Claro 24H',
    (select id from categorias where nombre = 'Taxis y Fletes'),
    (select id from localidades where nombre = 'Río Claro'),
    'Regional'::tipo_cobertura,
    'Terminal de buses, Río Claro',
    '88886003',
    'Servicio de taxi día y noche, viajes a Golfito y Ciudad Neily.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'DJ Sonido Tropical',
    (select id from categorias where nombre = 'Música y Shows'),
    (select id from localidades where nombre = 'Río Claro'),
    'Regional'::tipo_cobertura,
    'A domicilio en toda la zona sur',
    '88886004',
    'Sonido y animación para fiestas, bodas y turnos.',
    false
on conflict (nombre_servicio) do nothing;

-- ---------------------------------------------------------------------
-- Golfito (ya tiene "Barbería VIP" destacado del seed anterior) — se
-- agrega 1 destacado más y 3 gratuitos para llegar a 5 negocios.
-- ---------------------------------------------------------------------
insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Restaurante Mirador del Golfo',
    (select id from categorias where nombre = 'Comida / Sodas'),
    (select id from localidades where nombre = 'Golfito'),
    'Local'::tipo_cobertura,
    'Pueblo Civil, frente al muelle, Golfito',
    '88887001',
    'Mariscos frescos y vista al golfo. Ideal para grupos.',
    true
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Minisuper Golfito Mar',
    (select id from categorias where nombre = 'Tiendas y Minisupers'),
    (select id from localidades where nombre = 'Golfito'),
    'Local'::tipo_cobertura,
    'Depósito Libre, Golfito',
    '88887002',
    'Abarrotes, bebidas frías y productos importados.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Enfermería a Domicilio Golfito',
    (select id from categorias where nombre = 'Enfermería y Salud'),
    (select id from localidades where nombre = 'Golfito'),
    'Regional'::tipo_cobertura,
    'Atención a domicilio en Golfito y alrededores',
    '88887003',
    'Curaciones, inyecciones y cuidado de adultos mayores.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Fletes y Mudanzas Golfito',
    (select id from categorias where nombre = 'Mandados / Express'),
    (select id from localidades where nombre = 'Golfito'),
    'Local'::tipo_cobertura,
    'Barrio Kilómetro Cuatro, Golfito',
    '88887004',
    'Mudanzas, acarreo de muebles y mandados urgentes.',
    false
on conflict (nombre_servicio) do nothing;

-- ---------------------------------------------------------------------
-- Ciudad Neily (ya tiene "Taxi Express Neily" del seed anterior) — se
-- agregan 4 gratuitos para llegar a 5 negocios en total.
-- ---------------------------------------------------------------------
insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Soda La Parada Neily',
    (select id from categorias where nombre = 'Comida / Sodas'),
    (select id from localidades where nombre = 'Ciudad Neily'),
    'Local'::tipo_cobertura,
    'Calle central, Ciudad Neily',
    '88888001',
    'Casados, tacos y batidos. Abierto desde las 6am.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Estética Neily Nails',
    (select id from categorias where nombre = 'Barbería y Estética'),
    (select id from localidades where nombre = 'Ciudad Neily'),
    'Local'::tipo_cobertura,
    'Barrio Corina, Ciudad Neily',
    '88888002',
    'Manicure, pedicure y tratamientos faciales.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Ferretería El Tornillo',
    (select id from categorias where nombre = 'Otros Oficios'),
    (select id from localidades where nombre = 'Ciudad Neily'),
    'Regional'::tipo_cobertura,
    'Contiguo al mercado municipal, Ciudad Neily',
    '88888003',
    'Materiales de construcción, herramientas y pintura.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Karaoke y Sonido Neily',
    (select id from categorias where nombre = 'Música y Shows'),
    (select id from localidades where nombre = 'Ciudad Neily'),
    'Local'::tipo_cobertura,
    'Barrio Alajuelita, Ciudad Neily',
    '88888004',
    'Alquiler de equipo de sonido y karaoke para eventos.',
    false
on conflict (nombre_servicio) do nothing;

-- ---------------------------------------------------------------------
-- Paso Canoas (ya tiene "Mandados Paso Canoas" del seed anterior) — se
-- agregan 4 gratuitos para llegar a 5 negocios en total.
-- ---------------------------------------------------------------------
insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Soda Frontera',
    (select id from categorias where nombre = 'Comida / Sodas'),
    (select id from localidades where nombre = 'Paso Canoas'),
    'Local'::tipo_cobertura,
    'A 50m del puesto fronterizo, Paso Canoas',
    '88889001',
    'Comida rápida y típica para viajeros.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Taxi Frontera Express',
    (select id from categorias where nombre = 'Taxis y Fletes'),
    (select id from localidades where nombre = 'Paso Canoas'),
    'Regional'::tipo_cobertura,
    'Zona fronteriza, Paso Canoas',
    '88889002',
    'Viajes a David (Panamá) y Ciudad Neily.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Minisuper Las Canoas',
    (select id from categorias where nombre = 'Tiendas y Minisupers'),
    (select id from localidades where nombre = 'Paso Canoas'),
    'Local'::tipo_cobertura,
    'Calle comercial, Paso Canoas',
    '88889003',
    'Cambio de moneda, snacks y artículos de viaje.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Enfermería Paso Canoas',
    (select id from categorias where nombre = 'Enfermería y Salud'),
    (select id from localidades where nombre = 'Paso Canoas'),
    'Local'::tipo_cobertura,
    'Barrio Los Ángeles, Paso Canoas',
    '88889004',
    'Consultas básicas, inyecciones y curaciones.',
    false
on conflict (nombre_servicio) do nothing;
