import { parseISO } from "date-fns";

// Colunas DATE (nascimento, data do pedido, validade...) não têm hora nem fuso.
// new Date("2026-11-10") interpreta como meia-noite UTC, que no Brasil vira 09/11 às 21h:
// a tela mostrava um dia antes e os formulários gravavam a data errada.
// Aqui a data é lida no fuso local, sempre no dia certo.
export function parseDateOnly(value: string | number | Date | null | undefined): Date {
  return parseISO(String(value ?? "").slice(0, 10));
}

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const hojeLocal = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const valido = (d: Date) => !Number.isNaN(d.getTime());

// Partes para o bloco de data dos cartões (ex.: 23 / nov).
export function dateTile(value?: string | null) {
  const d = parseDateOnly(value);
  return valido(d) ? { dia: String(d.getDate()).padStart(2, "0"), mes: MESES[d.getMonth()] } : { dia: "--", mes: "" };
}

export const brDate = (value?: string | null) => {
  const d = parseDateOnly(value);
  return valido(d) ? `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}` : "";
};

const hm = (value?: string | null) => (value ? String(value).slice(0, 5) : "");

// "Dom · 19:00 – 21:00" ou, se durar mais de um dia, "28/11 22:00 → 29/11 05:00".
export function whenShort(di?: string | null, hi?: string | null, df?: string | null, hf?: string | null) {
  const ini = parseDateOnly(di);
  if (!valido(ini)) return "Data a definir";
  const curto = (v?: string | null) => brDate(v).slice(0, 5);
  if (df && df.slice(0, 10) !== String(di).slice(0, 10)) return `${curto(di)} ${hm(hi)} → ${curto(df)} ${hm(hf)}`.trim();
  return `${DIAS[ini.getDay()]} · ${hm(hi)}${hf ? ` – ${hm(hf)}` : ""}`;
}

// "Dom, 23/11 · 19:00 – 21:00" para a tela de detalhes.
export function whenLong(di?: string | null, hi?: string | null, df?: string | null, hf?: string | null) {
  const ini = parseDateOnly(di);
  if (!valido(ini)) return "Data a definir";
  if (df && df.slice(0, 10) !== String(di).slice(0, 10)) return whenShort(di, hi, df, hf);
  return `${DIAS[ini.getDay()]}, ${brDate(di).slice(0, 5)} · ${hm(hi)}${hf ? ` – ${hm(hf)}` : ""}`;
}

// Quanto falta: "Hoje", "Amanhã", "Em 6 dias", "Acontecendo" ou "Encerrado".
export function untilLabel(di?: string | null, df?: string | null) {
  const ini = parseDateOnly(di);
  if (!valido(ini)) return "";
  const fim = valido(parseDateOnly(df)) ? parseDateOnly(df) : ini;
  const hoje = hojeLocal();
  const n = Math.round((ini.getTime() - hoje.getTime()) / 864e5);
  if (fim.getTime() < hoje.getTime()) return "Encerrado";
  if (n < 0) return "Acontecendo";
  return n === 0 ? "Hoje" : n === 1 ? "Amanhã" : `Em ${n} dias`;
}

// "Publicado hoje", "Publicado há 7 dias".
export function agoLabel(value?: string | null) {
  const d = new Date(String(value ?? ""));
  if (!valido(d)) return "";
  const n = Math.floor((hojeLocal().getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 864e5);
  return n <= 0 ? "Publicado hoje" : n === 1 ? "Publicado ontem" : `Publicado há ${n} dias`;
}

// Aniversário a partir da data de nascimento: "14/03 · 36 anos" e se é neste mês.
export function birthday(value?: string | null) {
  const d = parseDateOnly(value);
  if (!valido(d)) return { texto: "—", mes: false, chave: 9999 };
  const hoje = new Date();
  let idade = hoje.getFullYear() - d.getFullYear();
  if (hoje.getMonth() < d.getMonth() || (hoje.getMonth() === d.getMonth() && hoje.getDate() < d.getDate())) idade--;
  const ddmm = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  return { texto: `${ddmm} · ${idade} anos`, ddmm, mes: d.getMonth() === hoje.getMonth(), chave: d.getMonth() * 100 + d.getDate() };
}
