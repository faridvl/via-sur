import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { enviarEnlaceAcceso } from "@/lib/email";
import { ENLACE_ACCESO_DURACION_MS } from "@/types/viasur";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Genera un código numérico de 6 dígitos (con ceros a la izquierda) para
 * ingresarlo a mano en la PWA. El link del correo abre el navegador del
 * sistema, no la app instalada, así que el código es el camino confiable
 * en celular; el link se mantiene como alternativa para desktop.
 */
function generarCodigo(): string {
  return Math.floor(Math.random() * 1_000_000).toString().padStart(6, "0");
}

/**
 * POST /api/auth/solicitar-enlace
 * Recibe un email, genera un enlace de acceso de un solo uso (con su link y
 * su código de 6 dígitos) y lo envía por correo. Responde con éxito
 * genérico exista o no el email, para no filtrar qué correos están
 * registrados.
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
    const codigo = generarCodigo();

    const [enlace] = (await sql`
      insert into enlaces_acceso (email, codigo, expira_en)
      values (${email}, ${codigo}, ${expiraEn.toISOString()})
      returning token
    `) as { token: string }[];

    const origen = request.nextUrl.origin;
    const url = `${origen}/api/auth/verificar?token=${enlace.token}`;

    await enviarEnlaceAcceso(email, url, codigo);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[solicitar-enlace]", error);
    return NextResponse.json(
      { error: "No se pudo enviar el enlace de acceso. Intentá de nuevo." },
      { status: 500 }
    );
  }
}
