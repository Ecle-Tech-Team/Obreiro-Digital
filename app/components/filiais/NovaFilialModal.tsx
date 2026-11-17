'use client'
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppModal, ModalCloseButton, ModalSurface } from '@/app/components/shared/MemberStyle';
import api from '@/app/api/api';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (filial: { id_igreja: number; nome: string }) => void;
};

const vazio = { nome: '', cnpj: '', data_fundacao: '', setor: '', ministerio: '', cep: '', endereco: '', bairro: '', cidade: '' };
const campo = 'text2 rounded-lg border border-slate-300 px-4 py-3 text-black';

// Cadastro de filial pela matriz: a igreja já nasce ligada à matriz.
export default function NovaFilialModal({ isOpen, onClose, onCreated }: Props) {
  const [dados, setDados] = useState(vazio);
  const [enviando, setEnviando] = useState(false);
  const set = (chave: keyof typeof vazio) => (e: React.ChangeEvent<HTMLInputElement>) => setDados(atual => ({ ...atual, [chave]: e.target.value }));

  const buscarCep = async (cep: string) => {
    try {
      const { data } = await api.post(`/cep/${cep}`);
      setDados(atual => ({ ...atual, endereco: data.street || atual.endereco, bairro: data.neighborhood || atual.bairro, cidade: data.city || atual.cidade }));
    } catch {
      toast.error('CEP não encontrado.', { position: 'top-center', autoClose: 2000 });
    }
  };

  const fechar = () => { setDados(vazio); onClose(); };

  const salvar = async (event: React.FormEvent) => {
    event.preventDefault();
    const obrigatorios: (keyof typeof vazio)[] = ['nome', 'cnpj', 'data_fundacao', 'ministerio', 'cep', 'endereco', 'bairro', 'cidade'];
    if (obrigatorios.some(chave => !dados[chave].trim())) {
      toast.warn('Preencha todos os campos obrigatórios.', { position: 'top-center' });
      return;
    }
    setEnviando(true);
    try {
      const { data } = await api.post('/igreja/filial', dados);
      toast.success('Filial cadastrada.', { position: 'top-center', autoClose: 1500 });
      const nome = dados.nome.trim();
      setDados(vazio);
      onCreated({ id_igreja: data.id_igreja, nome });
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message ? error.response.data.message : 'Não foi possível cadastrar a filial.';
      toast.error(message, { position: 'top-center', autoClose: 4000 });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onRequestClose={fechar}
      contentLabel="Nova filial"
      ariaHideApp={false}
      overlayClassName="fixed inset-0 z-50 bg-slate-950/55"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <ModalSurface className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto p-6">
        <form onSubmit={salvar}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text1 text-2xl text-black">Nova filial</h2>
              <p className="text2 mt-1 text-gray-600">A igreja será cadastrada como filial da sua matriz. Depois você gera o convite para o pastor dela.</p>
            </div>
            <ModalCloseButton onClick={fechar} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text2 flex flex-col gap-1 text-gray-800 sm:col-span-2">Nome *
              <input className={campo} value={dados.nome} onChange={set('nome')} maxLength={150} required />
            </label>
            <label className="text2 flex flex-col gap-1 text-gray-800">CNPJ *
              <input className={campo} value={dados.cnpj} onChange={set('cnpj')} maxLength={20} required />
            </label>
            <label className="text2 flex flex-col gap-1 text-gray-800">Data de fundação *
              <input type="date" className={campo} value={dados.data_fundacao} onChange={set('data_fundacao')} required />
            </label>
            <label className="text2 flex flex-col gap-1 text-gray-800">Ministério *
              <input className={campo} value={dados.ministerio} onChange={set('ministerio')} maxLength={150} required />
            </label>
            <label className="text2 flex flex-col gap-1 text-gray-800">Setor
              <input className={campo} value={dados.setor} onChange={set('setor')} maxLength={150} />
            </label>
            <label className="text2 flex flex-col gap-1 text-gray-800">CEP *
              <input
                className={campo}
                inputMode="numeric"
                value={dados.cep}
                onChange={e => {
                  const cep = e.target.value.replace(/\D/g, '').slice(0, 8);
                  setDados(atual => ({ ...atual, cep }));
                  if (cep.length === 8) buscarCep(cep);
                }}
                required
              />
            </label>
            <label className="text2 flex flex-col gap-1 text-gray-800">Endereço *
              <input className={campo} value={dados.endereco} onChange={set('endereco')} maxLength={150} required />
            </label>
            <label className="text2 flex flex-col gap-1 text-gray-800">Bairro *
              <input className={campo} value={dados.bairro} onChange={set('bairro')} maxLength={150} required />
            </label>
            <label className="text2 flex flex-col gap-1 text-gray-800">Cidade *
              <input className={campo} value={dados.cidade} onChange={set('cidade')} maxLength={150} required />
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" className="text2 rounded-lg px-5 py-2 text-gray-700 hover:bg-gray-100" onClick={fechar}>Cancelar</button>
            <button type="submit" disabled={enviando} className="text2 rounded-lg bg-azul px-5 py-2 text-white hover:bg-blue-600 disabled:opacity-60">
              {enviando ? 'Salvando...' : 'Cadastrar filial'}
            </button>
          </div>
        </form>
      </ModalSurface>
    </AppModal>
  );
}
