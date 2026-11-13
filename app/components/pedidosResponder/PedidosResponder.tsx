'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { AppModal, DataTable, ModalCloseButton, ModalSurface } from '@/app/components/shared/MemberStyle';
import api from '@/app/api/api';
import { parseDateOnly } from "@/app/utils/date";

interface PedidoRecebido {
  id_pedido: number;
  nome_produto: string;
  categoria_produto: string;
  quantidade: number;
  data_pedido: string;
  status_pedido: string;
  data_entrega: string | null;
  motivo_recusa: string | null;
  respondido: number | boolean;
  id_igreja: number;
  nome_igreja: string;
}

type Acao = { pedido: PedidoRecebido; tipo: 'Entregue' | 'Recusado' };

// Quem responde pedidos: pastores e usuários da matriz, de igrejas que não são filiais
// (os pedidos de uma filial são respondidos pela matriz). A API confere de novo.
export function podeResponderPedidos(cargo: string | null, idMatriz: string | null) {
  const ehFilial = !!idMatriz && idMatriz !== 'null' && idMatriz !== 'undefined';
  return !ehFilial && (cargo === 'Pastor' || cargo === 'Pastor Matriz' || cargo === 'Obreiro Matriz');
}

const hoje = () => format(new Date(), 'yyyy-MM-dd');
const dataBR = (valor: string | null) => (valor ? format(parseDateOnly(valor), 'dd/MM/yyyy') : '');

