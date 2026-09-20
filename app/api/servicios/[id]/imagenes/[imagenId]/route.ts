import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { obtenerUsuarioIdActual } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/servicios/:id/imagenes/:imagenId
 * Elimina una foto puntual del servicio. Solo el dueño del servicio.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imagenId: string } }
) {
  const usuarioId = await obtenerUsuarioIdActual(request);

  if (!usuarioId) {
    return NextResponse.json(
      { error: "Necesitás iniciar sesión." },
      { status: 401 }
    );
  }

  const sql = getDb();

  try {
    const [imagen] = (await sql`
      delete from imagenes_servicio
      using servicios_locales sl
      where imagenes_servicio.id = ${params.imagenId}
        and imagenes_servicio.servicio_id = ${params.id}
        and sl.id = imagenes_servicio.servicio_id
        and sl.usuario_id = ${usuarioId}
      returning imagenes_servicio.id
    `) as { id: string }[];

    if (!imagen) {
      return NextResponse.json(
        { error: "No se encontró la imagen o no pertenece al usuario." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No se pudo eliminar la imagen." },
      { status: 500 }
    );
  }
}
