import { AppModal, ModalSurface } from '@/app/components/shared/MemberStyle';
import React from "react";

interface EventoModalMobileProps {
  isOpen: boolean;
  onRequestClose: () => void;
  evento: {
    nome: string;
    local: string;
    data_inicio: string;
    horario_inicio: string;
    data_fim: string;
    horario_fim: string;
    tipo_evento?: "matriz" | "local";
  } | null;
}

export default function EventoModalMobile({
  isOpen,
  onRequestClose,
  evento,
}: EventoModalMobileProps) {
  if (!evento) return null;

  return (
    <AppModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="fixed inset-0 flex items-center justify-center z-50 p-3"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <ModalSurface className="w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto break-words px-4 py-6 sm:px-6 sm:py-10">
        <h2 className="text-xl text-center mb-10 text1">Detalhes do Evento</h2>
        <div className="text-sm text-gray-700">
          <p className="mb-5 text3 text-gray-500">
            <strong className="text1 text-lg text-black">Nome:</strong> {evento.nome}
          </p>
          <p className="mb-5 text3 text-gray-500">
            <strong className="text1 text-lg text-black">Tipo do Evento:</strong> {evento.tipo_evento}
          </p>
          <p className="mb-5 text3 text-gray-500">
            <strong className="text1 text-lg text-black">Local:</strong> {evento.local}
          </p>
          <p className="mb-5 text3 text-gray-500">
            <strong className="text1 text-lg text-black">Início:</strong> {evento.data_inicio} às {evento.horario_inicio}
          </p>
          <p className="mb-5 text3 text-gray-500">
            <strong className="text1 text-lg text-black">Fim:</strong> {evento.data_fim} às {evento.horario_fim}
          </p>
        </div>
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            onClick={onRequestClose}
          >
            Fechar
          </button>
        </div>
      </ModalSurface>
    </AppModal>
  );
}
