"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { AlertTriangle, Boxes, CalendarClock, CircleDollarSign, Hash, Package, Pencil, Plus, Tag, Trash2 } from "lucide-react";

import { ConfirmDialog, EditRow, Modal, ViewRow } from "@/app/components/ui/Modal";
import { apiMessage, PageShell, SearchBox, SortMenu } from "@/app/components/ui/PageParts";
import { brDate, parseDateOnly } from "@/app/utils/date";
import { brl, cents, toApiValue, toInputValue } from "@/app/utils/money";
import api from "../../api/api";

import "react-toastify/dist/ReactToastify.css";

interface Produto { id_produto: number; cod_produto: string | null; categoria: string; nome_produto: string; quantidade: number; validade: string; preco_unitario: string; id_igreja: number }
type Sort = "recent" | "oldest" | "name-asc" | "name-desc" | "validade";
type Form = { nome: string; cod: string; cat: string; qtd: string; preco: string; validade: string };

const CATEGORIAS = ["Cozinha", "Limpeza", "Materiais de Construção"];
const CURTA: Record<string, string> = { "Materiais de Construção": "Construção" };
const SORTS: [Sort, string][] = [["recent", "Adicionados recentemente"], ["oldest", "Adicionados antigamente"], ["name-asc", "Nome A-Z"], ["name-desc", "Nome Z-A"], ["validade", "Vencem primeiro"]];
const COLS = "minmax(0, 1fr) 110px 130px 140px 190px";
const ALERTA_DIAS = 60;
const toastConfig = { position: "top-center" as const, autoClose: 1800, theme: "colored" as const };

// Dias até a validade (negativo = vencido).
function diasAte(valor: string) {
  const d = parseDateOnly(valor);
  if (Number.isNaN(d.getTime())) return Infinity;
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - hoje.getTime()) / 864e5);
}
function validade(valor: string) {
  const n = diasAte(valor);
  if (n < 0) return { cls: "tag tag-rec", txt: `Vencido · ${brDate(valor)}` };
  if (n <= ALERTA_DIAS) return { cls: "tag tag-and", txt: `${brDate(valor)} · ${n === 0 ? "vence hoje" : n === 1 ? "1 dia" : `${n} dias`}` };
  return { cls: "list-n", txt: brDate(valor) };
}