// Lista de pedidos que a igreja do usuário deve responder: os próprios (quando ela não tem
// matriz) e os das filiais. Responder marca o pedido como entregue ou recusado.
export default function PedidosResponder({ onRespondido }: { onRespondido?: () => void }) {
  const [pedidos, setPedidos] = useState<PedidoRecebido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarRespondidos, setMostrarRespondidos] = useState(false);
  const [acao, setAcao] = useState<Acao | null>(null);
  const [dataEntrega, setDataEntrega] = useState(hoje());
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);

  const carregar = async () => {
    try {
      const response = await api.get('/pedido/recebidos');
      setPedidos(response.data);
    } catch (error) {
      console.error('Erro ao buscar pedidos para responder:', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const abrir = (pedido: PedidoRecebido, tipo: Acao['tipo']) => {
    setAcao({ pedido, tipo });
    setDataEntrega(hoje());
    setMotivo('');
  };

  const responder = async () => {
    if (!acao) return;
    if (acao.tipo === 'Entregue' && !dataEntrega) { toast.warn('Informe a data de entrega.', { position: 'top-center' }); return; }
    if (acao.tipo === 'Recusado' && !motivo.trim()) { toast.warn('Informe o motivo da recusa.', { position: 'top-center' }); return; }
    setEnviando(true);
    try {
      await api.put(`/pedido/${acao.pedido.id_pedido}/responder`, acao.tipo === 'Entregue'
        ? { status_pedido: 'Entregue', data_entrega: dataEntrega }
        : { status_pedido: 'Recusado', motivo_recusa: motivo.trim() });
      toast.success(acao.tipo === 'Entregue' ? 'Pedido marcado como entregue.' : 'Pedido recusado.', { position: 'top-center', autoClose: 1500 });
      setAcao(null);
      await carregar();
      onRespondido?.();
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message ? error.response.data.message : 'Não foi possível responder o pedido.';
      toast.error(message, { position: 'top-center', autoClose: 4000 });
    } finally {
      setEnviando(false);
    }
  };

  const pendentes = pedidos.filter(p => !p.respondido);
  const visiveis = mostrarRespondidos ? pedidos : pendentes;

  return (
    <section className="mt-10 min-w-0" aria-labelledby="pedidos-responder-titulo">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="pedidos-responder-titulo" className="text1 text-2xl text-black">
          Pedidos para responder {pendentes.length > 0 && <span className="ml-2 rounded-full bg-azul px-3 py-1 text-base text-white">{pendentes.length}</span>}
        </h2>
        <label className="text2 flex items-center gap-2 text-gray-700">
          <input type="checkbox" checked={mostrarRespondidos} onChange={e => setMostrarRespondidos(e.target.checked)} />
          Mostrar já respondidos
        </label>
      </div>
      <p className="text2 mt-1 text-gray-600">Pedidos da sua igreja e das igrejas subordinadas. Marque como entregue ou recuse informando o motivo.</p>

      <div className="page-table-scroll mt-4 max-h-[50vh]">
        {carregando ? (
          <p className="text2 text-gray-600">Carregando...</p>
        ) : visiveis.length === 0 ? (
          <p className="text2 text-gray-600">{mostrarRespondidos ? 'Nenhum pedido recebido.' : 'Nenhum pedido aguardando resposta.'}</p>
        ) : (
          <DataTable>
            <thead className="sticky top-0">
              <tr className="bg-azul text-white">
                <th className="text1 px-4 py-2 text-white">Igreja</th>
                <th className="text1 px-4 py-2 text-white">Produto</th>
                <th className="text1 px-4 py-2 text-white">Quantidade</th>
                <th className="text1 px-4 py-2 text-white">Data do Pedido</th>
                <th className="text1 px-4 py-2 text-white">Situação</th>
                <th className="text1 px-4 py-2 text-white">Ações</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map(p => (
                <tr key={p.id_pedido}>
                  <td data-label="Igreja" className="text2 py-3 text-center">{p.nome_igreja}</td>
                  <td data-label="Produto" className="text2 py-3 text-center">{p.nome_produto} <span className="text-gray-500">({p.categoria_produto})</span></td>
                  <td data-label="Quantidade" className="text2 py-3 text-center">{p.quantidade}</td>
                  <td data-label="Data do Pedido" className="text2 py-3 text-center">{dataBR(p.data_pedido)}</td>
                  <td data-label="Situação" className="text2 py-3 text-center">
                    {p.status_pedido}
                    {p.status_pedido === 'Entregue' && p.data_entrega && <span className="block text-sm text-gray-500">em {dataBR(p.data_entrega)}</span>}
                    {p.status_pedido === 'Recusado' && p.motivo_recusa && <span className="block text-sm text-gray-500">{p.motivo_recusa}</span>}
                  </td>
                  <td data-label="Ações" className="text2 py-3 text-center">
                    {p.respondido ? <span className="text-gray-500">Respondido</span> : (
                      <div className="flex flex-wrap justify-center gap-2">
                        <button type="button" className="rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700" onClick={() => abrir(p, 'Entregue')}>Entregar</button>
                        <button type="button" className="rounded-lg bg-red-500 px-3 py-2 text-white hover:bg-red-600" onClick={() => abrir(p, 'Recusado')}>Recusar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </div>

      <AppModal
        isOpen={!!acao}
        onRequestClose={() => setAcao(null)}
        contentLabel="Responder pedido"
        ariaHideApp={false}
        overlayClassName="fixed inset-0 z-50 bg-slate-950/55"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {acao && (
          <ModalSurface className="w-full max-w-md p-6">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text1 text-xl text-black">{acao.tipo === 'Entregue' ? 'Marcar como entregue' : 'Recusar pedido'}</h3>
              <ModalCloseButton onClick={() => setAcao(null)} />
            </div>
            <p className="text2 mt-2 text-gray-700">
              {acao.pedido.quantidade}x {acao.pedido.nome_produto} — {acao.pedido.nome_igreja}
            </p>
            {acao.tipo === 'Entregue' ? (
              <label className="text2 mt-4 flex flex-col gap-1 text-gray-800">
                Data de entrega
                <input type="date" className="rounded-lg border px-4 py-3" value={dataEntrega} onChange={e => setDataEntrega(e.target.value)} required />
              </label>
            ) : (
              <label className="text2 mt-4 flex flex-col gap-1 text-gray-800">
                Motivo da recusa
                <textarea className="rounded-lg border px-4 py-3" rows={3} maxLength={1000} value={motivo} onChange={e => setMotivo(e.target.value)} required />
              </label>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="text2 rounded-lg px-5 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setAcao(null)}>Cancelar</button>
              <button type="button" disabled={enviando} className={`text2 rounded-lg px-5 py-2 text-white disabled:opacity-60 ${acao.tipo === 'Entregue' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}`} onClick={responder}>
                {acao.tipo === 'Entregue' ? 'Confirmar entrega' : 'Confirmar recusa'}
              </button>
            </div>
          </ModalSurface>
        )}
      </AppModal>
    </section>
  );
}
