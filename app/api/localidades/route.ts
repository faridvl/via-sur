import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import type { Localidad } from "@/types/viasur";

/**
 * GET /api/localidades
 * Devuelve las localidades activas, ordenadas alfabéticamente.
 */
export async function GET() {
  const { data, error } = await supabaseServer
    .from("localidades")
    .select("id, nombre, activa")
    .eq("activa", true)
    .order("nombre", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "No se pudieron obtener las localidades." },
      { status: 500 }
    );
  }

  return NextResponse.json({ localidades: data as Localidad[] });
}
