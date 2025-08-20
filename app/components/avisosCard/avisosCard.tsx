import React, { FormEvent } from "react";
import Image from "next/image";
import lixo from "@/public/icons/delete.svg";

interface Igreja {
  id_igreja: number;
  nome: string;
  id_matriz: number;
  is_global: boolean;
}

interface AvisosProps {
  titulo: string;
  conteudo: string;
  data: string;
  tipo_aviso: string;
  onClick?: (event: FormEvent<Element>) => void;
  onDelete: () => void;
}

export default function AvisosCard({
  titulo,
  conteudo,
  data,
  tipo_aviso,
  onClick,
  onDelete,
}: AvisosProps) {
  const cargoUsuario =
    typeof window !== "undefined" ? sessionStorage.getItem("cargo") : null;

  // Condição para mostrar o botão apagar
  const podeApagar =
    tipo_aviso !== "matriz" || cargoUsuario === "Pastor Matriz";

  return (
    <main>
      <div className="flex flex-col bg-white rounded-xl shadow-xl px-5 py-5 h-[35vh] w-[25.5vh] justify-between">
        <div className="flex">
          {podeApagar && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              <Image src={lixo} width={30} height={40} alt="lixo Icon" />
            </button>
          )}
        </div>

        <h4 className="text-black text3 text-md text-left mt-2">
            {tipo_aviso === "matriz" ? "Aviso da Matriz" : "Aviso Local"}
          </h4>
        <div className="mt-2">
          <h4 className="text-azul text3 text-md text-left">
            Publicado em:
          </h4>
          <p className="text-black text3 text-xl my-2 text-left">{data}</p>
        </div>

        <h3 className="text-black text1 text-2xl my-2 text-left">{titulo}</h3>

        <p className="text-black text3 text-lg my-2 text-left truncate">
          {conteudo}
        </p>

        <div className="flex justify-center mt-auto">
          <button
            className="bg-azul px-14 py-1.5 text-white text2 text-lg rounded-xl cursor-pointer"
            onClick={onClick}
          >
            Veja Mais
          </button>
        </div>
      </div>
    </main>
  );
}
