"use client";
import React, { useEffect, useState } from "react";
import api from "@/app/api/api";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import close from "@/public/icons/close.svg";

interface Evento {
  id_evento: number;
  nome: string;
  data_inicio: string;
  horario_inicio: string;
  data_fim: string;
  horario_fim: string;
  local: string;
}

interface Aviso {
  id_aviso: number;
  titulo: string;
  conteudo: string;
}

export default function Apresentacao() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id_igreja = sessionStorage.getItem("id_igreja");

        const response = await api.get(`/evento/semana/${id_igreja}`);
        setEventos(response.data.eventos);
        setAvisos(response.data.avisos);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchData();
  }, []);
  return (
    <main className="bg-azul min-h-screen text-white p-5 flex flex-col md:flex-row gap-5">
      {/* Lado esquerdo - Eventos */}
      <section className="w-full md:w-2/3">
        <h1 className="text-4xl mt-10 text1">Eventos da Semana</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {eventos.map((evento) => (
            <div
              key={evento.id_evento}
              className="bg-white text-black p-4 rounded-xl shadow"
            >
              <p className="text-azul text3 text-md mb-1">em {evento.local}</p>
              <h2 className="text-3xl text1">{evento.nome}</h2>
              <div className="mt-2">
                <p className="text-xl text3 mt-4">
                  <strong>Início:</strong>{" "}
                  {format(new Date(evento.data_inicio), "dd/MM")} às{" "}
                  {evento.horario_inicio.slice(0, 5)}
                </p>
                <p className="text-xl text3 mt-2">
                  <strong>Fim:</strong>{" "}
                  {format(new Date(evento.data_fim), "dd/MM")} às{" "}
                  {evento.horario_fim.slice(0, 5)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lado direito - Avisos */}
      <section className="w-full md:w-1/3 bg-white text-black p-5 rounded-xl shadow">
        <h2 className="text-3xl text1 text-center text-black mt-10 mb-5">
          Avisos Gerais
        </h2>
        <div className="flex flex-col gap-4">
          {avisos.map((aviso) => (
            <div
              key={aviso.id_aviso}
              className="bg-blue-500 text-white p-4 rounded-lg shadow-md"
            >
              <h3 className="text-lg text1">{aviso.titulo}</h3>
              <p className="text-sm mt-1 text3">{aviso.conteudo}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="cursor-pointer">
        <Link href={"/../../pages/inicio"}>
          <Image
            src={close}
            width={40}
            height={40}
            alt="close Icon"
            className="bg-red-500 hover:bg-red-600 rounded-sm"
          />
        </Link>
      </div>
    </main>
  );
}
