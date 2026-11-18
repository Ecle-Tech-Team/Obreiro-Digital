'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import { Bug, Church, Flag, Hash, KeyRound, Lock, LogOut, Mail, MapPin, MessageCircle, Pencil, Plus, ShieldCheck, UserRoundX } from 'lucide-react';

import { PageShell, apiMessage } from '@/app/components/ui/PageParts';
import { ConfirmDialog, EditRow, Modal, ViewRow } from '@/app/components/ui/Modal';
import { brDate, parseDateOnly } from '@/app/utils/date';
import { TermosConteudo } from '@/app/components/auth/Termos';
import api from '@/app/api/api';

interface Igreja {
  id_igreja: number;
  nome: string;
  cnpj: string | null;
  setor: string | null;
  ministerio: string | null;
  cep: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  data_fundacao: string | null;
  id_matriz?: number | null;
}

type Tela = null | 'logout' | 'dados' | 'email' | 'emailOk' | 'senha' | 'senhaOk' | 'bug' | 'termos' | 'apagar' | 'apagarOk';

const MOTIVOS = ['Erro de navegação', 'Bug visual', 'Problema de cadastro', 'Erro nos dados', 'Outro'];
const ok = (msg: string) => toast.success(msg, { position: 'top-center', autoClose: 1500 });
const erro = (msg: string) => toast.error(msg, { position: 'top-center', autoClose: 4000 });
const aviso = (msg: string) => toast.warn(msg, { position: 'top-center' });
const Vazio = () => <span aria-hidden="true" />;
const podeVerMatriz = () => typeof window !== 'undefined' && /Matriz$/.test(sessionStorage.getItem('cargo') || '');

function fundacao(valor?: string | null) {
  const d = parseDateOnly(valor);
  if (!valor || isNaN(d.getTime())) return '—';
  const hoje = new Date();
  let anos = hoje.getFullYear() - d.getFullYear();
  if (hoje.getMonth() < d.getMonth() || (hoje.getMonth() === d.getMonth() && hoje.getDate() < d.getDate())) anos -= 1;
  return anos > 0 ? `${brDate(valor)} · há ${anos} ${anos === 1 ? 'ano' : 'anos'}` : brDate(valor);
}

const sair = (router: ReturnType<typeof useRouter>) => {
  sessionStorage.clear();
  localStorage.clear();
  router.push('/pages/login');
};

