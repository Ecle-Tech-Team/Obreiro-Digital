"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { CalendarHeart, Flag, Pencil, Plus, Users } from "lucide-react";

import { EditRow, Modal, ViewRow } from "@/app/components/ui/Modal";
import { apiMessage, PageShell, SearchBox, SortMenu } from "@/app/components/ui/PageParts";
import { brDate, parseDateOnly } from "@/app/utils/date";
import { isMatriz } from "@/app/utils/auth";
import api from "../../api/api";

import "react-toastify/dist/ReactToastify.css";

interface Departamento { id_departamento: number; nome: string; birth: string; data_congresso: string | null; id_igreja: number; qtd_membros?: number }
type Sort = "recent" | "oldest" | "name-asc" | "name-desc" | "membros";
type Form = { nome: string; fund: string; cong: string };

const SORTS: [Sort, string][] = [["recent", "Adicionados recentemente"], ["oldest", "Adicionados antigamente"], ["name-asc", "Nome A-Z"], ["name-desc", "Nome Z-A"], ["membros", "Mais membros"]];
const toastConfig = { position: "top-center" as const, autoClose: 1800, theme: "colored" as const };

// "Congresso 18/07/2026 · em 12 dias" ou "· já realizado".
function congresso(valor?: string | null) {
  if (!valor) return "Sem congresso marcado";
  const d = parseDateOnly(valor);
  if (Number.isNaN(d.getTime())) return "Sem congresso marcado";
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const n = Math.round((d.getTime() - hoje.getTime()) / 864e5);
  const quando = n < 0 ? "já realizado" : n === 0 ? "hoje" : n === 1 ? "amanhã" : `em ${n} dias`;
  return `Congresso ${brDate(valor)} · ${quando}`;
}
const fundacao = (valor?: string | null) => { const d = parseDateOnly(valor); return Number.isNaN(d.getTime()) ? "Fundação não informada" : `Fundado em ${d.getFullYear()}`; };
const qtd = (n?: number) => `${Number(n || 0)} ${Number(n || 0) === 1 ? "membro" : "membros"}`;

