"use client";
import React, { useState, useEffect, useRef } from "react";
import { fetchMembrosPorIgreja, fetchObreirosPorIgreja, fetchDepartamentosPorIgreja } from "@/app/api/api";
import ModalMovimentacao from "../movimentacaoModal/movimentacaoModal";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import seta from "@/public/icons/seta-down-white.svg";
import close from "@/public/icons/close.svg";

interface Igreja {
  id_igreja: number;
  nome: string;
  cnpj: string;
  data_fundacao: string;
}

interface User {
  id_user: number;
  cod_membro: string;
  nome: string;
  email: string;
  birth: string;
  cargo: string;
  id_igreja: number;
}

interface Departamento {
  id_departamento: number;
  nome: string;
  birth: string;
  data_congresso: string;
  qtd_membros: number;
  id_igreja: number;
}

interface Membro {
  id_membro: number;
  cod_membro: string;
  nome: string;
  birth: string;
  novo_convertido: string;
  numero: string;
  id_departamento: number;
  id_igreja: number;
}

interface ModalProps {
  igreja: Igreja | null;
  onClose: () => void;
}

const ModalIgrejaDetalhes: React.FC<ModalProps> = ({ igreja, onClose }) => {
  const [modalMov, setModalMov] = useState<{
  tipo: "membro" | "usuario";
  id: number;
} | null>(null);

  const [tab, setTab] = useState<"membros" | "obreiros" | "departamentos">(
    "membros"
  );
  const [membros, setMembros] = useState<Membro[]>([]);
  const [obreiros, setObreiros] = useState<User[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem("token");

      if (!igreja?.id_igreja || !token) {
        console.error("ID da igreja ou token não encontrado");
        return;
      }

      try {
        const membrosData = await fetchMembrosPorIgreja(igreja?.id_igreja);
        setMembros(membrosData);
        const obreirosData = await fetchObreirosPorIgreja(igreja?.id_igreja);
        setObreiros(obreirosData);
        const departamentosData = await fetchDepartamentosPorIgreja(igreja?.id_igreja);
        setDepartamentos(departamentosData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchData();
  }, [igreja]);

  if (!igreja) return null;

  const getNomeDepartamento = (id_departamento: number) => {
    const departamento = departamentos.find(
      (dep) => dep.id_departamento === id_departamento
    );
    return departamento ? departamento.nome : "Sem departamento";
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[80vh] overflow-auto relative">
        <div className="bg-azul pb-4 sticky top-0 z-20">
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

          <h2 className="text-xl text1 text-white ml-[5.6vh] mb-2 text-left">
            {igreja.nome}
          </h2>

          <div className="relative ml-[5.6vh]" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center bg-azul py-2 cursor-pointer"
            >
              <span className="text-white text-3xl text1 capitalize mr-2">
                {tab}
              </span>
              <Image
                src={seta}
                width={22}
                height={22}
                alt="seta"
                className={`transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute w-48 bg-white shadow-lg rounded-lg z-50">
                <button
                  className="block w-full text-left text-black text2 text-lg p-3 hover:bg-slate-200 hover:rounded-t-lg"
                  onClick={() => {
                    setTab("membros");
                    setIsDropdownOpen(false);
                  }}
                >
                  Membros
                </button>
                <button
                  className="block w-full text-left text-black text2 text-lg p-3 hover:bg-slate-200"
                  onClick={() => {
                    setTab("obreiros");
                    setIsDropdownOpen(false);
                  }}
                >
                  Obreiros
                </button>
                <button
                  className="block w-full text-left text-black text2 text-lg p-3 hover:bg-slate-200"
                  onClick={() => {
                    setTab("departamentos");
                    setIsDropdownOpen(false);
                  }}
                >
                  Departamentos
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="h-[72vh] max-h-[72vh]">
          {tab === "membros" && (
            <table className="w-full table-auto">
              <thead className="sticky top-[130px] z-30">
                <tr className="bg-azul text-white text1 text-xl">
                  <th className="py-2 px-5">Nome</th>
                  <th className="p-2">Data de Nascimento</th>
                  <th className="p-2">Número</th>
                  <th className="p-2">Departamento</th>
                </tr>
              </thead>
              <tbody>
                {membros.map((m) => (
                  <tr
                    key={m.id_membro}
                    className="text-center text-black hover:bg-slate-200 cursor-pointer"
                    onClick={() => setModalMov({ tipo: "membro", id: m.id_membro })}
                  >
                    <td className="p-2 text2 text-lg">{m.nome}</td>
                    <td className="p-2 text2 text-lg">
                      {format(new Date(m.birth), "dd/MM/yyyy")}
                    </td>
                    <td className="p-2 text2 text-lg">{m.numero}</td>
                    <td className="p-2 text2 text-lg">
                      {getNomeDepartamento(m.id_departamento)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "obreiros" && (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-azul text-white text1 text-xl">
                  <th className="p-2">Nome</th>
                  <th className="p-2">Cargo</th>
                  <th className="p-2">Data de Nascimento</th>
                  <th className="p-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {obreiros.map((o) => (
                  <tr
                    key={o.id_user}
                    className="text-center text-black hover:bg-slate-200 cursor-pointer"
                    onClick={() => setModalMov({ tipo: "usuario", id: o.id_user })}
                  >
                    <td className="p-2 text2 text-lg">{o.nome}</td>
                    <td className="p-2 text2 text-lg">{o.cargo}</td>
                    <td className="p-2 text2 text-lg">
                      {format(new Date(o.birth), "dd/MM/yyyy")}
                    </td>
                    <td className="p-2 text2 text-lg">{o.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "departamentos" && (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-azul text-white text1 text-xl">
                  <th className="p-2">Nome</th>
                  <th className="p-2">Data Congresso</th>
                  <th className="p-2">Qtd. Membros</th>
                </tr>
              </thead>
              <tbody>
                {departamentos.map((d) => (
                  <tr
                    key={d.id_departamento}
                    className="text-center text-black hover:bg-slate-200 cursor-pointer"
                  >
                    <td className="p-2 text2 text-lg">{d.nome}</td>
                    <td className="p-2 text2 text-lg">{format(new Date(d.data_congresso), "dd/MM/yyyy")}</td>
                    <td className="p-2 text2 text-lg">{d.qtd_membros}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {modalMov && (
        <ModalMovimentacao
          tipo={modalMov.tipo}
          id={modalMov.id}
          onClose={() => setModalMov(null)}
          onSuccess={() => {
          setTimeout(() => {
            window.location.reload();
          });
          }}
        />
      )}
    </div>
  );
};

export default ModalIgrejaDetalhes;
