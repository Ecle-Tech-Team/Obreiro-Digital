'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowRight } from 'lucide-react';

import { AuthInput, AuthShell, AuthSteps } from '@/app/components/auth/AuthParts';
import { TermosConteudo } from '@/app/components/auth/Termos';
import { Modal } from '@/app/components/ui/Modal';
import { apiMessage } from '@/app/components/ui/PageParts';
import api from '../../api/api';

const vazio = { nome: '', cnpj: '', data_fundacao: '', ministerio: '', setor: '', cep: '', cidade: '', endereco: '', bairro: '' };
type Campo = keyof typeof vazio;
const OBRIGATORIOS: [Campo, string][] = [
  ['nome', 'Informe o nome da igreja.'],
  ['cnpj', 'Informe o CNPJ.'],
  ['data_fundacao', 'Informe a data de fundação.'],
  ['ministerio', 'Informe o ministério.'],
  ['cep', 'Informe o CEP.'],
  ['cidade', 'Informe a cidade.'],
  ['endereco', 'Informe a rua e o número.'],
  ['bairro', 'Informe o bairro.'],
];

// 12345678000190 -> 12.345.678/0001-90 (aceita digitação parcial).
function mascaraCnpj(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14);
  return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
}
const mascaraCep = (d: string) => (d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d);
const hoje = () => new Date().toISOString().slice(0, 10);

