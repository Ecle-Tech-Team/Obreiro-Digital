"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import { ArrowRight, Calendar, ChevronDown, Filter, Lock, MessageSquare, Pencil, Plus, Search, Trash2 } from "lucide-react";

import MenuLateral from "@/app/components/menuLateral/menuLateral";
import { ConfirmDialog, Modal, ViewRow } from "@/app/components/ui/Modal";
import { agoLabel } from "@/app/utils/date";
import api from "../../api/api";

import "react-toastify/dist/ReactToastify.css";

interface Aviso {
  id_aviso: number;
  titulo: string;
  conteudo: string;
  data_criacao: string;
  is_global?: 0 | 1 | boolean;
  id_matriz?: number | null;
  tipo_aviso?: "matriz" | "local";
}

type Sort = "recent" | "oldest" | "name-asc" | "name-desc";
type Form = { titulo: string; conteudo: string; tipo: "local" | "matriz" };

const SORTS: [Sort, string][] = [["recent", "Mais recentes"], ["oldest", "Mais antigos"], ["name-asc", "Título A-Z"], ["name-desc", "Título Z-A"]];
const vazio: Form = { titulo: "", conteudo: "", tipo: "local" };
const toastConfig = { position: "top-center" as const, autoClose: 1800, theme: "colored" as const };

