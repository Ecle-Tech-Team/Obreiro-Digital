"use client";
import React from "react";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import api from "../../api/api";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "@/public/images/icon-white.png";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    const notifySuccess = () => {
      toast.success("Login realizado com sucesso!", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    };

    const notifyWarn = () => {
      toast.warn("Preencha os campos!", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    };

    const notifyError = () => {
      toast.error("Erro no login, Tente novamente.", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    };

    const notifyInvalidEmail = () => {
      toast.error("Por favor, insira um email válido.", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    };

    try {
      if (!email || !senha) {
        notifyWarn();
        return;
      }

      // Validação de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        notifyInvalidEmail();
        return;
      } else {
        const dataLogin = {
          email,
          senha,
        };

        const response = await api.post("/login", dataLogin);
        const userData = response.data.user;

        sessionStorage.setItem("id_user", userData.id_user);
        sessionStorage.setItem("nome", userData.nome);
        sessionStorage.setItem("cargo", userData.cargo);
        sessionStorage.setItem("id_igreja", userData.id_igreja);
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("id_matriz", userData.id_matriz);

        notifySuccess();

        if (userData.cargo === "Pastor" || userData.cargo === "Pastor Matriz") {
          setTimeout(() => {
            router.push("/pages/inicio", { scroll: false });
          }, 1500);
        } else if (
          userData.cargo === "Obreiro" || userData.cargo === "Obreiro Matriz"
        ) {
          setTimeout(() => {
            router.push("/pages/inicioMobile", { scroll: false });
          }, 1500);
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Email ou senha incorretos.", { position: "top-center" });
      } else {
        notifyError();
      }
    }
  }
  return (
    <main className="min-h-screen bg-azul flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <Image
              src={logo}
              width={64}
              height={64}
              alt="Obreiro Digital"
              className="drop-shadow-lg"
              priority
            />
            <h1 className="ml-4 font-extrabold text-3xl xs:text-4xl sm:text-5xl text-white text1">
              OBREIRO<br />DIGITAL
            </h1>
          </div>

          <h2 className="text-white text-2xl xs:text-3xl sm:text-4xl text1 mb-2">
            Login
          </h2>
          <p className="text-white text-lg text2 opacity-90">
            Bem-vindo(a) de volta!
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 xs:p-8 shadow-2xl">

          {/* Campo Email */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-white text1 text-lg mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Digite seu email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl text2 text-gray-800 bg-white/95 border border-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
              required
              autoComplete="email"
              inputMode="email"
            />
          </div>

          {/* Campo Senha */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-white text1 text-lg">
                Senha
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-white text2 text-sm hover:text-blue-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded p-1"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <Eye size={24} aria-hidden="true" /> : <EyeOff size={24} aria-hidden="true" />}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha..."
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl text2 text-gray-800 bg-white/95 border border-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
              required
              autoComplete="current-password"
            />
          </div>

          {/* Botão de Login */}
          <button
            type="submit"
            onClick={handleLogin}
            className="w-full py-3.5 px-4 bg-white text-azul text1 text-lg rounded-xl hover:bg-blue-50 active:bg-blue-100 border-2 border-white hover:border-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 font-semibold shadow-lg hover:shadow-xl active:shadow-md"
          >
            Entrar
          </button>

          <ToastContainer />

          {/* Links adicionais */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <Link href="/pages/recuperarSenha" className="block w-full text-center text-white text2 text-sm hover:text-blue-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded py-2">
              Esqueci a senha
            </Link>

            <div className="text-center mt-4">
              <p className="text-white text2 text-sm">
                Novo por aqui?{' '}
                <Link
                  href={"/../../pages/cadastroIgreja"}
                  className="text1 text-white hover:text-blue-200 font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
