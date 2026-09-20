import { NextRequest, NextResponse } from "next/server";
import { obtenerUsuarioIdActual } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/sesion
 * Devuelve el usuario_id de la sesión activa, o 401 si no hay sesión.
 */
export async function GET(request: NextRequest) {
  const usuarioId = await obtenerUsuarioIdActual(request);

  if (!usuarioId) {
    return NextResponse.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  return NextResponse.json({ usuario_id: usuarioId });
}
