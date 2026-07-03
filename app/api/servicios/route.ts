import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { CrearServicioPayload, ServicioLocal, TipoCobertura } from "@/types/viasur";

// Esta ruta depende de la base de datos en cada request (semilla diaria,
// query params); nunca debe prerenderizarse en build time.
export const dynamic = "force-dynamic";

const COBERTURAS_VALIDAS = Object.values(TipoCobertura);

/**
 * Calcula una semilla determinística para el día actual (UTC), en
 * formato AAAAMMDD.
 * El mismo día siempre produce la misma semilla, por lo que el orden
 * "aleatorio" de la RPC se mantiene estable durante toda la jornada.
 */
function calcularSemillaDiaria(): number {
  const hoy = new Date();
  const yyyymmdd =
    hoy.getUTCFullYear() * 10000 +
    (hoy.getUTCMonth() + 1) * 100 +
    hoy.getUTCDate();

  return yyyymmdd;
}

/**
 * GET /api/servicios?localidad_id=1&categoria_id=2
 * Devuelve los servicios de una localidad (y opcionalmente una categoría)
 * para el día actual, priorizando destacados y con orden aleatorio
 * estable por día.
 *
 * GET /api/servicios?usuario_id=uuid
 * Devuelve los servicios registrados por un usuario puntual (usado por el
 * panel "Mis Servicios" para detectar si ya tiene un negocio publicado).
 * Ignora localidad_id/categoria_id si usuario_id está presente.
 */
export async function GET(request: NextRequest) {
  const usuarioIdParam = request.nextUrl.searchParams.get("usuario_id");
  const sql = getDb();

  if (usuarioIdParam) {
    try {
      const servicios = (await sql`
        select *
        from servicios_locales
        where usuario_id = ${usuarioIdParam}
        order by created_at desc
      `) as ServicioLocal[];

      return NextResponse.json({ servicios });
    } catch {
      return NextResponse.json(
        { error: "No se pudieron obtener los servicios del usuario." },
        { status: 500 }
      );
    }
  }

  const localidadIdParam = request.nextUrl.searchParams.get("localidad_id");
  const categoriaIdParam = request.nextUrl.searchParams.get("categoria_id");

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

  let categoriaId: number | null = null;

  if (categoriaIdParam) {
    categoriaId = Number(categoriaIdParam);

    if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
      return NextResponse.json(
        { error: "El parámetro 'categoria_id' debe ser un entero positivo." },
        { status: 400 }
      );
    }
  }

  const seedValue = calcularSemillaDiaria();

  try {
    const servicios = (await sql`
      select *
      from obtener_servicios_por_dia(${seedValue}, ${localidadId}, ${categoriaId})
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
 * Registra un nuevo servicio local asociado a una localidad y categoría
 * existentes.
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
    categoria_id,
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

  if (!Number.isInteger(categoria_id) || categoria_id <= 0) {
    return NextResponse.json(
      { error: "El campo 'categoria_id' debe ser un entero positivo." },
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
        usuario_id, nombre_servicio, categoria_id, localidad_id,
        cobertura, direccion_exacta, whatsapp, descripcion
      ) values (
        ${usuario_id ?? null}, ${nombre_servicio}, ${categoria_id}, ${localidad_id},
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

/**
 * PATCH /api/servicios
 * Edita un servicio existente. Requiere 'id' en el body; solo el
 * propietario ('usuario_id') puede editar su servicio.
 */
export async function PATCH(request: NextRequest) {
  let body: CrearServicioPayload & { id?: string };

  try {
    body = (await request.json()) as CrearServicioPayload & { id?: string };
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud debe ser JSON válido." },
      { status: 400 }
    );
  }

  const {
    id,
    nombre_servicio,
    categoria_id,
    localidad_id,
    cobertura,
    direccion_exacta,
    whatsapp,
    descripcion,
    usuario_id,
  } = body;

  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { error: "El campo 'id' es requerido." },
      { status: 400 }
    );
  }

  if (!usuario_id || typeof usuario_id !== "string") {
    return NextResponse.json(
      { error: "El campo 'usuario_id' es requerido." },
      { status: 400 }
    );
  }

  if (!nombre_servicio || typeof nombre_servicio !== "string") {
    return NextResponse.json(
      { error: "El campo 'nombre_servicio' es requerido." },
      { status: 400 }
    );
  }

  if (!Number.isInteger(categoria_id) || categoria_id <= 0) {
    return NextResponse.json(
      { error: "El campo 'categoria_id' debe ser un entero positivo." },
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
      update servicios_locales
      set nombre_servicio  = ${nombre_servicio},
          categoria_id     = ${categoria_id},
          localidad_id     = ${localidad_id},
          cobertura        = ${cobertura},
          direccion_exacta = ${direccion_exacta ?? null},
          whatsapp         = ${whatsapp ?? null},
          descripcion      = ${descripcion ?? null}
      where id = ${id} and usuario_id = ${usuario_id}
      returning *
    `) as ServicioLocal[];

    if (!servicio) {
      return NextResponse.json(
        { error: "No se encontró el servicio o no pertenece al usuario." },
        { status: 404 }
      );
    }

    return NextResponse.json({ servicio });
  } catch {
    return NextResponse.json(
      { error: "No se pudo actualizar el servicio." },
      { status: 500 }
    );
  }
}
