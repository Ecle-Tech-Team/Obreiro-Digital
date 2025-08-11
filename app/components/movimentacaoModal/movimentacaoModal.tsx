"use client";
import React, { useState, useEffect } from "react";
import api from "@/app/api/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { moverPessoa } from "../../../app/api/api";
import Image from "next/image";
import close from "@/public/icons/close.svg";

interface Igreja {
  id_igreja: number;
  nome: string;
  cnpj: string;
  data_fundacao: string;
  ministerio: string;
  setor: string;
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  id_matriz: number;
}

interface ModalMovimentacaoProps {
  tipo: "membro" | "usuario";
  id: number;
  onClose: () => void;
  onSuccess: () => void; // Para atualizar a lista depois
}

export default function ModalMovimentacao({
  tipo,
  id,
  onClose,
  onSuccess,
}: ModalMovimentacaoProps) {
  const [igreja, setIgreja] = useState<Igreja[]>([]);

  useEffect(() => {
    const fetchIgrejas = async () => {
      try {
        const id_user = sessionStorage.getItem("id_user");
        const response = await api.get(`/igreja/subordinadasUser/${id_user}`);
        setIgreja(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchIgrejas();
  }, []);

  const [novaIgreja, setNovaIgreja] = useState("");
  const [loading, setLoading] = useState(false);
  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("token") : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = tipo === "membro" ? "/mover/membro" : "/mover/cadastro";

      await moverPessoa(tipo, id, Number(novaIgreja));

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Membro cadastrado com sucesso!", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="cursor-pointer flex place-content-end rounded-lg sticky">
          <Image
            onClick={onClose}
            src={close}
            width={40}
            height={40}
            alt="close Icon"
            className="bg-red-500 hover:bg-red-600 rounded-tr-lg"
          />
        </div>

        <h2 className="text-2xl text1 font-bold mb-4 px-6 py-2">
          Mover {tipo === "membro" ? "Membro" : "Usuário"}
        </h2>

        <form onSubmit={handleSubmit} className="px-6">
          <label className="block mb-2 text1 text-black">Nova Igreja</label>

          <select
            className="sm:h-[5.2vh] md:h-[5.5vh] lg:h-[5vh] sm:w-[21vh] md:w-[41vh] lg:w-[41vh] sm:text-xl md:text-lg lg:text-lg text-gray-600 pl-5 text2 text-left content-center justify-center rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={novaIgreja}
            onChange={(e) => setNovaIgreja(e.target.value)}
          >
            <option value={""} disabled>
              Selecione uma igreja
            </option>
            {igreja.map((i) => (
              <option key={i.id_igreja} value={i.id_igreja}>
                {i.nome}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2 mt-6 mb-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-azul text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {loading ? "Movendo..." : "Mover"}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}
