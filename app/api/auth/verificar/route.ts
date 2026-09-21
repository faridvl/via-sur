import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { crearSesionParaEmail } from "@/lib/auth";
import { COOKIE_SESION } from "@/types/viasur";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/verificar?token=uuid
 * Consume un enlace de acceso por su link (alternativa a escribir el
 * código de 6 dígitos, ver /api/auth/verificar-codigo). Útil en desktop;
 * en celular el link abre el navegador del sistema, no la PWA instalada,
 * por eso redirige a /login/listo en vez de directo a /mis-servicios.
 * Si el enlace no es válido, redirige a /login con un error.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const origen = request.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(
      `${origen}/login?error=enlace-invalido`
    );
  }

  const sql = getDb();

  try {
    const [enlace] = (await sql`
      update enlaces_acceso
      set usado = true
      where token = ${token} and usado = false and expira_en > now()
      returning email
    `) as { email: string }[];

    if (!enlace) {
      return NextResponse.redirect(
        `${origen}/login?error=enlace-invalido`
      );
    }

    const { token: sesionToken, expiraEn } = await crearSesionParaEmail(
      enlace.email
    );

    const respuesta = NextResponse.redirect(`${origen}/login/listo`);

    respuesta.cookies.set(COOKIE_SESION, sesionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiraEn,
    });

    return respuesta;
  } catch {
    return NextResponse.redirect(
      `${origen}/login?error=enlace-invalido`
    );
  }
}
