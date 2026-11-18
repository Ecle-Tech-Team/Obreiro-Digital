"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Cake, Calendar, Hash, KeyRound, Lock, Mail, Pencil, Plus, Trash2, UserPlus } from "lucide-react";

import { ConfirmDialog, EditRow, Modal, ViewRow } from "@/app/components/ui/Modal";
import { apiMessage, initials, PageShell, SearchBox, SortMenu } from "@/app/components/ui/PageParts";
import { birthday, brDate } from "@/app/utils/date";
import { isMatriz } from "@/app/utils/auth";
import api from "../../api/api";

import "react-toastify/dist/ReactToastify.css";

interface Obreiro { id_user: number; cod_membro: string; nome: string; email: string; birth: string; cargo: string; id_igreja: number }
type Sort = "recent" | "oldest" | "name-asc" | "name-desc" | "niver";
type Form = { cod: string; nome: string; email: string; senha: string; nasc: string; cargo: string };

const SORTS: [Sort, string][] = [["recent", "Adicionados recentemente"], ["oldest", "Adicionados antigamente"], ["name-asc", "Nome A-Z"], ["name-desc", "Nome Z-A"], ["niver", "Aniversário (jan → dez)"]];
const toastConfig = { position: "top-center" as const, autoClose: 1800, theme: "colored" as const };
const ehPastor = (cargo?: string | null) => cargo === "Pastor" || cargo === "Pastor Matriz";

