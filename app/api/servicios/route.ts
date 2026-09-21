import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { obtenerUsuarioIdActual } from "@/lib/auth";
import {
  CrearServicioPayload,
  EstadisticasServicio,
  ImagenServicio,
  ServicioLocal,
  TipoCobertura,
} from "@/types/viasur";

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
 * GET /api/servicios?usuario_id=1 (cualquier valor no vacío)
 * Devuelve los servicios del usuario de la sesión activa (usado por el
 * panel "Mis Servicios" para detectar si ya tiene un negocio publicado).
 * El valor del parámetro se ignora: el usuario siempre se resuelve desde
 * la cookie de sesión, nunca desde el query param, para que no se puedan
 * consultar los servicios de otro usuario.
 * Ignora localidad_id/categoria_id si usuario_id está presente.
 */
export async function GET(request: NextRequest) {
  const usuarioIdParam = request.nextUrl.searchParams.get("usuario_id");
  const sql = getDb();

  if (usuarioIdParam) {
    const usuarioId = await obtenerUsuarioIdActual(request);

    if (!usuarioId) {
      return NextResponse.json(
        { error: "Necesitás iniciar sesión." },
        { status: 401 }
      );
    }

    try {
      const filas = (await sql`
        select
          sl.*,
          coalesce(count(*) filter (where ev.tipo_evento = 'visita'), 0)::int as visitas,
          coalesce(count(*) filter (where ev.tipo_evento = 'contacto'), 0)::int as contactos,
          coalesce(count(*) filter (where ev.tipo_evento = 'llamada'), 0)::int as llamadas
        from servicios_locales sl
        left join eventos_servicio ev on ev.servicio_id = sl.id
        where sl.usuario_id = ${usuarioId}
        group by sl.id
        order by sl.created_at desc
      `) as (ServicioLocal & EstadisticasServicio)[];

      const servicios = filas.map(
        ({ visitas, contactos, llamadas, ...servicio }) => servicio
      );
      const estadisticas: Record<string, EstadisticasServicio> =
        Object.fromEntries(
          filas.map((f) => [
            f.id,
            { visitas: f.visitas, contactos: f.contactos, llamadas: f.llamadas },
          ])
        );

      const imagenes: Record<string, ImagenServicio[]> = {};

      if (servicios.length > 0) {
        const ids = servicios.map((s) => s.id);
        const filasImagenes = (await sql`
          select *
          from imagenes_servicio
          where servicio_id = any(${ids})
          order by servicio_id, orden asc
        `) as ImagenServicio[];

        for (const img of filasImagenes) {
          (imagenes[img.servicio_id] ??= []).push(img);
        }
      }

      return NextResponse.json({ servicios, estadisticas, imagenes });
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

    const imagenes: Record<string, ImagenServicio[]> = {};

    if (servicios.length > 0) {
      const ids = servicios.map((s) => s.id);
      const filasImagenes = (await sql`
        select *
        from imagenes_servicio
        where servicio_id = any(${ids})
        order by servicio_id, orden asc
      `) as ImagenServicio[];

      for (const img of filasImagenes) {
        (imagenes[img.servicio_id] ??= []).push(img);
      }
    }

    return NextResponse.json({ servicios, imagenes });
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
  const usuarioId = await obtenerUsuarioIdActual(request);

  if (!usuarioId) {
    return NextResponse.json(
      { error: "Necesitás iniciar sesión para registrar un servicio." },
      { status: 401 }
    );
  }

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
    nombre_contacto,
    telefono_alternativo,
    descripcion,
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
        cobertura, direccion_exacta, whatsapp, nombre_contacto,
        telefono_alternativo, descripcion
      ) values (
        ${usuarioId}, ${nombre_servicio}, ${categoria_id}, ${localidad_id},
        ${cobertura}, ${direccion_exacta ?? null}, ${whatsapp ?? null}, ${nombre_contacto ?? null},
        ${telefono_alternativo ?? null}, ${descripcion ?? null}
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
  const usuarioId = await obtenerUsuarioIdActual(request);

  if (!usuarioId) {
    return NextResponse.json(
      { error: "Necesitás iniciar sesión para editar un servicio." },
      { status: 401 }
    );
  }

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
    nombre_contacto,
    telefono_alternativo,
    descripcion,
  } = body;

  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { error: "El campo 'id' es requerido." },
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
      set nombre_servicio      = ${nombre_servicio},
          categoria_id         = ${categoria_id},
          localidad_id         = ${localidad_id},
          cobertura            = ${cobertura},
          direccion_exacta     = ${direccion_exacta ?? null},
          whatsapp             = ${whatsapp ?? null},
          nombre_contacto      = ${nombre_contacto ?? null},
          telefono_alternativo = ${telefono_alternativo ?? null},
          descripcion          = ${descripcion ?? null}
      where id = ${id} and usuario_id = ${usuarioId}
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

/**
 * DELETE /api/servicios
 * Elimina un servicio propio. Requiere 'id' en el body; solo el
 * propietario ('usuario_id' de la sesión) puede eliminar su servicio.
 */
export async function DELETE(request: NextRequest) {
  const usuarioId = await obtenerUsuarioIdActual(request);

  if (!usuarioId) {
    return NextResponse.json(
      { error: "Necesitás iniciar sesión para eliminar un servicio." },
      { status: 401 }
    );
  }

  let body: { id?: string };

  try {
    body = (await request.json()) as { id?: string };
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud debe ser JSON válido." },
      { status: 400 }
    );
  }

  const { id } = body;

  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { error: "El campo 'id' es requerido." },
      { status: 400 }
    );
  }

  const sql = getDb();

  try {
    const [servicio] = (await sql`
      delete from servicios_locales
      where id = ${id} and usuario_id = ${usuarioId}
      returning id
    `) as { id: string }[];

    if (!servicio) {
      return NextResponse.json(
        { error: "No se encontró el servicio o no pertenece al usuario." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No se pudo eliminar el servicio." },
      { status: 500 }
    );
  }
}