export default function CadastroIgreja() {
  const router = useRouter();
  const [dados, setDados] = useState(vazio);
  const [erros, setErros] = useState<Partial<Record<Campo, string>>>({});
  const [termos, setTermos] = useState(false);
  const [aceito, setAceito] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  const set = (k: Campo, v: string) => { setDados((d) => ({ ...d, [k]: v })); setErros((e) => ({ ...e, [k]: undefined })); };
  const campo = (k: Campo) => ({ value: dados[k], error: erros[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(k, e.target.value) });

  const buscarCep = async (cep: string) => {
    setBuscandoCep(true);
    try {
      const { data } = await api.post(`/cep/${cep}`);
      setDados((d) => ({ ...d, endereco: data.street || d.endereco, bairro: data.neighborhood || d.bairro, cidade: data.city || d.cidade }));
      setErros((e) => ({ ...e, cep: undefined, cidade: undefined, endereco: undefined, bairro: undefined }));
      // O CEP traz só a rua: leva o cursor para o fim dela, para completar o número.
      if (data.street) setTimeout(() => {
        const rua = document.getElementById('ci-endereco') as HTMLInputElement | null;
        rua?.focus();
        rua?.setSelectionRange(rua.value.length, rua.value.length);
      }, 0);
    } catch {
      setErros((e) => ({ ...e, cep: 'CEP não encontrado. Confira ou preencha o endereço manualmente.' }));
    } finally {
      setBuscandoCep(false);
    }
  };

  const continuar = (event: React.FormEvent) => {
    event.preventDefault();
    const novos: Partial<Record<Campo, string>> = {};
    for (const [k, msg] of OBRIGATORIOS) if (!dados[k].trim()) novos[k] = msg;
    if (!novos.cnpj && dados.cnpj.replace(/\D/g, '').length !== 14) novos.cnpj = 'O CNPJ tem 14 números.';
    if (!novos.cep && dados.cep.length !== 8) novos.cep = 'O CEP tem 8 números.';
    if (!novos.data_fundacao && dados.data_fundacao > hoje()) novos.data_fundacao = 'A data de fundação não pode estar no futuro.';
    setErros(novos);
    const primeiro = OBRIGATORIOS.find(([k]) => novos[k]);
    if (primeiro) return void document.getElementById(`ci-${primeiro[0]}`)?.focus();
    setAceito(false);
    setTermos(true);
  };

  const cadastrar = async () => {
    if (!aceito) return;
    setEnviando(true);
    try {
      const corpo = Object.fromEntries(Object.entries(dados).map(([k, v]) => [k, v.trim()]));
      const { data } = await api.post('/igreja', corpo);
      sessionStorage.setItem('igrejaCadastroId', String(data.id_igreja));
      sessionStorage.setItem('igrejaCadastroNome', String(data.nome));
      sessionStorage.setItem('igrejaCadastroToken', String(data.registration_token));
      router.push('/pages/cadastroPastor', { scroll: false });
    } catch (error) {
      setEnviando(false);
      setTermos(false);
      toast.error(apiMessage(error, 'Não foi possível cadastrar a igreja. Tente novamente.'), { position: 'top-center', autoClose: 4000 });
    }
  };

  return (
    <AuthShell wide after={<ToastContainer />}>
      <AuthSteps steps={['Igreja', 'Termos', 'Pastor']} current={termos ? 1 : 0} />
      <h1 className="au-h1">Cadastre sua igreja</h1>
      <p className="au-sub">Comece pelos dados da igreja. Depois você aceita os termos e cadastra o pastor responsável.</p>
      <form className="au-form" onSubmit={continuar} noValidate>
        <div className="au-sec">
          <p className="au-sec-t">Dados da igreja</p>
          <div className="au-grid">
            <div className="au-f full"><label htmlFor="ci-nome">Nome da igreja</label><AuthInput id="ci-nome" type="text" maxLength={150} placeholder="Ex.: Congregação Jardim Esperança" {...campo('nome')} /></div>
            <div className="au-f"><label htmlFor="ci-cnpj">CNPJ</label><AuthInput id="ci-cnpj" type="text" inputMode="numeric" placeholder="00.000.000/0000-00" {...campo('cnpj')} onChange={(e) => set('cnpj', mascaraCnpj(e.target.value))} /></div>
            <div className="au-f"><label htmlFor="ci-data_fundacao">Data de fundação</label><AuthInput id="ci-data_fundacao" type="date" max={hoje()} {...campo('data_fundacao')} /></div>
            <div className="au-f"><label htmlFor="ci-ministerio">Ministério</label><AuthInput id="ci-ministerio" type="text" maxLength={150} placeholder="Nome do ministério" {...campo('ministerio')} /></div>
            <div className="au-f"><label htmlFor="ci-setor">Setor <span style={{ fontWeight: 600, color: '#64748b' }}>(opcional)</span></label><AuthInput id="ci-setor" type="text" maxLength={150} placeholder="Ex.: 02" {...campo('setor')} /></div>
          </div>
        </div>
        <div className="au-sec">
          <p className="au-sec-t">Endereço</p>
          <div className="au-grid">
            <div className="au-f">
              <label htmlFor="ci-cep">CEP</label>
              <AuthInput
                id="ci-cep" type="text" inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" aria-describedby="ci-cep-hint"
                value={mascaraCep(dados.cep)} error={erros.cep}
                onChange={(e) => {
                  const cep = e.target.value.replace(/\D/g, '').slice(0, 8);
                  set('cep', cep);
                  if (cep.length === 8) void buscarCep(cep);
                }}
              />
              <p className="au-hint" id="ci-cep-hint" aria-live="polite">{buscandoCep ? 'Buscando endereço…' : 'O endereço é preenchido pelo CEP.'}</p>
            </div>
            <div className="au-f"><label htmlFor="ci-cidade">Cidade</label><AuthInput id="ci-cidade" type="text" maxLength={150} autoComplete="address-level2" {...campo('cidade')} /></div>
            <div className="au-f full"><label htmlFor="ci-endereco">Rua e número</label><AuthInput id="ci-endereco" type="text" maxLength={150} autoComplete="street-address" placeholder="Ex.: Rua das Oliveiras, 120" {...campo('endereco')} /></div>
            <div className="au-f full"><label htmlFor="ci-bairro">Bairro</label><AuthInput id="ci-bairro" type="text" maxLength={150} {...campo('bairro')} /></div>
          </div>
        </div>
        <button type="submit" className="au-btn">Continuar<ArrowRight className="i" aria-hidden="true" /></button>
      </form>
      <p className="au-foot">Já tem conta? <Link href="/pages/login" className="au-link" style={{ fontSize: 15 }}>Entrar</Link></p>

      <Modal open={termos} onClose={() => { if (!enviando) setTermos(false); }} title="Termos de uso" subtitle="Leia antes de continuar o cadastro.">
        <div className="mx-b term">
          <TermosConteudo />
          <label className="au-check" style={{ marginTop: 16 }}><input type="checkbox" checked={aceito} onChange={(e) => setAceito(e.target.checked)} />Li e concordo com os termos de uso.</label>
        </div>
        <div className="mx-f">
          <button type="button" className="btn ghost" onClick={() => setTermos(false)} disabled={enviando}>Voltar</button>
          <button type="button" className="btn pri" onClick={cadastrar} disabled={!aceito || enviando}>{enviando ? 'Cadastrando…' : 'Aceitar e continuar'}</button>
        </div>
      </Modal>
    </AuthShell>
  );
}
