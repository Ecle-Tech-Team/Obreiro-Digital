"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { ArrowRight, CircleCheck, Info, Lock, Mail } from "lucide-react";

import { AuthInput, AuthShell, AuthSteps, EMAIL_RE, PasswordInput, SENHA_MIN } from "@/app/components/auth/AuthParts";
import api from "../../api/api";

type Erros = { email?: string; codigo?: string; senha?: string };

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [etapa, setEtapa] = useState<"pedir" | "confirmar" | "feito">("pedir");
  const [aviso, setAviso] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);

  async function pedirCodigo(event: FormEvent) {
    event.preventDefault();
    const e = email.trim();
    if (!EMAIL_RE.test(e)) return setErros({ email: e ? "Insira um email válido, como nome@igreja.com.br." : "Informe o email da sua conta." });
    setErros({});
    setEnviando(true);
    try {
      await api.post("/recuperarLogin", { email: e });
      setEtapa("confirmar");
      setAviso("Se o email estiver cadastrado, você receberá um código em instantes.");
    } catch {
      setAviso("Não foi possível enviar a solicitação agora. Tente novamente em alguns minutos.");
    } finally {
      setEnviando(false);
    }
  }

  async function redefinir(event: FormEvent) {
    event.preventDefault();
    const novos: Erros = {};
    if (!/^\d{6}$/.test(codigo)) novos.codigo = codigo ? "O código tem 6 números." : "Digite o código que chegou no seu email.";
    if (novaSenha.length < SENHA_MIN) novos.senha = `A senha precisa ter pelo menos ${SENHA_MIN} caracteres.`;
    setErros(novos);
    if (novos.codigo || novos.senha) return;
    setEnviando(true);
    try {
      await api.post("/recuperarLogin/confirm", { email: email.trim(), code: codigo, newPassword: novaSenha });
      setCodigo("");
      setNovaSenha("");
      setEtapa("feito");
      setAviso("");
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status === 429) setErros({ codigo: "Muitas tentativas. Aguarde alguns minutos e tente de novo." });
      else if (status === 400) setErros({ codigo: "Código inválido ou expirado. Confira os números ou solicite outro código." });
      else setErros({ codigo: "Não foi possível redefinir a senha agora. Tente novamente." });
    } finally {
      setEnviando(false);
    }
  }

  const outroCodigo = () => { setCodigo(""); setNovaSenha(""); setErros({}); setAviso(""); setEtapa("pedir"); };
  return (
    <AuthShell back={{ href: "/pages/login", label: "Voltar ao login" }}>
      <AuthSteps steps={["Solicitar código", "Nova senha"]} current={etapa === "pedir" ? 0 : etapa === "confirmar" ? 1 : 2} />

      {etapa === "pedir" && (
        <>
          <h1 className="au-h1">Esqueceu a senha?</h1>
          <p className="au-sub">Informe o email da sua conta. Vamos enviar um código de 6 dígitos que vale por 15 minutos.</p>
          <form className="au-form" onSubmit={pedirCodigo} noValidate>
            <div className="au-f">
              <label htmlFor="recovery-email">Email</label>
              <AuthInput id="recovery-email" icon={Mail} type="email" autoComplete="email" placeholder="nome@igreja.com.br" maxLength={254}
                value={email} error={erros.email} onChange={(e) => { setEmail(e.target.value); setErros({}); }} />
            </div>
            <button type="submit" className="au-btn" disabled={enviando}>{enviando ? "Enviando…" : "Enviar código"}<ArrowRight className="i" aria-hidden="true" /></button>
          </form>
        </>
      )}

      {etapa === "confirmar" && (
        <>
          <h1 className="au-h1">Crie uma nova senha</h1>
          <p className="au-sub">Digite o código enviado para <strong style={{ color: "#0f172a" }}>{email.trim()}</strong> e escolha a nova senha.</p>
          <form className="au-form" onSubmit={redefinir} noValidate>
            <div className="au-f">
              <label htmlFor="recovery-code">Código de verificação</label>
              <AuthInput id="recovery-code" className="code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000"
                value={codigo} error={erros.codigo} onChange={(e) => { setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6)); setErros((x) => ({ ...x, codigo: undefined })); }} />
            </div>
            <div className="au-f">
              <label htmlFor="recovery-password">Nova senha</label>
              <PasswordInput id="recovery-password" icon={Lock} autoComplete="new-password" maxLength={1024} aria-describedby="rp-hint"
                value={novaSenha} error={erros.senha} onChange={(e) => { setNovaSenha(e.target.value); setErros((x) => ({ ...x, senha: undefined })); }} />
              <p className="au-hint" id="rp-hint">Mínimo de {SENHA_MIN} caracteres.</p>
            </div>
            <button type="submit" className="au-btn" disabled={enviando}>{enviando ? "Salvando…" : "Redefinir senha"}</button>
            <button type="button" className="au-btn sec" onClick={outroCodigo}>Solicitar outro código</button>
          </form>
        </>
      )}

      {etapa === "feito" && (
        <div className="au-done" role="status">
          <span className="au-done-ico" aria-hidden="true"><CircleCheck className="i" /></span>
          <h1 className="au-h1" style={{ marginTop: 0 }}>Senha redefinida</h1>
          <p className="au-sub">Agora é só entrar com a nova senha.</p>
          <Link href="/pages/login" className="au-btn" style={{ marginTop: 24 }}>Ir para o login<ArrowRight className="i" aria-hidden="true" /></Link>
        </div>
      )}

      {aviso && <p className="au-note" role="status"><Info className="i" aria-hidden="true" /><span>{aviso}</span></p>}
    </AuthShell>
  );
}
