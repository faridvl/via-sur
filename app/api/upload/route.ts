import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { obtenerUsuarioIdActual } from "@/lib/auth";

export const dynamic = "force-dynamic";

const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/upload
 * Sube la imagen de un servicio a Vercel Blob y devuelve su URL
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

  try {
    const blob = await put(
      `servicios/${usuarioId}-${Date.now()}-${archivo.name}`,
      archivo,
      { access: "public", addRandomSuffix: true }
    );

    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No se pudo subir la imagen." },
      { status: 500 }
    );
  }
}
