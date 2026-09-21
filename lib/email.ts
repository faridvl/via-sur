/**
 * Envío de correo transaccional (magic link de inicio de sesión).
 * Usa Resend (https://resend.com) — tier gratuito de 3,000 correos/mes.
 * Requiere la variable de entorno RESEND_API_KEY.
 */

const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Remitente del correo. Debe ser un dominio verificado en Resend; mientras
 * no se verifique un dominio propio, Resend permite enviar solo desde
 * "onboarding@resend.dev" (válido para pruebas, no para producción real).
 */
const REMITENTE = process.env.RESEND_FROM_EMAIL ?? "TicoRed <onboarding@resend.dev>";

export async function enviarEnlaceAcceso(
  email: string,
  enlace: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Falta la variable de entorno RESEND_API_KEY");
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: REMITENTE,
      to: email,
      subject: "Tu enlace de acceso a TicoRed",
      html: `
        <p>Hacé clic en el siguiente enlace para iniciar sesión en TicoRed:</p>
        <p><a href="${enlace}">${enlace}</a></p>
        <p>Este enlace vence en 15 minutos. Si no solicitaste este acceso, podés ignorar este correo.</p>
      `,
    }),
  });

  if (!res.ok) {
    const detalle = await res.text().catch(() => "");
    throw new Error(
      `No se pudo enviar el correo con el enlace de acceso. Resend respondió ${res.status}: ${detalle}`
    );
  }
}
