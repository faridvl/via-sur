-- =====================================================================
-- VíaSur — Río Claro: 5 negocios en cada categoría
-- =====================================================================
-- Idempotente: usa ON CONFLICT DO NOTHING sobre nombre_servicio
-- (constraint única creada en 2026-07-03_update_and_seed.sql).
--
-- Estado previo (antes de este script):
--   Comida / Sodas         2 (1 destacado)
--   Barbería y Estética    1
--   Taxis y Fletes         1
--   Mandados / Express     0
--   Enfermería y Salud     1 (1 destacado)
--   Música y Shows         1
--   Tiendas y Minisupers   1
--   Otros Oficios          0
--
-- Este script agrega los negocios faltantes para que las 8 categorías
-- de Río Claro lleguen a 5 negocios cada una (40 en total), y suma 2
-- destacados nuevos (Taxis y Tiendas) para tener presencia premium en
-- más categorías, además de las ya destacadas (Comida y Enfermería).
--
-- Uso:
--   psql "$DATABASE_URL" -f migrations/2026-07-03d_rio_claro_todas_categorias.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- Comida / Sodas (2 → 5): faltan 3
-- ---------------------------------------------------------------------
insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Panadería La Espiga',
    (select id from categorias where nombre = 'Comida / Sodas'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Calle central, Río Claro',
    '88891001',
    'Pan casero, repostería y café de la zona.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Pollo Asado Don Chepe',
    (select id from categorias where nombre = 'Comida / Sodas'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Barrio Fátima, Río Claro',
    '88891002',
    'Pollo asado a la leña, ensaladas y papas caseras.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Heladería Fresco Sur',
    (select id from categorias where nombre = 'Comida / Sodas'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Frente al parque central, Río Claro',
    '88891003',
    'Helados artesanales, granizados y batidos.',
    false
on conflict (nombre_servicio) do nothing;

-- ---------------------------------------------------------------------
-- Barbería y Estética (1 → 5): faltan 4
-- ---------------------------------------------------------------------
insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Salón Belleza Total',
    (select id from categorias where nombre = 'Barbería y Estética'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Barrio Fátima, Río Claro',
    '88892001',
    'Corte, color, alisado y maquillaje profesional.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Uñas y Pestañas RC',
    (select id from categorias where nombre = 'Barbería y Estética'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Calle principal, Río Claro',
    '88892002',
    'Manicure, pedicure y extensión de pestañas.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Barbería Estilo Clásico',
    (select id from categorias where nombre = 'Barbería y Estética'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Costado sur del parque, Río Claro',
    '88892003',
    'Cortes tradicionales, afeitado con navaja.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Spa Relax Río Claro',
    (select id from categorias where nombre = 'Barbería y Estética'),
    (select id from localidades where nombre = 'Río Claro'),
    'Regional'::tipo_cobertura,
    'Entrada a Río Claro, sobre carretera principal',
    '88892004',
    'Masajes, faciales y tratamientos de relajación.',
    false
on conflict (nombre_servicio) do nothing;

-- ---------------------------------------------------------------------
-- Taxis y Fletes (1 → 5): faltan 4, se agrega 1 destacado
-- ---------------------------------------------------------------------
insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Taxi Premium Río Claro',
    (select id from categorias where nombre = 'Taxis y Fletes'),
    (select id from localidades where nombre = 'Río Claro'),
    'Regional'::tipo_cobertura,
    'Terminal de buses, Río Claro',
    '88893001',
    'Vehículos modernos, viajes seguros día y noche, reservas por WhatsApp.',
    true
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Fletes Río Claro Carga Pesada',
    (select id from categorias where nombre = 'Taxis y Fletes'),
    (select id from localidades where nombre = 'Río Claro'),
    'Regional'::tipo_cobertura,
    'Barrio Fátima, Río Claro',
    '88893002',
    'Mudanzas, acarreo de materiales y carga en general.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Taxi Doña Flora',
    (select id from categorias where nombre = 'Taxis y Fletes'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Calle central, Río Claro',
    '88893003',
    'Servicio de taxi confiable dentro de Río Claro.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Moto Taxi Rápido RC',
    (select id from categorias where nombre = 'Taxis y Fletes'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Terminal de buses, Río Claro',
    '88893004',
    'Viajes cortos en moto, rápido y económico.',
    false
on conflict (nombre_servicio) do nothing;

-- ---------------------------------------------------------------------
-- Mandados / Express (0 → 5): faltan 5
-- ---------------------------------------------------------------------
insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Mandados Río Claro Express',
    (select id from categorias where nombre = 'Mandados / Express'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Calle central, Río Claro',
    '88894001',
    'Trámites, compras y entregas urgentes en Río Claro.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Delivery RC 24H',
    (select id from categorias where nombre = 'Mandados / Express'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Barrio Fátima, Río Claro',
    '88894002',
    'Entrega de comida, medicinas y paquetes.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Encomiendas del Sur',
    (select id from categorias where nombre = 'Mandados / Express'),
    (select id from localidades where nombre = 'Río Claro'),
    'Regional'::tipo_cobertura,
    'Terminal de buses, Río Claro',
    '88894003',
    'Envío de encomiendas a Golfito, Neily y Paso Canoas.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Trámites y Gestiones RC',
    (select id from categorias where nombre = 'Mandados / Express'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Costado del banco, Río Claro',
    '88894004',
    'Pagos de servicios, trámites bancarios y filas.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Compras y Mandados Doña Ana',
    (select id from categorias where nombre = 'Mandados / Express'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Barrio Los Ángeles, Río Claro',
    '88894005',
    'Compras de supermercado y farmacia a domicilio.',
    false
on conflict (nombre_servicio) do nothing;

-- ---------------------------------------------------------------------
-- Enfermería y Salud (1 → 5): faltan 4
-- ---------------------------------------------------------------------
insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Clínica Dental Río Claro',
    (select id from categorias where nombre = 'Enfermería y Salud'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Calle central, Río Claro',
    '88895001',
    'Limpieza dental, extracciones y consultas generales.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Enfermería a Domicilio RC',
    (select id from categorias where nombre = 'Enfermería y Salud'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Barrio Fátima, Río Claro',
    '88895002',
    'Curaciones, inyecciones y control de signos vitales.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Óptica Visión Sur',
    (select id from categorias where nombre = 'Enfermería y Salud'),
    (select id from localidades where nombre = 'Río Claro'),
    'Regional'::tipo_cobertura,
    'Frente al parque central, Río Claro',
    '88895003',
    'Exámenes de la vista, lentes y monturas.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Fisioterapia Río Claro',
    (select id from categorias where nombre = 'Enfermería y Salud'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Barrio Los Ángeles, Río Claro',
    '88895004',
    'Terapias de rehabilitación y masajes terapéuticos.',
    false
on conflict (nombre_servicio) do nothing;

-- ---------------------------------------------------------------------
-- Música y Shows (1 → 5): faltan 4
-- ---------------------------------------------------------------------
insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Mariachi Sur de Costa Rica',
    (select id from categorias where nombre = 'Música y Shows'),
    (select id from localidades where nombre = 'Río Claro'),
    'Regional'::tipo_cobertura,
    'A domicilio en toda la zona sur',
    '88896001',
    'Serenatas, cumpleaños y eventos especiales.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Payasos y Animación RC',
    (select id from categorias where nombre = 'Música y Shows'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Barrio Fátima, Río Claro',
    '88896002',
    'Animación infantil, payasos y magia para fiestas.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Grupo Versátil Río Claro',
    (select id from categorias where nombre = 'Música y Shows'),
    (select id from localidades where nombre = 'Río Claro'),
    'Regional'::tipo_cobertura,
    'Calle central, Río Claro',
    '88896003',
    'Música en vivo para bodas, turnos y fiestas patronales.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Alquiler de Toldos y Sonido RC',
    (select id from categorias where nombre = 'Música y Shows'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Terminal de buses, Río Claro',
    '88896004',
    'Alquiler de toldos, mesas, sillas y equipo de sonido.',
    false
on conflict (nombre_servicio) do nothing;

-- ---------------------------------------------------------------------
-- Tiendas y Minisupers (1 → 5): faltan 4, se agrega 1 destacado
-- ---------------------------------------------------------------------
insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Súper Mercado Río Claro Plaza',
    (select id from categorias where nombre = 'Tiendas y Minisupers'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Calle central, Río Claro',
    '88897001',
    'El supermercado más completo de la zona: abarrotes, carnes y más.',
    true
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Ropa y Calzado Río Claro',
    (select id from categorias where nombre = 'Tiendas y Minisupers'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Frente al parque central, Río Claro',
    '88897002',
    'Ropa para toda la familia, calzado y accesorios.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Pulpería Doña Marlene',
    (select id from categorias where nombre = 'Tiendas y Minisupers'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Barrio Los Ángeles, Río Claro',
    '88897003',
    'Abarrotes de barrio, abierto todos los días.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Ferretería Río Claro Sur',
    (select id from categorias where nombre = 'Tiendas y Minisupers'),
    (select id from localidades where nombre = 'Río Claro'),
    'Regional'::tipo_cobertura,
    'Terminal de buses, Río Claro',
    '88897004',
    'Materiales de construcción y artículos para el hogar.',
    false
on conflict (nombre_servicio) do nothing;

-- ---------------------------------------------------------------------
-- Otros Oficios (0 → 5): faltan 5
-- ---------------------------------------------------------------------
insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Electricista Río Claro',
    (select id from categorias where nombre = 'Otros Oficios'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Barrio Fátima, Río Claro',
    '88898001',
    'Instalaciones eléctricas, reparaciones y mantenimiento.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Plomería Río Claro',
    (select id from categorias where nombre = 'Otros Oficios'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Calle central, Río Claro',
    '88898002',
    'Reparación de fugas, instalación de tuberías y sanitarios.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Carpintería El Roble',
    (select id from categorias where nombre = 'Otros Oficios'),
    (select id from localidades where nombre = 'Río Claro'),
    'Regional'::tipo_cobertura,
    'Barrio Los Ángeles, Río Claro',
    '88898003',
    'Muebles a medida, puertas y reparaciones en madera.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Jardinería y Paisajismo RC',
    (select id from categorias where nombre = 'Otros Oficios'),
    (select id from localidades where nombre = 'Río Claro'),
    'Local'::tipo_cobertura,
    'Terminal de buses, Río Claro',
    '88898004',
    'Diseño de jardines, poda y mantenimiento de zonas verdes.',
    false
on conflict (nombre_servicio) do nothing;

insert into servicios_locales (
    usuario_id, nombre_servicio, categoria_id, localidad_id,
    cobertura, direccion_exacta, whatsapp, descripcion, es_destacado
)
select
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Técnico en Refrigeración RC',
    (select id from categorias where nombre = 'Otros Oficios'),
    (select id from localidades where nombre = 'Río Claro'),
    'Regional'::tipo_cobertura,
    'Barrio Fátima, Río Claro',
    '88898005',
    'Reparación de aires acondicionados y refrigeradoras.',
    false
on conflict (nombre_servicio) do nothing;
