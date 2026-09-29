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

        <div className="app-content">
          <div className="flex justify-between items-center ">
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

          <div className="bg-azul p-4 xs:p-6 sm:p-8 lg:p-10 rounded-xl mt-2">
            <h1 className="text-white text1 ml-0 xs:ml-2 text-xl xs:text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">
              A Paz {cargo} {nome}!
            </h1>
            <h3 className="text-white text2 mt-1 ml-0 xs:ml-2 text-base xs:text-lg sm:text-xl lg:text-2xl xl:text-3xl">
              Veja as principais informações sobre a sua igreja:
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 xs:gap-6 mt-6">
            <div className="bg-white shadow-lg rounded-xl p-4 xs:p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center">
                <Users className="w-8 h-8 xs:w-10 xs:h-10 text-azul" />
                <h4 className="text1 text-black text-lg xs:text-xl lg:text-2xl ml-3">
                  Membros
                </h4>
              </div>
              <div className="mt-3 xs:mt-4">
                <p className="text2 text-azul text-sm xs:text-base lg:text-lg">Membros Totais</p>
                <p className="text2 text-black text-xl xs:text-2xl lg:text-3xl font-semibold mt-1">{totalMembros}</p>
              </div>
              <Link
                className="mt-3 xs:mt-4 inline-flex items-center group"
                href={"/../../pages/membros"}
              >
                <span className="text2 text-blue-600 group-hover:text-blue-800 transition-colors duration-200 text-sm xs:text-base">Ver detalhes</span>
                <ChevronRight color="#5271FF" className="w-5 h-5 ml-1 xs:ml-2 group-hover:translate-x-1 hover:text-blue-700 transition-transform duration-200" />
              </Link>
            </div>

            <div className="bg-white shadow-lg rounded-xl p-4 xs:p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center">
                <Calendar className="w-7 h-7 xs:w-9 xs:h-9 text-azul" />
                <h4 className="text1 text-black text-lg xs:text-xl lg:text-2xl ml-3">
                  Eventos
                </h4>
              </div>
              <div className="mt-3 xs:mt-4">
                <p className="text2 text-azul text-sm xs:text-base lg:text-lg">Eventos Totais</p>
                <p className="text2 text-black text-xl xs:text-2xl lg:text-3xl font-semibold mt-1">{totalEventos}</p>
              </div>
              <Link
                className="mt-3 xs:mt-4 inline-flex items-center group"
                href={"/../../pages/eventos"}
              >
                <span className="text2 text-blue-600 group-hover:text-blue-800 transition-colors duration-200 text-sm xs:text-base">Ver detalhes</span>
                <ChevronRight color="#5271FF" className="w-5 h-5 ml-1 xs:ml-2 group-hover:translate-x-1 hover:text-blue-700 transition-transform duration-200" />
              </Link>
            </div>

            <div className="bg-white shadow-lg rounded-xl p-4 xs:p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center">
                <DollarSign className="w-7 h-7 xs:w-9 xs:h-9 text-azul" />
                <h4 className="text1 text-black text-lg xs:text-xl lg:text-2xl ml-3">
                  Saldo
                </h4>
              </div>
              <div className="mt-3 xs:mt-4">
                <p className="text2 text-azul text-sm xs:text-base lg:text-lg">Saldo Total</p>
                <p className="text2 text-black text-xl xs:text-2xl lg:text-3xl font-semibold mt-1">
                  {saldoVisivel && saldoAtual
                    ? `R$ ${saldoAtual.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : "---"}
                </p>
              </div>
              <button
                className="mt-3 xs:mt-4 inline-flex items-center group"
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

            <div className="bg-white shadow-lg rounded-xl p-4 xs:p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center">
                <UserPlus className="w-8 h-8 xs:w-10 xs:h-10 text-azul" />
                <h4 className="text1 text-black text-lg xs:text-xl lg:text-2xl ml-3">
                  Visitantes
                </h4>
              </div>
              <div className="mt-3 xs:mt-4">
                <p className="text2 text-azul text-sm xs:text-base lg:text-lg">Visitantes Totais</p>
                <p className="text2 text-black text-xl xs:text-2xl lg:text-3xl font-semibold mt-1">{totalVisitantes}</p>
              </div>
              <Link
                className="mt-3 xs:mt-4 inline-flex items-center group"
                href={"/../../pages/visitantes"}
              >
                <span className="text2 text-blue-600 group-hover:text-blue-800 transition-colors duration-200 text-sm xs:text-base">Ver detalhes</span>
                <ChevronRight color="#5271FF" className="w-5 h-5 ml-1 xs:ml-2 group-hover:translate-x-1 hover:text-blue-700 transition-transform duration-200" />
              </Link>
            </div>

            <div className="bg-white shadow-lg rounded-xl p-4 xs:p-6 hover:shadow-xl transition-shadow duration-200 col-span-1 xs:col-span-2 lg:col-span-1">
              <div className="flex items-center">
                <Package className="w-7 h-7 xs:w-9 xs:h-9 text-azul" />
                <h4 className="text1 text-black text-lg xs:text-xl lg:text-2xl ml-3">
                  Pedidos
                </h4>
              </div>
              <div className="mt-3 xs:mt-4 grid grid-cols-1 xs:grid-cols-3 gap-3 xs:gap-4">
                <div className="bg-green-50 rounded-lg p-3 xs:p-4">
                  <p className="text2 text-green-700 text-xs xs:text-sm lg:text-base font-medium">Entregues</p>
                  <p className="text2 text-black text-lg xs:text-xl lg:text-2xl font-semibold mt-1">{pedidosEntregues}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 xs:p-4">
                  <p className="text2 text-yellow-700 text-xs xs:text-sm lg:text-base font-medium">Em Andamento</p>
                  <p className="text2 text-black text-lg xs:text-xl lg:text-2xl font-semibold mt-1">{pedidosEmAndamento}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 xs:p-4">
                  <p className="text2 text-red-700 text-xs xs:text-sm lg:text-base font-medium">Recusados</p>
                  <p className="text2 text-black text-lg xs:text-xl lg:text-2xl font-semibold mt-1">{pedidosRecusados}</p>
                </div>
              </div>
              <Link
                className="mt-4 xs:mt-5 inline-flex items-center group"
                href={"/../../pages/pedidos"}
              >
                <span className="text2 text-azul group-hover:text-blue-700 transition-colors duration-200 text-sm xs:text-base">Ver detalhes</span>
                <ChevronRight color="#5271FF" className="w-5 h-5 ml-1 xs:ml-2 group-hover:translate-x-1 hover:text-blue-700 transition-transform duration-200" />
              </Link>
            </div>

            {cargo === "Pastor Matriz" && (
              <div className="bg-white shadow-lg rounded-xl p-4 xs:p-6 hover:shadow-xl transition-shadow duration-200 col-span-1 xs:col-span-2 lg:col-span-1">
                <div className="flex items-center">
                  <Church className="w-8 h-8 xs:w-10 xs:h-10 text-azul" />
                  <h4 className="text1 text-black text-lg xs:text-xl lg:text-2xl ml-3">
                    Igrejas Subordinadas
                  </h4>
                </div>

                <div className="mt-3 xs:mt-4 space-y-2 max-h-32 xs:max-h-40 overflow-y-auto pr-2">
                  {igrejasSubordinadas.length > 0 ? (
                    igrejasSubordinadas.slice(0, 4).map((igreja) => (
                      <div key={igreja.id_igreja} className="flex items-center py-2 border-b border-gray-100 last:border-0">
                        <div className="w-2 h-2 bg-azul rounded-full mr-3"></div>
                        <p className="text2 text-gray-700 text-sm xs:text-base truncate">{igreja.nome}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text2 text-gray-500 text-sm xs:text-base py-2">Nenhuma subordinada encontrada</p>
                  )}
                </div>

                <div className="mt-4 xs:mt-5">
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
    </main>
  );
}
