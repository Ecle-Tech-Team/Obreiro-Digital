import React, { FormEvent } from "react";
import Image from "next/image";
import lixo from "@/public/icons/delete.svg";

interface AvisosProps {
  titulo: string;
  conteudo: string;
  data: string;
  onClick?: (event: FormEvent<Element>) => void;
}

export default function AvisosCardMobile({
  titulo,
  conteudo,
  data,
  onClick,
}: AvisosProps) {
  return (
    <main>
      <div className="flex flex-col bg-white rounded-xl shadow-xl px-5 py-5 h-[35vh] w-[31vh] justify-between">
        <div className="mt-2">
          <h4 className="text-azul text3 text-md text-left">Publicado em:</h4>
          <p className="text-black text3 text-xl my-2 text-left">{data}</p>
        </div>

        <h3 className="text-black text1 text-2xl my-2 text-left">{titulo}</h3>

        <p className="text-black text3 text-lg my-2 text-left truncate">
          {conteudo}
        </p>

        <div className="flex justify-center mt-auto">
          <button
            className="bg-azul px-[8.8vh] py-2 text-white text2 text-lg rounded-lg cursor-pointer"
            onClick={onClick}
          >
            Veja Mais
          </button>
        </div>
      </div>
    </main>
  );
}