export default function Obreiros() {
  const [obreiros, setObreiros] = useState<Obreiro[]>([]);
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<Sort>("name-asc");
  const [eu, setEu] = useState<{ id: number; cargo: string | null; igreja: string | null; matriz: boolean }>({ id: 0, cargo: null, igreja: null, matriz: false });

  const [modal, setModal] = useState<"det" | "form" | null>(null);
  const [sel, setSel] = useState<Obreiro | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [paraExcluir, setParaExcluir] = useState<Obreiro | null>(null);

  // Usuários da matriz cadastram cargos "Matriz"; nas demais igrejas, Pastor e Obreiro.
  const cargos = eu.matriz ? ["Obreiro Matriz", "Pastor Matriz"] : ["Obreiro", "Pastor"];
  const souPastor = ehPastor(eu.cargo);
  const podeMexer = (o: Obreiro) => souPastor || o.id_user === eu.id;

  const carregar = useCallback(async () => {
    const igreja = sessionStorage.getItem("id_igreja");
    if (!igreja) return;
    try {
      const { data } = await api.get(`/cadastro/obreiros/${igreja}`);
      setObreiros(Array.isArray(data) ? data : []);
    } catch (error) {
      setObreiros([]);
      toast.error(apiMessage(error, "Erro ao carregar obreiros."), toastConfig);
    }
  }, []);

  useEffect(() => {
    setEu({ id: Number(sessionStorage.getItem("id_user")), cargo: sessionStorage.getItem("cargo"), igreja: sessionStorage.getItem("id_igreja"), matriz: isMatriz() });
    void carregar();
  }, [carregar]);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const filtrados = obreiros.filter((o) => !termo || `${o.nome} ${o.email} ${o.cod_membro} ${o.cargo}`.toLowerCase().includes(termo));
    const cmp: Record<Sort, (a: Obreiro, b: Obreiro) => number> = {
      recent: (a, b) => b.id_user - a.id_user,
      oldest: (a, b) => a.id_user - b.id_user,
      "name-asc": (a, b) => a.nome.localeCompare(b.nome),
      "name-desc": (a, b) => b.nome.localeCompare(a.nome),
      niver: (a, b) => birthday(a.birth).chave - birthday(b.birth).chave,
    };
    return [...filtrados].sort(cmp[ordem]);
  }, [obreiros, busca, ordem]);

  const novo = () => { setSel(null); setForm({ cod: "", nome: "", email: "", senha: "", nasc: "", cargo: cargos[0] }); setModal("form"); };
  const editar = () => {
    if (!sel) return;
    setForm({ cod: sel.cod_membro || "", nome: sel.nome || "", email: sel.email || "", senha: "", nasc: (sel.birth || "").slice(0, 10), cargo: sel.cargo });
    setModal("form");
  };
  const fechar = () => { setModal(null); setSel(null); setForm(null); };
  const voltar = () => setModal(sel ? "det" : null);
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => (f ? { ...f, [k]: e.target.value } : f));

  const editandoProprio = !!sel && sel.id_user === eu.id;

  async function salvar(event?: React.FormEvent) {
    event?.preventDefault();
    if (!form) return;
    if (!form.nome.trim() || !form.cod.trim() || !form.email.trim() || !form.nasc) return void toast.warn("Preencha nome, código, email e nascimento.", toastConfig);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return void toast.warn("Email inválido.", toastConfig);
    if ((!sel || form.senha) && form.senha.length < 10) return void toast.warn("A senha deve ter pelo menos 10 caracteres.", toastConfig);
    setSalvando(true);
    try {
      if (sel) {
        const dados: Record<string, string> = { cod_membro: form.cod.trim(), nome: form.nome.trim(), birth: form.nasc };
        // A própria conta troca email e senha em Configurações (exige a senha atual).
        if (!editandoProprio) {
          dados.email = form.email.trim();
          if (form.senha) dados.senha = form.senha;
        }
        if (souPastor && form.cargo !== sel.cargo) dados.cargo = form.cargo;
        await api.put(`/cadastro/${sel.id_user}`, dados);
        await carregar();
        setSel({ ...sel, ...dados, email: dados.email ?? sel.email, cargo: dados.cargo ?? sel.cargo });
        setModal("det");
        toast.success("Obreiro atualizado com sucesso!", toastConfig);
      } else {
        await api.post("/cadastro", { cod_membro: form.cod.trim(), nome: form.nome.trim(), email: form.email.trim(), senha: form.senha, birth: form.nasc, cargo: form.cargo, id_igreja: eu.igreja });
        await carregar();
        fechar();
        toast.success("Obreiro cadastrado com sucesso!", toastConfig);
      }
    } catch (error) {
      toast.error(apiMessage(error, sel ? "Erro na atualização. Tente novamente." : "Erro no cadastro. Verifique se o email já está em uso."), { ...toastConfig, autoClose: 4000 });
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!paraExcluir) return;
    try {
      await api.delete(`/cadastro/${paraExcluir.id_user}`);
      await carregar();
      fechar();
      toast.success("Obreiro removido com sucesso!", toastConfig);
    } catch (error) {
      toast.error(apiMessage(error, "Erro ao remover obreiro."), { ...toastConfig, autoClose: 4000 });
    } finally {
      setParaExcluir(null);
    }
  }

  const titleLinks = [{ label: "Membros", href: "/pages/membros" }, { label: "Departamentos", href: "/pages/departamentos" }, ...(eu.matriz ? [{ label: "Igrejas", href: "/pages/igrejas" }] : [])];
  // O cargo atual sempre aparece entre as opções, para o campo nunca mostrar um valor diferente do real.
  const opcoesCargo = form && !cargos.includes(form.cargo) ? [form.cargo, ...cargos] : cargos;

  return (
    <PageShell
      crumbs={[{ label: "Início", href: "/pages/inicio" }, { label: "Membros", href: "/pages/membros" }, { label: "Obreiros" }]}
      title="Obreiros"
      titleLinks={titleLinks}
      after={(
        <>
          <Modal open={modal === "det" && !!sel} onClose={fechar} title="Detalhes do obreiro" subtitle={sel ? `Cód. ${sel.cod_membro}` : ""}>
            {sel && (
              <>
                <div className="mx-b">
                  <div className="pf">
                    <span className="av" aria-hidden="true">{initials(sel.nome)}</span>
                    <div><h3 className="xc-tit">{sel.nome}</h3><span className={ehPastor(sel.cargo) ? "tag tag-mat" : "tag tag-loc"}>{sel.cargo}</span></div>
                  </div>
                  <div className="vw">
                    <ViewRow icon={Mail} label="Email">{sel.email}</ViewRow>
                    <ViewRow icon={Calendar} label="Nascimento">{brDate(sel.birth)}</ViewRow>
                  </div>
                </div>
                {podeMexer(sel) ? (
                  <div className="mx-f split">
                    <button type="button" className="btn dng-g" onClick={() => setParaExcluir(sel)}><Trash2 className="i s18" aria-hidden="true" />Excluir</button>
                    <button type="button" className="btn pri" onClick={editar}><Pencil className="i s18" aria-hidden="true" />Editar</button>
                  </div>
                ) : (
                  <div className="mx-f"><button type="button" className="btn pri" onClick={fechar}>Fechar</button></div>
                )}
              </>
            )}
          </Modal>

          <Modal open={modal === "form" && !!form} onClose={fechar} as="form" onSubmit={salvar} title={sel ? "Editar obreiro" : "Novo obreiro"} subtitle={sel ? "Atualize os dados de acesso." : "A pessoa entra no app com este email e senha."}>
            {form && (
              <>
                <div className="mx-b">
                  {souPastor && (
                    <div className="chips" role="radiogroup" aria-label="Cargo">
                      {opcoesCargo.map((c) => (
                        <label key={c}><input type="radio" name="o-cargo" value={c} checked={form.cargo === c} onChange={() => setForm({ ...form, cargo: c })} />{c}</label>
                      ))}
                    </div>
                  )}
                  <label className="sr" htmlFor="o-nome">Nome completo</label>
                  <input id="o-nome" className="ed-tit" placeholder="Nome completo" maxLength={150} value={form.nome} onChange={set("nome")} />
                  <div className="vw">
                    <EditRow icon={Hash} label="Código" htmlFor="o-cod"><input id="o-cod" className="ed-in" placeholder="Ex.: O-206" maxLength={16} value={form.cod} onChange={set("cod")} /></EditRow>
                    <EditRow icon={Mail} label="Email" htmlFor="o-email">
                      <input id="o-email" className="ed-in" type="email" autoComplete="off" placeholder="nome@exemplo.com" maxLength={150} value={form.email} onChange={set("email")} disabled={editandoProprio} />
                    </EditRow>
                    {!editandoProprio && (
                      <EditRow icon={KeyRound} label="Senha" htmlFor="o-senha">
                        <input id="o-senha" className="ed-in" type="password" autoComplete="new-password" placeholder={sel ? "Deixe em branco para manter" : "Mínimo de 10 caracteres"} maxLength={128} value={form.senha} onChange={set("senha")} />
                      </EditRow>
                    )}
                    <EditRow icon={Calendar} label="Nascimento" htmlFor="o-nasc"><input id="o-nasc" className="ed-in" type="date" value={form.nasc} onChange={set("nasc")} /></EditRow>
                  </div>
                  {editandoProprio && <p className="mx-note"><Lock className="i s18" aria-hidden="true" />Seu email e sua senha são alterados em Configurações.</p>}
                </div>
                <div className="mx-f">
                  <button type="button" className="btn ghost" onClick={voltar}>Cancelar</button>
                  <button type="submit" className="btn pri" disabled={!form.nome.trim() || salvando}>{sel ? "Salvar alterações" : "Cadastrar obreiro"}</button>
                </div>
              </>
            )}
          </Modal>

          <ConfirmDialog
            open={!!paraExcluir}
            onCancel={() => setParaExcluir(null)}
            onConfirm={excluir}
            title="Excluir obreiro?"
            message={<>“{paraExcluir?.nome}” perderá o acesso ao app. Essa ação não pode ser desfeita.</>}
          />
          <ToastContainer />
        </>
      )}
    >
      <div className="toolbar">
        <SearchBox value={busca} onChange={setBusca} placeholder="Pesquisar obreiros..." />
        <SortMenu options={SORTS} value={ordem} onChange={setOrdem} />
        {souPastor && <button type="button" className="btn-add" onClick={novo}><Plus className="i s20" aria-hidden="true" />Novo Obreiro</button>}
      </div>

      {lista.length === 0 ? (
        <div className="card empty">
          <div style={{ display: "grid", placeItems: "center", width: 64, height: 64, margin: "0 auto 12px", borderRadius: 999, background: "#eff6ff", color: "#5271FF" }}><UserPlus className="i s32" aria-hidden="true" /></div>
          <h3 className="t1" style={{ fontSize: 20, color: "#1f2937" }}>Nenhum obreiro encontrado</h3>
          <p style={{ marginTop: 6 }}>Tente ajustar sua busca</p>
        </div>
      ) : (
        <div className="cards">
          {lista.map((o) => {
            const niver = birthday(o.birth);
            return (
              <article key={o.id_user} className="card lc">
                <button type="button" className="hit" aria-label={`Ver ${o.nome}`} onClick={() => { setSel(o); setModal("det"); }} />
                <div className="lc-top"><span className="av" aria-hidden="true">{initials(o.nome)}</span><span className={ehPastor(o.cargo) ? "tag tag-mat" : "tag tag-loc"}>{o.cargo}</span></div>
                <h3 className="lc-tit">{o.nome}</h3>
                <p className="xc-meta"><Mail className="i" aria-hidden="true" /><span>{o.email}</span></p>
                <div className="lc-foot row">
                  <span className="lc-cod">{o.cod_membro}</span>
                  <span className="xc-meta"><span className={`niver${niver.mes ? " mes" : ""}`}>{niver.mes ? <Cake className="i" aria-hidden="true" /> : <Calendar className="i" aria-hidden="true" />}Aniversário {niver.ddmm ?? "—"}</span></span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
