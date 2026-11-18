// Valores em centavos (BigInt) para somar sem erro de arredondamento.
// A API recebe e devolve valores como "1234.56".

export function cents(value: string | number | null | undefined): bigint {
  const texto = String(value ?? "").trim();
  const m = texto.match(/^(-?)(\d+)(?:\.(\d{1,2}))?$/);
  if (!m) return 0n;
  const v = BigInt(m[2]) * 100n + BigInt((m[3] || "").padEnd(2, "0") || "0");
  return m[1] ? -v : v;
}

// R$ 1.234,56 (sinal opcional: "+ R$" / "− R$").
export function brl(value: bigint, sinal = false): string {
  const abs = value < 0n ? -value : value;
  const reais = (abs / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const texto = `R$ ${reais},${(abs % 100n).toString().padStart(2, "0")}`;
  if (sinal) return `${value < 0n ? "− " : "+ "}${texto}`;
  return value < 0n ? `− ${texto}` : texto;
}

// "R$ 1.234,56" / "1234,56" / "1234.56" → "1234.56"; vazio se inválido.
export function toApiValue(input: string): string {
  let t = String(input).replace(/[^\d.,]/g, "");
  if (!t) return "";
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  else if ((t.match(/\./g) || []).length > 1) t = t.replace(/\.(?=.*\.)/g, "");
  return /^\d+(\.\d{1,2})?$/.test(t) && Number(t) > 0 ? t : "";
}

// Para o campo de valor no formulário: "1234.5" → "1.234,50".
export function toInputValue(api: string | number | null | undefined): string {
  const c = cents(api);
  return c === 0n ? "" : brl(c).replace("R$ ", "");
}