export default function Estoque() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<Sort>("name-asc");
  const [cat, setCat] = useState("todos");

  const [modal, setModal] = useState<"det" | "form" | null>(null);
  const [sel, setSel] = useState<Produto | null>(null);
  const [form, setForm] = useState<Form>({ nome: "", cod: "", cat: "", qtd: "", preco: "", validade: "" });
  const [salvando, setSalvando] = useState(false);
  const [paraExcluir, setParaExcluir] = useState<Produto | null>(null);

  const carregar = useCallback(async () => {
    const igreja = sessionStorage.getItem("id_igreja");
    if (!igreja) return;
    try {
      const { data } = await api.get(`/estoque/${igreja}`);
      setProdutos(Array.isArray(data) ? data : []);
    } catch {
      setProdutos([]);
    }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  const total = (p: Produto) => cents(p.preco_unitario) * BigInt(p.quantidade || 0);
  const kpis = useMemo(() => ({
    valor: produtos.reduce((t, p) => t + total(p), 0n),
    vencendo: produtos.filter((p) => diasAte(p.validade) <= ALERTA_DIAS).length,
  }), [produtos]);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const cmp: Record<Sort, (a: Produto, b: Produto) => number> = {
      recent: (a, b) => b.id_produto - a.id_produto,
      oldest: (a, b) => a.id_produto - b.id_produto,
      "name-asc": (a, b) => a.nome_produto.localeCompare(b.nome_produto),
      "name-desc": (a, b) => b.nome_produto.localeCompare(a.nome_produto),
      validade: (a, b) => diasAte(a.validade) - diasAte(b.validade),
    };
    return produtos
      .filter((p) => cat === "todos" || p.categoria === cat)
      .filter((p) => !termo || `${p.nome_produto} ${p.cod_produto ?? ""} ${p.categoria}`.toLowerCase().includes(termo))
      .sort(cmp[ordem]);
  }, [produtos, busca, ordem, cat]);

  const novo = () => { setSel(null); setForm({ nome: "", cod: "", cat: "", qtd: "", preco: "", validade: "" }); setModal("form"); };
  const editar = () => { if (sel) { setForm({ nome: sel.nome_produto, cod: sel.cod_produto ?? "", cat: sel.categoria, qtd: String(sel.quantidade), preco: toInputValue(sel.preco_unitario), validade: String(sel.validade).slice(0, 10) }); setModal("form"); } };
  const fechar = () => { setModal(null); setSel(null); };
  const voltar = () => setModal(sel ? "det" : null);
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  async function salvar(event?: React.FormEvent) {
    event?.preventDefault();
    const qtd = Number(form.qtd);
    const preco = toApiValue(form.preco);
    if (!form.nome.trim() || !form.cat || !form.validade) return void toast.warn("Preencha nome, categoria e validade.", toastConfig);
    if (!Number.isInteger(qtd) || qtd < 0) return void toast.warn("A quantidade deve ser um número inteiro.", toastConfig);
    if (!preco) return void toast.warn("Informe o preço unitário, por exemplo 12,50.", toastConfig);
    const dados = { nome_produto: form.nome.trim(), cod_produto: form.cod.trim(), categoria: form.cat, quantidade: qtd, preco_unitario: preco, validade: form.validade };
    setSalvando(true);
    try {
      if (sel) {
        await api.put(`/estoque/${sel.id_produto}/${sel.id_igreja}`, dados);
        await carregar();
        setSel({ ...sel, ...dados });
        setModal("det");
        toast.success("Produto atualizado!", toastConfig);
      } else {
        await api.post("/estoque", dados);
        await carregar();
        fechar();
        toast.success("Produto adicionado ao estoque!", toastConfig);
      }
    } catch (error) {
      toast.error(apiMessage(error, "Não foi possível salvar o produto."), toastConfig);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!paraExcluir) return;
    try {
      await api.delete(`/estoque/${paraExcluir.id_produto}`);
      await carregar();
      fechar();
      toast.success("Produto removido.", toastConfig);
    } catch (error) {
      toast.error(apiMessage(error, "Erro ao remover produto."), toastConfig);
    } finally {
      setParaExcluir(null);
    }
  }

  const tabs: [string, string, number][] = [["todos", "Todos", produtos.length], ...CATEGORIAS.map((c) => [c, CURTA[c] || c, produtos.filter((p) => p.categoria === c).length] as [string, string, number])];

  return (
    <PageShell
      crumbs={[{ label: "Início", href: "/pages/inicio" }, { label: "Estoque" }]}
      title="Estoque"
      after={(
        <>
          <Modal open={modal === "det" && !!sel} onClose={fechar} title="Detalhes do produto" subtitle={sel ? `${sel.cod_produto || "Sem código"} · ${sel.categoria}` : ""}>
            {sel && (
              <>
                <div className="mx-b">
                  <div className="pf"><span className="av" aria-hidden="true"><Package className="i" /></span><div><h3 className="xc-tit">{sel.nome_produto}</h3><span className="tag tag-loc">{sel.categoria}</span></div></div>
                  <div className="vw">
                    <ViewRow icon={Boxes} label="Quantidade">{sel.quantidade} {sel.quantidade === 1 ? "unidade" : "unidades"}</ViewRow>
                    <ViewRow icon={CircleDollarSign} label="Preço unitário">{brl(cents(sel.preco_unitario))} · total {brl(total(sel))}</ViewRow>
                    <ViewRow icon={CalendarClock} label="Validade"><span className={validade(sel.validade).cls}>{validade(sel.validade).txt}</span></ViewRow>
                  </div>
                </div>
                <div className="mx-f split">
                  <button type="button" className="btn dng-g" onClick={() => setParaExcluir(sel)}><Trash2 className="i s18" aria-hidden="true" />Excluir</button>
                  <button type="button" className="btn pri" onClick={editar}><Pencil className="i s18" aria-hidden="true" />Editar</button>
                </div>
              </>
            )}
          </Modal>

          <Modal open={modal === "form"} onClose={fechar} as="form" onSubmit={salvar} title={sel ? "Editar produto" : "Novo produto"} subtitle={sel ? "Atualize quantidade, preço ou validade." : "Cadastre um item do estoque da igreja."}>
            <div className="mx-b">
              <label className="sr" htmlFor="s-nome">Nome do produto</label>
              <input id="s-nome" className="ed-tit" placeholder="Nome do produto" maxLength={150} value={form.nome} onChange={set("nome")} />
              <div className="vw">
                <EditRow icon={Hash} label="Código" htmlFor="s-cod"><input id="s-cod" className="ed-in" placeholder="Ex.: P-004" maxLength={30} value={form.cod} onChange={set("cod")} /></EditRow>
                <EditRow icon={Tag} label="Categoria" htmlFor="s-cat">
                  <select id="s-cat" className="ed-in" value={form.cat} onChange={set("cat")}>
                    <option value="">Selecione</option>
                    {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </EditRow>
                <EditRow icon={Boxes} label="Quantidade" htmlFor="s-qtd"><input id="s-qtd" className="ed-in" type="number" min={0} step={1} value={form.qtd} onChange={set("qtd")} /></EditRow>
                <EditRow icon={CircleDollarSign} label="Preço unit." htmlFor="s-preco"><input id="s-preco" className="ed-in" inputMode="decimal" placeholder="0,00" maxLength={14} value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value.replace(/[^\d.,]/g, "") })} /></EditRow>
                <EditRow icon={CalendarClock} label="Validade" htmlFor="s-val"><input id="s-val" className="ed-in" type="date" value={form.validade} onChange={set("validade")} /></EditRow>
              </div>
            </div>
            <div className="mx-f">
              <button type="button" className="btn ghost" onClick={voltar}>Cancelar</button>
              <button type="submit" className="btn pri" disabled={!form.nome.trim() || salvando}>{sel ? "Salvar alterações" : "Adicionar produto"}</button>
            </div>
          </Modal>

          <ConfirmDialog
            open={!!paraExcluir}
            onCancel={() => setParaExcluir(null)}
            onConfirm={excluir}
            title="Excluir produto?"
            message={<>“{paraExcluir?.nome_produto}” será removido do estoque. Essa ação não pode ser desfeita.</>}
          />
          <ToastContainer />
        </>
      )}
    >
      <div className="toolbar">
        <SearchBox value={busca} onChange={setBusca} placeholder="Pesquisar produtos..." />
        <SortMenu options={SORTS} value={ordem} onChange={setOrdem} />
        <button type="button" className="btn-add" onClick={novo}><Plus className="i s20" aria-hidden="true" />Novo Produto</button>
      </div>

      <div className="kpis">
        <div className="card kpi"><p className="kpi-l"><Package className="i" aria-hidden="true" />Produtos</p><p className="kpi-v">{produtos.length}</p></div>
        <div className="card kpi"><p className="kpi-l"><CircleDollarSign className="i" aria-hidden="true" />Valor em estoque</p><p className="kpi-v">{brl(kpis.valor)}</p></div>
        <div className="card kpi"><p className="kpi-l"><AlertTriangle className="i" aria-hidden="true" />Vencem em até {ALERTA_DIAS} dias</p><p className="kpi-v">{kpis.vencendo}</p></div>
      </div>

      <div className="list-bar">
        <div className="tabs" role="tablist" aria-label="Filtrar por categoria" style={{ background: "#e9edf5" }}>
          {tabs.map(([k, label, n]) => <button key={k} type="button" role="tab" className={cat === k ? "on" : ""} aria-selected={cat === k} onClick={() => setCat(k)}>{label} · {n}</button>)}
        </div>
        <span className="list-n">{lista.length} {lista.length === 1 ? "produto" : "produtos"}</span>
      </div>

      <div className="tbl-wrap fin">
        <div className="dt">
          <div className="dt-h" style={{ gridTemplateColumns: COLS }}><span>Produto</span><span>Quantidade</span><span>Preço unit.</span><span>Total</span><span className="r">Validade</span></div>
          {lista.map((p) => {
            const v = validade(p.validade);
            return (
              <div key={p.id_produto} className="dt-r" style={{ gridTemplateColumns: COLS, minHeight: 68 }}>
                <button type="button" className="hit" aria-label={`Ver ${p.nome_produto}`} onClick={() => { setSel(p); setModal("det"); }} />
                <div className="c-desc" data-label="Produto">
                  <div className="mb">
                    <span className="fx-ico box" aria-hidden="true"><Package className="i" /></span>
                    <div><p className="mb-n"><span className="mb-t">{p.nome_produto}</span></p><p className="mb-c">{p.cod_produto ? `${p.cod_produto} · ` : ""}{CURTA[p.categoria] || p.categoria}<span className="only-m"> · {p.quantidade} un.</span></p></div>
                  </div>
                </div>
                <span className="c-hm" data-label="Quantidade">{p.quantidade} un.</span>
                <span className="c-hm" data-label="Preço unit.">{brl(cents(p.preco_unitario))}</span>
                <span className="c-hm" data-label="Total" style={{ color: "#0f172a", fontWeight: 800 }}>{brl(total(p))}</span>
                <span className="c-val" data-label="Validade"><span className={v.cls}>{v.txt}</span></span>
              </div>
            );
          })}
          {lista.length === 0 && <p className="empty">{produtos.length ? "Nenhum produto neste filtro." : "Nenhum produto cadastrado ainda."}</p>}
        </div>
      </div>
    </PageShell>
  );
}
