"use client";

import { AppModal, ModalSurface } from '@/app/components/shared/MemberStyle';
import React from "react";
import { X } from "lucide-react";

interface Departamento {
  id_departamento: number;
  nome: string;
}

type NovoConvertido = "Sim" | "Não";

export interface MemberFormData {
  cod_membro: string;
  nome: string;
  birth: string;
  novo_convertido: NovoConvertido;
  numero: string;
  id_departamento: number;
}

interface MemberFormModalProps {
  isOpen: boolean;
  mode: "new" | "edit";
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  departamentos: Departamento[];
  formData: MemberFormData;
  onChange: (field: keyof MemberFormData, value: string | number) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const inputClass =
  "text2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-azul focus:bg-white focus:ring-4 focus:ring-blue-100";

const selectClass =
  "text2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-800 outline-none transition-all duration-200 focus:border-azul focus:bg-white focus:ring-4 focus:ring-blue-100";

const labelClass = "text1 mb-1.5 block text-sm font-semibold text-slate-700";

export default function MemberFormModal({
  isOpen,
  mode,
  title,
  subtitle,
  submitLabel,
  departamentos,
  formData,
  onChange,
  onClose,
  onSubmit,
}: MemberFormModalProps) {
  const resolvedTitle =
    title ?? (mode === "new" ? "Novo Membro" : "Editar Membro");
  const resolvedSubtitle =
    subtitle ??
    (mode === "new"
      ? "Cadastre um membro com nome, contato e departamento."
      : "Atualize as informações do membro selecionado.");
  const resolvedSubmitLabel =
    submitLabel ?? (mode === "new" ? "Cadastrar membro" : "Salvar alterações");

  return (
    <AppModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={resolvedTitle}
      overlayClassName="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-[3px]"
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
    >
      <ModalSurface className="flex h-[86dvh] w-full flex-col overflow-hidden rounded-t-3xl sm:h-auto sm:max-h-[86dvh] sm:max-w-xl sm:rounded-3xl">
        <div className="flex items-start justify-between bg-azul px-4 py-4 text-white sm:px-6 sm:py-5">
          <div className="pr-3">
            <h2 className="text1 text-xl font-bold sm:text-2xl">
              {resolvedTitle}
            </h2>
            <p className="text2 mt-1 text-sm text-blue-100 sm:text-[15px]">
              {resolvedSubtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 transition-colors duration-200 hover:bg-white/25"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Cód. Membro</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Digite o código"
                  value={formData.cod_membro}
                  onChange={(e) => onChange("cod_membro", e.target.value)}
                  maxLength={16}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Celular</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Digite o número"
                  value={formData.numero}
                  onChange={(e) => onChange("numero", e.target.value)}
                  maxLength={25}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Nome</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Digite o nome completo"
                  value={formData.nome}
                  onChange={(e) => onChange("nome", e.target.value)}
                  maxLength={150}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Data de Nascimento</label>
                <input
                  type="date"
                  className={inputClass}
                  value={formData.birth}
                  onChange={(e) => onChange("birth", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Novo Convertido</label>
                <select
                  className={selectClass}
                  value={formData.novo_convertido}
                  onChange={(e) =>
                    onChange(
                      "novo_convertido",
                      e.target.value as NovoConvertido,
                    )
                  }
                >
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Departamento</label>
                <select
                  className={selectClass}
                  value={formData.id_departamento}
                  onChange={(e) =>
                    onChange("id_departamento", Number(e.target.value))
                  }
                >
                  <option value={0} disabled>
                    Selecione um departamento
                  </option>
                  {departamentos.map((dep) => (
                    <option
                      key={dep.id_departamento}
                      value={dep.id_departamento}
                    >
                      {dep.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="submit"
                className="text2 inline-flex h-11 items-center justify-center rounded-xl bg-azul px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-600"
              >
                {resolvedSubmitLabel}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text2 inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </ModalSurface>
    </AppModal>
  );
}
