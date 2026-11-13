import { parseISO } from "date-fns";

// Colunas DATE (nascimento, data do pedido, validade...) não têm hora nem fuso.
// new Date("2026-11-10") interpreta como meia-noite UTC, que no Brasil vira 09/11 às 21h:
// a tela mostrava um dia antes e os formulários gravavam a data errada.
// Aqui a data é lida no fuso local, sempre no dia certo.
export function parseDateOnly(value: string | number | Date | null | undefined): Date {
  return parseISO(String(value ?? "").slice(0, 10));
}
