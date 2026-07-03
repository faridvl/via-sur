import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let cliente: NeonQueryFunction<false, false> | null = null;

/**
 * Cliente SQL de Neon (HTTP, sin conexión TCP persistente — apto para
 * Route Handlers serverless). Se instancia de forma perezosa (recién en
 * el primer uso, no al importar el módulo) porque Next.js importa los
 * Route Handlers durante el build para recolectar metadata de las
 * páginas, momento en el que las variables de entorno del proyecto en
 * Vercel pueden no estar disponibles todavía.
 */
export function getDb(): NeonQueryFunction<false, false> {
  if (cliente) {
    return cliente;
  }

  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    throw new Error("Falta la variable de entorno DATABASE_URL");
  }

  cliente = neon(DATABASE_URL);

  return cliente;
}