export default function Configuracoes() {
  const router = useRouter();
  const [tela, setTela] = useState<Tela>(null);
  const [enviando, setEnviando] = useState(false);
  const fechar = () => setTela(null);

  // Dados da igreja
  const [igreja, setIgreja] = useState<Igreja | null>(null);
  const [rascunho, setRascunho] = useState<Igreja | null>(null);
  const [podeEditar, setPodeEditar] = useState(false);

  // Email e senha
  const [novoEmail, setNovoEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Bug e exclusão
  const [motivo, setMotivo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [emailConfirmacao, setEmailConfirmacao] = useState('');

  const encerrarSessao = async () => {
    try { await api.post('/login/logout'); } catch { /* Sessão já expirada. */ }
    finally { sair(router); }
  };

  const abrirDados = async () => {
    const id = sessionStorage.getItem('id_igreja');
    if (!id) return erro('Igreja não encontrada na sessão. Entre novamente.');
    try {
      const { data } = await api.get(`/igreja/${id}`);
      const cargo = sessionStorage.getItem('cargo');
      setPodeEditar(cargo === 'Pastor' || cargo === 'Pastor Matriz');
      setIgreja(data);
      setRascunho(null);
      setTela('dados');
    } catch (error) {
      erro(apiMessage(error, 'Não foi possível carregar os dados da igreja.'));
    }
  };

  const salvarIgreja = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!rascunho) return;
    if (!rascunho.nome.trim()) return aviso('Informe o nome da igreja.');
    setEnviando(true);
    try {
      const corpo = { ...rascunho, nome: rascunho.nome.trim(), data_fundacao: rascunho.data_fundacao ? String(rascunho.data_fundacao).slice(0, 10) : null };
      await api.put(`/igreja/${rascunho.id_igreja}`, corpo);
      setIgreja(corpo);
      setRascunho(null);
      ok('Dados da igreja atualizados!');
    } catch (error) {
      erro(apiMessage(error, 'Não foi possível salvar. Tente novamente.'));
    } finally {
      setEnviando(false);
    }
  };

  const abrirEmail = () => { setNovoEmail(''); setSenhaAtual(''); setTela('email'); };
  const continuarEmail = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoEmail.trim())) return aviso('Digite um email válido.');
    if (!senhaAtual) return aviso('Informe sua senha atual.');
    setTela('emailOk');
  };
  const alterarEmail = async () => {
    setEnviando(true);
    try {
      const email = novoEmail.trim();
      await api.put(`/cadastro/${sessionStorage.getItem('id_user')}`, { email, senha_atual: senhaAtual });
      sessionStorage.setItem('email', email);
      setSenhaAtual('');
      fechar();
      ok('Email alterado com sucesso!');
    } catch (error) {
      setTela('email');
      erro(apiMessage(error, 'Não foi possível alterar o email.'));
    } finally {
      setEnviando(false);
    }
  };

  const abrirSenha = () => { setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha(''); setTela('senha'); };
  const continuarSenha = (event: React.FormEvent) => {
    event.preventDefault();
    if (!senhaAtual) return aviso('Informe sua senha atual.');
    if (!novaSenha || !confirmarSenha) return aviso('Preencha a nova senha e a confirmação.');
    if (novaSenha !== confirmarSenha) return aviso('As senhas não coincidem.');
    setTela('senhaOk');
  };
  const alterarSenha = async () => {
    setEnviando(true);
    try {
      await api.put(`/cadastro/${sessionStorage.getItem('id_user')}`, { senha: novaSenha, senha_atual: senhaAtual });
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
      fechar();
      ok('Senha alterada! Entre novamente com a nova senha.');
      // A troca de senha encerra as outras sessões; esta também precisa de novo login.
      setTimeout(() => sair(router), 1500);
    } catch (error) {
      setTela('senha');
      erro(apiMessage(error, 'Não foi possível alterar a senha.'));
    } finally {
      setEnviando(false);
    }
  };

  const abrirBug = () => { setMotivo(''); setDescricao(''); setTela('bug'); };
  const enviarBug = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!motivo) return aviso('Escolha o motivo.');
    if (!descricao.trim()) return aviso('Conte o que aconteceu.');
    setEnviando(true);
    try {
      await api.post('/report', { motivo, descricao: descricao.trim() });
      fechar();
      ok('Relatório enviado. Obrigado!');
    } catch (error) {
      erro(apiMessage(error, 'Não foi possível enviar o relatório.'));
    } finally {
      setEnviando(false);
    }
  };

  const apagarConta = async (event: React.FormEvent) => {
    event.preventDefault();
    const atual = sessionStorage.getItem('email')?.trim().toLowerCase();
    if (!emailConfirmacao.trim() || emailConfirmacao.trim().toLowerCase() !== atual) return aviso('O email não corresponde ao da sua conta.');
    setEnviando(true);
    try {
      await api.delete(`/cadastro/${sessionStorage.getItem('id_user')}`);
      sair(router);
    } catch (error) {
      erro(apiMessage(error, 'Não foi possível apagar a conta.'));
    } finally {
      setEnviando(false);
    }
  };

  const campo = (k: keyof Igreja) => ({
    value: (rascunho?.[k] as string | null | undefined) ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setRascunho((r) => (r ? { ...r, [k]: e.target.value } : r)),
  });

  const editando = !!rascunho;
  const ehFilial = igreja?.id_matriz != null;
  const tipoIgreja = ehFilial ? 'Filial' : podeVerMatriz() ? 'Matriz' : 'Igreja';

  return (
    <PageShell
      crumbs={[{ label: 'Início', href: '/pages/inicio' }, { label: 'Configurações' }]}
      title="Configurações"
      titleAside={<button type="button" className="out" onClick={() => setTela('logout')}>Encerrar Sessão<LogOut className="i" aria-hidden="true" /></button>}
      after={<ToastContainer />}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
        <button type="button" className="opt" onClick={abrirDados}><Church className="i" aria-hidden="true" />Dados da Igreja<small>Visualizar dados da igreja</small></button>
        <button type="button" className="opt" onClick={abrirEmail}><Mail className="i" aria-hidden="true" />Alterar Email<small>Novo email</small></button>
        <button type="button" className="opt" onClick={abrirSenha}><KeyRound className="i" aria-hidden="true" />Alterar Senha<small>Nova senha</small></button>
        <button type="button" className="opt" onClick={abrirBug}><Bug className="i" aria-hidden="true" />Relatar Bug<small>Descreva o seu bug</small></button>
        <button type="button" className="opt dead" aria-disabled="true" title="Em breve"><MessageCircle className="i" aria-hidden="true" />Solicitar Suporte<small>Em breve</small></button>
        <button type="button" className="opt" onClick={() => setTela('termos')}><ShieldCheck className="i" aria-hidden="true" />Privacidade<small>Termos de privacidade</small></button>
        <button type="button" className="opt red" onClick={() => { setEmailConfirmacao(''); setTela('apagar'); }}><UserRoundX className="i" aria-hidden="true" />Apagar Conta<small>Deletar sua conta</small></button>
      </div>

      <ConfirmDialog
        open={tela === 'logout'} onCancel={fechar} onConfirm={encerrarSessao}
        title="Sair da conta?" message="Você precisará fazer login novamente para acessar o sistema."
        confirmLabel="Sair" icon={LogOut} tone="info"
      />

      <Modal
        open={tela === 'dados'} onClose={fechar}
        as={editando ? 'form' : 'div'} onSubmit={salvarIgreja}
        title={editando ? 'Editar dados da igreja' : 'Dados da igreja'}
        subtitle={editando ? 'As alterações valem para todos os usuários da igreja.' : 'Igreja vinculada à sua conta.'}
      >
        {igreja && !editando && (
          <>
            <div className="mx-b">
              <div className="pf">
                <span className="av" aria-hidden="true"><Church className="i" /></span>
                <div>
                  <h3 className="xc-tit">{igreja.nome}</h3>
                  <span className={ehFilial ? 'tag tag-loc' : 'tag tag-mat'}>{tipoIgreja}{igreja.setor ? ` · ${/^setor/i.test(igreja.setor.trim()) ? igreja.setor.trim() : `Setor ${igreja.setor.trim()}`}` : ''}</span>
                </div>
              </div>
              <div className="vw">
                <ViewRow icon={Hash} label="CNPJ">{igreja.cnpj || '—'}</ViewRow>
                <ViewRow icon={Church} label="Ministério">{igreja.ministerio || '—'}</ViewRow>
                <ViewRow icon={Flag} label="Fundação">{fundacao(igreja.data_fundacao)}</ViewRow>
                <ViewRow icon={MapPin} label="Endereço" top>
                  {[igreja.endereco, igreja.bairro].filter(Boolean).join(' · ') || '—'}
                  {(igreja.cidade || igreja.cep) && <><br />{[igreja.cidade, igreja.cep && `CEP ${igreja.cep}`].filter(Boolean).join(' · ')}</>}
                </ViewRow>
              </div>
            </div>
            {podeEditar && (
              <div className="mx-f">
                <button type="button" className="btn pri" onClick={() => setRascunho({ ...igreja, data_fundacao: igreja.data_fundacao ? String(igreja.data_fundacao).slice(0, 10) : '' })}><Pencil className="i s18" aria-hidden="true" />Editar</button>
              </div>
            )}
          </>
        )}
        {rascunho && (
          <>
            <div className="mx-b">
              <label className="sr" htmlFor="dg-nome">Nome da igreja</label>
              <input id="dg-nome" className="ed-tit" maxLength={150} {...campo('nome')} />
              <div className="ed-f"><span className="ed-l">Dados da igreja</span>
                <div className="vw">
                  <EditRow icon={Hash} label="CNPJ" htmlFor="dg-cnpj"><input id="dg-cnpj" className="ed-in" maxLength={18} {...campo('cnpj')} /></EditRow>
                  <EditRow icon={Flag} label="Fundação" htmlFor="dg-fund"><input id="dg-fund" className="ed-in" type="date" {...campo('data_fundacao')} /></EditRow>
                  <EditRow icon={Church} label="Ministério" htmlFor="dg-min"><input id="dg-min" className="ed-in" maxLength={100} {...campo('ministerio')} /></EditRow>
                  <EditRow icon={Plus} label="Setor" htmlFor="dg-set"><input id="dg-set" className="ed-in" maxLength={50} {...campo('setor')} /></EditRow>
                </div>
              </div>
              <div className="ed-f"><span className="ed-l">Endereço</span>
                <div className="vw">
                  <EditRow icon={MapPin} label="CEP" htmlFor="dg-cep"><input id="dg-cep" className="ed-in" maxLength={9} inputMode="numeric" {...campo('cep')} /></EditRow>
                  <EditRow icon={Vazio} label="Rua e nº" htmlFor="dg-end"><input id="dg-end" className="ed-in" maxLength={200} {...campo('endereco')} /></EditRow>
                  <EditRow icon={Vazio} label="Bairro" htmlFor="dg-bai"><input id="dg-bai" className="ed-in" maxLength={100} {...campo('bairro')} /></EditRow>
                  <EditRow icon={Vazio} label="Cidade" htmlFor="dg-cid"><input id="dg-cid" className="ed-in" maxLength={100} {...campo('cidade')} /></EditRow>
                </div>
              </div>
            </div>
            <div className="mx-f">
              <button type="button" className="btn ghost" onClick={() => setRascunho(null)}>Cancelar</button>
              <button type="submit" className="btn pri" disabled={enviando}>Salvar alterações</button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={tela === 'email'} onClose={fechar} as="form" onSubmit={continuarEmail} title="Alterar email" subtitle="Você passará a entrar no sistema com o novo email.">
        <div className="mx-b">
          <div className="vw">
            <EditRow icon={Mail} label="Novo email" htmlFor="em-n"><input id="em-n" className="ed-in" type="email" autoComplete="email" placeholder="nome@exemplo.com" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} /></EditRow>
            <EditRow icon={Lock} label="Senha atual" htmlFor="em-s"><input id="em-s" className="ed-in" type="password" autoComplete="current-password" placeholder="Para confirmar que é você" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} /></EditRow>
          </div>
        </div>
        <div className="mx-f"><button type="button" className="btn ghost" onClick={fechar}>Cancelar</button><button type="submit" className="btn pri">Continuar</button></div>
      </Modal>
      <ConfirmDialog
        open={tela === 'emailOk'} onCancel={() => setTela('email')} onConfirm={alterarEmail} busy={enviando}
        title="Alterar email?" message={<>Seu email de acesso passará a ser <strong style={{ color: '#0f172a' }}>{novoEmail.trim()}</strong>.</>}
        confirmLabel="Sim, alterar" icon={Mail} tone="info"
      />

      <Modal open={tela === 'senha'} onClose={fechar} as="form" onSubmit={continuarSenha} title="Alterar senha" subtitle="Use uma senha que você não usa em outros sites.">
        <div className="mx-b">
          <div className="vw">
            <EditRow icon={Lock} label="Senha atual" htmlFor="sn-a"><input id="sn-a" className="ed-in" type="password" autoComplete="current-password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} /></EditRow>
            <EditRow icon={KeyRound} label="Nova senha" htmlFor="sn-n"><input id="sn-n" className="ed-in" type="password" autoComplete="new-password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} /></EditRow>
            <EditRow icon={Vazio} label="Confirmar" htmlFor="sn-c"><input id="sn-c" className="ed-in" type="password" autoComplete="new-password" placeholder="Repita a nova senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} /></EditRow>
          </div>
        </div>
        <div className="mx-f"><button type="button" className="btn ghost" onClick={fechar}>Cancelar</button><button type="submit" className="btn pri">Continuar</button></div>
      </Modal>
      <ConfirmDialog
        open={tela === 'senhaOk'} onCancel={() => setTela('senha')} onConfirm={alterarSenha} busy={enviando}
        title="Alterar senha?" message="Você sairá da conta e usará a nova senha no próximo login."
        confirmLabel="Sim, alterar" icon={KeyRound} tone="info"
      />

      <Modal open={tela === 'bug'} onClose={fechar} as="form" onSubmit={enviarBug} title="Relatar bug" subtitle="Conte o que aconteceu. Isso ajuda a corrigir mais rápido.">
        <div className="mx-b">
          <div className="ed-f"><span className="ed-l" id="bg-m-l">Motivo</span>
            <div className="chips" role="radiogroup" aria-labelledby="bg-m-l">
              {MOTIVOS.map((m) => <label key={m}><input type="radio" name="bg-m" value={m} checked={motivo === m} onChange={() => setMotivo(m)} />{m}</label>)}
            </div>
          </div>
          <div className="ed-f"><label className="ed-l" htmlFor="bg-d">O que aconteceu?</label><textarea id="bg-d" className="ed-in" maxLength={2000} placeholder="Ex.: ao salvar um membro, a tela ficou em branco..." value={descricao} onChange={(e) => setDescricao(e.target.value)} /></div>
        </div>
        <div className="mx-f"><button type="button" className="btn ghost" onClick={fechar}>Cancelar</button><button type="submit" className="btn pri" disabled={enviando}>Enviar relatório</button></div>
      </Modal>

      <Modal open={tela === 'termos'} onClose={fechar} title="Termos de privacidade" subtitle="Como seus dados são usados no Obreiro Digital.">
        <div className="mx-b term">
          <TermosConteudo />
        </div>
        <div className="mx-f"><button type="button" className="btn pri" onClick={fechar}>Entendi</button></div>
      </Modal>

      <ConfirmDialog
        open={tela === 'apagar'} onCancel={fechar} onConfirm={() => setTela('apagarOk')}
        title="Apagar conta?" message="Todos os dados da sua conta serão removidos. Essa ação não pode ser desfeita."
        confirmLabel="Continuar" icon={UserRoundX}
      />
      <Modal open={tela === 'apagarOk'} onClose={fechar} size="sm" role="alertdialog" as="form" onSubmit={apagarConta}>
        <div className="mx-cf">
          <span className="mx-ico"><Mail className="i" aria-hidden="true" /></span>
          <h2>Confirme seu email</h2>
          <p>Digite o email da conta para confirmar a exclusão.</p>
          <div className="ed-f"><label htmlFor="ap-e" className="sr">Email</label><input id="ap-e" className="ed-in" type="email" autoComplete="off" placeholder="nome@exemplo.com" value={emailConfirmacao} onChange={(e) => setEmailConfirmacao(e.target.value)} /></div>
        </div>
        <div className="mx-f"><button type="button" className="btn" onClick={fechar}>Cancelar</button><button type="submit" className="btn dng" disabled={enviando}>Apagar conta</button></div>
      </Modal>
    </PageShell>
  );
}