const ehMatriz = (a: Aviso) => a.tipo_aviso === "matriz" || Boolean(a.is_global);
const tagDe = (matriz: boolean) => matriz ? { cls: "tag tag-mat", label: "Aviso da Matriz" } : { cls: "tag tag-loc", label: "Aviso Local" };
// data_criacao é data e hora (DATETIME), então aqui o Date normal está certo.
const dataBr = (valor?: string) => {
  const d = new Date(String(valor ?? ""));
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR");
};

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void) {
  useEffect(() => {
    const handler = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) onOutside(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}

export default function Avisos() {
  const [cargo, setCargo] = useState<string | null>(null);
  const [idIgreja, setIdIgreja] = useState<string | null>(null);
  const [idMatriz, setIdMatriz] = useState<string | null>(null);

  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<Sort>("recent");
  const [menuTitulo, setMenuTitulo] = useState(false);
  const [menuOrdem, setMenuOrdem] = useState(false);

  const [modal, setModal] = useState<"det" | "form" | null>(null);
  const [selecionado, setSelecionado] = useState<Aviso | null>(null);
  const [form, setForm] = useState<Form>(vazio);
  const [salvando, setSalvando] = useState(false);
  const [paraExcluir, setParaExcluir] = useState<Aviso | null>(null);

  const tituloRef = useRef<HTMLDivElement>(null);
  const ordemRef = useRef<HTMLDivElement>(null);
  useClickOutside(tituloRef, useCallback(() => setMenuTitulo(false), []));
  useClickOutside(ordemRef, useCallback(() => setMenuOrdem(false), []));

  const pastor = cargo === "Pastor" || cargo === "Pastor Matriz";
  const pastorMatriz = cargo === "Pastor Matriz";
  // Pastores editam e excluem; avisos da Matriz só pelo Pastor Matriz.
  const podeEditar = (a: Aviso) => pastor && (!ehMatriz(a) || pastorMatriz);

  useEffect(() => {
    setCargo(sessionStorage.getItem("cargo"));
    setIdIgreja(sessionStorage.getItem("id_igreja"));
    setIdMatriz(sessionStorage.getItem("id_matriz"));
  }, []);

  const carregar = useCallback(async () => {
    const igreja = sessionStorage.getItem("id_igreja");
    if (!igreja) return setAvisos([]);
    try {
      const response = await api.get(`/avisos/matriz/${igreja}`);
      setAvisos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      // 404 = nenhum aviso publicado.
      setAvisos([]);
      if ((error as { response?: { status?: number } })?.response?.status !== 404) toast.error("Erro ao carregar avisos.", toastConfig);
    }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const filtrados = avisos.filter((a) => !termo || `${a.titulo} ${a.conteudo}`.toLowerCase().includes(termo));
    const quando = (a: Aviso) => new Date(a.data_criacao).getTime() || a.id_aviso;
    const cmp: Record<Sort, (a: Aviso, b: Aviso) => number> = {
      recent: (a, b) => quando(b) - quando(a),
      oldest: (a, b) => quando(a) - quando(b),
      "name-asc": (a, b) => a.titulo.localeCompare(b.titulo),
      "name-desc": (a, b) => b.titulo.localeCompare(a.titulo),
    };
    return [...filtrados].sort(cmp[ordem]);
  }, [avisos, busca, ordem]);

  const novo = () => { setSelecionado(null); setForm(vazio); setModal("form"); };
  const editar = () => {
    if (!selecionado) return;
    setForm({ titulo: selecionado.titulo || "", conteudo: selecionado.conteudo || "", tipo: ehMatriz(selecionado) ? "matriz" : "local" });
    setModal("form");
  };
  const fechar = () => { setModal(null); setSelecionado(null); };
  const voltar = () => setModal(selecionado ? "det" : null);

  async function salvar(event?: React.FormEvent) {
    event?.preventDefault();
    if (!form.titulo.trim() || !form.conteudo.trim()) {
      toast.warn("Preencha o título e a mensagem.", toastConfig);
      return;
    }
    const dados = { titulo: form.titulo.trim(), conteudo: form.conteudo.trim() };
    setSalvando(true);
    try {
      if (selecionado) {
        await api.put(`/avisos/${selecionado.id_aviso}`, dados);
        await carregar();
        setSelecionado({ ...selecionado, ...dados });
        setModal("det");
        toast.success("Aviso atualizado com sucesso!", toastConfig);
      } else {
        const global = form.tipo === "matriz" && pastorMatriz;
        await api.post("/avisos", { ...dados, is_global: global, id_matriz: global ? (idMatriz && idMatriz !== "null" ? idMatriz : idIgreja) : null });
        await carregar();
        fechar();
        toast.success("Aviso publicado com sucesso!", toastConfig);
      }
    } catch (error) {
      console.error("Erro ao salvar aviso:", error);
      toast.error(selecionado ? "Erro na atualização. Tente novamente." : "Erro ao publicar. Tente novamente.", toastConfig);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!paraExcluir) return;
    try {
      await api.delete(`/avisos/${paraExcluir.id_aviso}`);
      await carregar();
      toast.success("Aviso removido com sucesso!", toastConfig);
      fechar();
    } catch (error) {
      console.error("Erro ao excluir aviso:", error);
      toast.error("Erro ao remover aviso.", toastConfig);
    } finally {
      setParaExcluir(null);
    }
  }

  const editando = !!selecionado;
  const det = selecionado;
  const somenteLeitura = !!det && !podeEditar(det);
  const tagForm = tagDe(form.tipo === "matriz");

  return (
    <div className="min-h-screen bg-fundo">
      <div className="flex flex-col lg:flex-row">
        <MenuLateral />
        <div className="app-content">
          <div className="wrap">
            <nav className="crumb" aria-label="Navegação">
              <Link href="/pages/inicio">Início</Link><span aria-hidden="true">&gt;</span>
              <Link href="/pages/eventos">Eventos</Link><span aria-hidden="true">&gt;</span>
              <span className="cur" aria-current="page">Avisos</span>
            </nav>

            <div className="ttl-row" ref={tituloRef}>
              <h1 className="ptitle">Avisos</h1>
              <button type="button" className="ttl-btn" aria-label="Menu de navegação" aria-expanded={menuTitulo} onClick={() => setMenuTitulo((v) => !v)}>
                <ChevronDown className="i s32" aria-hidden="true" />
              </button>
              {menuTitulo && <div className="menu left"><Link href="/pages/eventos">Eventos</Link></div>}
            </div>

            <div className="toolbar">
              <div className="search">
                <Search className="i" aria-hidden="true" />
                <input type="text" placeholder="Pesquisar avisos..." aria-label="Pesquisar avisos" value={busca} onChange={(e) => setBusca(e.target.value)} />
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
              <button type="button" className="btn-add" onClick={novo}><Plus className="i s20" aria-hidden="true" />Novo Aviso</button>
            </div>

            {lista.length === 0 ? (
              <div className="card empty">
                <h3 className="t1" style={{ fontSize: 20, color: "#1f2937" }}>Nenhum aviso encontrado</h3>
                <p style={{ marginTop: 6 }}>{busca ? "Tente ajustar sua busca" : "Publique o primeiro aviso para a igreja"}</p>
              </div>
            ) : (
              <div className="cards">
                {lista.map((a) => {
                  const tag = tagDe(ehMatriz(a));
                  return (
                    <article key={a.id_aviso} className="card xc">
                      <div className="xc-head">
                        <span className={tag.cls}>{tag.label}</span>
                        {podeEditar(a) && (
                          <button type="button" className="del" aria-label={`Excluir ${a.titulo}`} onClick={() => setParaExcluir(a)}><Trash2 className="i" aria-hidden="true" /></button>
                        )}
                      </div>
                      <h3 className="xc-tit">{a.titulo}</h3>
                      <p className="xc-txt">{a.conteudo}</p>
                      <div className="xc-foot">
                        <span className="xc-meta" style={{ fontSize: 14, color: "#64748b" }}><Calendar className="i" aria-hidden="true" /><span title={`Publicado em ${dataBr(a.data_criacao)}`}>{dataBr(a.data_criacao)}</span></span>
                        <button type="button" className="xc-more" onClick={() => { setSelecionado(a); setModal("det"); }}>Ver aviso<ArrowRight className="i" aria-hidden="true" /></button>
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
      <Modal open={modal === "det" && !!det} onClose={fechar} title="Detalhes do aviso" subtitle={det ? agoLabel(det.data_criacao) : ""}>
        {det && (
          <>
            <div className="mx-b">
              <span className={tagDe(ehMatriz(det)).cls}>{tagDe(ehMatriz(det)).label}</span>
              <h3 className="xc-tit" style={{ marginTop: -6, fontSize: 24 }}>{det.titulo}</h3>
              <div className="vw">
                <ViewRow icon={MessageSquare} label="Mensagem" text>{det.conteudo}</ViewRow>
                <ViewRow icon={Calendar} label="Publicado em">{dataBr(det.data_criacao)}</ViewRow>
              </div>
              {somenteLeitura && (
                <p className="mx-note"><Lock className="i s18" aria-hidden="true" />
                  {ehMatriz(det) ? "Somente o Pastor Matriz pode editar este aviso." : "Somente pastores podem editar avisos."}
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
        title={editando ? "Editar aviso" : "Novo aviso"}
        subtitle={editando ? (det ? `Publicado em ${dataBr(det.data_criacao)}` : "") : "Escreva o aviso que a igreja vai ver."}
      >
        <div className="mx-b">
          {pastorMatriz && !editando ? (
            <div className="chips" role="radiogroup" aria-label="Tipo de aviso">
              <label><input type="radio" name="a-tipo" value="local" checked={form.tipo === "local"} onChange={() => setForm((f) => ({ ...f, tipo: "local" }))} />Aviso Local</label>
              <label><input type="radio" name="a-tipo" value="matriz" checked={form.tipo === "matriz"} onChange={() => setForm((f) => ({ ...f, tipo: "matriz" }))} />Aviso da Matriz</label>
            </div>
          ) : (
            <span className={tagForm.cls}>{tagForm.label}</span>
          )}
          <label className="sr" htmlFor="a-tit">Título do aviso</label>
          <input id="a-tit" className="ed-tit" placeholder="Título do aviso" maxLength={150} value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
          <div className="ed-f">
            <label className="ed-l" htmlFor="a-cont">Mensagem</label>
            <textarea id="a-cont" className="ed-in" placeholder="Escreva o aviso para a igreja..." value={form.conteudo} onChange={(e) => setForm((f) => ({ ...f, conteudo: e.target.value }))} />
          </div>
        </div>
        <div className="mx-f">
          <button type="button" className="btn ghost" onClick={voltar}>Cancelar</button>
          <button type="submit" className="btn pri" disabled={!form.titulo.trim() || salvando}>{editando ? "Salvar alterações" : "Publicar aviso"}</button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!paraExcluir}
        onCancel={() => setParaExcluir(null)}
        onConfirm={excluir}
        title="Excluir aviso?"
        message={<>“{paraExcluir?.titulo}” será removido. Essa ação não pode ser desfeita.</>}
      />

      <ToastContainer />
    </div>
  );
}
