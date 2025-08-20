import React, { useState, useEffect, FormEvent } from "react";
import { format } from "date-fns";
import Image from "next/image";
import api from "@/app/api/api";
import data from "@/public/icons/data.svg";
import relogio from "@/public/icons/relogio.svg";

interface Igreja {
  id_igreja: number;
  nome: string;
  id_matriz: number;
  is_global: boolean;
}

interface EventosProps {
  h4?: string;
  h3?: string;
  data_inicio?: string;
  hora_inicio?: string;
  data_fim?: string;
  hora_fim?: string;
  tipo_evento?: string;
}

export default function EventosCardMobile({
  h3,
  h4,
  data_inicio,
  hora_inicio,
  data_fim,
  hora_fim,
  tipo_evento,
}: EventosProps) {
   const cargoUsuario =
    typeof window !== "undefined" ? sessionStorage.getItem("cargo") : null;

  return (
    <main>
      <div className="flex flex-col bg-white rounded-xl shadow-xl px-2 py-2 h-[30vh] w-[30vh] cursor-pointer">
        <div className="flex justify-center">
          <h4 className="text-azul text3 text-lg text-center mt-3 truncate max-w-[40ch]">
            Em <span className="text-azul text3 text-xl text-center">{h4}</span>
          </h4>
        </div>

        <h4 className="text-black text3 text-lg text-center pt-1">
          {tipo_evento === "matriz" ? "Evento da Matriz" : "Evento Local"}
        </h4>
        
        <h3 className="text-black text1 text-2xl my-2 flex justify-center text-center">
          {h3}
        </h3>
        
        <div className="flex justify-center">
          <div className="flex flex-col justify-center">
            <div className="flex">
              <Image src={data} width={20} height={20} alt="" />
              <p className="text-azul text3 ml-1">Início</p>
            </div>
            <p className="text-black text3 text-lg my-2">{data_inicio}</p>
            <div className="flex mt-1">
              <Image src={relogio} width={20} height={20} alt="" />
              <p className="text-black text3 text-lg ml-1">{hora_inicio}</p>
            </div>
          </div>

          <div className="flex flex-col ml-3">
            <div className="flex">
              <Image src={data} width={20} height={20} alt="" />
              <p className="text-azul text3 ml-1">Fim</p>
            </div>
            <p className="text-black text3 text-lg my-2">{data_fim}</p>
            <div className="flex mt-1">
              <Image src={relogio} width={20} height={20} alt="" />
              <p className="text-black text3 text-lg ml-1">{hora_fim}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
