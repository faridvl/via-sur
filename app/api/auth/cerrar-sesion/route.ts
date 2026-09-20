import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { COOKIE_SESION } from "@/types/viasur";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/cerrar-sesion
 * Invalida la sesión activa (borra la fila en `sesiones` y la cookie).
 */
export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_SESION)?.value;

  if (token) {
    const sql = getDb();

    try {
      await sql`delete from sesiones where token = ${token}`;
    } catch {
      // No bloquea el cierre de sesión en el cliente si la fila ya no existe.
    }
  }

  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.delete(COOKIE_SESION);

  return respuesta;
}
