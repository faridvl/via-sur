import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { obtenerUsuarioIdActual } from "@/lib/auth";

export const dynamic = "force-dynamic";

const TIPOS_VALIDOS = ["visita", "contacto", "llamada"] as const;
type TipoEvento = (typeof TIPOS_VALIDOS)[number];

/**
 * POST /api/servicios/:id/evento
 * Registra una interacción con la vista pública de un servicio (visita
 * al detalle, clic en WhatsApp, clic en llamar). No requiere sesión
 * (la mayoría de quienes visitan no están logueados), pero si el
 * request sí trae una sesión y coincide con el dueño del servicio, el
 * evento se descarta silenciosamente: no queremos que el dueño mirando
 * su propio negocio infle sus propias estadísticas.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: { tipo?: string };

  try {
    body = (await request.json()) as { tipo?: string };
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud debe ser JSON válido." },
      { status: 400 }
    );
  }

  const tipo = body.tipo;

  if (!tipo || !TIPOS_VALIDOS.includes(tipo as TipoEvento)) {
    return NextResponse.json(
      { error: "El campo 'tipo' debe ser 'visita', 'contacto' o 'llamada'." },
      { status: 400 }
    );
  }

  const sql = getDb();

  try {
    const usuarioId = await obtenerUsuarioIdActual(request);

    if (usuarioId) {
      const [servicio] = (await sql`
        select usuario_id from servicios_locales where id = ${params.id}
      `) as { usuario_id: string | null }[];

      if (servicio?.usuario_id === usuarioId) {
        return NextResponse.json({ ok: true, descartado: true });
      }
    }

    await sql`
      insert into eventos_servicio (servicio_id, tipo_evento)
      values (${params.id}, ${tipo})
    `;

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No se encontró el servicio." },
      { status: 404 }
    );
  }
}
