import { randomUUID } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { obtenerUsuarioIdActual } from "@/lib/auth";

export const dynamic = "force-dynamic";

const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5MB

let clienteR2: S3Client | null = null;

/**
 * Cliente S3 apuntando a Cloudflare R2 (API compatible con S3). Perezoso
 * por el mismo motivo que `lib/db.ts`: las variables de entorno de
 * Vercel pueden no estar disponibles cuando Next.js importa los Route
 * Handlers durante el build.
 */
function obtenerClienteR2(): S3Client {
  if (clienteR2) {
    return clienteR2;
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Faltan las variables de entorno de Cloudflare R2.");
  }

  clienteR2 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  return clienteR2;
}

/**
 * POST /api/upload
 * Sube la imagen de un servicio a Cloudflare R2 y devuelve su URL
 * pública. Requiere sesión activa: solo el dueño de un negocio puede
 * subir su propia foto.
 */
export async function POST(request: NextRequest) {
  const usuarioId = await obtenerUsuarioIdActual(request);

  if (!usuarioId) {
    return NextResponse.json(
      { error: "Necesitás iniciar sesión para subir una imagen." },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const archivo = formData.get("file");

  if (!(archivo instanceof File)) {
    return NextResponse.json(
      { error: "El campo 'file' es requerido." },
      { status: 400 }
    );
  }

  if (!archivo.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "El archivo debe ser una imagen." },
      { status: 400 }
    );
  }

  if (archivo.size > TAMANO_MAXIMO_BYTES) {
    return NextResponse.json(
      { error: "La imagen no puede superar los 5MB." },
      { status: 400 }
    );
  }

  const bucket = process.env.R2_BUCKET_NAME;
  const urlPublica = process.env.R2_PUBLIC_URL;

  if (!bucket || !urlPublica) {
    return NextResponse.json(
      { error: "El almacenamiento de imágenes no está configurado." },
      { status: 500 }
    );
  }

  const extension = archivo.name.includes(".")
    ? archivo.name.slice(archivo.name.lastIndexOf("."))
    : "";
  const clave = `servicios/${usuarioId}-${Date.now()}-${randomUUID()}${extension}`;

  try {
    const bytes = new Uint8Array(await archivo.arrayBuffer());

    await obtenerClienteR2().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: clave,
        Body: bytes,
        ContentType: archivo.type,
      })
    );

    return NextResponse.json(
      { url: `${urlPublica.replace(/\/$/, "")}/${clave}` },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo subir la imagen." },
      { status: 500 }
    );
  }
}
