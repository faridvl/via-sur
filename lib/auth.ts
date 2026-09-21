import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { COOKIE_SESION, SESION_DURACION_MS } from "@/types/viasur";

/**
 * Resuelve el usuario autenticado a partir de la cookie de sesión,
 * validándola contra la tabla `sesiones`. Devuelve null si no hay
 * cookie, la sesión no existe o ya expiró.
 */
export async function obtenerUsuarioIdActual(
  request: NextRequest
): Promise<string | null> {
  const token = request.cookies.get(COOKIE_SESION)?.value;

  if (!token) {
    return null;
  }

  const sql = getDb();

  const [sesion] = (await sql`
    select usuario_id
    from sesiones
    where token = ${token} and expira_en > now()
  `) as { usuario_id: string }[];

  return sesion?.usuario_id ?? null;
}

/**
 * Busca o crea el usuario por email y abre una sesión nueva.
 * Compartido entre el consumo del enlace por token (link del correo) y por
 * código de 6 dígitos (input manual): ambos caminos llegan al mismo punto
 * una vez identificado el email dueño del enlace.
 */
export async function crearSesionParaEmail(
  email: string
): Promise<{ token: string; expiraEn: Date }> {
  const sql = getDb();

  let [usuario] = (await sql`
    select id from usuarios where email = ${email}
  `) as { id: string }[];

  if (!usuario) {
    [usuario] = (await sql`
      insert into usuarios (email)
      values (${email})
      returning id
    `) as { id: string }[];
  }

  const expiraEn = new Date(Date.now() + SESION_DURACION_MS);

  const [sesion] = (await sql`
    insert into sesiones (usuario_id, expira_en)
    values (${usuario.id}, ${expiraEn.toISOString()})
    returning token
  `) as { token: string }[];

  return { token: sesion.token, expiraEn };
}
