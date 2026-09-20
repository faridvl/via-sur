type TipoEvento = "visita" | "contacto" | "llamada";

/**
 * Registra una interacción con un servicio (visita al detalle, clic en
 * WhatsApp/llamar) sin bloquear la navegación del usuario. Usa
 * sendBeacon cuando está disponible porque el clic en WhatsApp/llamar
 * navega fuera de la página (wa.me/tel:) antes de que un fetch normal
 * pueda completarse.
 */
export function registrarEvento(servicioId: string, tipo: TipoEvento): void {
  const body = JSON.stringify({ tipo });
  const url = `/api/servicios/${servicioId}/evento`;

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    return;
  }

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}
