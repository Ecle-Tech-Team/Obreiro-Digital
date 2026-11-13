// O celular é guardado só com dígitos (DDD + número). Aqui só formatamos para exibir e digitar.
export function formatPhone(value: string | number | null | undefined): string {
  let digits = String(value ?? "").replace(/\D/g, "");
  let prefix = "";
  if (digits.length > 11 && digits.startsWith("55")) {
    prefix = "+55 ";
    digits = digits.slice(2);
  }
  digits = digits.slice(0, 11);
  if (digits.length <= 2) return prefix + digits;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  // Celular tem 9 dígitos após o DDD; fixo tem 8.
  const split = rest.length > 8 ? 5 : 4;
  const tail = rest.length > split ? `-${rest.slice(split)}` : "";
  return `${prefix}(${ddd}) ${rest.slice(0, split)}${tail}`;
}

export function isValidPhone(value: string): boolean {
  return /^(?:55)?\d{10,11}$/.test(value.replace(/\D/g, ""));
}

// Para exibir: números antigos fora do padrão (sem DDD) aparecem como foram gravados.
export function displayPhone(value: string | number | null | undefined): string {
  const raw = String(value ?? "");
  return isValidPhone(raw) ? formatPhone(raw) : raw;
}
