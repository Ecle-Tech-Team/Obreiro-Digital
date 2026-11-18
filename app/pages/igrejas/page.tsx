"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import { Church, Map as MapIcon, MapPin, Plus, TriangleAlert, UserRound } from "lucide-react";

import NovaFilialModal from "@/app/components/filiais/NovaFilialModal";
import ConvitePastorModal from "@/app/components/filiais/ConvitePastorModal";
import { Modal, ViewRow } from "@/app/components/ui/Modal";
import { initials, PageShell, SearchBox, SortMenu } from "@/app/components/ui/PageParts";
import { brDate } from "@/app/utils/date";
import { displayPhone } from "@/app/utils/phone";
import api from "../../api/api";

import "react-toastify/dist/ReactToastify.css";

interface Igreja { id_igreja: number; nome: string; cnpj: string; data_fundacao: string; ministerio: string; setor: string; cep: string; endereco: string; bairro: string; cidade: string; id_matriz: number | null }
interface Situacao { id_igreja: number; total_pastores: number; pastor_nome: string | null; convite_expira_em: string | null }
type Sort = "nome" | "cidade" | "recent";
type Aba = "membros" | "obreiros" | "departamentos";

const SORTS: [Sort, string][] = [["nome", "Nome A-Z"], ["cidade", "Cidade"], ["recent", "Adicionadas recentemente"]];
const ABAS: [Aba, string][] = [["membros", "Membros"], ["obreiros", "Obreiros"], ["departamentos", "Departamentos"]];
const COLS = { membros: ["Nome", "Código", "Celular", "Nascimento"], obreiros: ["Nome", "Email", "Cargo", "Nascimento"], departamentos: ["Nome", "Fundação", "Congresso", "Membros"] };
const ROTAS = { membros: "/membro/matriz/", obreiros: "/cadastro/matriz/", departamentos: "/departamento/matriz/" };

type Linha = Record<string, string | number | null>;
const linhaDe = (aba: Aba, r: Linha): string[] => aba === "membros"
  ? [String(r.nome ?? ""), String(r.cod_membro ?? ""), displayPhone(r.numero as string) || "—", brDate(r.birth as string)]
  : aba === "obreiros"
    ? [String(r.nome ?? ""), String(r.email ?? ""), String(r.cargo ?? ""), brDate(r.birth as string)]
    : [String(r.nome ?? ""), brDate(r.birth as string) || "—", brDate(r.data_congresso as string) || "—", r.qtd_membros != null ? String(r.qtd_membros) : "—"];

