import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { enviarEnlaceAcceso } from "@/lib/email";
import { ENLACE_ACCESO_DURACION_MS } from "@/types/viasur";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/solicitar-enlace
 * Recibe un email, genera un enlace de acceso de un solo uso y lo envía
 * por correo. Responde con éxito genérico exista o no el email, para no
 * filtrar qué correos están registrados.
 */
export async function POST(request: NextRequest) {
  let body: { email?: string };

  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud debe ser JSON válido." },
      { status: 400 }
    );
  }

  const email = body.email?.trim().toLowerCase();

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "Ingresá un correo electrónico válido." },
      { status: 400 }
    );
  }

  const sql = getDb();

  try {
    const expiraEn = new Date(Date.now() + ENLACE_ACCESO_DURACION_MS);

    const [enlace] = (await sql`
      insert into enlaces_acceso (email, expira_en)
      values (${email}, ${expiraEn.toISOString()})
      returning token
    `) as { token: string }[];

    const origen = request.nextUrl.origin;
    const url = `${origen}/api/auth/verificar?token=${enlace.token}`;

    await enviarEnlaceAcceso(email, url);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[solicitar-enlace]", error);
    return NextResponse.json(
      { error: "No se pudo enviar el enlace de acceso. Intentá de nuevo." },
      { status: 500 }
    );
  }
}
