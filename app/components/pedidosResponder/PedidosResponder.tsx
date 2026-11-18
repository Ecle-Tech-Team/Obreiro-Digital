'use client'
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Calendar, Check, Church, MessageSquare, Package, Truck } from 'lucide-react';
import { Modal, ViewRow } from '@/app/components/ui/Modal';
import { apiMessage } from '@/app/components/ui/PageParts';
import { brDate } from '@/app/utils/date';
import api from '@/app/api/api';

export interface PedidoRecebido {
  id_pedido: number;
  nome_produto: string;
  categoria_produto: string;
  quantidade: number;
  data_pedido: string;
  status_pedido: string | null;
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

export const situacaoTag = (status?: string | null) =>
  status === 'Entregue' ? 'tag tag-ok' : status === 'Recusado' ? 'tag tag-rec' : 'tag tag-and';

const hoje = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

// "Responder pedidos": um cartão por pedido, com Entregar e Recusar.
export default function PedidosResponder({ onRespondido }: { onRespondido?: () => void }) {
  const [pedidos, setPedidos] = useState<PedidoRecebido[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [mostrarRespondidos, setMostrarRespondidos] = useState(false);
  const [acao, setAcao] = useState<Acao | null>(null);
  const [dataEntrega, setDataEntrega] = useState(hoje());
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const { data } = await api.get('/pedido/recebidos');
      setPedidos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar pedidos para responder:', error);
    } finally {
      setCarregado(true);
    }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  const abrir = (pedido: PedidoRecebido, tipo: Acao['tipo']) => { setAcao({ pedido, tipo }); setDataEntrega(hoje()); setMotivo(''); };

  const responder = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!acao) return;
    if (acao.tipo === 'Entregue' && !dataEntrega) return void toast.warn('Informe a data de entrega.', { position: 'top-center' });
    if (acao.tipo === 'Recusado' && !motivo.trim()) return void toast.warn('Informe o motivo da recusa.', { position: 'top-center' });
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
      toast.error(apiMessage(error, 'Não foi possível responder o pedido.'), { position: 'top-center', autoClose: 4000 });
    } finally {
      setEnviando(false);
    }
  };

  const pendentes = pedidos.filter((p) => !p.respondido);
  const visiveis = mostrarRespondidos ? pedidos : pendentes;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }} aria-labelledby="rp-h">
      <div className="list-bar">
        <h2 id="rp-h" className="sec-t">
          Responder pedidos{' '}
          {carregado && <span className={pendentes.length ? 'tag tag-and' : 'tag tag-ok'}>{pendentes.length ? `${pendentes.length} ${pendentes.length === 1 ? 'pendente' : 'pendentes'}` : 'Nenhum pendente'}</span>}
        </h2>
        <label className="chk"><input type="checkbox" checked={mostrarRespondidos} onChange={(e) => setMostrarRespondidos(e.target.checked)} />Mostrar já respondidos</label>
      </div>
      <p className="list-n" style={{ fontSize: 15 }}>Pedidos que sua igreja responde: os das igrejas subordinadas e os próprios. Marque como entregue ou recuse informando o motivo.</p>
      {carregado && visiveis.length === 0 ? (
        <p className="card empty">{mostrarRespondidos ? 'Nenhum pedido recebido.' : 'Nenhum pedido aguardando resposta.'}</p>
      ) : (
        <div className="cards">
          {visiveis.map((p) => (
            <article key={p.id_pedido} className="card lc">
              <div className="lc-top"><span className="av" aria-hidden="true"><Package className="i" /></span><span className={situacaoTag(p.status_pedido)}>{p.status_pedido || 'Em Andamento'}</span></div>
              <h3 className="lc-tit" style={{ fontSize: 18 }}>{p.quantidade}× {p.nome_produto}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p className="xc-meta"><Church className="i" aria-hidden="true" /><span>{p.nome_igreja}</span></p>
                <p className="xc-meta"><Calendar className="i" aria-hidden="true" /><span>Pedido em {brDate(p.data_pedido)}</span></p>
              </div>
              <div className="lc-foot row">
                {p.respondido ? (
                  <span className="list-n">{p.status_pedido === 'Entregue' && p.data_entrega ? `Entregue em ${brDate(p.data_entrega)}` : p.motivo_recusa ? `Recusado: ${p.motivo_recusa}` : 'Pedido já respondido'}</span>
                ) : (
                  <div className="lc-acts">
                    <button type="button" className="btn rec" onClick={() => abrir(p, 'Recusado')}>Recusar</button>
                    <button type="button" className="btn ok" onClick={() => abrir(p, 'Entregue')}><Check className="i s18" aria-hidden="true" />Entregar</button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={!!acao}
        onClose={() => setAcao(null)}
        as="form"
        onSubmit={responder}
        title={acao?.tipo === 'Entregue' ? 'Marcar como entregue' : 'Recusar pedido'}
        subtitle={acao?.tipo === 'Entregue' ? 'Informe quando o pedido foi entregue.' : 'A igreja verá o motivo da recusa.'}
      >
        {acao && (
          <>
            <div className="mx-b">
              <div className="vw">
                <ViewRow icon={Church} label="Igreja">{acao.pedido.nome_igreja}</ViewRow>
                <ViewRow icon={Package} label="Pedido">{acao.pedido.quantidade}× {acao.pedido.nome_produto}</ViewRow>
              </div>
              {acao.tipo === 'Entregue' ? (
                <div className="ed-f"><label className="ed-l" htmlFor="rp-data"><Truck className="i s18" style={{ display: 'inline', marginRight: 6 }} aria-hidden="true" />Data de entrega</label><input id="rp-data" className="ed-in" type="date" value={dataEntrega} onChange={(e) => setDataEntrega(e.target.value)} /></div>
              ) : (
                <div className="ed-f"><label className="ed-l" htmlFor="rp-mot"><MessageSquare className="i s18" style={{ display: 'inline', marginRight: 6 }} aria-hidden="true" />Motivo da recusa</label><textarea id="rp-mot" className="ed-in" maxLength={1000} placeholder="Ex.: já temos estoque suficiente na matriz" value={motivo} onChange={(e) => setMotivo(e.target.value)} /></div>
              )}
            </div>
            <div className="mx-f">
              <button type="button" className="btn ghost" onClick={() => setAcao(null)}>Cancelar</button>
              <button type="submit" disabled={enviando} className={`btn ${acao.tipo === 'Entregue' ? 'ok' : 'dng'}`}>{acao.tipo === 'Entregue' ? 'Confirmar entrega' : 'Confirmar recusa'}</button>
            </div>
          </>
        )}
      </Modal>
    </section>
  );
}