export default function Departamentos() {
  const [lista0, setLista0] = useState<Departamento[]>([]);
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<Sort>("name-asc");
  const [matriz, setMatriz] = useState(false);

  const [modal, setModal] = useState<"det" | "form" | null>(null);
  const [sel, setSel] = useState<Departamento | null>(null);
  const [form, setForm] = useState<Form>({ nome: "", fund: "", cong: "" });
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    const igreja = sessionStorage.getItem("id_igreja");
    if (!igreja) return;
    try {
      const { data } = await api.get(`/departamento/${igreja}`);
      setLista0(Array.isArray(data) ? data : []);
    } catch (error) {
      setLista0([]);
      if ((error as { response?: { status?: number } })?.response?.status !== 404) toast.error("Erro ao carregar departamentos.", toastConfig);
    }
  }, []);

  useEffect(() => { setMatriz(isMatriz()); void carregar(); }, [carregar]);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const cmp: Record<Sort, (a: Departamento, b: Departamento) => number> = {
      recent: (a, b) => b.id_departamento - a.id_departamento,
      oldest: (a, b) => a.id_departamento - b.id_departamento,
      "name-asc": (a, b) => a.nome.localeCompare(b.nome),
      "name-desc": (a, b) => b.nome.localeCompare(a.nome),
      membros: (a, b) => Number(b.qtd_membros || 0) - Number(a.qtd_membros || 0),
    };
    return lista0.filter((d) => !termo || d.nome.toLowerCase().includes(termo)).sort(cmp[ordem]);
  }, [lista0, busca, ordem]);

  const novo = () => { setSel(null); setForm({ nome: "", fund: "", cong: "" }); setModal("form"); };
  const editar = () => { if (sel) { setForm({ nome: sel.nome, fund: (sel.birth || "").slice(0, 10), cong: (sel.data_congresso || "").slice(0, 10) }); setModal("form"); } };
  const fechar = () => { setModal(null); setSel(null); };
  const voltar = () => setModal(sel ? "det" : null);

  async function salvar(event?: React.FormEvent) {
    event?.preventDefault();
    if (!form.nome.trim() || !form.fund) return void toast.warn("Preencha o nome e a data de fundação.", toastConfig);
    const dados = { nome: form.nome.trim(), birth: form.fund, data_congresso: form.cong || null };
    setSalvando(true);
    try {
      if (sel) {
        await api.put(`/departamento/${sel.id_departamento}/${sel.id_igreja}`, dados);
        await carregar();
        setSel({ ...sel, ...dados });
        setModal("det");
        toast.success("Departamento atualizado com sucesso!", toastConfig);
      } else {
        await api.post("/departamento", dados);
        await carregar();
        fechar();
        toast.success("Departamento cadastrado com sucesso!", toastConfig);
      }
    } catch (error) {
      toast.error(apiMessage(error, sel ? "Erro na atualização. Tente novamente." : "Erro no cadastro. Tente novamente."), toastConfig);
    } finally {
      setSalvando(false);
    }
  }

  const titleLinks = [{ label: "Membros", href: "/pages/membros" }, { label: "Obreiros", href: "/pages/obreiros" }, ...(matriz ? [{ label: "Igrejas", href: "/pages/igrejas" }] : [])];

  return (
    <PageShell
      crumbs={[{ label: "Início", href: "/pages/inicio" }, { label: "Membros", href: "/pages/membros" }, { label: "Departamentos" }]}
      title="Departamentos"
      titleLinks={titleLinks}
      after={(
        <>
          <Modal open={modal === "det" && !!sel} onClose={fechar} title="Detalhes do departamento" subtitle={sel ? qtd(sel.qtd_membros) : ""}>
            {sel && (
              <>
                <div className="mx-b">
                  <div className="pf"><span className="av" aria-hidden="true"><Users className="i" /></span><div><h3 className="xc-tit">{sel.nome}</h3><p className="pf-sub">{qtd(sel.qtd_membros)}</p></div></div>
                  <div className="vw">
                    <ViewRow icon={Flag} label="Fundação">{brDate(sel.birth) || "—"}</ViewRow>
                    <ViewRow icon={CalendarHeart} label="Congresso">{sel.data_congresso ? congresso(sel.data_congresso).replace("Congresso ", "") : "Sem congresso marcado"}</ViewRow>
                  </div>
                </div>
                <div className="mx-f"><button type="button" className="btn pri" onClick={editar}><Pencil className="i s18" aria-hidden="true" />Editar</button></div>
              </>
            )}
          </Modal>

          <Modal open={modal === "form"} onClose={fechar} as="form" onSubmit={salvar} title={sel ? "Editar departamento" : "Novo departamento"} subtitle={sel ? "Atualize os dados do departamento." : "Crie um grupo para organizar os membros."}>
            <div className="mx-b">
              <label className="sr" htmlFor="dp-nome">Nome do departamento</label>
              <input id="dp-nome" className="ed-tit" placeholder="Nome do departamento" maxLength={150} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              <div className="vw">
                <EditRow icon={Flag} label="Fundação" htmlFor="dp-fund"><input id="dp-fund" className="ed-in" type="date" value={form.fund} onChange={(e) => setForm({ ...form, fund: e.target.value })} /></EditRow>
                <EditRow icon={CalendarHeart} label="Congresso" htmlFor="dp-cong"><input id="dp-cong" className="ed-in" type="date" value={form.cong} onChange={(e) => setForm({ ...form, cong: e.target.value })} /></EditRow>
              </div>
            </div>
            <div className="mx-f">
              <button type="button" className="btn ghost" onClick={voltar}>Cancelar</button>
              <button type="submit" className="btn pri" disabled={!form.nome.trim() || salvando}>{sel ? "Salvar alterações" : "Criar departamento"}</button>
            </div>
          </Modal>
          <ToastContainer />
        </>
      )}
    >
      <div className="toolbar">
        <SearchBox value={busca} onChange={setBusca} placeholder="Pesquisar departamentos..." />
        <SortMenu options={SORTS} value={ordem} onChange={setOrdem} />
        <button type="button" className="btn-add" onClick={novo}><Plus className="i s20" aria-hidden="true" />Novo Departamento</button>
      </div>

      {lista.length === 0 ? (
        <div className="card empty">
          <h3 className="t1" style={{ fontSize: 20, color: "#1f2937" }}>Nenhum departamento encontrado</h3>
          <p style={{ marginTop: 6 }}>{busca ? "Tente ajustar sua busca" : "Crie o primeiro departamento"}</p>
        </div>
      ) : (
        <div className="cards">
          {lista.map((d) => (
            <article key={d.id_departamento} className="card lc">
              <button type="button" className="hit" aria-label={`Ver ${d.nome}`} onClick={() => { setSel(d); setModal("det"); }} />
              <div className="lc-top"><span className="av" aria-hidden="true"><Users className="i" /></span></div>
              <h3 className="lc-tit">{d.nome}</h3>
              <p className="lc-big"><b>{Number(d.qtd_membros || 0)}</b>{Number(d.qtd_membros || 0) === 1 ? "membro" : "membros"}</p>
              <div className="lc-foot">
                <p className="xc-meta"><CalendarHeart className="i" aria-hidden="true" /><span>{congresso(d.data_congresso)}</span></p>
                <p className="xc-meta"><Flag className="i" aria-hidden="true" /><span>{fundacao(d.birth)}</span></p>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
