import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { COOKIE_SESION } from "@/types/viasur";

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
