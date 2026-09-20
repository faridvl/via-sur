-- =====================================================================
-- VíaSur — Datos de contacto adicionales para servicios_locales
-- =====================================================================
-- Nombre de la persona encargada y teléfono alternativo (llamada, no
-- WhatsApp), para negocios cuyos clientes prefieran no escribir.
-- Re-ejecutable: usa "add column if not exists".
-- =====================================================================

alter table servicios_locales
    add column if not exists nombre_contacto text;

alter table servicios_locales
    add column if not exists telefono_alternativo text;
