'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowRight, CircleAlert, CircleCheck, Info, Lock, Mail } from 'lucide-react';

import { AuthInput, AuthShell, AuthSteps, EMAIL_RE, FieldError, PasswordInput, SENHA_MIN } from '@/app/components/auth/AuthParts';
import { TermosConteudo } from '@/app/components/auth/Termos';
import { Modal } from '@/app/components/ui/Modal';
import { apiMessage } from '@/app/components/ui/PageParts';
import api from '../../api/api';

const vazio = { nome: '', cod_membro: '', birth: '', email: '', senha: '' };
type Campo = keyof typeof vazio | 'termos';
const hoje = () => new Date().toISOString().slice(0, 10);

export default function CadastroPastor() {
  const [dados, setDados] = useState(vazio);
  const [erros, setErros] = useState<Partial<Record<Campo, string>>>({});
  const [enviando, setEnviando] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [carregado, setCarregado] = useState(false);

  // Cadastro normal: a igreja acabou de ser criada na etapa anterior.
  const [igreja, setIgreja] = useState<{ id: number; nome: string } | null>(null);

  // Convite de filial: o código chega depois do "#" no link enviado pela matriz.
  const [conviteToken, setConviteToken] = useState('');
  const [convite, setConvite] = useState<{ igreja: string; matriz: string | null } | null>(null);
  const [conviteErro, setConviteErro] = useState('');
  const [aceito, setAceito] = useState(false);
  const [verTermos, setVerTermos] = useState(false);

  useEffect(() => {
    let token = '';
    try {
      const match = window.location.hash.match(/convite=([A-Za-z0-9_-]+)/);
      if (match) {
        token = match[1];
        sessionStorage.setItem('conviteToken', token);
        // Tira o código da barra de endereço (histórico e capturas de tela).
        window.history.replaceState(null, '', window.location.pathname);
      } else {
        token = sessionStorage.getItem('conviteToken') || '';
      }
      const id = Number(sessionStorage.getItem('igrejaCadastroId'));
      if (!token && id) setIgreja({ id, nome: sessionStorage.getItem('igrejaCadastroNome') || 'Igreja cadastrada' });
    } catch { /* armazenamento indisponível */ }
    setCarregado(true);
    if (!token) return;
    setConviteToken(token);
    api.post('/convite/validar', { token })
      .then(({ data }) => setConvite(data))
      .catch(() => setConviteErro('Este convite é inválido, expirou ou já foi utilizado. Peça um novo link à sua igreja matriz.'));
  }, []);

  const set = (k: keyof typeof vazio, v: string) => { setDados((d) => ({ ...d, [k]: v })); setErros((e) => ({ ...e, [k]: undefined })); };
  const campo = (k: keyof typeof vazio) => ({ value: dados[k], error: erros[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(k, e.target.value) });

  async function cadastrar(event: React.FormEvent) {
    event.preventDefault();
    const novos: Partial<Record<Campo, string>> = {};
    if (!dados.nome.trim()) novos.nome = 'Informe o nome completo.';
    if (!dados.cod_membro.trim()) novos.cod_membro = 'Informe o código de membro.';
    if (!dados.birth) novos.birth = 'Informe a data de nascimento.';
    else if (dados.birth > hoje()) novos.birth = 'A data de nascimento não pode estar no futuro.';
    if (!dados.email.trim()) novos.email = 'Informe o email.';
    else if (!EMAIL_RE.test(dados.email.trim())) novos.email = 'Insira um email válido, como nome@igreja.com.br.';
    if (dados.senha.length < SENHA_MIN) novos.senha = `A senha precisa ter pelo menos ${SENHA_MIN} caracteres.`;
    if (conviteToken && !aceito) novos.termos = 'Aceite os termos de uso para continuar.';
    setErros(novos);
    const primeiro = (['nome', 'cod_membro', 'birth', 'email', 'senha', 'termos'] as Campo[]).find((k) => novos[k]);
    if (primeiro) return void document.getElementById(`cp-${primeiro}`)?.focus();

    const base = { cod_membro: dados.cod_membro.trim(), nome: dados.nome.trim(), email: dados.email.trim(), senha: dados.senha, birth: dados.birth };
    setEnviando(true);
    try {
      if (conviteToken) {
        if (!convite) throw new Error(conviteErro || 'Convite inválido.');
        await api.post('/cadastro', { ...base, convite_token: conviteToken });
        try { sessionStorage.removeItem('conviteToken'); } catch { /* armazenamento indisponível */ }
      } else {
        if (!igreja) throw new Error('Cadastre a igreja antes do pastor.');
        await api.post('/cadastro', { ...base, cargo: 'Pastor Matriz', id_igreja: igreja.id, registration_token: sessionStorage.getItem('igrejaCadastroToken') });
        sessionStorage.removeItem('igrejaCadastroId');
        sessionStorage.removeItem('igrejaCadastroToken');
        sessionStorage.removeItem('igrejaCadastroNome');
      }
      setPronto(true);
    } catch (error) {
      toast.error(error instanceof Error && !('isAxiosError' in error) ? error.message : apiMessage(error, 'Não foi possível concluir o cadastro. Tente novamente.'), { position: 'top-center', autoClose: 4000 });
    } finally {
      setEnviando(false);
    }
  }

  const semOrigem = carregado && !conviteToken && !igreja && !pronto;

  return (
    <AuthShell wide after={<ToastContainer />}>
      {!conviteToken && <AuthSteps steps={['Igreja', 'Termos', 'Pastor']} current={pronto ? 3 : 2} />}

      {pronto ? (
        <div className="au-done" role="status">
          <span className="au-done-ico" aria-hidden="true"><CircleCheck className="i" /></span>
          <h1 className="au-h1" style={{ marginTop: 0 }}>Tudo pronto!</h1>
          <p className="au-sub">{conviteToken ? 'Sua conta de pastor foi criada.' : 'A igreja e o pastor foram cadastrados.'} Use o email e a senha que você acabou de criar para entrar.</p>
          <Link href="/pages/login" className="au-btn" style={{ marginTop: 24 }}>Ir para o login<ArrowRight className="i" aria-hidden="true" /></Link>
        </div>
      ) : semOrigem ? (
        <div className="au-done">
          <h1 className="au-h1" style={{ marginTop: 0 }}>Comece pelo cadastro da igreja</h1>
          <p className="au-sub">O pastor é cadastrado logo depois da igreja. Se você recebeu um convite de filial, abra o link que a matriz enviou.</p>
          <Link href="/pages/cadastroIgreja" className="au-btn" style={{ marginTop: 24 }}>Cadastrar igreja<ArrowRight className="i" aria-hidden="true" /></Link>
        </div>
      ) : (
        <>
          <h1 className="au-h1">{conviteToken ? 'Crie sua conta de pastor' : 'Cadastre o pastor responsável'}</h1>
          <p className="au-sub">{conviteToken ? 'Você vai administrar a filial no Obreiro Digital.' : 'Ele será o primeiro a acessar o painel da igreja e poderá cadastrar os obreiros depois.'}</p>
          {conviteToken && (
            <p className={conviteErro ? 'au-note' : 'au-note ok'} role="status" style={conviteErro ? { background: '#fef2f2', color: '#991b1b' } : undefined}>
              {conviteErro ? <CircleAlert className="i" aria-hidden="true" /> : <Info className="i" aria-hidden="true" />}
              <span>{conviteErro || (convite ? `Você foi convidado para ser pastor da ${convite.igreja}${convite.matriz ? ` (filial de ${convite.matriz})` : ''}.` : 'Verificando convite…')}</span>
            </p>
          )}
          <form className="au-form" onSubmit={cadastrar} noValidate>
            <div className="au-sec">
              <p className="au-sec-t">Dados pessoais</p>
              <div className="au-grid">
                <div className="au-f full"><label htmlFor="cp-nome">Nome completo</label><AuthInput id="cp-nome" type="text" autoComplete="name" maxLength={150} {...campo('nome')} /></div>
                <div className="au-f"><label htmlFor="cp-cod_membro">Código de membro</label><AuthInput id="cp-cod_membro" type="text" maxLength={50} placeholder="Ex.: M-0001" {...campo('cod_membro')} /></div>
                <div className="au-f"><label htmlFor="cp-birth">Data de nascimento</label><AuthInput id="cp-birth" type="date" max={hoje()} autoComplete="bday" {...campo('birth')} /></div>
                <div className="au-f full">
                  <label htmlFor="cp-igreja">Igreja</label>
                  <input id="cp-igreja" className="au-in" readOnly value={conviteToken ? convite?.igreja || '—' : igreja?.nome || ''} style={{ background: '#f8fafc', color: '#475569' }} />
                </div>
              </div>
            </div>
            <div className="au-sec">
              <p className="au-sec-t">Acesso ao sistema</p>
              <div className="au-f"><label htmlFor="cp-email">Email</label><AuthInput id="cp-email" icon={Mail} type="email" inputMode="email" autoComplete="email" maxLength={254} placeholder="nome@igreja.com.br" {...campo('email')} /></div>
              <div className="au-f">
                <label htmlFor="cp-senha">Senha</label>
                <PasswordInput id="cp-senha" icon={Lock} autoComplete="new-password" maxLength={1024} aria-describedby="cp-hint" {...campo('senha')} />
                <p className="au-hint" id="cp-hint">Mínimo de {SENHA_MIN} caracteres.</p>
              </div>
            </div>
            {conviteToken && (
              <div className="au-f">
                <label className="au-check">
                  <input id="cp-termos" type="checkbox" checked={aceito} aria-describedby={erros.termos ? 'cp-termos-err' : undefined} onChange={(e) => { setAceito(e.target.checked); setErros((x) => ({ ...x, termos: undefined })); }} />
                  <span>Li e concordo com os <button type="button" className="au-link" style={{ border: 0, background: 'none', padding: 0, fontSize: 15 }} onClick={() => setVerTermos(true)}>termos de uso</button>.</span>
                </label>
                <FieldError id="cp-termos-err">{erros.termos}</FieldError>
              </div>
            )}
            <button type="submit" className="au-btn" disabled={enviando || (!!conviteToken && !convite)}>{enviando ? 'Cadastrando…' : 'Concluir cadastro'}</button>
          </form>
        </>
      )}

      <Modal open={verTermos} onClose={() => setVerTermos(false)} title="Termos de uso" subtitle="Como seus dados são usados no Obreiro Digital.">
        <div className="mx-b term"><TermosConteudo /></div>
        <div className="mx-f"><button type="button" className="btn pri" onClick={() => { setAceito(true); setVerTermos(false); }}>Aceitar</button></div>
      </Modal>
    </AuthShell>
  );
}
