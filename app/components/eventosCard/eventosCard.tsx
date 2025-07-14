import React, { useState, useEffect, FormEvent } from "react";
import { format } from "date-fns";
import Image from "next/image";
import api from "@/app/api/api";
import data from "@/public/icons/data.svg";
import relogio from "@/public/icons/relogio.svg";
import lixo from "@/public/icons/delete.svg";

interface EventosProps {
  h4?: string;
  h3?: string;
  data_inicio?: string;
  hora_inicio?: string;
  data_fim?: string;
  hora_fim?: string;
  onClick?: (event: FormEvent<Element>) => void;
  onDelete: () => void;
}

export default function EventosCard({
  h3,
  h4,
  data_inicio,
  hora_inicio,
  data_fim,
  hora_fim,
  onClick = () => {},
  onDelete,
}: EventosProps) {
  return (
    <main>
      <div className="flex flex-col bg-white rounded-xl shadow-xl px-5 py-5 h-[37vh] w-[33vh]">
        <div className="flex">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            <Image src={lixo} width={30} height={40} alt="lixo Icon" />
          </button>
        </div>
        <div className="flex justify-center">
          <h4 className="text-azul text3 text-lg text-center mt-3 truncate">
            Em <span className="text-azul text3 text-xl text-center">{h4}</span>
          </h4>
        </div>
        <h3 className="text-black text1 text-3xl my-4 flex justify-center text-center truncate">
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
              <p className="text-black text3 text-xl ml-1">{hora_inicio}</p>
            </div>
          </div>

          <div className="flex flex-col ml-2">
            <div className="flex">
              <Image src={data} width={20} height={20} alt="" />
              <p className="text-azul text3 ml-1">Fim</p>
            </div>
            <p className="text-black text3 text-lg my-2">{data_fim}</p>
            <div className="flex mt-1">
              <Image src={relogio} width={20} height={20} alt="" />
              <p className="text-black text3 text-xl ml-1">{hora_fim}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-auto">
          <button
            className="bg-azul px-20 py-1.5 text-white text2 text-lg rounded-xl cursor-pointer"
            onClick={onClick}
          >
            Veja Mais
          </button>
        </div>
      </div>
    </main>
  );
}
