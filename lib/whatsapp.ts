/**
 * Normaliza un número local (ej. "8888-8888") al formato E.164 sin el
 * signo "+" que espera wa.me, anteponiendo el código de país de Costa
 * Rica (506) si no viene incluido.
 */
export function normalizarWhatsapp(numero: string): string {
  const soloDigitos = numero.replace(/\D/g, "");

  if (soloDigitos.startsWith("506")) {
    return soloDigitos;
  }

  return `506${soloDigitos}`;
}
