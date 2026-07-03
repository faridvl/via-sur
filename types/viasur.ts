// =====================================================================
// VíaSur — Tipos e interfaces del dominio
// =====================================================================

/**
 * Cobertura geográfica de un servicio.
 * Coincide 1:1 con el ENUM `tipo_cobertura` de la base de datos.
 */
export enum TipoCobertura {
  Local = "Local",
  Regional = "Regional",
}

/**
 * Localidad normalizada (tabla `localidades`).
 * Reemplaza al antiguo ENUM rígido para permitir altas/bajas dinámicas.
 */
export interface Localidad {
  id: number;
  nombre: string;
  activa: boolean;
}

/**
 * Categoría de servicio normalizada (tabla `categorias`).
 * Reemplaza al antiguo ENUM rígido para permitir altas/bajas dinámicas.
 */
export interface Categoria {
  id: number;
  nombre: string;
  icono: string | null;
  activa: boolean;
}

/**
 * Usuario propietario de uno o más servicios (tabla `usuarios`).
 */
export interface Usuario {
  id: string;
  nombre_completo: string | null;
  celular: string | null;
  created_at: string;
}

/**
 * Servicio local publicado (tabla `servicios_locales`).
 */
export interface ServicioLocal {
  id: string;
  usuario_id: string | null;
  nombre_servicio: string;
  categoria_id: number;
  localidad_id: number;
  cobertura: TipoCobertura;
  direccion_exacta: string | null;
  whatsapp: string | null;
  descripcion: string | null;
  es_destacado: boolean;
  created_at: string;
}

/**
 * Payload del formulario de registro de un nuevo servicio.
 * `localidad_id` y `categoria_id` son numéricos: referencian
 * directamente a `localidades.id` y `categorias.id`.
 */
export interface FormRegistroServicio {
  nombre_servicio: string;
  categoria_id: number;
  localidad_id: number;
  cobertura: TipoCobertura;
  direccion_exacta: string;
  whatsapp: string;
  descripcion: string;
}

/**
 * Body esperado por POST /api/servicios.
 * Extiende el formulario con el usuario autor (opcional en fase inicial).
 */
export interface CrearServicioPayload extends FormRegistroServicio {
  usuario_id?: string;
}

/**
 * Body esperado por PATCH /api/servicios (edición de un servicio propio).
 */
export interface EditarServicioPayload extends CrearServicioPayload {
  id: string;
  usuario_id: string;
}

/**
 * Usuario de prueba fijo (fase sin autenticación real). Simula la sesión
 * activa en el panel "Mis Servicios".
 */
export const USUARIO_ACTUAL_ID = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d";
