"use client";
import React, { useState, useEffect } from "react";
import api from "@/app/api/api";
import MenuLateral from "@/app/components/menuLateral/menuLateral";
import Link from "next/link";
// Ícones do lucide-react
import {
  Users,
  Calendar,
  DollarSign,
  UserPlus,
  Package,
  Church,
  Eye,
  EyeOff,
  Cast,
  ChevronRight,
  ChevronDown,
  Search
} from "lucide-react";

interface Saldo {
  id_saldo: number;
  saldo: number;
  id_igreja: number;
}

interface User {
  id_user: number;
  id_igreja: number;
}

export default function inicio() {
  const [user, setUser] = useState<User | null>(null);
  const [totalPedidos, setTotalPedidos] = useState<number>(0);
  const [pedidosEntregues, setPedidosEntregues] = useState<number>(0);
  const [pedidosEmAndamento, setPedidosEmAndamento] = useState<number>(0);
  const [pedidosRecusados, setPedidosRecusados] = useState<number>(0);

  useEffect(() => {
    const fetchTotalPedidos = async () => {
      try {
        const id_igreja = sessionStorage.getItem("id_igreja");
        const response = await api.get(`/pedido/count/total/${id_igreja}`);
        setTotalPedidos(response.data);
      } catch (error) {
        console.error("Erro ao buscar total de pedidos:", error);
      }
    };

    fetchTotalPedidos();
  }, []);

  useEffect(() => {
    const fetchPedidosEntregues = async () => {
      try {
        const id_igreja = sessionStorage.getItem("id_igreja");
        const response = await api.get(`/pedido/count/entregue/${id_igreja}`);
        setPedidosEntregues(response.data);
      } catch (error) {
        console.error("Erro ao buscar pedidos entregues:", error);
      }
    };

    fetchPedidosEntregues();
  }, []);

  useEffect(() => {
    const fetchPedidosEmAndamento = async () => {
      try {
        const id_igreja = sessionStorage.getItem("id_igreja");
        const response = await api.get(
          `pedido/count/em-andamento/${id_igreja}`
        );
        setPedidosEmAndamento(response.data);
      } catch (error) {
        console.error("Erro ao buscar pedidos em andamento:", error);
      }
    };

    fetchPedidosEmAndamento();
  }, []);

  useEffect(() => {
    const fetchPedidosRecusados = async () => {
      try {
        const id_igreja = sessionStorage.getItem("id_igreja");
        const response = await api.get(`pedido/count/recusados/${id_igreja}`);
        setPedidosRecusados(response.data);
      } catch (error) {
        console.error("Erro ao buscar pedidos em andamento:", error);
      }
    };

    fetchPedidosRecusados();
  }, []);

  const [totalMembros, setTotalMembros] = useState<number>(0);
  const [totalEventos, setTotalEventos] = useState<number>(0);
  const [totalVisitantes, setTotalVisitantes] = useState<number>(0);

  useEffect(() => {
    const fetchMembros = async () => {
      try {
        const id_igreja = sessionStorage.getItem("id_igreja");
        const response = await api.get(`membro/count/${id_igreja}`);
        setTotalMembros(response.data);
      } catch (error) {
        console.error("Erro ao buscar membros:", error);
      }
    };

    fetchMembros();
  }, []);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const id_igreja = sessionStorage.getItem("id_igreja");
        const response = await api.get(`evento/count/${id_igreja}`);
        setTotalEventos(response.data);
      } catch (error) {
        console.error("Erro ao buscar eventos:", error);
      }
    };

    fetchEventos();
  }, []);

  useEffect(() => {
    const fetchVisitantes = async () => {
      try {
        const id_igreja = sessionStorage.getItem("id_igreja");
        const response = await api.get(`visitante/count/${id_igreja}`);
        setTotalVisitantes(response.data);
      } catch (error) {
        console.error("Erro ao buscar visitantes:", error);
      }
    };

    fetchVisitantes();
  }, []);

  const [saldoVisivel, setSaldoVisivel] = useState(false);
  const [saldoAtual, setSaldo] = useState<Saldo | null>(null);

  useEffect(() => {
    const fetchSaldo = async () => {
      try {
        const userResponse = await api.get("/cadastro");
        setUser(userResponse.data);
        if (userResponse.data && userResponse.data.id_igreja) {
          const response = await api.get(
            `/financas/saldo/${userResponse.data.id_igreja}`
          );
          setSaldo(response.data);
        }
      } catch (error) {
        console.error("Error fetching saldo:", error);
      }
    };

    fetchSaldo();
  }, []);

  const [totalIgrejasSubordinadas, setTotalIgrejasSubordinadas] = useState<number>(0);
  const [igrejasSubordinadas, setIgrejasSubordinadas] = useState<any[]>([]);

  useEffect(() => {
  const fetchIgrejasSubordinadas = async () => {
    try {
      const id_igreja = sessionStorage.getItem('id_igreja');
      const cargo = sessionStorage.getItem('cargo');

      if (cargo === "Pastor Matriz" && id_igreja) {
        // lista completa
        const response = await api.get(`/igreja/subordinadas/${id_igreja}`);
        setIgrejasSubordinadas(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar igrejas subordinadas:", error);
    }
  };

  fetchIgrejasSubordinadas();
}, []);


  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");

  useEffect(() => {
    setNome(sessionStorage.getItem("nome") || "");
    setCargo(sessionStorage.getItem("cargo") || "");
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row">
        <MenuLateral />

        <div className="app-content min-w-0">
          <div className="mx-auto w-full min-w-0 max-w-[1500px] space-y-5 lg:space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center">
              <Link
                href={"/../../pages/inicio"}
                className="text-gray-600 text-sm xs:text-base lg:text-lg text3 hover:text-azul transition-colors duration-200"
              >
                Início
              </Link>
              <span className="text-gray-400 mx-2">&#62;</span>
            </div>

            <Link
              className="flex bg-azul items-center justify-center p-2 xs:p-3 cursor-pointer rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-azul focus:ring-offset-2"
              href={"/../../pages/apresentacao"}
              aria-label="Ir para apresentação"
            >
              <Cast className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
            </Link>
          </div>

          <div className="w-full min-w-0 rounded-xl bg-azul p-5 sm:p-7 lg:p-8 xl:p-10">
            <h1 className="text-white text1 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl break-words">
              A Paz {cargo} {nome}!
            </h1>
            <h3 className="text-white text2 mt-2 text-base sm:text-lg lg:text-xl xl:text-2xl">
              Veja as principais informações sobre a sua igreja:
            </h3>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:gap-5 xl:gap-6">
            <div className="flex h-full min-w-0 flex-col rounded-xl bg-white p-5 shadow-lg transition-shadow duration-200 hover:shadow-xl xl:p-6">
              <div className="flex min-h-10 items-center gap-3">
                <Users className="h-9 w-9 shrink-0 text-azul" />
                <h4 className="text1 min-w-0 text-xl text-black xl:text-2xl">
                  Membros
                </h4>
              </div>
              <div className="mt-5 min-w-0 flex-1">
                <p className="text2 text-azul text-sm xs:text-base lg:text-lg">Membros Totais</p>
                <p className="text2 text-black text-xl xs:text-2xl lg:text-3xl font-semibold mt-1">{totalMembros}</p>
              </div>
              <Link
                className="group mt-auto inline-flex items-center pt-5"
                href={"/../../pages/membros"}
              >
                <span className="text2 text-blue-600 group-hover:text-blue-800 transition-colors duration-200 text-sm xs:text-base">Ver detalhes</span>
                <ChevronRight color="#5271FF" className="w-5 h-5 ml-1 xs:ml-2 group-hover:translate-x-1 hover:text-blue-700 transition-transform duration-200" />
              </Link>
            </div>

            <div className="flex h-full min-w-0 flex-col rounded-xl bg-white p-5 shadow-lg transition-shadow duration-200 hover:shadow-xl xl:p-6">
              <div className="flex min-h-10 items-center gap-3">
                <Calendar className="h-9 w-9 shrink-0 text-azul" />
                <h4 className="text1 min-w-0 text-xl text-black xl:text-2xl">
                  Eventos
                </h4>
              </div>
              <div className="mt-5 min-w-0 flex-1">
                <p className="text2 text-azul text-sm xs:text-base lg:text-lg">Eventos Totais</p>
                <p className="text2 text-black text-xl xs:text-2xl lg:text-3xl font-semibold mt-1">{totalEventos}</p>
              </div>
              <Link
                className="group mt-auto inline-flex items-center pt-5"
                href={"/../../pages/eventos"}
              >
                <span className="text2 text-blue-600 group-hover:text-blue-800 transition-colors duration-200 text-sm xs:text-base">Ver detalhes</span>
                <ChevronRight color="#5271FF" className="w-5 h-5 ml-1 xs:ml-2 group-hover:translate-x-1 hover:text-blue-700 transition-transform duration-200" />
              </Link>
            </div>

            <div className="flex h-full min-w-0 flex-col rounded-xl bg-white p-5 shadow-lg transition-shadow duration-200 hover:shadow-xl xl:p-6">
              <div className="flex min-h-10 items-center gap-3">
                <DollarSign className="h-9 w-9 shrink-0 text-azul" />
                <h4 className="text1 min-w-0 text-xl text-black xl:text-2xl">
                  Saldo
                </h4>
              </div>
              <div className="mt-5 min-w-0 flex-1">
                <p className="text2 text-azul text-sm xs:text-base lg:text-lg">Saldo Total</p>
                <p className="text2 break-words text-xl font-semibold text-black sm:text-2xl xl:text-3xl mt-1">
                  {saldoVisivel && saldoAtual
                    ? `R$ ${saldoAtual.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : "---"}
                </p>
              </div>
              <button
                className="group mt-auto inline-flex items-center self-start pt-5"
                onClick={() => setSaldoVisivel(!saldoVisivel)}
              >
                <span className="text2 text-azul group-hover:text-blue-700 transition-colors duration-200 text-sm xs:text-base">
                  {saldoVisivel ? "Ocultar" : "Mostrar"} saldo
                </span>
                {saldoVisivel ? (
                  <EyeOff color="#5271FF" className="w-5 h-5 ml-1 xs:ml-2 group-hover:scale-110 hover:text-blue-700 transition-transform duration-200" />
                ) : (
                  <Eye color="#5271FF" className="w-5 h-5 ml-1 xs:ml-2 group-hover:scale-110 hover:text-blue-700 transition-transform duration-200" />
                )}
              </button>
            </div>

            <div className="flex h-full min-w-0 flex-col rounded-xl bg-white p-5 shadow-lg transition-shadow duration-200 hover:shadow-xl xl:p-6">
              <div className="flex min-h-10 items-center gap-3">
                <UserPlus className="h-9 w-9 shrink-0 text-azul" />
                <h4 className="text1 min-w-0 text-xl text-black xl:text-2xl">
                  Visitantes
                </h4>
              </div>
              <div className="mt-5 min-w-0 flex-1">
                <p className="text2 text-azul text-sm xs:text-base lg:text-lg">Visitantes Totais</p>
                <p className="text2 text-black text-xl xs:text-2xl lg:text-3xl font-semibold mt-1">{totalVisitantes}</p>
              </div>
              <Link
                className="group mt-auto inline-flex items-center pt-5"
                href={"/../../pages/visitantes"}
              >
                <span className="text2 text-blue-600 group-hover:text-blue-800 transition-colors duration-200 text-sm xs:text-base">Ver detalhes</span>
                <ChevronRight color="#5271FF" className="w-5 h-5 ml-1 xs:ml-2 group-hover:translate-x-1 hover:text-blue-700 transition-transform duration-200" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-2 lg:gap-5 xl:gap-6">
            <div className="flex h-full min-w-0 flex-col rounded-xl bg-white p-5 shadow-lg transition-shadow duration-200 hover:shadow-xl sm:p-6 xl:only:col-span-2">
              <div className="flex min-h-10 items-center gap-3">
                <Package className="h-9 w-9 shrink-0 text-azul" />
                <h4 className="text1 min-w-0 text-xl text-black sm:text-2xl">
                  Pedidos
                </h4>
              </div>
              <div className="mt-5 grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
                <div className="min-w-0 rounded-lg bg-green-50 p-3">
                  <p className="text2 text-green-700 text-xs sm:text-sm font-medium">Entregues</p>
                  <p className="text2 text-black text-lg xs:text-xl lg:text-2xl font-semibold mt-1">{pedidosEntregues}</p>
                </div>
                <div className="min-w-0 rounded-lg bg-yellow-50 p-3">
                  <p className="text2 text-yellow-700 text-xs sm:text-sm font-medium">Em Andamento</p>
                  <p className="text2 text-black text-lg xs:text-xl lg:text-2xl font-semibold mt-1">{pedidosEmAndamento}</p>
                </div>
                <div className="min-w-0 rounded-lg bg-red-50 p-3">
                  <p className="text2 text-red-700 text-xs sm:text-sm font-medium">Recusados</p>
                  <p className="text2 text-black text-lg xs:text-xl lg:text-2xl font-semibold mt-1">{pedidosRecusados}</p>
                </div>
              </div>
              <Link
                className="group mt-auto inline-flex items-center self-start pt-5"
                href={"/../../pages/pedidos"}
              >
                <span className="text2 text-azul group-hover:text-blue-700 transition-colors duration-200 text-sm xs:text-base">Ver detalhes</span>
                <ChevronRight color="#5271FF" className="w-5 h-5 ml-1 xs:ml-2 group-hover:translate-x-1 hover:text-blue-700 transition-transform duration-200" />
              </Link>
            </div>

            {cargo === "Pastor Matriz" && (
              <div className="flex h-full min-w-0 flex-col rounded-xl bg-white p-5 shadow-lg transition-shadow duration-200 hover:shadow-xl sm:p-6">
                <div className="flex min-h-10 items-center gap-3">
                  <Church className="h-9 w-9 shrink-0 text-azul" />
                  <h4 className="text1 min-w-0 text-xl text-black sm:text-2xl">
                    Igrejas Subordinadas
                  </h4>
                </div>

                <div className="mt-5 min-w-0 flex-1 space-y-2 overflow-y-auto pr-2">
                  {igrejasSubordinadas.length > 0 ? (
                    igrejasSubordinadas.slice(0, 4).map((igreja) => (
                      <div key={igreja.id_igreja} className="flex min-w-0 items-center border-b border-gray-100 py-2 last:border-0">
                        <div className="mr-3 h-2 w-2 shrink-0 rounded-full bg-azul"></div>
                        <p className="text2 min-w-0 break-words text-sm text-gray-700 sm:text-base">{igreja.nome}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text2 text-gray-500 text-sm xs:text-base py-2">Nenhuma subordinada encontrada</p>
                  )}
                </div>

                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="text2 text-azul text-sm xs:text-base lg:text-lg">Saldo Total</p>
                  <p className="text2 text-black text-xl">{igrejasSubordinadas.length}</p>

                  <Link className="mt-4 inline-flex items-center" href={"/../../pages/igrejas"}>
                    <span className="text2 text-blue-500">Ver detalhes</span>
                    <ChevronDown color="#5271FF" width={30} height={30} className="ml-1"/>
                  </Link>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </main>
  );
}
