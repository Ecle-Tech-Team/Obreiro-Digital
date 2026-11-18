"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Calendar, Hash, Lock, MessageSquare, Package, Pencil, Plus, Tag, Trash2, Truck } from "lucide-react";

import PedidosResponder, { podeResponderPedidos, situacaoTag } from "@/app/components/pedidosResponder/PedidosResponder";
import { ConfirmDialog, EditRow, Modal, ViewRow } from "@/app/components/ui/Modal";
import { apiMessage, PageShell, SearchBox, SortMenu } from "@/app/components/ui/PageParts";
import { brDate } from "@/app/utils/date";
import api from "../../api/api";

import "react-toastify/dist/ReactToastify.css";

interface Pedido { id_pedido: number; nome_produto: string; categoria_produto: string; quantidade: number; data_pedido: string; status_pedido: string | null; data_entrega: string | null; motivo_recusa: string | null; respondido?: number | boolean; id_igreja: number }
type Sort = "recent" | "oldest" | "name-asc" | "name-desc" | "qtd";
type Situacao = "todos" | "Em Andamento" | "Entregue" | "Recusado";
type Form = { nome: string; cat: string; qtd: string; data: string };

const CATEGORIAS = ["Limpeza", "Cozinha", "Descartável", "Material de Construção", "Eletrônico", "Eletroeletrônico", "Móvel"];
const SORTS: [Sort, string][] = [["recent", "Mais recentes"], ["oldest", "Mais antigos"], ["name-asc", "Nome A-Z"], ["name-desc", "Nome Z-A"], ["qtd", "Maior quantidade"]];
const COLS = "minmax(0, 1fr) 130px 140px 170px";
const toastConfig = { position: "top-center" as const, autoClose: 1800, theme: "colored" as const };
const hoje = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const situacao = (p: Pedido) => p.status_pedido || "Em Andamento";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<Sort>("recent");
  const [filtro, setFiltro] = useState<Situacao>("todos");
  const [podeResponder, setPodeResponder] = useState(false);
  const [versao, setVersao] = useState(0);

  const [modal, setModal] = useState<"det" | "form" | null>(null);
  const [sel, setSel] = useState<Pedido | null>(null);
  const [form, setForm] = useState<Form>({ nome: "", cat: "", qtd: "1", data: hoje() });
  const [salvando, setSalvando] = useState(false);
  const [paraExcluir, setParaExcluir] = useState<Pedido | null>(null);

  const carregar = useCallback(async () => {
    const igreja = sessionStorage.getItem("id_igreja");
    if (!igreja) return;
    try {
      const { data } = await api.get(`/pedido/${igreja}`);
      setPedidos(Array.isArray(data) ? data : []);
    } catch {
      setPedidos([]);
    }
  }, []);

  useEffect(() => {
    setPodeResponder(podeResponderPedidos(sessionStorage.getItem("cargo"), sessionStorage.getItem("id_matriz")));
    void carregar();
  }, [carregar]);

  const contagem = useMemo(() => {
    const c: Record<Situacao, number> = { todos: pedidos.length, "Em Andamento": 0, Entregue: 0, Recusado: 0 };
    for (const p of pedidos) c[situacao(p) as Situacao] = (c[situacao(p) as Situacao] || 0) + 1;
    return c;
  }, [pedidos]);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const cmp: Record<Sort, (a: Pedido, b: Pedido) => number> = {
      recent: (a, b) => String(b.data_pedido).localeCompare(String(a.data_pedido)) || b.id_pedido - a.id_pedido,
      oldest: (a, b) => String(a.data_pedido).localeCompare(String(b.data_pedido)) || a.id_pedido - b.id_pedido,
      "name-asc": (a, b) => a.nome_produto.localeCompare(b.nome_produto),
      "name-desc": (a, b) => b.nome_produto.localeCompare(a.nome_produto),
      qtd: (a, b) => b.quantidade - a.quantidade,
    };
    return pedidos
      .filter((p) => filtro === "todos" || situacao(p) === filtro)
      .filter((p) => !termo || `${p.nome_produto} ${p.categoria_produto}`.toLowerCase().includes(termo))
      .sort(cmp[ordem]);
  }, [pedidos, busca, ordem, filtro]);

  const novo = () => { setSel(null); setForm({ nome: "", cat: "", qtd: "1", data: hoje() }); setModal("form"); };
  const editar = () => { if (sel) { setForm({ nome: sel.nome_produto, cat: sel.categoria_produto, qtd: String(sel.quantidade), data: String(sel.data_pedido).slice(0, 10) }); setModal("form"); } };
  const fechar = () => { setModal(null); setSel(null); };
  const voltar = () => setModal(sel ? "det" : null);

  async function salvar(event?: React.FormEvent) {
    event?.preventDefault();
    const qtd = Number(form.qtd);
    if (!form.nome.trim() || !form.cat || !form.data) return void toast.warn("Preencha o item, a categoria e a data.", toastConfig);
    if (!Number.isInteger(qtd) || qtd < 1) return void toast.warn("A quantidade deve ser um número inteiro maior que zero.", toastConfig);
    const dados = { nome_produto: form.nome.trim(), categoria_produto: form.cat, quantidade: qtd, data_pedido: form.data };
    setSalvando(true);
    try {
      if (sel) {
        await api.put(`/pedido/${sel.id_pedido}/${sel.id_igreja}`, dados);
        await carregar();
        setSel({ ...sel, ...dados });
        setModal("det");
        toast.success("Pedido atualizado!", toastConfig);
      } else {
        await api.post("/pedido", dados);
        await carregar();
        setVersao((v) => v + 1);
        fechar();
        toast.success("Pedido enviado!", toastConfig);
      }
    } catch (error) {
      toast.error(apiMessage(error, "Não foi possível salvar o pedido."), toastConfig);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!paraExcluir) return;
    try {
      await api.delete(`/pedido/${paraExcluir.id_pedido}`);
      await carregar();
      setVersao((v) => v + 1);
      fechar();
      toast.success("Pedido removido.", toastConfig);
    } catch (error) {
      toast.error(apiMessage(error, "Erro ao remover pedido."), toastConfig);
    } finally {
      setParaExcluir(null);
    }
  }

  const categorias = form.cat && !CATEGORIAS.includes(form.cat) ? [form.cat, ...CATEGORIAS] : CATEGORIAS;
  const SITUACOES: [Situacao, string][] = [["todos", "Todos"], ["Em Andamento", "Em andamento"], ["Entregue", "Entregues"], ["Recusado", "Recusados"]];

  return (
    <PageShell
      crumbs={[{ label: "Início", href: "/pages/inicio" }, { label: "Pedidos" }]}
      title="Pedidos"
      after={(
        <>
          <Modal open={modal === "det" && !!sel} onClose={fechar} title="Detalhes do pedido" subtitle={sel ? `Pedido em ${brDate(sel.data_pedido)}` : ""}>
            {sel && (
              <>
                <div className="mx-b">
                  <span className={situacaoTag(sel.status_pedido)}>{situacao(sel)}</span>
                  <h3 className="xc-tit" style={{ marginTop: -6, fontSize: 24 }}>{sel.nome_produto}</h3>
                  <div className="vw">
                    <ViewRow icon={Tag} label="Categoria">{sel.categoria_produto}</ViewRow>
                    <ViewRow icon={Hash} label="Quantidade">{sel.quantidade} {sel.quantidade === 1 ? "unidade" : "unidades"}</ViewRow>
                    <ViewRow icon={Calendar} label="Data do pedido">{brDate(sel.data_pedido)}</ViewRow>
                    {sel.status_pedido === "Entregue" && sel.data_entrega && <ViewRow icon={Truck} label="Entregue em">{brDate(sel.data_entrega)}</ViewRow>}
                    {sel.status_pedido === "Recusado" && sel.motivo_recusa && <ViewRow icon={MessageSquare} label="Motivo da recusa" text>{sel.motivo_recusa}</ViewRow>}
                  </div>
                  {sel.respondido ? <p className="mx-note"><Lock className="i s18" aria-hidden="true" />Pedido já respondido: não pode mais ser editado.</p> : null}
                </div>
                <div className="mx-f split">
                  <button type="button" className="btn dng-g" onClick={() => setParaExcluir(sel)}><Trash2 className="i s18" aria-hidden="true" />Excluir</button>
                  {!sel.respondido && <button type="button" className="btn pri" onClick={editar}><Pencil className="i s18" aria-hidden="true" />Editar</button>}
                </div>
              </>
            )}
          </Modal>

          <Modal open={modal === "form"} onClose={fechar} as="form" onSubmit={salvar} title={sel ? "Editar pedido" : "Novo pedido"} subtitle={sel ? "Corrija os dados enquanto o pedido não for respondido." : "O pedido vai para a igreja responsável aprovar."}>
            <div className="mx-b">
              {sel && <span className={situacaoTag(sel.status_pedido)}>{situacao(sel)}</span>}
              <label className="sr" htmlFor="p-nome">O que você precisa?</label>
              <input id="p-nome" className="ed-tit" placeholder="O que você precisa?" maxLength={150} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              <div className="vw">
                <EditRow icon={Tag} label="Categoria" htmlFor="p-cat">
                  <select id="p-cat" className="ed-in" value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}>
                    <option value="">Selecione</option>
                    {categorias.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </EditRow>
                <EditRow icon={Hash} label="Quantidade" htmlFor="p-qtd"><input id="p-qtd" className="ed-in" type="number" min={1} step={1} value={form.qtd} onChange={(e) => setForm({ ...form, qtd: e.target.value })} /></EditRow>
                <EditRow icon={Calendar} label="Data" htmlFor="p-data"><input id="p-data" className="ed-in" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} /></EditRow>
              </div>
            </div>
            <div className="mx-f">
              <button type="button" className="btn ghost" onClick={voltar}>Cancelar</button>
              <button type="submit" className="btn pri" disabled={!form.nome.trim() || salvando}>{sel ? "Salvar alterações" : "Enviar pedido"}</button>
            </div>
          </Modal>

          <ConfirmDialog
            open={!!paraExcluir}
            onCancel={() => setParaExcluir(null)}
            onConfirm={excluir}
            title="Excluir pedido?"
            message={<>O pedido “{paraExcluir?.nome_produto}” será cancelado e removido. Essa ação não pode ser desfeita.</>}
          />
          <ToastContainer />
        </>
      )}
    >
      {podeResponder && <PedidosResponder key={versao} onRespondido={carregar} />}

      <h2 className="sec-t" style={{ marginTop: podeResponder ? 12 : 0 }}>Meus pedidos</h2>
      <div className="toolbar">
        <SearchBox value={busca} onChange={setBusca} placeholder="Pesquisar pedidos..." />
        <SortMenu options={SORTS} value={ordem} onChange={setOrdem} />
        <button type="button" className="btn-add" onClick={novo}><Plus className="i s20" aria-hidden="true" />Novo Pedido</button>
      </div>
      <div className="list-bar">
        <div className="tabs" role="tablist" aria-label="Filtrar por situação" style={{ background: "#e9edf5" }}>
          {SITUACOES.map(([k, label]) => <button key={k} type="button" role="tab" className={filtro === k ? "on" : ""} aria-selected={filtro === k} onClick={() => setFiltro(k)}>{label} · {contagem[k] || 0}</button>)}
        </div>
        <span className="list-n">{lista.length} {lista.length === 1 ? "pedido" : "pedidos"}</span>
      </div>
      <div className="tbl-wrap fin">
        <div className="dt">
          <div className="dt-h" style={{ gridTemplateColumns: COLS }}><span>Pedido</span><span>Quantidade</span><span>Data</span><span className="r">Situação</span></div>
          {lista.map((p) => (
            <div key={p.id_pedido} className="dt-r" style={{ gridTemplateColumns: COLS, minHeight: 68 }}>
              <button type="button" className="hit" aria-label={`Ver pedido ${p.nome_produto}`} onClick={() => { setSel(p); setModal("det"); }} />
              <div className="c-desc" data-label="Pedido">
                <div className="mb">
                  <span className="fx-ico box" aria-hidden="true"><Package className="i" /></span>
                  <div><p className="mb-n"><span className="mb-t">{p.nome_produto}</span></p><p className="mb-c">{p.categoria_produto}<span className="only-m"> · {p.quantidade} un. · {brDate(p.data_pedido)}</span></p></div>
                </div>
              </div>
              <span className="c-hm" data-label="Quantidade">{p.quantidade} un.</span>
              <span className="c-data" data-label="Data">{brDate(p.data_pedido)}</span>
              <span className="c-val" data-label="Situação"><span className={situacaoTag(p.status_pedido)}>{situacao(p)}</span></span>
            </div>
          ))}
          {lista.length === 0 && <p className="empty">{pedidos.length ? "Nenhum pedido neste filtro." : "Nenhum pedido feito ainda."}</p>}
        </div>
      </div>
    </PageShell>
  );
}
