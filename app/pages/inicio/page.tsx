"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Cast, ChevronRight, Church, DollarSign, Eye, EyeOff, Package, UserPlus, Users } from "lucide-react";

import MenuLateral from "@/app/components/menuLateral/menuLateral";
import { brl, cents } from "@/app/utils/money";
import api from "@/app/api/api";

type Totais = { membros: number | null; eventos: number | null; visitantes: number | null; entregues: number | null; andamento: number | null; recusados: number | null };
type Filial = { id_igreja: number; nome: string };

const LIMITE_FILIAIS = 5;
const numero = (v: number | null) => (v === null ? "—" : v.toLocaleString("pt-BR"));

// Busca um contador sem derrubar a tela: em caso de erro mostra "—".
async function contar(url: string): Promise<number | null> {
  try {
    const { data } = await api.get(url);
    const n = Number(data);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function Mais({ href }: { href: string }) {
  return <Link className="more" href={href}>Ver detalhes<ChevronRight className="i" aria-hidden="true" /></Link>;
}

export default function Inicio() {
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [totais, setTotais] = useState<Totais>({ membros: null, eventos: null, visitantes: null, entregues: null, andamento: null, recusados: null });
  const [saldo, setSaldo] = useState<bigint | null>(null);
  const [saldoVisivel, setSaldoVisivel] = useState(false);
  const [filiais, setFiliais] = useState<Filial[] | null>(null);

  useEffect(() => {
    const igreja = sessionStorage.getItem("id_igreja");
    const meuCargo = sessionStorage.getItem("cargo") || "";
    setNome(sessionStorage.getItem("nome") || "");
    setCargo(meuCargo);
    if (!igreja) return;

    Promise.all([
      contar(`/membro/count/${igreja}`),
      contar(`/evento/count/${igreja}`),
      contar(`/visitante/count/${igreja}`),
      contar(`/pedido/count/entregue/${igreja}`),
      contar(`/pedido/count/em-andamento/${igreja}`),
      contar(`/pedido/count/recusados/${igreja}`),
    ]).then(([membros, eventos, visitantes, entregues, andamento, recusados]) =>
      setTotais({ membros, eventos, visitantes, entregues, andamento, recusados }));

    api.get(`/financas/saldo/${igreja}`)
      .then(({ data }) => setSaldo(cents(String(data?.saldo ?? ""))))
      .catch(() => setSaldo(null));

    if (meuCargo === "Pastor Matriz") {
      api.get(`/igreja/subordinadas/${igreja}`)
        .then(({ data }) => setFiliais(Array.isArray(data) ? data : []))
        .catch(() => setFiliais([]));
    }
  }, []);

  const SaldoIcon = saldoVisivel ? EyeOff : Eye;

  return (
    <div className="min-h-screen bg-fundo">
      <div className="flex flex-col lg:flex-row">
        <MenuLateral />
        <div className="app-content">
          <div className="wrap">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <nav className="crumb" aria-label="Navegação"><span className="cur" aria-current="page">Início</span><span aria-hidden="true">&gt;</span></nav>
              <Link href="/pages/apresentacao" className="btn-cast" aria-label="Ir para apresentação" title="Apresentação"><Cast className="i" aria-hidden="true" /></Link>
            </div>

            <section className="hero">
              <h1>A Paz {cargo} {nome}!</h1>
              <h3>Veja as principais informações sobre a sua igreja:</h3>
            </section>

            <div className="grid4">
              <div className="card stat">
                <h4><Users className="i" aria-hidden="true" />Membros</h4>
                <p className="lbl">Membros Totais</p><p className="val">{numero(totais.membros)}</p>
                <Mais href="/pages/membros" />
              </div>
              <div className="card stat">
                <h4><Calendar className="i" aria-hidden="true" />Eventos</h4>
                <p className="lbl">Eventos Totais</p><p className="val">{numero(totais.eventos)}</p>
                <Mais href="/pages/eventos" />
              </div>
              <div className="card stat">
                <h4><DollarSign className="i" aria-hidden="true" />Saldo</h4>
                <p className="lbl">Saldo Total</p>
                <p className="val">{saldoVisivel ? (saldo === null ? "Indisponível" : brl(saldo)) : "R$ ••••"}</p>
                <button type="button" className="more" aria-pressed={saldoVisivel} onClick={() => setSaldoVisivel((v) => !v)}>
                  {saldoVisivel ? "Ocultar" : "Mostrar"} saldo<SaldoIcon className="i" aria-hidden="true" />
                </button>
              </div>
              <div className="card stat">
                <h4><UserPlus className="i" aria-hidden="true" />Visitantes</h4>
                <p className="lbl">Visitantes Totais</p><p className="val">{numero(totais.visitantes)}</p>
                <Mais href="/pages/visitantes" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))", gap: 20 }}>
              <div className="card stat">
                <h4><Package className="i" aria-hidden="true" />Pedidos</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
                  <div><p className="lbl">Entregues</p><p className="val">{numero(totais.entregues)}</p></div>
                  <div><p className="lbl">Em Andamento</p><p className="val">{numero(totais.andamento)}</p></div>
                  <div><p className="lbl">Recusados</p><p className="val">{numero(totais.recusados)}</p></div>
                </div>
                <Mais href="/pages/pedidos" />
              </div>
              {cargo === "Pastor Matriz" && (
                <div className="card stat">
                  <h4><Church className="i" aria-hidden="true" />Igrejas Subordinadas</h4>
                  {filiais && filiais.length === 0 ? (
                    <p className="lbl" style={{ color: "#64748b" }}>Nenhuma filial cadastrada ainda.</p>
                  ) : (
                    <ul style={{ margin: "18px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 8, fontSize: 16 }}>
                      {(filiais || []).slice(0, LIMITE_FILIAIS).map((f) => (
                        <li key={f.id_igreja} style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <span aria-hidden="true" style={{ flex: "none", width: 8, height: 8, borderRadius: 99, background: "#5271FF" }} />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.nome}</span>
                        </li>
                      ))}
                      {filiais && filiais.length > LIMITE_FILIAIS && <li style={{ color: "#64748b" }}>e mais {filiais.length - LIMITE_FILIAIS}</li>}
                    </ul>
                  )}
                  <Mais href="/pages/igrejas" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
