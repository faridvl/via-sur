import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { COOKIE_SESION, SESION_DURACION_MS } from "@/types/viasur";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/verificar?token=uuid
 * Consume un enlace de acceso: si es válido y no expiró, busca o crea el
 * usuario por email, abre una sesión (cookie httpOnly) y redirige a
 * /mis-servicios. Si el enlace no es válido, redirige a /iniciar-sesion
 * con un error.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const origen = request.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(
      `${origen}/iniciar-sesion?error=enlace-invalido`
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
        `${origen}/iniciar-sesion?error=enlace-invalido`
      );
    }

    let [usuario] = (await sql`
      select id from usuarios where email = ${enlace.email}
    `) as { id: string }[];

    if (!usuario) {
      [usuario] = (await sql`
        insert into usuarios (email)
        values (${enlace.email})
        returning id
      `) as { id: string }[];
    }

    const expiraEn = new Date(Date.now() + SESION_DURACION_MS);

    const [sesion] = (await sql`
      insert into sesiones (usuario_id, expira_en)
      values (${usuario.id}, ${expiraEn.toISOString()})
      returning token
    `) as { token: string }[];

    const respuesta = NextResponse.redirect(`${origen}/mis-servicios`);

    respuesta.cookies.set(COOKIE_SESION, sesion.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiraEn,
    });

    return respuesta;
  } catch {
    return NextResponse.redirect(
      `${origen}/iniciar-sesion?error=enlace-invalido`
    );
  }
}
