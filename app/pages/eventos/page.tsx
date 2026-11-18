"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import { ArrowRight, Calendar, Cast, ChevronDown, Clock, Filter, Lock, MapPin, Pencil, Plus, Search, Trash2 } from "lucide-react";

import MenuLateral from "@/app/components/menuLateral/menuLateral";
import { ConfirmDialog, EditRow, Modal, ViewRow } from "@/app/components/ui/Modal";
import { dateTile, untilLabel, whenLong, whenShort } from "@/app/utils/date";
import api from "../../api/api";

import "react-toastify/dist/ReactToastify.css";

interface Evento {
  id_evento: number;
  nome: string;
  data_inicio: string;
  horario_inicio: string;
  data_fim: string;
  horario_fim: string;
  local: string;
  id_igreja: number;
  is_global?: 0 | 1 | boolean;
  id_matriz?: number | null;
  tipo_evento?: "matriz" | "local";
}

type Sort = "recent" | "oldest" | "name-asc" | "name-desc";
type Form = { nome: string; local: string; di: string; hi: string; df: string; hf: string; tipo: "local" | "matriz" };

const SORTS: [Sort, string][] = [["recent", "Adicionados recentemente"], ["oldest", "Adicionados antigamente"], ["name-asc", "Nome A-Z"], ["name-desc", "Nome Z-A"]];
const vazio: Form = { nome: "", local: "", di: "", hi: "", df: "", hf: "", tipo: "local" };
const toastConfig = { position: "top-center" as const, autoClose: 1800, theme: "colored" as const };

const ehMatriz = (e: Evento) => e.tipo_evento === "matriz" || Boolean(e.is_global);
const tagDe = (e: { tipo: string } | Evento) => ("tipo" in e ? e.tipo === "matriz" : ehMatriz(e))
  ? { cls: "tag tag-mat", label: "Evento da Matriz" } : { cls: "tag tag-loc", label: "Evento Local" };
const paraForm = (e: Evento): Form => ({
  nome: e.nome || "", local: e.local || "",
  di: (e.data_inicio || "").slice(0, 10), hi: (e.horario_inicio || "").slice(0, 5),
  df: (e.data_fim || "").slice(0, 10), hf: (e.horario_fim || "").slice(0, 5),
  tipo: ehMatriz(e) ? "matriz" : "local",
});

