'use client'
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Calendar, Hash, MapPin, Map as MapIcon, BookOpen } from 'lucide-react';
import { EditRow, Modal } from '@/app/components/ui/Modal';
import { apiMessage } from '@/app/components/ui/PageParts';
import api from '@/app/api/api';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (filial: { id_igreja: number; nome: string }) => void;
};

const vazio = { nome: '', cnpj: '', data_fundacao: '', setor: '', ministerio: '', cep: '', endereco: '', bairro: '', cidade: '' };

// Cadastro de filial pela matriz: a igreja já nasce ligada à matriz.
export default function NovaFilialModal({ isOpen, onClose, onCreated }: Props) {
  const [dados, setDados] = useState(vazio);
  const [enviando, setEnviando] = useState(false);
  const set = (chave: keyof typeof vazio) => (e: React.ChangeEvent<HTMLInputElement>) => setDados((atual) => ({ ...atual, [chave]: e.target.value }));

  const buscarCep = async (cep: string) => {
    try {
      const { data } = await api.post(`/cep/${cep}`);
      setDados((atual) => ({ ...atual, endereco: data.street || atual.endereco, bairro: data.neighborhood || atual.bairro, cidade: data.city || atual.cidade }));
    } catch {
      toast.error('CEP não encontrado.', { position: 'top-center', autoClose: 2000 });
    }
  };

  const fechar = () => { setDados(vazio); onClose(); };

  const salvar = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const obrigatorios: (keyof typeof vazio)[] = ['nome', 'cnpj', 'data_fundacao', 'ministerio', 'cep', 'endereco', 'bairro', 'cidade'];
    if (obrigatorios.some((chave) => !dados[chave].trim())) {
      toast.warn('Preencha todos os campos, exceto o setor.', { position: 'top-center' });
      return;
    }
    setEnviando(true);
    try {
      const { data } = await api.post('/igreja/filial', dados);
      const nome = dados.nome.trim();
      setDados(vazio);
      onCreated({ id_igreja: data.id_igreja, nome });
    } catch (error) {
      toast.error(apiMessage(error, 'Não foi possível cadastrar a filial.'), { position: 'top-center', autoClose: 4000 });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={fechar}
      as="form"
      onSubmit={salvar}
      title="Nova filial"
      subtitle="A igreja será cadastrada como filial da sua matriz. Depois você gera o convite para o pastor dela."
    >
      <div className="mx-b">
        <label className="sr" htmlFor="nf-nome">Nome da igreja</label>
        <input id="nf-nome" className="ed-tit" placeholder="Nome da igreja" maxLength={150} value={dados.nome} onChange={set('nome')} />
        <div className="ed-f">
          <span className="ed-l">Dados da igreja</span>
          <div className="vw">
            <EditRow icon={Hash} label="CNPJ" htmlFor="nf-cnpj"><input id="nf-cnpj" className="ed-in" placeholder="00.000.000/0000-00" maxLength={20} value={dados.cnpj} onChange={set('cnpj')} /></EditRow>
            <EditRow icon={Calendar} label="Fundação" htmlFor="nf-fund"><input id="nf-fund" className="ed-in" type="date" value={dados.data_fundacao} onChange={set('data_fundacao')} /></EditRow>
            <EditRow icon={BookOpen} label="Ministério" htmlFor="nf-min"><input id="nf-min" className="ed-in" placeholder="Nome do ministério" maxLength={150} value={dados.ministerio} onChange={set('ministerio')} /></EditRow>
            <EditRow icon={MapIcon} label="Setor" htmlFor="nf-set"><input id="nf-set" className="ed-in" placeholder="Opcional" maxLength={150} value={dados.setor} onChange={set('setor')} /></EditRow>
          </div>
        </div>
        <div className="ed-f">
          <span className="ed-l">Endereço</span>
          <div className="vw">
            <EditRow icon={MapPin} label="CEP" htmlFor="nf-cep">
              <input
                id="nf-cep"
                className="ed-in"
                inputMode="numeric"
                placeholder="00000-000"
                value={dados.cep}
                onChange={(e) => {
                  const cep = e.target.value.replace(/\D/g, '').slice(0, 8);
                  setDados((atual) => ({ ...atual, cep }));
                  if (cep.length === 8) buscarCep(cep);
                }}
              />
            </EditRow>
            <div className="ed-r"><span aria-hidden="true" /><label className="ed-l" htmlFor="nf-end">Rua e nº</label><input id="nf-end" className="ed-in" placeholder="Ex.: Rua das Flores, 120" maxLength={150} value={dados.endereco} onChange={set('endereco')} /></div>
            <div className="ed-r"><span aria-hidden="true" /><label className="ed-l" htmlFor="nf-bai">Bairro</label><input id="nf-bai" className="ed-in" maxLength={150} value={dados.bairro} onChange={set('bairro')} /></div>
            <div className="ed-r"><span aria-hidden="true" /><label className="ed-l" htmlFor="nf-cid">Cidade</label><input id="nf-cid" className="ed-in" maxLength={150} value={dados.cidade} onChange={set('cidade')} /></div>
          </div>
        </div>
      </div>
      <div className="mx-f">
        <button type="button" className="btn ghost" onClick={fechar}>Cancelar</button>
        <button type="submit" className="btn pri" disabled={!dados.nome.trim() || enviando}>{enviando ? 'Salvando...' : 'Cadastrar filial'}</button>
      </div>
    </Modal>
  );
}
