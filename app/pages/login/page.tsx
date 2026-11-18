"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowRight, Info, Lock, Mail } from "lucide-react";

import { AuthInput, AuthShell, EMAIL_RE, PasswordInput } from "@/app/components/auth/AuthParts";
import api from "../../api/api";

type Erros = { email?: string; senha?: string };

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);
  const [expirou, setExpirou] = useState(false);

  // Aviso quando o usuário foi trazido ao login porque a sessão expirou.
  useEffect(() => {
    try {
      if (sessionStorage.getItem("sessaoExpirada")) {
        sessionStorage.removeItem("sessaoExpirada");
        setExpirou(true);
      }
    } catch { /* armazenamento indisponível */ }
  }, []);

  async function entrar(event: React.FormEvent) {
    event.preventDefault();
    const e = email.trim();
    const novos: Erros = {};
    if (!e) novos.email = "Informe seu email.";
    else if (!EMAIL_RE.test(e)) novos.email = "Insira um email válido, como nome@igreja.com.br.";
    if (!senha) novos.senha = "Informe sua senha.";
    setErros(novos);
    if (novos.email || novos.senha) {
      document.getElementById(novos.email ? "email" : "password")?.focus();
      return;
    }

    setEnviando(true);
    try {
      const { data } = await api.post("/login", { email: e, senha });
      const user = data.user;
      sessionStorage.setItem("id_user", user.id_user);
      sessionStorage.setItem("nome", user.nome);
      sessionStorage.setItem("cargo", user.cargo);
      sessionStorage.setItem("id_igreja", user.id_igreja);
      sessionStorage.setItem("email", e);
      sessionStorage.setItem("id_matriz", user.id_matriz);

      toast.success("Login realizado com sucesso!", { position: "top-center", autoClose: 1200 });
      const destino = user.cargo === "Pastor" || user.cargo === "Pastor Matriz" ? "/pages/inicio" : "/pages/inicioMobile";
      setTimeout(() => router.push(destino, { scroll: false }), 1200);
    } catch (error) {
      setEnviando(false);
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401) {
        setErros({ senha: "Email ou senha incorretos." });
        document.getElementById("password")?.focus();
      } else if (status === 429) {
        toast.error("Muitas tentativas. Aguarde alguns minutos e tente de novo.", { position: "top-center", autoClose: 5000 });
      } else {
        toast.error("Não foi possível entrar agora. Tente novamente.", { position: "top-center", autoClose: 4000 });
      }
    }
  }

  return (
    <AuthShell after={<ToastContainer />}>
      <p className="au-eyebrow">Acesso</p>
      <h1 className="au-h1">Bem-vindo de volta</h1>
      <p className="au-sub">Entre com seu email e senha para acessar o Obreiro Digital.</p>
      {expirou && <p className="au-note" role="status"><Info className="i" aria-hidden="true" /><span>Sua sessão expirou. Entre novamente.</span></p>}
      <form className="au-form" onSubmit={entrar} noValidate>
        <div className="au-f">
          <label htmlFor="email">Email</label>
          <AuthInput
            id="email" icon={Mail} type="email" inputMode="email" autoComplete="email" placeholder="nome@igreja.com.br" maxLength={254}
            value={email} error={erros.email}
            onChange={(ev) => { setEmail(ev.target.value); setErros((x) => ({ ...x, email: undefined })); }}
          />
        </div>
        <div className="au-f">
          <div className="au-lrow"><label htmlFor="password">Senha</label><Link href="/pages/recuperarSenha" className="au-link">Esqueci a senha</Link></div>
          <PasswordInput
            id="password" icon={Lock} autoComplete="current-password" placeholder="Sua senha" maxLength={1024}
            value={senha} error={erros.senha}
            onChange={(ev) => { setSenha(ev.target.value); setErros((x) => ({ ...x, senha: undefined })); }}
          />
        </div>
        <button type="submit" className="au-btn" disabled={enviando}>{enviando ? "Entrando…" : "Entrar"}<ArrowRight className="i" aria-hidden="true" /></button>
      </form>
      <p className="au-foot">Novo por aqui? <Link href="/pages/cadastroIgreja" className="au-link" style={{ fontSize: 15 }}>Cadastre sua igreja</Link></p>
    </AuthShell>
  );
}
