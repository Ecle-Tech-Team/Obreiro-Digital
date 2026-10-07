"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import api from "../../api/api";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"request" | "confirm" | "done">("request");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function requestCode(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await api.post("/recuperarLogin", { email: email.trim() });
      setStep("confirm");
      setMessage("Se a conta existir, enviaremos um código para esse email.");
    } catch {
      setMessage("Não foi possível enviar a solicitação agora. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmCode(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await api.post("/recuperarLogin/confirm", { token: token.trim(), newPassword });
      setToken("");
      setNewPassword("");
      setStep("done");
      setMessage("Senha alterada. Entre com sua nova senha.");
    } catch {
      setMessage("Código inválido ou expirado. Solicite outro código e tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-azul flex items-center justify-center p-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h1 className="text1 text-2xl font-bold text-azul">Recuperar senha</h1>
        <p className="mt-2 text2 text-gray-700">O código enviado por email vale por 15 minutos e pode ser usado uma vez.</p>
        {step === "request" && (
          <form onSubmit={requestCode} className="mt-6 space-y-4">
            <label htmlFor="recovery-email" className="block text2 font-medium text-gray-800">Email</label>
            <input id="recovery-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} className="w-full rounded-lg border border-gray-400 p-3 text-gray-900" />
            <button type="submit" disabled={busy} className="w-full rounded-lg bg-azul p-3 font-semibold text-white disabled:opacity-50">Enviar código</button>
          </form>
        )}
        {step === "confirm" && (
          <form onSubmit={confirmCode} className="mt-6 space-y-4">
            <label htmlFor="recovery-code" className="block text2 font-medium text-gray-800">Código recebido</label>
            <input id="recovery-code" type="text" autoComplete="off" required value={token} onChange={event => setToken(event.target.value)} className="w-full rounded-lg border border-gray-400 p-3 text-gray-900" />
            <label htmlFor="recovery-password" className="block text2 font-medium text-gray-800">Nova senha (mínimo de 10 caracteres)</label>
            <input id="recovery-password" type="password" autoComplete="new-password" required minLength={10} maxLength={1024} value={newPassword} onChange={event => setNewPassword(event.target.value)} className="w-full rounded-lg border border-gray-400 p-3 text-gray-900" />
            <button type="submit" disabled={busy} className="w-full rounded-lg bg-azul p-3 font-semibold text-white disabled:opacity-50">Redefinir senha</button>
            <button type="button" onClick={() => { setToken(""); setNewPassword(""); setStep("request"); }} className="w-full text-azul underline">Solicitar outro código</button>
          </form>
        )}
        {message && <p role="status" className="mt-4 text2 text-gray-800">{message}</p>}
        <Link href="/pages/login" className="mt-6 block text-center text-azul underline">Voltar ao login</Link>
      </section>
    </main>
  );
}
