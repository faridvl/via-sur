import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { crearSesionParaEmail } from "@/lib/auth";
import { COOKIE_SESION } from "@/types/viasur";

export const dynamic = "force-dynamic";

const CODIGO_REGEX = /^\d{6}$/;

/**
 * POST /api/auth/verificar-codigo
 * Consume un enlace de acceso por su código de 6 dígitos, escrito a mano
 * dentro de la PWA. Existe porque el link del mismo correo abre el
 * navegador del sistema, no la app instalada: el código es el camino que
 * no depende de qué aplicación intercepta el link.
 */
export async function POST(request: NextRequest) {
  let body: { email?: string; codigo?: string };

  try {
    body = (await request.json()) as { email?: string; codigo?: string };
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud debe ser JSON válido." },
      { status: 400 }
    );
  }

  const email = body.email?.trim().toLowerCase();
  const codigo = body.codigo?.trim();

  if (!email || !codigo || !CODIGO_REGEX.test(codigo)) {
    return NextResponse.json(
      { error: "Ingresá el código de 6 dígitos que te enviamos." },
      { status: 400 }
    );
  }

  const sql = getDb();

  try {
    const [enlace] = (await sql`
      update enlaces_acceso
      set usado = true
      where email = ${email}
        and codigo = ${codigo}
        and usado = false
        and expira_en > now()
      returning email
    `) as { email: string }[];

    if (!enlace) {
      return NextResponse.json(
        { error: "Ese código no es válido o venció. Solicitá uno nuevo." },
        { status: 400 }
      );
    }

    const { token: sesionToken, expiraEn } = await crearSesionParaEmail(
      enlace.email
    );

    const respuesta = NextResponse.json({ ok: true });

    respuesta.cookies.set(COOKIE_SESION, sesionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiraEn,
    });

    return respuesta;
  } catch (error) {
    console.error("[verificar-codigo]", error);
    return NextResponse.json(
      { error: "No se pudo verificar el código. Intentá de nuevo." },
      { status: 500 }
    );
  }
}
