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
 * Categoría de un servicio.
 * Coincide 1:1 con el ENUM `categoria_servicio` de la base de datos.
 */
export enum CategoriaServicio {
  Comida = "Comida",
  Barberia = "Barberia",
  Transporte = "Transporte",
  Express = "Express",
  Salud = "Salud",
  Shows = "Shows",
  Comercio = "Comercio",
  Otros = "Otros",
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
  tipo_categoria: CategoriaServicio;
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
 * `localidad_id` es numérico: referencia directa a `localidades.id`.
 */
export interface FormRegistroServicio {
  nombre_servicio: string;
  tipo_categoria: CategoriaServicio;
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
