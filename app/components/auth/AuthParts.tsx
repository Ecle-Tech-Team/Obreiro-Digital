'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Check, CircleAlert, Eye, EyeOff } from 'lucide-react';
import logo from '@/public/images/icon.png';

// Moldura das telas de acesso: fundo branco, logo no topo e conteúdo centralizado.
export function AuthShell({ wide = false, back, children, after }: { wide?: boolean; back?: { href: string; label: string }; children: React.ReactNode; after?: React.ReactNode }) {
  return (
    <main className="au">
      <div className="au-main">
        <div className="au-logo"><Image src={logo} alt="" width={44} height={44} priority /><span>OBREIRO<br />DIGITAL</span></div>
        <div className={`au-body${wide ? ' wide' : ''}`}>
          {back && <Link href={back.href} className="au-back"><ArrowLeft className="i" aria-hidden="true" />{back.label}</Link>}
          {children}
        </div>
      </div>
      {after}
    </main>
  );
}

export function AuthSteps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="au-steps" aria-label="Etapas">
      {steps.map((s, i) => {
        const estado = i < current ? 'done' : i === current ? 'on' : '';
        return (
          <li key={s} className={estado} aria-current={i === current ? 'step' : undefined}>
            <span>{i < current ? <Check className="i" style={{ width: 14, height: 14 }} aria-label="concluída" /> : i + 1}</span>{s}
          </li>
        );
      })}
    </ol>
  );
}

export function FieldError({ id, children }: { id: string; children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="au-err" id={id}><CircleAlert className="i" aria-hidden="true" />{children}</p>;
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { id: string; error?: string; icon?: React.ElementType };

// Campo de texto com ícone opcional à esquerda e mensagem de erro abaixo.
export function AuthInput({ id, error, icon: Icon, className = '', ...rest }: InputProps) {
  const errId = `${id}-err`;
  const input = (
    <input
      id={id}
      className={`au-in${Icon ? ' ic' : ''}${error ? ' err' : ''} ${className}`.trim()}
      aria-invalid={error ? true : undefined}
      aria-describedby={[error ? errId : '', rest['aria-describedby'] || ''].filter(Boolean).join(' ') || undefined}
      {...rest}
    />
  );
  return (
    <>
      {Icon ? <div className="au-w"><Icon className="i" aria-hidden="true" />{input}</div> : input}
      <FieldError id={errId}>{error}</FieldError>
    </>
  );
}

// Senha com botão de mostrar/ocultar.
export function PasswordInput({ id, error, icon: Icon, ...rest }: InputProps) {
  const [visivel, setVisivel] = useState(false);
  const errId = `${id}-err`;
  return (
    <>
      <div className="au-w">
        {Icon && <Icon className="i" aria-hidden="true" />}
        <input
          id={id}
          type={visivel ? 'text' : 'password'}
          className={`au-in${Icon ? ' ic' : ''} eye${error ? ' err' : ''}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={[error ? errId : '', rest['aria-describedby'] || ''].filter(Boolean).join(' ') || undefined}
          {...rest}
        />
        <button type="button" className="au-eye" onClick={() => setVisivel((v) => !v)} aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={visivel}>
          {visivel ? <EyeOff className="i" aria-hidden="true" /> : <Eye className="i" aria-hidden="true" />}
        </button>
      </div>
      <FieldError id={errId}>{error}</FieldError>
    </>
  );
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const SENHA_MIN = 10;
