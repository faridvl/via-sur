import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  CategoriaServicio,
  CrearServicioPayload,
  ServicioLocal,
  TipoCobertura,
} from "@/types/viasur";

// Esta ruta depende de la base de datos en cada request (semilla diaria,
// query params); nunca debe prerenderizarse en build time.
export const dynamic = "force-dynamic";

const CATEGORIAS_VALIDAS = Object.values(CategoriaServicio);
const COBERTURAS_VALIDAS = Object.values(TipoCobertura);

/**
 * Calcula una semilla determinística para el día actual (UTC).
 * El mismo día siempre produce la misma semilla, por lo que el orden
 * "aleatorio" de la RPC se mantiene estable durante toda la jornada.
 */
function calcularSemillaDiaria(): number {
  const hoy = new Date();
  const yyyymmdd =
    hoy.getUTCFullYear() * 10000 +
    (hoy.getUTCMonth() + 1) * 100 +
    hoy.getUTCDate();

  // Acotado al rango de int4 de Postgres.
  return yyyymmdd % 2147483647;
}

/**
 * GET /api/servicios?localidad_id=1
 * Devuelve los servicios de una localidad para el día actual,
 * priorizando destacados y con orden aleatorio estable por día.
 */
export async function GET(request: NextRequest) {
  const localidadIdParam = request.nextUrl.searchParams.get("localidad_id");

  if (!localidadIdParam) {
    return NextResponse.json(
      { error: "El parámetro 'localidad_id' es requerido." },
      { status: 400 }
    );
  }

  const localidadId = Number(localidadIdParam);

  if (!Number.isInteger(localidadId) || localidadId <= 0) {
    return NextResponse.json(
      { error: "El parámetro 'localidad_id' debe ser un entero positivo." },
      { status: 400 }
    );
  }

  const seedValue = calcularSemillaDiaria();
  const sql = getDb();

  try {
    const servicios = (await sql`
      select *
      from obtener_servicios_por_dia(${seedValue}, ${localidadId})
    `) as ServicioLocal[];

    return NextResponse.json({ servicios });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron obtener los servicios." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/servicios
 * Registra un nuevo servicio local asociado a una localidad existente.
 */
export async function POST(request: NextRequest) {
  let body: CrearServicioPayload;

  try {
    body = (await request.json()) as CrearServicioPayload;
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud debe ser JSON válido." },
      { status: 400 }
    );
  }

  const {
    nombre_servicio,
    tipo_categoria,
    localidad_id,
    cobertura,
    direccion_exacta,
    whatsapp,
    descripcion,
    usuario_id,
  } = body;

  if (!nombre_servicio || typeof nombre_servicio !== "string") {
    return NextResponse.json(
      { error: "El campo 'nombre_servicio' es requerido." },
      { status: 400 }
    );
  }

  if (
    !tipo_categoria ||
    !CATEGORIAS_VALIDAS.includes(tipo_categoria as CategoriaServicio)
  ) {
    return NextResponse.json(
      { error: "El campo 'tipo_categoria' no es una categoría válida." },
      { status: 400 }
    );
  }

  if (!Number.isInteger(localidad_id) || localidad_id <= 0) {
    return NextResponse.json(
      { error: "El campo 'localidad_id' debe ser un entero positivo." },
      { status: 400 }
    );
  }

  if (!cobertura || !COBERTURAS_VALIDAS.includes(cobertura as TipoCobertura)) {
    return NextResponse.json(
      { error: "El campo 'cobertura' no es una cobertura válida." },
      { status: 400 }
    );
  }

  const sql = getDb();

  try {
    const [servicio] = (await sql`
      insert into servicios_locales (
        usuario_id, nombre_servicio, tipo_categoria, localidad_id,
        cobertura, direccion_exacta, whatsapp, descripcion
      ) values (
        ${usuario_id ?? null}, ${nombre_servicio}, ${tipo_categoria}, ${localidad_id},
        ${cobertura}, ${direccion_exacta ?? null}, ${whatsapp ?? null}, ${descripcion ?? null}
      )
      returning *
    `) as ServicioLocal[];

    return NextResponse.json({ servicio }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No se pudo registrar el servicio." },
      { status: 500 }
    );
  }
}
