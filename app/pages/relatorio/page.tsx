"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Lock, Scale } from "lucide-react";

import { PageShell } from "@/app/components/ui/PageParts";
import { brDate } from "@/app/utils/date";
import { brl, cents } from "@/app/utils/money";
import api from "@/app/api/api";

type Entry = { id_financas: number; tipo: "Entrada" | "Saída"; categoria: string; valor: string; data: string };
type Per = "mes" | "ant" | "ano" | "custom";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
function periodo(per: Exclude<Per, "custom">): [string, string] {
  const h = new Date();
  if (per === "mes") return [iso(new Date(h.getFullYear(), h.getMonth(), 1)), iso(new Date(h.getFullYear(), h.getMonth() + 1, 0))];
  if (per === "ant") return [iso(new Date(h.getFullYear(), h.getMonth() - 1, 1)), iso(new Date(h.getFullYear(), h.getMonth(), 0))];
  return [`${h.getFullYear()}-01-01`, `${h.getFullYear()}-12-31`];
}
const PRESETS: [Per, string][] = [["mes", "Este mês"], ["ant", "Mês passado"], ["ano", "Este ano"], ["custom", "Personalizado"]];

// Lista de categorias da maior para a menor, com a fatia de cada uma no total.
function porCategoria(lista: Entry[]) {
  const mapa = new Map<string, bigint>();
  for (const e of lista) mapa.set(e.categoria, (mapa.get(e.categoria) || 0n) + cents(e.valor));
  const total = [...mapa.values()].reduce((a, b) => a + b, 0n);
  return [...mapa.entries()]
    .sort((a, b) => (b[1] > a[1] ? 1 : b[1] < a[1] ? -1 : 0))
    .map(([nome, v]) => ({ nome, v, pct: total > 0n ? `${Math.round(Number((v * 1000n) / total) / 10)}%` : "0%" }));
}

function Categorias({ titulo, tipo, itens }: { titulo: string; tipo: "in" | "out"; itens: ReturnType<typeof porCategoria> }) {
  const Icon = tipo === "in" ? ArrowDownLeft : ArrowUpRight;
  return (
    <section className="card" style={{ padding: 22 }} aria-label={titulo}>
      <h2 className="sec-t"><span className={`fx-ico ${tipo}`} aria-hidden="true"><Icon className="i" /></span>{titulo}</h2>
      <div style={{ marginTop: 8 }}>
        {itens.length === 0 && <p className="list-n" style={{ padding: "14px 0" }}>{tipo === "in" ? "Nenhuma entrada no período." : "Nenhuma saída no período."}</p>}
        {itens.map((c) => (
          <div key={c.nome} className="cat">
            <div className="cat-h"><span>{c.nome}</span><span><b>{brl(c.v)}</b><span className="cat-p">{c.pct}</span></span></div>
            <div className={`bar${tipo === "out" ? " neg" : ""}`} aria-hidden="true"><i style={{ width: c.pct }} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Relatorio() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [per, setPer] = useState<Per>("mes");
  const [de, setDe] = useState(periodo("mes")[0]);
  const [ate, setAte] = useState(periodo("mes")[1]);
  const [estado, setEstado] = useState<"carregando" | "ok" | "sem-acesso" | "erro">("carregando");

  useEffect(() => {
    const igreja = sessionStorage.getItem("id_igreja");
    api.get(`/financas/${igreja}`)
      .then(({ data }) => { setEntries(Array.isArray(data) ? data : []); setEstado("ok"); })
      .catch((error) => setEstado(error?.response?.status === 403 ? "sem-acesso" : "erro"));
  }, []);

  const escolher = (p: Per) => {
    setPer(p);
    if (p !== "custom") { const [a, b] = periodo(p); setDe(a); setAte(b); }
  };

  const resumo = useMemo(() => {
    const noPeriodo = entries.filter((e) => { const d = String(e.data).slice(0, 10); return (!de || d >= de) && (!ate || d <= ate); });
    const ent = noPeriodo.filter((e) => e.tipo === "Entrada");
    const sai = noPeriodo.filter((e) => e.tipo === "Saída");
    const soma = (l: Entry[]) => l.reduce((t, e) => t + cents(e.valor), 0n);
    return { vazio: noPeriodo.length === 0, ent: soma(ent), sai: soma(sai), catsE: porCategoria(ent), catsS: porCategoria(sai) };
  }, [entries, de, ate]);

  return (
    <PageShell crumbs={[{ label: "Início", href: "/pages/inicio" }, { label: "Financeiro", href: "/pages/financeiro" }, { label: "Relatório" }]} title="Relatório financeiro">
      <p style={{ marginTop: -16, fontSize: 16, color: "#64748b" }}>Resumo dos lançamentos da sua igreja no período.</p>

      {estado === "sem-acesso" ? (
        <div className="card empty"><Lock className="i s32" style={{ margin: "0 auto 12px", color: "#5271FF" }} aria-hidden="true" /><h3 className="t1" style={{ fontSize: 20, color: "#1f2937" }}>Acesso restrito</h3><p style={{ marginTop: 6 }}>Somente pastores acessam o relatório financeiro.</p></div>
      ) : estado === "erro" ? (
        <div className="card empty" role="alert">Não foi possível carregar o relatório. Tente novamente.</div>
      ) : (
        <>
          <div className="per">
            <div className="tabs" role="tablist" aria-label="Período" style={{ background: "#e9edf5" }}>
              {PRESETS.map(([k, label]) => <button key={k} type="button" role="tab" className={per === k ? "on" : ""} aria-selected={per === k} onClick={() => escolher(k)}>{label}</button>)}
            </div>
            {per === "custom" ? (
              <div className="per-d">
                <label htmlFor="rp-de">De</label><input id="rp-de" className="ed-in" type="date" value={de} onChange={(e) => setDe(e.target.value)} />
                <label htmlFor="rp-ate">Até</label><input id="rp-ate" className="ed-in" type="date" value={ate} min={de || undefined} onChange={(e) => setAte(e.target.value)} />
              </div>
            ) : (
              <span className="list-n">{brDate(de)} – {brDate(ate)}</span>
            )}
          </div>

          <div className="kpis">
            <div className="card kpi ent"><p className="kpi-l"><ArrowDownLeft className="i" aria-hidden="true" />Entradas</p><p className="kpi-v">{brl(resumo.ent)}</p></div>
            <div className="card kpi sai"><p className="kpi-l"><ArrowUpRight className="i" aria-hidden="true" />Saídas</p><p className="kpi-v">{brl(resumo.sai)}</p></div>
            <div className="card kpi res"><p className="kpi-l"><Scale className="i" aria-hidden="true" />Resultado do período</p><p className="kpi-v">{brl(resumo.ent - resumo.sai)}</p></div>
          </div>

          {estado === "carregando" ? (
            <p className="list-n" role="status">Carregando relatório…</p>
          ) : resumo.vazio ? (
            <div className="card empty"><h3 className="t1" style={{ fontSize: 20, color: "#1f2937" }}>Nenhum lançamento neste período</h3><p style={{ marginTop: 6 }}>Escolha outro período para ver o resumo.</p></div>
          ) : (
            <div className="grid2">
              <Categorias titulo="Entradas por categoria" tipo="in" itens={resumo.catsE} />
              <Categorias titulo="Saídas por categoria" tipo="out" itens={resumo.catsS} />
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
