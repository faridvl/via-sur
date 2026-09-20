import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { obtenerUsuarioIdActual } from "@/lib/auth";
import { ImagenServicio } from "@/types/viasur";

export const dynamic = "force-dynamic";

/**
 * GET /api/servicios/:id/imagenes
 * Lista las fotos de un servicio, ordenadas (la primera es la portada).
 * Pública: se usa también en la vista de detalle del negocio.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sql = getDb();

  try {
    const imagenes = (await sql`
      select * from imagenes_servicio
      where servicio_id = ${params.id}
      order by orden asc
    `) as ImagenServicio[];

    return NextResponse.json({ imagenes });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron obtener las imágenes." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/servicios/:id/imagenes
 * Agrega una foto al servicio (la URL ya debe existir en Vercel Blob,
 * subida antes vía POST /api/upload). Solo el dueño del servicio.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const usuarioId = await obtenerUsuarioIdActual(request);

  if (!usuarioId) {
    return NextResponse.json(
      { error: "Necesitás iniciar sesión." },
      { status: 401 }
    );
  }

  let body: { url?: string };

  try {
    body = (await request.json()) as { url?: string };
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud debe ser JSON válido." },
      { status: 400 }
    );
  }

  if (!body.url || typeof body.url !== "string") {
    return NextResponse.json(
      { error: "El campo 'url' es requerido." },
      { status: 400 }
    );
  }

  const sql = getDb();

  try {
    const [propio] = (await sql`
      select id from servicios_locales
      where id = ${params.id} and usuario_id = ${usuarioId}
    `) as { id: string }[];

    if (!propio) {
      return NextResponse.json(
        { error: "No se encontró el servicio o no pertenece al usuario." },
        { status: 404 }
      );
    }

    const [{ siguiente }] = (await sql`
      select coalesce(max(orden) + 1, 0) as siguiente
      from imagenes_servicio
      where servicio_id = ${params.id}
    `) as { siguiente: number }[];

    const [imagen] = (await sql`
      insert into imagenes_servicio (servicio_id, url, orden)
      values (${params.id}, ${body.url}, ${siguiente})
      returning *
    `) as ImagenServicio[];

    return NextResponse.json({ imagen }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No se pudo agregar la imagen." },
      { status: 500 }
    );
  }
}
