"use client";
import React, { useState, useEffect } from "react";
import { CalendarDays, ChevronRight, Package, Users } from "lucide-react";
import api from "@/app/api/api";
import MenuInferior from "@/app/components/menuInferior/menuInferior";
import MenuSuperior from "@/app/components/menuSuperior/menuSuperior";
import Image from "next/image";
import logo from "@/public/images/icon.png";
import Link from "next/link";

export default function inicioMobile() {
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

  const [totalEventos, setTotalEventos] = useState<number>(0);
  const [totalVisitantes, setTotalVisitantes] = useState<number>(0);

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

  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");

  useEffect(() => {
    setNome(sessionStorage.getItem("nome") || "");
    setCargo(sessionStorage.getItem("cargo") || "");
  }, []);

  return (
    <main className="mobile-page min-h-screen bg-gray-100">
      <MenuSuperior />
      <MenuInferior />

      <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-7">
        <div className="min-w-0 rounded-xl bg-azul p-5 sm:p-7">
          <h1 className="text1 break-words text-2xl text-white sm:text-3xl lg:text-4xl">
            A Paz {nome} {cargo}!
          </h1>
          <h2 className="text2 mt-2 text-base leading-snug text-white sm:text-lg lg:text-xl">
            Veja as principais informações sobre a sua igreja:
          </h2>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-4 min-[390px]:grid-cols-2 sm:gap-5">
          <Link
            href={"/../../pages/eventosMobile"}
            className="group flex h-full min-w-0 flex-col rounded-xl bg-white p-5 shadow-xl transition-shadow hover:shadow-2xl"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <CalendarDays size={28} className="shrink-0 text-azul" aria-hidden="true" />
              <h4 className="text3 min-w-0 text-lg text-black sm:text-xl">Eventos</h4>
            </div>
            <div className="mt-5 flex-1">
              <p className="text2 text-sm text-azul sm:text-base">Eventos Totais</p>
              <p className="text2 mt-1 text-2xl font-semibold text-black">{totalEventos}</p>
            </div>
            <span className="text2 mt-5 inline-flex items-center gap-1 text-sm text-azul group-hover:text-blue-700">
              Ver detalhes <ChevronRight size={18} aria-hidden="true" />
            </span>
          </Link>

          <Link
            href={"/../../pages/visitantesMobile"}
            className="group flex h-full min-w-0 flex-col rounded-xl bg-white p-5 shadow-xl transition-shadow hover:shadow-2xl"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <Users size={28} className="shrink-0 text-azul" aria-hidden="true" />
              <h4 className="text3 min-w-0 text-lg text-black sm:text-xl">Visitantes</h4>
            </div>
            <div className="mt-5 flex-1">
              <p className="text2 text-sm text-azul sm:text-base">Visitantes Totais</p>
              <p className="text2 mt-1 text-2xl font-semibold text-black">{totalVisitantes}</p>
            </div>
            <span className="text2 mt-5 inline-flex items-center gap-1 text-sm text-azul group-hover:text-blue-700">
              Ver detalhes <ChevronRight size={18} aria-hidden="true" />
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2 lg:gap-5">
          <Link
            href={"/../../pages/pedidosMobile"}
            className="group flex h-full min-w-0 flex-col rounded-xl bg-white p-5 shadow-xl transition-shadow hover:shadow-2xl"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <Package size={28} className="shrink-0 text-azul" aria-hidden="true" />
              <h4 className="text3 min-w-0 text-xl text-black">Pedidos</h4>
            </div>
            <div className="mt-5 grid min-w-0 flex-1 grid-cols-1 gap-2 min-[430px]:grid-cols-3 min-[430px]:gap-3">
              <div className="min-w-0 rounded-lg bg-green-50 p-3">
                <p className="text2 text-sm font-medium text-green-700">Entregues</p>
                <p className="text2 mt-1 text-xl font-semibold text-black">{pedidosEntregues}</p>
              </div>
              <div className="min-w-0 rounded-lg bg-yellow-50 p-3">
                <p className="text2 text-sm font-medium text-yellow-700">Em Andamento</p>
                <p className="text2 mt-1 text-xl font-semibold text-black">{pedidosEmAndamento}</p>
              </div>
              <div className="min-w-0 rounded-lg bg-red-50 p-3">
                <p className="text2 text-sm font-medium text-red-700">Recusados</p>
                <p className="text2 mt-1 text-xl font-semibold text-black">{pedidosRecusados}</p>
              </div>
            </div>
            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="text2 text-sm text-azul sm:text-base">Pedidos Totais</p>
              <p className="text2 mt-1 text-xl font-semibold text-black">{totalPedidos}</p>
            </div>
            <span className="text2 mt-5 inline-flex items-center gap-1 text-sm text-azul group-hover:text-blue-700">
              Ver detalhes <ChevronRight size={18} aria-hidden="true" />
            </span>
          </Link>

          <div className="flex h-full min-w-0 flex-col rounded-xl bg-white p-5 shadow-xl sm:p-6">
            <div className="flex min-w-0 items-center gap-2.5">
              <Image src={logo} width={30} height={30} alt="" />
              <h4 className="text3 min-w-0 text-xl text-black">Acompanhe o Projeto</h4>
            </div>
            <p className="text2 mt-5 flex-1 text-base leading-relaxed text-black">
              Siga-nos nas redes sociais e saiba mais sobre os próximos passos do Obreiro Digital!
            </p>
            <Link
              className="text2 mt-5 inline-flex min-h-11 items-center self-start rounded-lg bg-azul px-4 text-base text-white transition-colors hover:bg-blue-600"
              href={"https://www.instagram.com/obreirodigital/"}
            >
              Acesse Já
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
