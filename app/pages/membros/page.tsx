"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Cake, Calendar, Hash, Pencil, Phone, Plus, Sparkles, Trash2, UserPlus, Users } from "lucide-react";

import { ConfirmDialog, EditRow, Modal, ViewRow } from "@/app/components/ui/Modal";
import { apiMessage, initials, PageShell, Pager, SearchBox, SortMenu } from "@/app/components/ui/PageParts";
import { birthday, brDate } from "@/app/utils/date";
import { displayPhone, formatPhone, isValidPhone } from "@/app/utils/phone";
import { isMatriz } from "@/app/utils/auth";
import api from "../../api/api";

import "react-toastify/dist/ReactToastify.css";

interface Membro {
  id_membro: number;
  cod_membro: string;
  nome: string;
  numero: string | null;
  birth: string;
  novo_convertido: "Sim" | "Não";
  id_departamento: number | null;
  id_igreja: number;
}
interface Departamento { id_departamento: number; nome: string }

type Sort = "recent" | "oldest" | "name-asc" | "name-desc" | "niver";
type Form = { cod: string; nome: string; tel: string; nasc: string; dep: string; novo: "Sim" | "Não" };

const SORTS: [Sort, string][] = [["recent", "Adicionados recentemente"], ["oldest", "Adicionados antigamente"], ["name-asc", "Nome A-Z"], ["name-desc", "Nome Z-A"], ["niver", "Aniversário (jan → dez)"]];
const vazio: Form = { cod: "", nome: "", tel: "", nasc: "", dep: "", novo: "Não" };
const POR_PAGINA = 10;
const toastConfig = { position: "top-center" as const, autoClose: 1800, theme: "colored" as const };
const COLS = "minmax(0, 2.2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)";

