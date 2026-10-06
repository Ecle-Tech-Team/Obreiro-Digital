"use client";
import React, { useState, useEffect } from "react";
import { ModalSurface } from '@/app/components/shared/MemberStyle';
import { X } from "lucide-react";
import api from "@/app/api/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { moverPessoa } from "../../../app/api/api";

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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-3">
      <ModalSurface className="w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto">
        <div className="cursor-pointer flex place-content-end rounded-lg sticky">
          <X
            onClick={onClose}
            width={40}
            height={40} aria-label="close Icon"
            className="bg-red-500 hover:bg-red-600 rounded-tr-lg"
          />
        </div>

        <h2 className="text-2xl text1 font-bold mb-4 px-6 py-2">
          Mover {tipo === "membro" ? "Membro" : "Usuário"}
        </h2>

        <form onSubmit={handleSubmit} className="px-6">
          <label className="block mb-2 text1 text-black">Nova Igreja</label>

          <select
            className="min-h-11 w-full text-base sm:text-lg text-gray-600 px-4 text2 text-left rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
      </ModalSurface>
      <ToastContainer />
    </div>
  );
}
