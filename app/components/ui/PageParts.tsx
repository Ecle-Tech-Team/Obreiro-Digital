'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
import MenuLateral from '@/app/components/menuLateral/menuLateral';

// Fecha menus suspensos ao clicar fora.
export function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void) {
  useEffect(() => {
    const handler = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) onOutside(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onOutside]);
}

type Crumb = { label: string; href?: string };

// Estrutura das telas do Pastor: menu lateral, trilha, título (com menu opcional) e conteúdo.
export function PageShell({ crumbs, title, titleLinks, titleExtra, children, after }: {
  crumbs: Crumb[]; title: string; titleLinks?: Crumb[]; titleExtra?: React.ReactNode; children: React.ReactNode; after?: React.ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, useCallback(() => setAberto(false), []));
  return (
    <div className="min-h-screen bg-fundo">
      <div className="flex flex-col lg:flex-row">
        <MenuLateral />
        <div className="app-content">
          <div className="wrap">
            <nav className="crumb" aria-label="Navegação">
              {crumbs.map((c, i) => (
                <React.Fragment key={c.label}>
                  {i > 0 && <span aria-hidden="true">&gt;</span>}
                  {c.href ? <Link href={c.href}>{c.label}</Link> : <span className="cur" aria-current="page">{c.label}</span>}
                </React.Fragment>
              ))}
            </nav>
            <div className="ttl-row" ref={ref}>
              <h1 className="ptitle">{title}</h1>
              {titleExtra}
              {titleLinks && titleLinks.length > 0 && (
                <>
                  <button type="button" className="ttl-btn" aria-label="Menu de navegação" aria-expanded={aberto} onClick={() => setAberto((v) => !v)}>
                    <ChevronDown className="i s32" aria-hidden="true" />
                  </button>
                  {aberto && <div className="menu left">{titleLinks.map((l) => <Link key={l.label} href={l.href || '#'}>{l.label}</Link>)}</div>}
                </>
              )}
            </div>
            {children}
          </div>
        </div>
      </div>
      {after}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="search">
      <Search className="i" aria-hidden="true" />
      <input type="text" placeholder={placeholder} aria-label={placeholder.replace(/\.+$/, '')} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function SortMenu<T extends string>({ options, value, onChange }: { options: [T, string][]; value: T; onChange: (v: T) => void }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, useCallback(() => setAberto(false), []));
  return (
    <div className="rel" ref={ref}>
      <button type="button" className="btn-icon" aria-label="Ordenar resultados" aria-expanded={aberto} onClick={() => setAberto((v) => !v)}>
        <Filter className="i s20" aria-hidden="true" />
      </button>
      {aberto && (
        <div className="menu">
          {options.map(([k, label]) => (
            <button key={k} type="button" className={value === k ? 'sel' : ''} onClick={() => { onChange(k); setAberto(false); }}>{label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// Paginação: "Mostrando 1–10 de 42" + botões.
export function Pager({ page, total, perPage, onPage }: { page: number; total: number; perPage: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (total <= perPage) return null;
  const inicio = (page - 1) * perPage + 1;
  const fim = Math.min(total, page * perPage);
  const janela = Array.from({ length: pages }, (_, i) => i + 1).filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === pages);
  return (
    <div className="pager">
      <span>Mostrando {inicio}–{fim} de {total}</span>
      <div className="pg">
        <button type="button" aria-label="Página anterior" disabled={page === 1} onClick={() => onPage(page - 1)}><ChevronLeft className="i s18" style={{ margin: 'auto' }} aria-hidden="true" /></button>
        {janela.map((p) => <button key={p} type="button" className={p === page ? 'on' : ''} aria-current={p === page ? 'page' : undefined} onClick={() => onPage(p)}>{p}</button>)}
        <button type="button" aria-label="Próxima página" disabled={page === pages} onClick={() => onPage(page + 1)}><ChevronRight className="i s18" style={{ margin: 'auto' }} aria-hidden="true" /></button>
      </div>
    </div>
  );
}

// Iniciais do nome (primeira e última palavra).
export function initials(nome?: string | null) {
  const partes = String(nome ?? '').trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return '?';
  return ((partes[0][0] || '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
}

// Mensagem de erro da API, quando houver.
export function apiMessage(error: unknown, fallback: string) {
  const data = (error as { response?: { data?: { message?: string } } })?.response?.data;
  return data?.message ? String(data.message) : fallback;
}
