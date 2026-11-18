"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import { ArrowDownLeft, ArrowUpRight, Calendar, Eye, EyeOff, FileText, Lock, Pencil, Plus, Tag, Wallet } from "lucide-react";

import { EditRow, Modal, ViewRow } from "@/app/components/ui/Modal";
import { apiMessage, PageShell } from "@/app/components/ui/PageParts";
import { brDate } from "@/app/utils/date";
import { brl, cents, toApiValue, toInputValue } from "@/app/utils/money";
import api from "../../api/api";

import "react-toastify/dist/ReactToastify.css";

interface Movimento { id_financas: number; tipo: "Entrada" | "Saída"; categoria: string; valor: string; descricao: string; data: string; id_igreja: number }
type Filtro = "todos" | "ent" | "sai";
type Form = { tipo: "Entrada" | "Saída"; valor: string; categoria: string; data: string; descricao: string };

const CATEGORIAS = ["Oferta Simples", "Oferta Especial", "Dízimo", "Contribuição para Missões", "Contribuição para Obras"];
const OCULTO = "R$ ••••";
const COLS = "130px minmax(0, 1fr) 200px";
const toastConfig = { position: "top-center" as const, autoClose: 1800, theme: "colored" as const };
const hoje = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

export default function Financeiro() {
  const [movs, setMovs] = useState<Movimento[]>([]);
  const [saldo, setSaldo] = useState<string | null>(null);
  const [visivel, setVisivel] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [semAcesso, setSemAcesso] = useState(false);

  const [modal, setModal] = useState<"det" | "form" | null>(null);
  const [sel, setSel] = useState<Movimento | null>(null);
  const [form, setForm] = useState<Form>({ tipo: "Entrada", valor: "", categoria: "", data: hoje(), descricao: "" });
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    const igreja = sessionStorage.getItem("id_igreja");
    if (!igreja) return;
    try {
      const [lista, s] = await Promise.all([api.get(`/financas/${igreja}`), api.get(`/financas/saldo/${igreja}`)]);
      setMovs(Array.isArray(lista.data) ? lista.data : []);
      setSaldo(String(s.data?.saldo ?? "0.00"));
    } catch (error) {
      // O financeiro é só para pastores.
      if ((error as { response?: { status?: number } })?.response?.status === 403) setSemAcesso(true);
      else toast.error("Erro ao carregar o financeiro.", toastConfig);
    }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  const totais = useMemo(() => {
    let ent = 0n, sai = 0n;
    for (const m of movs) { if (m.tipo === "Entrada") ent += cents(m.valor); else sai += cents(m.valor); }
    return { ent, sai, nE: movs.filter((m) => m.tipo === "Entrada").length, nS: movs.filter((m) => m.tipo === "Saída").length };
  }, [movs]);

  const lista = useMemo(() => movs
    .filter((m) => filtro === "todos" || (filtro === "ent" ? m.tipo === "Entrada" : m.tipo === "Saída"))
    .sort((a, b) => String(b.data).localeCompare(String(a.data)) || b.id_financas - a.id_financas), [movs, filtro]);

  const valorTxt = (m: Movimento) => (visivel ? brl(m.tipo === "Saída" ? -cents(m.valor) : cents(m.valor), true) : OCULTO);
  const mostrar = (v: bigint) => (visivel ? brl(v) : OCULTO);

  const novo = () => { setSel(null); setForm({ tipo: "Entrada", valor: "", categoria: "", data: hoje(), descricao: "" }); setModal("form"); };
  const editar = () => { if (sel) { setForm({ tipo: sel.tipo, valor: toInputValue(sel.valor), categoria: sel.categoria, data: String(sel.data).slice(0, 10), descricao: sel.descricao || "" }); setModal("form"); } };
  const fechar = () => { setModal(null); setSel(null); };
  const voltar = () => setModal(sel ? "det" : null);

  async function salvar(event?: React.FormEvent) {
    event?.preventDefault();
    const valor = toApiValue(form.valor);
    if (!valor) return void toast.warn("Informe um valor válido, por exemplo 150,00.", toastConfig);
    if (!form.categoria || !form.data || !form.descricao.trim()) return void toast.warn("Preencha categoria, data e descrição.", toastConfig);
    const dados = { tipo: form.tipo, categoria: form.categoria, valor, descricao: form.descricao.trim(), data: form.data };
    setSalvando(true);
    try {
      if (sel) {
        await api.put(`/financas/${sel.id_financas}/${sel.id_igreja}`, dados);
        await carregar();
        setSel({ ...sel, ...dados });
        setModal("det");
        toast.success("Movimentação atualizada!", toastConfig);
      } else {
        await api.post("/financas", { ...dados, id_igreja: sessionStorage.getItem("id_igreja") });
        await carregar();
        fechar();
        toast.success("Movimentação registrada!", toastConfig);
      }
    } catch (error) {
      toast.error(apiMessage(error, "Não foi possível salvar a movimentação."), toastConfig);
    } finally {
      setSalvando(false);
    }
  }

  // Categoria antiga (fora da lista atual) continua aparecendo para não ser trocada sem querer.
  const categorias = form.categoria && !CATEGORIAS.includes(form.categoria) ? [form.categoria, ...CATEGORIAS] : CATEGORIAS;

  if (semAcesso) {
    return (
      <PageShell crumbs={[{ label: "Início", href: "/pages/inicio" }, { label: "Financeiro" }]} title="Financeiro">
        <div className="card empty"><Lock className="i s32" style={{ margin: "0 auto 12px", color: "#5271FF" }} aria-hidden="true" /><h3 className="t1" style={{ fontSize: 20, color: "#1f2937" }}>Acesso restrito</h3><p style={{ marginTop: 6 }}>Somente pastores acessam o financeiro da igreja.</p></div>
      </PageShell>
    );
  }

  return (
    <PageShell
      crumbs={[{ label: "Início", href: "/pages/inicio" }, { label: "Financeiro" }]}
      title="Financeiro"
      titleExtra={(
        <button type="button" className="ttl-btn" style={{ width: 52, height: 52 }} aria-label={visivel ? "Ocultar valores" : "Mostrar valores"} aria-pressed={!visivel} onClick={() => setVisivel((v) => !v)}>
          {visivel ? <Eye className="i s32" aria-hidden="true" /> : <EyeOff className="i s32" aria-hidden="true" />}
        </button>
      )}
      after={(
        <>
          <Modal open={modal === "det" && !!sel} onClose={fechar} title="Detalhes da movimentação" subtitle={sel ? brDate(sel.data) : ""}>
            {sel && (
              <>
                <div className="mx-b">
                  <span className={sel.tipo === "Entrada" ? "tag tag-ok" : "tag tag-rec"}>{sel.tipo}</span>
                  <h3 className="xc-tit" style={{ marginTop: -6, fontSize: 30 }}>{valorTxt(sel)}</h3>
                  <div className="vw">
                    <ViewRow icon={Tag} label="Categoria">{sel.categoria}</ViewRow>
                    <ViewRow icon={Calendar} label="Data">{brDate(sel.data)}</ViewRow>
                    <ViewRow icon={FileText} label="Descrição">{sel.descricao || "—"}</ViewRow>
                  </div>
                </div>
                <div className="mx-f"><button type="button" className="btn pri" onClick={editar}><Pencil className="i s18" aria-hidden="true" />Editar</button></div>
              </>
            )}
          </Modal>

          <Modal open={modal === "form"} onClose={fechar} as="form" onSubmit={salvar} title={sel ? "Editar movimentação" : "Nova movimentação"} subtitle={sel ? "Corrija os dados do lançamento. O saldo é recalculado." : "Registre uma entrada ou saída do caixa."}>
            <div className="mx-b">
              <div className="chips" role="radiogroup" aria-label="Tipo">
                {(["Entrada", "Saída"] as const).map((t) => <label key={t}><input type="radio" name="fm-tipo" value={t} checked={form.tipo === t} onChange={() => setForm({ ...form, tipo: t })} />{t}</label>)}
              </div>
              <label className="sr" htmlFor="fm-val">Valor</label>
              <input id="fm-val" className="ed-tit" inputMode="decimal" placeholder="R$ 0,00" maxLength={16} value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value.replace(/[^\d.,]/g, "") })} />
              <div className="vw">
                <EditRow icon={Tag} label="Categoria" htmlFor="fm-cat">
                  <select id="fm-cat" className="ed-in" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                    <option value="" disabled>Selecione</option>
                    {categorias.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </EditRow>
                <EditRow icon={Calendar} label="Data" htmlFor="fm-data"><input id="fm-data" className="ed-in" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} /></EditRow>
                <EditRow icon={FileText} label="Descrição" htmlFor="fm-desc"><input id="fm-desc" className="ed-in" placeholder="Ex.: Culto de domingo" maxLength={255} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></EditRow>
              </div>
            </div>
            <div className="mx-f">
              <button type="button" className="btn ghost" onClick={voltar}>Cancelar</button>
              <button type="submit" className="btn pri" disabled={!toApiValue(form.valor) || salvando}>{sel ? "Salvar alterações" : "Registrar movimentação"}</button>
            </div>
          </Modal>
          <ToastContainer />
        </>
      )}
    >
      <div className="toolbar" style={{ justifyContent: "flex-end", marginTop: -12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link href="/pages/relatorio" className="btn" style={{ minHeight: 48 }}><FileText className="i s20" aria-hidden="true" />Ver relatório</Link>
          <button type="button" className="btn-add" onClick={novo}><Plus className="i s20" aria-hidden="true" />Nova Movimentação</button>
        </div>
      </div>

      <div className="kpis">
        <div className="card kpi ent"><p className="kpi-l"><ArrowDownLeft className="i" aria-hidden="true" />Entradas</p><p className="kpi-v">{mostrar(totais.ent)}</p></div>
        <div className="card kpi sai"><p className="kpi-l"><ArrowUpRight className="i" aria-hidden="true" />Saídas</p><p className="kpi-v">{mostrar(totais.sai)}</p></div>
        <div className="card kpi res"><p className="kpi-l"><Wallet className="i" aria-hidden="true" />Saldo</p><p className="kpi-v">{saldo === null ? "—" : mostrar(cents(saldo))}</p></div>
      </div>

      <div className="list-bar">
        <div className="tabs" role="tablist" aria-label="Filtrar movimentações">
          {([["todos", "Todos", movs.length], ["ent", "Entradas", totais.nE], ["sai", "Saídas", totais.nS]] as [Filtro, string, number][]).map(([k, l, n]) => (
            <button key={k} type="button" role="tab" className={filtro === k ? "on" : ""} aria-selected={filtro === k} onClick={() => setFiltro(k)}>{l} · {n}</button>
          ))}
        </div>
        <span className="list-n">{lista.length} {lista.length === 1 ? "movimentação" : "movimentações"}</span>
      </div>

      <div className="tbl-wrap fin">
        <div className="dt">
          <div className="dt-h" style={{ gridTemplateColumns: COLS }}><span>Data</span><span>Descrição</span><span className="r">Valor</span></div>
          {lista.map((m) => (
            <div key={m.id_financas} className="dt-r" style={{ gridTemplateColumns: COLS, minHeight: 68 }}>
              <button type="button" className="hit" aria-label={`Ver movimentação ${m.descricao}`} onClick={() => { setSel(m); setModal("det"); }} />
              <span className="c-data" data-label="Data">{brDate(m.data)}</span>
              <div className="c-desc" data-label="Descrição">
                <div className="mb">
                  <span className={`fx-ico ${m.tipo === "Entrada" ? "in" : "out"}`} aria-hidden="true">{m.tipo === "Entrada" ? <ArrowDownLeft className="i" /> : <ArrowUpRight className="i" />}</span>
                  <div><p className="mb-n"><span className="mb-t">{m.descricao || m.categoria}</span></p><p className="mb-c">{m.categoria}<span className="only-m"> · {brDate(m.data)}</span></p></div>
                </div>
              </div>
              <span className="c-val" data-label="Valor"><span className={`val ${m.tipo === "Entrada" ? "pos" : "neg"}`}>{valorTxt(m)}</span></span>
            </div>
          ))}
          {lista.length === 0 && <p className="empty">{movs.length ? "Nenhuma movimentação neste filtro." : "Nenhuma movimentação registrada ainda."}</p>}
        </div>
      </div>
    </PageShell>
  );
}