export default function Igrejas() {
  const [igrejas, setIgrejas] = useState<Igreja[]>([]);
  const [situacao, setSituacao] = useState<Record<number, Situacao>>({});
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<Sort>("nome");
  const [cargo, setCargo] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  const [sel, setSel] = useState<Igreja | null>(null);
  const [aba, setAba] = useState<Aba>("membros");
  const [linhas, setLinhas] = useState<Linha[] | null>(null);
  const [novaAberta, setNovaAberta] = useState(false);
  const [convite, setConvite] = useState<{ id_igreja: number; nome: string; nova?: boolean } | null>(null);

  const pastorMatriz = cargo === "Pastor Matriz";
  const recarregar = () => setReload((n) => n + 1);

  useEffect(() => { setCargo(sessionStorage.getItem("cargo")); }, []);

  useEffect(() => {
    const id_user = sessionStorage.getItem("id_user");
    api.get(`/igreja/subordinadasUser/${id_user}`).then(({ data }) => setIgrejas(Array.isArray(data) ? data : [])).catch(() => setIgrejas([]));
    api.get("/igreja/filiais").then(({ data }) => setSituacao(Object.fromEntries((data as Situacao[]).map((s) => [s.id_igreja, s])))).catch(() => setSituacao({}));
  }, [reload]);

  // Dados da aba aberta nos detalhes.
  useEffect(() => {
    if (!sel) return;
    setLinhas(null);
    api.get(`${ROTAS[aba]}${sel.id_igreja}`).then(({ data }) => setLinhas(Array.isArray(data) ? data : [])).catch(() => setLinhas([]));
  }, [sel, aba]);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const cmp: Record<Sort, (a: Igreja, b: Igreja) => number> = {
      nome: (a, b) => (a.id_matriz == null ? -1 : b.id_matriz == null ? 1 : a.nome.localeCompare(b.nome)),
      cidade: (a, b) => `${a.cidade} ${a.bairro}`.localeCompare(`${b.cidade} ${b.bairro}`),
      recent: (a, b) => b.id_igreja - a.id_igreja,
    };
    return igrejas.filter((i) => !termo || `${i.nome} ${i.cidade} ${i.bairro} ${i.setor} ${i.cnpj}`.toLowerCase().includes(termo)).sort(cmp[ordem]);
  }, [igrejas, busca, ordem]);

  const pastorDe = (i: Igreja) => situacao[i.id_igreja]?.pastor_nome || null;

  return (
    <PageShell
      crumbs={[{ label: "Início", href: "/pages/inicio" }, { label: "Membros", href: "/pages/membros" }, { label: "Igrejas" }]}
      title="Igrejas"
      titleLinks={[{ label: "Membros", href: "/pages/membros" }, { label: "Obreiros", href: "/pages/obreiros" }, { label: "Departamentos", href: "/pages/departamentos" }]}
      after={(
        <>
          <Modal open={!!sel} onClose={() => setSel(null)} size="wide" title="Detalhes da igreja" subtitle={sel ? `CNPJ ${sel.cnpj}` : ""}>
            {sel && (
              <div className="mx-b">
                <div className="pf"><span className="av" aria-hidden="true"><Church className="i" /></span><div><h3 className="xc-tit">{sel.nome}</h3><span className={sel.id_matriz == null ? "tag tag-mat" : "tag tag-loc"}>{sel.id_matriz == null ? "Matriz" : "Filial"}</span></div></div>
                <div className="vw cols">
                  <ViewRow icon={UserRound} label="Pastor">{pastorDe(sel) || "Sem pastor"}</ViewRow>
                  <ViewRow icon={MapPin} label="Local">{sel.bairro} · {sel.cidade}</ViewRow>
                  <ViewRow icon={MapIcon} label="Setor">{sel.setor || "—"}</ViewRow>
                </div>
                <div className="tabs" role="tablist" aria-label="Dados da igreja">
                  {ABAS.map(([k, label]) => <button key={k} type="button" role="tab" className={aba === k ? "on" : ""} aria-selected={aba === k} onClick={() => setAba(k)}>{label}</button>)}
                </div>
                <div className="tbl-wrap">
                  <div className="dt" style={{ minWidth: 560 }}>
                    <div className="dt-h" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>{COLS[aba].map((c) => <span key={c}>{c}</span>)}</div>
                    {linhas === null && <p className="empty">Carregando...</p>}
                    {linhas?.length === 0 && <p className="empty">Nada cadastrado.</p>}
                    {linhas?.map((r, idx) => (
                      <div key={idx} className="dt-r" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
                        {linhaDe(aba, r).map((v, j) => <span key={j} data-label={COLS[aba][j]}>{v}</span>)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Modal>

          <NovaFilialModal
            isOpen={novaAberta}
            onClose={() => setNovaAberta(false)}
            onCreated={(filial) => { setNovaAberta(false); recarregar(); setConvite({ ...filial, nova: true }); }}
          />
          <ConvitePastorModal
            filial={convite}
            onClose={() => { if (convite?.nova) toast.success("Filial cadastrada!", { position: "top-center", autoClose: 1800 }); setConvite(null); }}
            onGenerated={recarregar}
          />
          <ToastContainer />
        </>
      )}
    >
      <div className="toolbar">
        <SearchBox value={busca} onChange={setBusca} placeholder="Pesquisar igrejas..." />
        <SortMenu options={SORTS} value={ordem} onChange={setOrdem} />
        {pastorMatriz && <button type="button" className="btn-add" onClick={() => setNovaAberta(true)}><Plus className="i s20" aria-hidden="true" />Nova Igreja</button>}
      </div>

      {lista.length === 0 ? (
        <div className="card empty">
          <h3 className="t1" style={{ fontSize: 20, color: "#1f2937" }}>Nenhuma igreja encontrada</h3>
          <p style={{ marginTop: 6 }}>{busca ? "Tente ajustar sua busca" : "Cadastre a primeira filial"}</p>
        </div>
      ) : (
        <div className="cards">
          {lista.map((i) => {
            const info = situacao[i.id_igreja];
            const pastor = pastorDe(i);
            const ehMatriz = i.id_matriz == null;
            return (
              <article key={i.id_igreja} className="card lc">
                <button type="button" className="hit" aria-label={`Ver ${i.nome}`} onClick={() => { setAba("membros"); setSel(i); }} />
                <div className="lc-top">
                  <span className="av" aria-hidden="true"><Church className="i" /></span>
                  <span className={ehMatriz ? "tag tag-mat" : "tag tag-loc"}>{ehMatriz ? "Matriz" : `Filial${i.setor ? ` · ${i.setor}` : ""}`}</span>
                </div>
                <h3 className="lc-tit">{i.nome}</h3>
                <p className="xc-meta"><MapPin className="i" aria-hidden="true" /><span>{i.bairro} · {i.cidade}</span></p>
                <div className="lc-foot row">
                  {pastor ? (
                    <span className="lc-person"><span className="av sm" aria-hidden="true">{initials(pastor)}</span><span><small>Pastor</small>{pastor}</span></span>
                  ) : info?.convite_expira_em ? (
                    <>
                      <span className="lc-warn"><TriangleAlert className="i" aria-hidden="true" />Convite até {format(new Date(info.convite_expira_em), "dd/MM")}</span>
                      {pastorMatriz && <button type="button" className="btn lc-act" onClick={() => setConvite({ id_igreja: i.id_igreja, nome: i.nome })}>Novo link</button>}
                    </>
                  ) : (
                    <>
                      <span className="lc-warn"><TriangleAlert className="i" aria-hidden="true" />Sem pastor</span>
                      {pastorMatriz && !ehMatriz && <button type="button" className="btn pri lc-act" onClick={() => setConvite({ id_igreja: i.id_igreja, nome: i.nome })}>Convidar pastor</button>}
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
