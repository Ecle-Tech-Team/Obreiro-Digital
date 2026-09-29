"use client";

import React from "react";
import Modal from "react-modal";
import { Filter, Plus, Search, X } from "lucide-react";

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>;
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
type TableProps = React.TableHTMLAttributes<HTMLTableElement>;
type ModalProps = React.ComponentProps<typeof Modal>;

export function PageTitle({ className = "", ...props }: HeadingProps) {
  return <h1 className={`text1 text-2xl font-bold text-black xs:text-3xl sm:text-4xl lg:text-5xl ${className}`} {...props} />;
}

export function SearchField({ className = "", type = "text", ...props }: InputProps) {
  return (
    <div className="relative min-w-0 flex-1">
      <input
        type={type}
        aria-label={props["aria-label"] ?? props.placeholder}
        className={`text2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-12 text-gray-600 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-azul ${className}`}
        {...props}
      />
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
    </div>
  );
}

export function FilterButton({ className = "", type = "button", children, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      aria-label="Filtrar resultados"
      className={`inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 transition-colors duration-200 hover:bg-gray-50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-azul ${className}`}
      {...props}
    >
      {children ?? <Filter className="h-5 w-5 opacity-70" aria-hidden="true" />}
    </button>
  );
}

export function AddButton({ className = "", type = "button", children, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`text2 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-azul px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-azul focus:ring-offset-2 active:bg-blue-700 ${className}`}
      {...props}
    >
      <Plus className="h-5 w-5 shrink-0" aria-hidden="true" />
      {children}
    </button>
  );
}

export function DataTable({ className = "", ...props }: TableProps) {
  return <table className={`od-data-table w-full ${className}`} {...props} />;
}

export function ModalSurface({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`od-modal-surface ${className}`} {...props} />;
}

export function ModalCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="od-modal-close" onClick={onClick} aria-label="Fechar modal">
      <X className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

export function AppModal({ className, overlayClassName, ...props }: ModalProps) {
  const contentClass = typeof className === "string" ? className : "";
  const overlayClass = typeof overlayClassName === "string" ? overlayClassName : "";
  return (
    <Modal
      {...props}
      className={`od-modal ${contentClass}`}
      overlayClassName={`od-modal-overlay ${overlayClass}`}
    />
  );
}
