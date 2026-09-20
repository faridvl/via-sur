-- ---------------------------------------------------------------------
-- Script: actualizar_whatsapp_placeholder.sql
-- ---------------------------------------------------------------------
-- Reemplaza el número de WhatsApp de TODOS los negocios en
-- servicios_locales por un número placeholder (88165808) mientras
-- se recolectan los números reales.
--
-- Uso:
--   psql "$DATABASE_URL" -f scripts/actualizar_whatsapp_placeholder.sql
--
-- Nota: este UPDATE afecta a todas las filas de la tabla (no lleva
-- WHERE). Revisa el SELECT de verificación antes de correrlo si
-- quieres confirmar cuántas filas se van a modificar.
-- ---------------------------------------------------------------------

-- Verificación previa (opcional): cuántos servicios se van a actualizar
-- select count(*) from servicios_locales;

update servicios_locales
set whatsapp = '88165808';

-- Verificación posterior (opcional)
-- select id, nombre_servicio, whatsapp from servicios_locales;
