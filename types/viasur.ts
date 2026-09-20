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
  email: string | null;
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
  nombre_contacto: string | null;
  telefono_alternativo: string | null;
  descripcion: string | null;
  es_destacado: boolean;
  created_at: string;
}

/**
 * Foto de un servicio (tabla `imagenes_servicio`). Un servicio puede
 * tener varias; la de menor `orden` es la portada.
 */
export interface ImagenServicio {
  id: string;
  servicio_id: string;
  url: string;
  orden: number;
  created_at: string;
}

/**
 * Conteo agregado de interacciones anónimas con un servicio (tabla
 * `eventos_servicio`), usado solo en el panel "Mis Servicios". No
 * incluye las visitas del propio dueño a su servicio.
 */
export interface EstadisticasServicio {
  visitas: number;
  contactos: number;
  llamadas: number;
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
  nombre_contacto: string;
  telefono_alternativo: string;
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
 * Duración de una sesión activa tras iniciar sesión con el enlace mágico.
 */
export const SESION_DURACION_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

/**
 * Duración de validez de un enlace de acceso (magic link) antes de expirar.
 */
export const ENLACE_ACCESO_DURACION_MS = 15 * 60 * 1000; // 15 minutos

/**
 * Nombre de la cookie httpOnly que guarda el token de sesión.
 */
export const COOKIE_SESION = "viasur_sesion";