export default function Membros() {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<Sort>("recent");
  const [pagina, setPagina] = useState(1);
  const [matriz, setMatriz] = useState(false);

  const [modal, setModal] = useState<"det" | "form" | null>(null);
  const [sel, setSel] = useState<Membro | null>(null);
  const [form, setForm] = useState<Form>(vazio);
  const [salvando, setSalvando] = useState(false);
  const [paraExcluir, setParaExcluir] = useState<Membro | null>(null);

  const nomeDep = useCallback((id: number | null) => departamentos.find((d) => d.id_departamento === id)?.nome || "", [departamentos]);

  const carregar = useCallback(async () => {
    const igreja = sessionStorage.getItem("id_igreja");
    if (!igreja) return;
    try {
      const { data } = await api.get(`/membro/igreja/${igreja}`);
      setMembros(Array.isArray(data) ? data : []);
    } catch (error) {
      setMembros([]);
      if ((error as { response?: { status?: number } })?.response?.status !== 404) toast.error("Erro ao carregar membros.", toastConfig);
    }
  }, []);

  useEffect(() => {
    setMatriz(isMatriz());
    void carregar();
    api.get("/departamento").then(({ data }) => setDepartamentos(Array.isArray(data) ? data : [])).catch(() => setDepartamentos([]));
  }, [carregar]);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const digitos = termo.replace(/\D/g, "");
    const filtrados = membros.filter((m) => !termo
      || `${m.nome} ${m.cod_membro} ${nomeDep(m.id_departamento)}`.toLowerCase().includes(termo)
      || (digitos !== "" && String(m.numero ?? "").includes(digitos)));
    const cmp: Record<Sort, (a: Membro, b: Membro) => number> = {
      recent: (a, b) => b.id_membro - a.id_membro,
      oldest: (a, b) => a.id_membro - b.id_membro,
      "name-asc": (a, b) => a.nome.localeCompare(b.nome),
      "name-desc": (a, b) => b.nome.localeCompare(a.nome),
      niver: (a, b) => birthday(a.birth).chave - birthday(b.birth).chave,
    };
    return [...filtrados].sort(cmp[ordem]);
  }, [membros, busca, ordem, nomeDep]);

  useEffect(() => { setPagina(1); }, [busca, ordem]);
  const visiveis = lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const novo = () => { setSel(null); setForm(vazio); setModal("form"); };
  const editar = () => {
    if (!sel) return;
    setForm({ cod: sel.cod_membro || "", nome: sel.nome || "", tel: formatPhone(sel.numero), nasc: (sel.birth || "").slice(0, 10), dep: sel.id_departamento ? String(sel.id_departamento) : "", novo: sel.novo_convertido === "Sim" ? "Sim" : "Não" });
    setModal("form");
  };
  const fechar = () => { setModal(null); setSel(null); };
  const voltar = () => setModal(sel ? "det" : null);
  const campo = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function salvar(event?: React.FormEvent) {
    event?.preventDefault();
    if (!form.nome.trim() || !form.cod.trim() || !form.nasc) return void toast.warn("Preencha nome, código e nascimento.", toastConfig);
    if (form.tel.trim() && !isValidPhone(form.tel)) return void toast.warn("Celular inválido. Use DDD + número, por exemplo (11) 98765-4321.", toastConfig);
    const dados = { cod_membro: form.cod.trim(), nome: form.nome.trim(), numero: form.tel.trim(), birth: form.nasc, novo_convertido: form.novo, id_departamento: form.dep ? Number(form.dep) : null };
    setSalvando(true);
    try {
      if (sel) {
        await api.put(`/membro/${sel.id_membro}/${sel.id_igreja}`, dados);
        await carregar();
        setSel({ ...sel, ...dados, numero: dados.numero.replace(/\D/g, "") || null });
        setModal("det");
        toast.success("Membro atualizado com sucesso!", toastConfig);
      } else {
        await api.post("/membro", dados);
        await carregar();
        fechar();
        toast.success("Membro cadastrado com sucesso!", toastConfig);
      }
    } catch (error) {
      toast.error(apiMessage(error, sel ? "Erro na atualização. Tente novamente." : "Erro no cadastro. Tente novamente."), toastConfig);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!paraExcluir) return;
    try {
      await api.delete(`/membro/${paraExcluir.id_membro}`);
      await carregar();
      fechar();
      toast.success("Membro removido com sucesso!", toastConfig);
    } catch (error) {
      toast.error(apiMessage(error, "Erro ao remover membro."), toastConfig);
    } finally {
      setParaExcluir(null);
    }
  }

  const titleLinks = [{ label: "Obreiros", href: "/pages/obreiros" }, { label: "Departamentos", href: "/pages/departamentos" }, ...(matriz ? [{ label: "Igrejas", href: "/pages/igrejas" }] : [])];

  return (
    <PageShell
      crumbs={[{ label: "Início", href: "/pages/inicio" }, { label: "Membros" }]}
      title="Membros"
      titleLinks={titleLinks}
      after={(
        <>
          <Modal open={modal === "det" && !!sel} onClose={fechar} title="Detalhes do membro" subtitle={sel ? `Cód. ${sel.cod_membro}` : ""}>
            {sel && (
              <>
                <div className="mx-b">
                  <div className="pf">
                    <span className="av" aria-hidden="true">{initials(sel.nome)}</span>
                    <div><h3 className="xc-tit">{sel.nome}</h3>{sel.novo_convertido === "Sim" && <span className="tag tag-ok">Novo convertido</span>}</div>
                  </div>
                  <div className="vw">
                    <ViewRow icon={Phone} label="Celular">{displayPhone(sel.numero) || "—"}</ViewRow>
                    <ViewRow icon={Calendar} label="Nascimento">{brDate(sel.birth)} · {birthday(sel.birth).texto.split("· ")[1]}</ViewRow>
                    <ViewRow icon={Users} label="Departamento">{nomeDep(sel.id_departamento) || "Sem departamento"}</ViewRow>
                  </div>
                </div>
                <div className="mx-f split">
                  <button type="button" className="btn dng-g" onClick={() => setParaExcluir(sel)}><Trash2 className="i s18" aria-hidden="true" />Excluir</button>
                  <button type="button" className="btn pri" onClick={editar}><Pencil className="i s18" aria-hidden="true" />Editar</button>
                </div>
              </>
            )}
          </Modal>

          <Modal open={modal === "form"} onClose={fechar} as="form" onSubmit={salvar} title={sel ? "Editar membro" : "Novo membro"} subtitle={sel ? "Atualize os dados do membro." : "Preencha os dados para cadastrar."}>
            <div className="mx-b">
              <label className="sr" htmlFor="f-nome">Nome completo</label>
              <input id="f-nome" className="ed-tit" placeholder="Nome completo" maxLength={150} value={form.nome} onChange={campo("nome")} />
              <div className="vw">
                <EditRow icon={Hash} label="Código" htmlFor="f-cod"><input id="f-cod" className="ed-in" placeholder="Ex.: M-0110" maxLength={16} value={form.cod} onChange={campo("cod")} /></EditRow>
                <EditRow icon={Phone} label="Celular" htmlFor="f-tel">
                  <input id="f-tel" className="ed-in" type="tel" inputMode="numeric" autoComplete="tel" placeholder="(11) 98765-4321" maxLength={20} value={form.tel} onChange={(e) => setForm((f) => ({ ...f, tel: formatPhone(e.target.value) }))} />
                </EditRow>
                <EditRow icon={Calendar} label="Nascimento" htmlFor="f-nasc"><input id="f-nasc" className="ed-in" type="date" value={form.nasc} onChange={campo("nasc")} /></EditRow>
                <EditRow icon={Users} label="Departamento" htmlFor="f-dep">
                  <select id="f-dep" className="ed-in" value={form.dep} onChange={campo("dep")}>
                    <option value="">Sem departamento</option>
                    {departamentos.map((d) => <option key={d.id_departamento} value={d.id_departamento}>{d.nome}</option>)}
                  </select>
                </EditRow>
                <EditRow icon={Sparkles} label="Novo convertido" labelId="f-nc-l">
                  <div className="chips" role="radiogroup" aria-labelledby="f-nc-l">
                    {(["Sim", "Não"] as const).map((v) => (
                      <label key={v}><input type="radio" name="f-nc" value={v} checked={form.novo === v} onChange={() => setForm((f) => ({ ...f, novo: v }))} />{v}</label>
                    ))}
                  </div>
                </EditRow>
              </div>
            </div>
            <div className="mx-f">
              <button type="button" className="btn ghost" onClick={voltar}>Cancelar</button>
              <button type="submit" className="btn pri" disabled={!form.nome.trim() || salvando}>{sel ? "Salvar alterações" : "Cadastrar membro"}</button>
            </div>
          </Modal>

          <ConfirmDialog
            open={!!paraExcluir}
            onCancel={() => setParaExcluir(null)}
            onConfirm={excluir}
            title="Excluir membro?"
            message={<>“{paraExcluir?.nome}” será removido da lista de membros. Essa ação não pode ser desfeita.</>}
          />
          <ToastContainer />
        </>
      )}
    >
      <div className="toolbar">
        <SearchBox value={busca} onChange={setBusca} placeholder="Pesquisar membros..." />
        <SortMenu options={SORTS} value={ordem} onChange={setOrdem} />
        <button type="button" className="btn-add" onClick={novo}><Plus className="i s20" aria-hidden="true" />Novo Membro</button>
      </div>

      {lista.length === 0 ? (
        <div className="card empty">
          <div style={{ display: "grid", placeItems: "center", width: 64, height: 64, margin: "0 auto 12px", borderRadius: 999, background: "#eff6ff", color: "#5271FF" }}><UserPlus className="i s32" aria-hidden="true" /></div>
          <h3 className="t1" style={{ fontSize: 20, color: "#1f2937" }}>Nenhum membro encontrado</h3>
          <p style={{ marginTop: 6 }}>{busca ? "Tente ajustar sua busca" : "Cadastre o primeiro membro da igreja"}</p>
        </div>
      ) : (
        <>
          <div className="tbl-wrap lite">
            <div className="dt">
              <div className="dt-h" style={{ gridTemplateColumns: COLS }}><span>Membro</span><span>Departamento</span><span>Celular</span><span>Aniversário</span></div>
              {visiveis.map((m) => {
                const niver = birthday(m.birth);
                const dep = nomeDep(m.id_departamento);
                return (
                  <div key={m.id_membro} className="dt-r" style={{ gridTemplateColumns: COLS }}>
                    <button type="button" className="hit" aria-label={`Ver ${m.nome}`} onClick={() => { setSel(m); setModal("det"); }} />
                    <div className="c-mb" data-label="Membro">
                      <div className="mb">
                        <span className="av" aria-hidden="true">{initials(m.nome)}</span>
                        <div>
                          <p className="mb-n"><span className="mb-t">{m.nome}</span>{m.novo_convertido === "Sim" && <span className="tag tag-ok">Novo convertido</span>}</p>
                          <p className="mb-c">{m.cod_membro}</p>
                        </div>
                      </div>
                    </div>
                    <span className="c-dep" data-label="Departamento">{dep ? <span className="tag tag-loc">{dep}</span> : <span className="mb-c">—</span>}</span>
                    <span className="c-tel" data-label="Celular">{displayPhone(m.numero) || "—"}</span>
                    <span className="c-niv" data-label="Aniversário">
                      <span className={`niver${niver.mes ? " mes" : ""}`}>{niver.mes && <Cake className="i" aria-hidden="true" />}{niver.texto}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <Pager page={pagina} total={lista.length} perPage={POR_PAGINA} onPage={setPagina} />
        </>
      )}
    </PageShell>
  );
}
