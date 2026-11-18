'use client'
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { Church, Copy, Link2 } from 'lucide-react';
import { Modal } from '@/app/components/ui/Modal';
import { apiMessage } from '@/app/components/ui/PageParts';
import api from '@/app/api/api';

type Props = {
  filial: { id_igreja: number; nome: string; nova?: boolean } | null;
  onClose: () => void;
  onGenerated?: () => void;
};

// Gera o link de convite para o pastor da filial criar a própria conta.
// O código vai depois do "#": o navegador não o envia a servidores nem a outros sites.
export default function ConvitePastorModal({ filial, onClose, onGenerated }: Props) {
  const [link, setLink] = useState('');
  const [expira, setExpira] = useState('');
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => { setLink(''); setExpira(''); setCopiado(false); }, [filial?.id_igreja]);

  const gerar = async () => {
    if (!filial) return;
    setGerando(true);
    try {
      const { data } = await api.post('/convite', { id_igreja: filial.id_igreja });
      setLink(`${window.location.origin}/pages/cadastroPastor#convite=${data.token}`);
      setExpira(format(new Date(data.expira_em), "dd/MM/yyyy 'às' HH:mm"));
      onGenerated?.();
    } catch (error) {
      toast.error(apiMessage(error, 'Não foi possível gerar o convite.'), { position: 'top-center', autoClose: 4000 });
    } finally {
      setGerando(false);
    }
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
    } catch {
      toast.info('Selecione o link e copie manualmente.', { position: 'top-center' });
    }
  };

  return (
    <Modal
      open={!!filial}
      onClose={onClose}
      title="Convidar pastor"
      subtitle={filial?.nova ? 'Último passo do cadastro da filial.' : 'Esta filial ainda não tem pastor com acesso.'}
    >
      {filial && (
        <>
          <div className="mx-b">
            <div className="pf"><span className="av" aria-hidden="true"><Church className="i" /></span><div><h3 className="xc-tit">{filial.nome}</h3><span className="tag tag-loc">Filial</span></div></div>
            <p style={{ fontSize: 15, lineHeight: 1.55, color: '#334155' }}>
              Envie um link para o pastor da filial criar a própria conta, com a própria senha.
            </p>
            {link ? (
              <div className="ed-f">
                <label className="ed-l" htmlFor="cv-link">Link de convite</label>
                <div className="lnk">
                  <input id="cv-link" className="ed-in" readOnly value={link} onFocus={(e) => e.target.select()} />
                  <button type="button" className="btn pri" onClick={copiar}><Copy className="i s18" aria-hidden="true" />{copiado ? 'Copiado!' : 'Copiar link'}</button>
                </div>
                <p className="au-hint">Vale até {expira} e só pode ser usado uma vez. Gerar outro link cancela este.</p>
              </div>
            ) : (
              <button type="button" className="btn pri" disabled={gerando} onClick={gerar}><Link2 className="i s18" aria-hidden="true" />{gerando ? 'Gerando...' : 'Gerar link de convite'}</button>
            )}
          </div>
          <div className="mx-f"><button type="button" className="btn ghost" onClick={onClose}>{link ? 'Fechar' : 'Agora não'}</button></div>
        </>
      )}
    </Modal>
  );
}
