'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { AppModal, ModalCloseButton, ModalSurface } from '@/app/components/shared/MemberStyle';
import api from '@/app/api/api';

type Props = {
  filial: { id_igreja: number; nome: string } | null;
  onClose: () => void;
  onGenerated?: () => void;
};

// Gera o link de convite para o pastor da filial criar a própria conta.
// O código vai depois do "#": o navegador não o envia a servidores nem a outros sites.
export default function ConvitePastorModal({ filial, onClose, onGenerated }: Props) {
  const [link, setLink] = useState('');
  const [expira, setExpira] = useState('');
  const [gerando, setGerando] = useState(false);

  useEffect(() => { setLink(''); setExpira(''); }, [filial?.id_igreja]);

  const gerar = async () => {
    if (!filial) return;
    setGerando(true);
    try {
      const { data } = await api.post('/convite', { id_igreja: filial.id_igreja });
      setLink(`${window.location.origin}/pages/cadastroPastor#convite=${data.token}`);
      setExpira(format(new Date(data.expira_em), "dd/MM/yyyy 'às' HH:mm"));
      onGenerated?.();
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message ? error.response.data.message : 'Não foi possível gerar o convite.';
      toast.error(message, { position: 'top-center', autoClose: 4000 });
    } finally {
      setGerando(false);
    }
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copiado.', { position: 'top-center', autoClose: 1500 });
    } catch {
      toast.info('Selecione o link e copie manualmente.', { position: 'top-center' });
    }
  };

  return (
    <AppModal
      isOpen={!!filial}
      onRequestClose={onClose}
      contentLabel="Convidar pastor"
      ariaHideApp={false}
      overlayClassName="fixed inset-0 z-50 bg-slate-950/55"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {filial && (
        <ModalSurface className="w-full max-w-lg p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text1 text-2xl text-black">Convidar pastor</h2>
            <ModalCloseButton onClick={onClose} />
          </div>
          <p className="text2 mt-2 text-gray-700">
            Gere um link para o pastor da <strong>{filial.nome}</strong> criar a própria conta, com a própria senha.
          </p>

          {link ? (
            <div className="mt-4">
              <label className="text2 flex flex-col gap-1 text-gray-800">Link de convite
                <input readOnly className="text2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-black" value={link} onFocus={e => e.target.select()} />
              </label>
              <p className="text2 mt-2 text-sm text-gray-600">
                Vale até {expira} e só pode ser usado uma vez. Envie apenas para o futuro pastor. Gerar outro link cancela este.
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <button type="button" className="text2 rounded-lg px-5 py-2 text-gray-700 hover:bg-gray-100" onClick={onClose}>Fechar</button>
                <button type="button" className="text2 rounded-lg bg-azul px-5 py-2 text-white hover:bg-blue-600" onClick={copiar}>Copiar link</button>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" className="text2 rounded-lg px-5 py-2 text-gray-700 hover:bg-gray-100" onClick={onClose}>Agora não</button>
              <button type="button" disabled={gerando} className="text2 rounded-lg bg-azul px-5 py-2 text-white hover:bg-blue-600 disabled:opacity-60" onClick={gerar}>
                {gerando ? 'Gerando...' : 'Gerar link de convite'}
              </button>
            </div>
          )}
        </ModalSurface>
      )}
    </AppModal>
  );
}
