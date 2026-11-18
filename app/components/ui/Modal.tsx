'use client'
import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, X } from 'lucide-react';

// Modal do sistema visual novo (classes .mx-* em styles/od.css).
// - Esc e clique fora fecham; a rolagem da página fica travada enquanto está aberto.
// - sheet: no celular vira uma folha que sobe da parte de baixo (app do Obreiro).
type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  size?: 'sm' | 'md' | 'wide';
  sheet?: boolean;
  as?: 'div' | 'form';
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  role?: 'dialog' | 'alertdialog';
  children: React.ReactNode;
};

export function Modal({ open, onClose, title, subtitle, size = 'md', sheet = false, as = 'div', onSubmit, role = 'dialog', children }: ModalProps) {
  const titleId = useId();
  const boxRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') closeRef.current(); };
    document.addEventListener('keydown', onKey);
    // Leva o foco para o primeiro campo (ou botão) do modal.
    const first = boxRef.current?.querySelector<HTMLElement>('input:not([type=hidden]):not([disabled]), textarea, select, button:not(.mx-x)');
    (first ?? boxRef.current)?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  const Box = as;
  const className = `mx${size === 'sm' ? ' sm' : size === 'wide' ? ' wide' : ''}`;
  return createPortal(
    <div className={`mx-ov${sheet ? ' sheet' : ''}`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <Box
        ref={boxRef as never}
        className={className}
        role={role}
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        onSubmit={as === 'form' ? (onSubmit as React.FormEventHandler<HTMLElement> | undefined) : undefined}
        noValidate={as === 'form' ? true : undefined}
      >
        {title !== undefined && (
          <div className="mx-h">
            <div>
              <h2 id={titleId}>{title}</h2>
              {subtitle && <p>{subtitle}</p>}
            </div>
            <button type="button" className="mx-x" aria-label="Fechar" onClick={onClose}><X className="i" aria-hidden="true" /></button>
          </div>
        )}
        {children}
      </Box>
    </div>,
    document.body,
  );
}

// Linha de informação nos detalhes (ícone + rótulo pequeno + valor).
export function ViewRow({ icon: Icon, label, children, top = false, text = false }: { icon: React.ElementType; label: string; children: React.ReactNode; top?: boolean; text?: boolean }) {
  return (
    <div className={`vw-r${top || text ? ' top' : ''}`}>
      <Icon className="i" aria-hidden="true" />
      <div><small>{label}</small><span className={`vw-v${text ? ' txt' : ''}`}>{children}</span></div>
    </div>
  );
}

// Linha de campo no formulário, no mesmo formato dos detalhes.
export function EditRow({ icon: Icon, label, htmlFor, labelId, children }: { icon: React.ElementType; label: string; htmlFor?: string; labelId?: string; children: React.ReactNode }) {
  return (
    <div className="ed-r">
      <Icon className="i" aria-hidden="true" />
      {htmlFor ? <label className="ed-l" htmlFor={htmlFor}>{label}</label> : <span className="ed-l" id={labelId}>{label}</span>}
      {children}
    </div>
  );
}

// Confirmação (excluir em vermelho; demais em azul).
export function ConfirmDialog({ open, onCancel, onConfirm, title, message, confirmLabel = 'Excluir', tone = 'danger', icon: Icon = Trash2, busy = false, sheet = false }: {
  open: boolean; onCancel: () => void; onConfirm: () => void; title: string; message: React.ReactNode;
  confirmLabel?: string; tone?: 'danger' | 'info'; icon?: React.ElementType; busy?: boolean; sheet?: boolean;
}) {
  return (
    <Modal open={open} onClose={onCancel} size="sm" role="alertdialog" sheet={sheet}>
      <div className="mx-cf">
        <span className={`mx-ico${tone === 'info' ? ' info' : ''}`}><Icon className="i" aria-hidden="true" /></span>
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
      <div className="mx-f">
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
        <button type="button" className={`btn ${tone === 'danger' ? 'dng' : 'pri'}`} onClick={onConfirm} disabled={busy}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}
