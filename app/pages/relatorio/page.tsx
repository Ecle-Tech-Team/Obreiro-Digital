"use client";

import { useEffect, useMemo, useState } from "react";
import MenuLateral from "@/app/components/menuLateral/menuLateral";
import api from "@/app/api/api";

type Entry = { id_financas: number; tipo: "Entrada" | "Saída"; categoria: string; valor: string; data: string };

function cents(value: string): bigint {
  const match = String(value).match(/^(\d+)\.(\d{2})$/);
  return match ? BigInt(match[1]) * 100n + BigInt(match[2]) : 0n;
}

function currency(value: bigint): string {
  const absolute = value < 0n ? -value : value;
  return `${value < 0n ? "−" : ""}R$ ${(absolute / 100n).toLocaleString("pt-BR")},${(absolute % 100n).toString().padStart(2, "0")}`;
}

export default function Relatorio() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const user = await api.get("/cadastro");
        const result = await api.get(`/financas/${user.data.id_igreja}`);
        if (active) setEntries(result.data);
      } catch {
        if (active) setError("Não foi possível carregar o relatório. Confira seu acesso às finanças.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => entries.filter(entry => {
    const day = String(entry.data).slice(0, 10);
    return (!from || day >= from) && (!to || day <= to);
  }), [entries, from, to]);
  const summary = useMemo(() => {
    let income = 0n;
    let expense = 0n;
    const categories = new Map<string, { income: bigint; expense: bigint }>();
    for (const entry of filtered) {
      const amount = cents(entry.valor);
      const category = categories.get(entry.categoria) || { income: 0n, expense: 0n };
      if (entry.tipo === "Entrada") { income += amount; category.income += amount; }
      if (entry.tipo === "Saída") { expense += amount; category.expense += amount; }
      categories.set(entry.categoria, category);
    }
    return { income, expense, categories: [...categories.entries()].sort(([a], [b]) => a.localeCompare(b, "pt-BR")) };
  }, [filtered]);

  return (
    <div className="min-h-screen bg-fundo lg:pl-64">
      <MenuLateral />
      <main className="app-content mx-auto max-w-7xl">
        <h1 className="text1 text-3xl font-bold text-gray-900">Relatório financeiro</h1>
        <p className="mt-2 text2 text-gray-700">Resumo dos lançamentos da sua igreja no período selecionado.</p>
        <div className="mt-6 flex flex-wrap gap-4">
          <label className="text2 text-gray-800">De <input type="date" value={from} onChange={event => setFrom(event.target.value)} className="ml-2 rounded border border-gray-400 bg-white p-2" /></label>
          <label className="text2 text-gray-800">Até <input type="date" value={to} onChange={event => setTo(event.target.value)} className="ml-2 rounded border border-gray-400 bg-white p-2" /></label>
        </div>
        {loading && <p role="status" className="mt-6">Carregando relatório…</p>}
        {error && <p role="alert" className="mt-6 text-red-700">{error}</p>}
        {!loading && !error && (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-5 shadow"><h2 className="text2 text-gray-600">Entradas</h2><p className="mt-2 text-2xl font-bold text-verde">{currency(summary.income)}</p></div>
              <div className="rounded-xl bg-white p-5 shadow"><h2 className="text2 text-gray-600">Saídas</h2><p className="mt-2 text-2xl font-bold text-vermelho">{currency(summary.expense)}</p></div>
              <div className="rounded-xl bg-white p-5 shadow"><h2 className="text2 text-gray-600">Resultado do período</h2><p className="mt-2 text-2xl font-bold text-azul">{currency(summary.income - summary.expense)}</p></div>
            </div>
            <section className="mt-6 overflow-x-auto rounded-xl bg-white p-5 shadow">
              <h2 className="text1 text-xl font-bold text-gray-900">Por categoria</h2>
              {summary.categories.length === 0 ? <p className="mt-4 text-gray-700">Nenhum lançamento no período.</p> : (
                <table className="mt-4 w-full text-left text2">
                  <thead><tr className="border-b"><th scope="col" className="p-3">Categoria</th><th scope="col" className="p-3">Entradas</th><th scope="col" className="p-3">Saídas</th></tr></thead>
                  <tbody>{summary.categories.map(([category, values]) => <tr key={category} className="border-b"><th scope="row" className="p-3 font-medium">{category}</th><td className="p-3">{currency(values.income)}</td><td className="p-3">{currency(values.expense)}</td></tr>)}</tbody>
                </table>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