// Fecha menus suspensos ao clicar fora.
function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void) {
  useEffect(() => {
    const handler = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) onOutside(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}

export default function Eventos() {
  const [cargo, setCargo] = useState<string | null>(null);
  const [idIgreja, setIdIgreja] = useState<string | null>(null);
  const [idMatriz, setIdMatriz] = useState<string | null>(null);

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<Sort>("recent");
  const [menuTitulo, setMenuTitulo] = useState(false);
  const [menuOrdem, setMenuOrdem] = useState(false);

  const [modal, setModal] = useState<"det" | "form" | null>(null);
  const [selecionado, setSelecionado] = useState<Evento | null>(null);
  const [form, setForm] = useState<Form>(vazio);
  const [salvando, setSalvando] = useState(false);
  const [paraExcluir, setParaExcluir] = useState<Evento | null>(null);

  const tituloRef = useRef<HTMLDivElement>(null);
  const ordemRef = useRef<HTMLDivElement>(null);
  useClickOutside(tituloRef, useCallback(() => setMenuTitulo(false), []));
  useClickOutside(ordemRef, useCallback(() => setMenuOrdem(false), []));

  const pastor = cargo === "Pastor" || cargo === "Pastor Matriz";
  const pastorMatriz = cargo === "Pastor Matriz";
  // Pastores editam e excluem; eventos da Matriz só pelo Pastor Matriz.
  const podeEditar = (e: Evento) => pastor && (!ehMatriz(e) || pastorMatriz);

  useEffect(() => {
    setCargo(sessionStorage.getItem("cargo"));
    setIdIgreja(sessionStorage.getItem("id_igreja"));
    setIdMatriz(sessionStorage.getItem("id_matriz"));
  }, []);

  const carregar = useCallback(async () => {
    const igreja = sessionStorage.getItem("id_igreja");
    if (!igreja) return setEventos([]);
    try {
      const response = await api.get(`/evento/matriz/${igreja}`);
      setEventos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      // 404 = nenhum evento cadastrado.
      setEventos([]);
      if ((error as { response?: { status?: number } })?.response?.status !== 404) toast.error("Erro ao carregar eventos.", toastConfig);
    }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const filtrados = eventos.filter((e) => !termo || `${e.nome} ${e.local} ${e.data_inicio} ${e.data_fim}`.toLowerCase().includes(termo));
    const cmp: Record<Sort, (a: Evento, b: Evento) => number> = {
      recent: (a, b) => b.id_evento - a.id_evento,
      oldest: (a, b) => a.id_evento - b.id_evento,
      "name-asc": (a, b) => a.nome.localeCompare(b.nome),
      "name-desc": (a, b) => b.nome.localeCompare(a.nome),
    };
    return [...filtrados].sort(cmp[ordem]);
  }, [eventos, busca, ordem]);

  const abrirDetalhes = (e: Evento) => { setSelecionado(e); setModal("det"); };
  const novo = () => { setSelecionado(null); setForm(vazio); setModal("form"); };
  const editar = () => { if (selecionado) { setForm(paraForm(selecionado)); setModal("form"); } };
  const fechar = () => { setModal(null); setSelecionado(null); };
  const voltar = () => setModal(selecionado ? "det" : null);
  const campo = (k: keyof Form) => (ev: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: ev.target.value }));

  async function salvar(event?: React.FormEvent) {
    event?.preventDefault();
    if (!form.nome.trim() || !form.local.trim() || !form.di || !form.hi || !form.df || !form.hf) {
      toast.warn("Preencha nome, início, término e local.", toastConfig);
      return;
    }
    const dados = { nome: form.nome.trim(), local: form.local.trim(), data_inicio: form.di, horario_inicio: form.hi, data_fim: form.df, horario_fim: form.hf };
    setSalvando(true);
    try {
      if (selecionado) {
        await api.put(`/evento/${selecionado.id_evento}`, dados);
        await carregar();
        setSelecionado({ ...selecionado, ...dados });
        setModal("det");
        toast.success("Evento atualizado com sucesso!", toastConfig);
      } else {
        const global = form.tipo === "matriz" && pastorMatriz;
        await api.post("/evento", { ...dados, is_global: global, id_matriz: global ? (idMatriz && idMatriz !== "null" ? idMatriz : idIgreja) : null });
        await carregar();
        fechar();
        toast.success("Evento cadastrado com sucesso!", toastConfig);
      }
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      toast.error(selecionado ? "Erro na atualização. Tente novamente." : "Erro no cadastro. Tente novamente.", toastConfig);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!paraExcluir) return;
    try {
      await api.delete(`/evento/${paraExcluir.id_evento}`);
      await carregar();
      toast.success("Evento removido com sucesso!", toastConfig);
      fechar();
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      toast.error("Erro ao remover evento.", toastConfig);
    } finally {
      setParaExcluir(null);
    }
  }

  const editando = !!selecionado;
  const det = selecionado;
  const detTag = det ? tagDe(det) : null;
  const somenteLeitura = !!det && !podeEditar(det);

  return (
    <div className="min-h-screen bg-fundo">
      <div className="flex flex-col lg:flex-row">
        <MenuLateral />
        <div className="app-content">
          <div className="wrap">
            <nav className="crumb" aria-label="Navegação">
              <Link href="/pages/inicio">Início</Link><span aria-hidden="true">&gt;</span><span className="cur" aria-current="page">Eventos</span>
            </nav>

            <div className="ttl-row" ref={tituloRef}>
              <h1 className="ptitle">Eventos</h1>
              <button type="button" className="ttl-btn" aria-label="Menu de navegação" aria-expanded={menuTitulo} onClick={() => setMenuTitulo((v) => !v)}>
                <ChevronDown className="i s32" aria-hidden="true" />
              </button>
              {menuTitulo && <div className="menu left"><Link href="/pages/avisos">Avisos</Link></div>}
            </div>

            <div className="toolbar">
              <div className="search">
                <Search className="i" aria-hidden="true" />
                <input type="text" placeholder="Pesquisar eventos..." aria-label="Pesquisar eventos" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
              <div className="rel" ref={ordemRef}>
                <button type="button" className="btn-icon" aria-label="Ordenar resultados" aria-expanded={menuOrdem} onClick={() => setMenuOrdem((v) => !v)}>
                  <Filter className="i s20" aria-hidden="true" />
                </button>
                {menuOrdem && (
                  <div className="menu">
                    {SORTS.map(([k, label]) => (
                      <button key={k} type="button" className={ordem === k ? "sel" : ""} onClick={() => { setOrdem(k); setMenuOrdem(false); }}>{label}</button>
                    ))}
                  </div>
                )}
              </div>
              <Link href="/pages/apresentacao" className="btn-cast" aria-label="Ir para apresentação"><Cast className="i" aria-hidden="true" /></Link>
              <button type="button" className="btn-add" onClick={novo}><Plus className="i s20" aria-hidden="true" />Novo Evento</button>
            </div>

            {lista.length === 0 ? (
              <div className="card empty">
                <h3 className="t1" style={{ fontSize: 20, color: "#1f2937" }}>Nenhum evento encontrado</h3>
                <p style={{ marginTop: 6 }}>{busca ? "Tente ajustar sua busca" : "Adicione o primeiro evento da agenda"}</p>
              </div>
            ) : (
              <div className="cards">
                {lista.map((e) => {
                  const tile = dateTile(e.data_inicio);
                  const tag = tagDe(e);
                  return (
                    <article key={e.id_evento} className="card xc">
                      <div className="ev-row">
                        <div className="dtile"><b>{tile.dia}</b><small>{tile.mes}</small></div>
                        <div className="ev-body">
                          <div className="xc-head">
                            <span className={tag.cls}>{tag.label}</span>
                            {podeEditar(e) && (
                              <button type="button" className="del" aria-label={`Excluir ${e.nome}`} onClick={() => setParaExcluir(e)}><Trash2 className="i" aria-hidden="true" /></button>
                            )}
                          </div>
                          <h3 className="xc-tit">{e.nome}</h3>
                          <p className="xc-meta"><Clock className="i" aria-hidden="true" /><span>{whenShort(e.data_inicio, e.horario_inicio, e.data_fim, e.horario_fim)}</span></p>
                          <p className="xc-meta"><MapPin className="i" aria-hidden="true" /><span>{e.local}</span></p>
                        </div>
                      </div>
                      <div className="xc-foot">
                        <span>{untilLabel(e.data_inicio, e.data_fim)}</span>
                        <button type="button" className="xc-more" onClick={() => abrirDetalhes(e)}>Ver detalhes<ArrowRight className="i" aria-hidden="true" /></button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detalhes */}
      <Modal open={modal === "det" && !!det} onClose={fechar} title="Detalhes do evento" subtitle={det ? untilLabel(det.data_inicio, det.data_fim) || "Data a definir" : ""}>
        {det && detTag && (
          <>
            <div className="mx-b">
              <span className={detTag.cls}>{detTag.label}</span>
              <h3 className="xc-tit" style={{ marginTop: -6, fontSize: 24 }}>{det.nome}</h3>
              <div className="vw">
                <ViewRow icon={Calendar} label="Quando">{whenLong(det.data_inicio, det.horario_inicio, det.data_fim, det.horario_fim)}</ViewRow>
                <ViewRow icon={MapPin} label="Local">{det.local}</ViewRow>
              </div>
              {somenteLeitura && (
                <p className="mx-note"><Lock className="i s18" aria-hidden="true" />
                  {ehMatriz(det) ? "Somente o Pastor Matriz pode editar este evento." : "Somente pastores podem editar eventos."}
                </p>
              )}
            </div>
            {somenteLeitura ? (
              <div className="mx-f"><button type="button" className="btn pri" onClick={fechar}>Fechar</button></div>
            ) : (
              <div className="mx-f split">
                <span><button type="button" className="btn dng-g" onClick={() => setParaExcluir(det)}><Trash2 className="i s18" aria-hidden="true" />Excluir</button></span>
                <button type="button" className="btn pri" onClick={editar}><Pencil className="i s18" aria-hidden="true" />Editar</button>
              </div>
            )}
          </>
        )}
      </Modal>

      {/* Novo / Editar */}
      <Modal
        open={modal === "form"}
        onClose={fechar}
        as="form"
        onSubmit={salvar}
        title={editando ? "Editar evento" : "Novo evento"}
        subtitle={editando ? "Atualize as informações do evento." : "Preencha os dados abaixo para adicionar à agenda."}
      >
        <div className="mx-b">
          {pastorMatriz && !editando ? (
            <div className="chips" role="radiogroup" aria-label="Tipo de evento">
              <label><input type="radio" name="e-tipo" value="local" checked={form.tipo === "local"} onChange={() => setForm((f) => ({ ...f, tipo: "local" }))} />Evento Local</label>
              <label><input type="radio" name="e-tipo" value="matriz" checked={form.tipo === "matriz"} onChange={() => setForm((f) => ({ ...f, tipo: "matriz" }))} />Evento da Matriz</label>
            </div>
          ) : (
            <span className={tagDe(form).cls}>{tagDe(form).label}</span>
          )}
          <label className="sr" htmlFor="e-nome">Nome do evento</label>
          <input id="e-nome" className="ed-tit" placeholder="Nome do evento" maxLength={150} value={form.nome} onChange={campo("nome")} />
          <div className="vw">
            <EditRow icon={Calendar} label="Início" labelId="e-ini-l">
              <div className="ed-dt" role="group" aria-labelledby="e-ini-l">
                <input className="ed-in" type="date" aria-label="Data de início" value={form.di} onChange={campo("di")} />
                <input className="ed-in" type="time" aria-label="Horário de início" value={form.hi} onChange={campo("hi")} />
              </div>
            </EditRow>
            <EditRow icon={Clock} label="Término" labelId="e-fim-l">
              <div className="ed-dt" role="group" aria-labelledby="e-fim-l">
                <input className="ed-in" type="date" aria-label="Data de término" value={form.df} min={form.di || undefined} onChange={campo("df")} />
                <input className="ed-in" type="time" aria-label="Horário de término" value={form.hf} onChange={campo("hf")} />
              </div>
            </EditRow>
            <EditRow icon={MapPin} label="Local" htmlFor="e-local">
              <input id="e-local" className="ed-in" placeholder="Ex.: Templo Sede" maxLength={150} value={form.local} onChange={campo("local")} />
            </EditRow>
          </div>
        </div>
        <div className="mx-f">
          <button type="button" className="btn ghost" onClick={voltar}>Cancelar</button>
          <button type="submit" className="btn pri" disabled={!form.nome.trim() || salvando}>{editando ? "Salvar alterações" : "Criar evento"}</button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!paraExcluir}
        onCancel={() => setParaExcluir(null)}
        onConfirm={excluir}
        title="Excluir evento?"
        message={<>“{paraExcluir?.nome}” será removido da agenda. Essa ação não pode ser desfeita.</>}
      />

      <ToastContainer />
    </div>
  );
}
