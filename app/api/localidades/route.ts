import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { Localidad } from "@/types/viasur";

// Sin esto, Next.js intenta prerenderizar esta ruta en build time (no lee
// request ni cookies, así que no hay señal automática de que es dinámica),
// y falla porque DATABASE_URL todavía no existe en ese momento del build.
export const dynamic = "force-dynamic";

/**
 * GET /api/localidades
 * Devuelve las localidades activas, ordenadas alfabéticamente.
 */
export async function GET() {
  const sql = getDb();

  try {
    const localidades = (await sql`
      select id, nombre, activa
      from localidades
      where activa = true
      order by nombre asc
    `) as Localidad[];

    return NextResponse.json({ localidades });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron obtener las localidades." },
      { status: 500 }
    );
  }
}
