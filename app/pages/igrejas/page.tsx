"use client";
import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import MenuLateral from "@/app/components/menuLateral/menuLateral";
import Link from "next/link";
import Image from "next/image";
import api from "../../api/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import seta from "@/public/icons/seta-down.svg";
import close from "@/public/icons/close.svg";
import lixo from "@/public/icons/delete.svg";
import filter from "@/public/icons/filter.png";

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

export default function Igrejas() {
  const [nome, setNome] = useState<string>("");
  const [cnpj, setCnpj] = useState<string>("");
  const [data_fundacao, setDataFundacao] = useState<string>("");
  const [ministerio, setMinisterio] = useState<string>("");
  const [setor, setSetor] = useState<string>("");
  const [cep, setCep] = useState<string>("");
  const [endereco, setEndereco] = useState<string>("");
  const [cidade, setCidade] = useState<string>("");
  const [bairro, setBairro] = useState<string>("");
  const [aceitoTermos, setAceitoTermos] = useState<boolean>(false);

  const [igrejas, setIgrejas] = useState<Igreja[]>([]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [igrejaToDelete, setIgrejaToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allIgrejas, setAllIgrejas] = useState<Igreja[]>([]); // Lista completa
  const [filteredIgrejas, setFilteredIgrejas] = useState<Igreja[]>([]); // Lista filtrada

  const handleDeleteClick = (id_igreja: number) => {
    setIgrejaToDelete(id_igreja);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!igrejaToDelete) return;

    try {
      await api.delete(`/igreja/${igrejaToDelete}`);
      const notifyDelete = () => {
        toast.success("Igreja deletada com sucesso!", {
          position: "top-center",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      };

      setIgrejas(igrejas.filter((i) => i.id_igreja !== igrejaToDelete));
      notifyDelete();
    } catch (error) {
      toast.error("Erro ao remover igreja.");
    } finally {
      setIsDeleteModalOpen(false);
      setIgrejaToDelete(null);
    }
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

  useEffect(() => {
    const fetchIgrejasSubordinadas = async () => {
      try {
        const id_user = sessionStorage.getItem("id_user");

        const response = await api.get(`/igreja/subordinadasUser/${id_user}`);
        setAllIgrejas(response.data);
        setFilteredIgrejas(response.data);
      } catch (error) {
        console.error("Erro ao buscar igrejas subordinadas:", error);
      }
    };

    fetchIgrejasSubordinadas();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (term.trim() === "") {
      setFilteredIgrejas(allIgrejas);
      return;
    }

    const lowercasedTerm = term.toLowerCase();

    const filtered = allIgrejas.filter((igreja) => {
      // Converte todos os campos para string antes de verificar
      const nomeStr = igreja.nome ? igreja.nome.toString().toLowerCase() : "";
      const codStr = igreja.cnpj ? igreja.cnpj.toString().toLowerCase() : "";
      const enderecoStr = igreja.endereco
        ? igreja.endereco.toString().toLocaleLowerCase()
        : "";

      return (
        nomeStr.includes(lowercasedTerm) ||
        codStr.includes(lowercasedTerm) ||
        enderecoStr.includes(lowercasedTerm)
      );
    });

    setFilteredIgrejas(filtered);
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<
    "recent" | "oldest" | "name-asc" | "name-desc" | "birth"
  >("recent");

  const sortIgrejas = (igrejas: Igreja[]) => {
    const sorted = [...igrejas];

    switch (sortCriteria) {
      case "recent":
        // Adicionados recentemente (maior ID primeiro)
        return sorted.sort((a, b) => b.id_igreja - a.id_igreja);

      case "oldest":
        // Adicionados há mais tempo (menor ID primeiro)
        return sorted.sort((a, b) => a.id_igreja - b.id_igreja);

      case "name-asc":
        // Ordem alfabética A-Z
        return sorted.sort((a, b) => a.nome.localeCompare(b.nome));

      case "name-desc":
        // Ordem alfabética Z-A
        return sorted.sort((a, b) => b.nome.localeCompare(a.nome));

      case "birth":
        // Por data de nascimento (mais jovens primeiro)
        return sorted.sort(
          (a, b) =>
            new Date(b.data_fundacao).getTime() -
            new Date(a.data_fundacao).getTime()
        );

      default:
        return sorted;
    }
  };
  const sortedIgrejas = sortIgrejas(filteredIgrejas);

  return (
    <main>
      <div className="flex">
        <MenuLateral />
        <div className="sm:ml-[10vh] md:ml-[20vh] lg:ml-[5vh] mr-[10vh] mb-[5vh]">
          <div className="flex mt-12">
            <Link
              href={"/../../pages/inicio"}
              className="text-cinza text-lg text3"
            >
              Início &#62;
            </Link>
            <Link
              href={"/../../pages/igrejas"}
              className="text-cinza text-lg text3 ml-2"
            >
              Igrejas &#62;
            </Link>
          </div>

          <div className="flex">
            <div
              className="mt-10 relative sm:right-20 md:right-2"
              ref={dropdownRef}
            >
              <button onClick={toggleDropdown} className="ml-2 flex">
                <h1 className="text-black text1 sm:mr-[2vh]  sm:text-4xl md:text-4xl lg:text-5xl">
                  Igrejas
                </h1>
                <Image
                  src={seta}
                  width={24}
                  height={24}
                  alt="Arrow Icon"
                  className={`${
                    isDropdownOpen ? "rotate-180" : ""
                  } transition-transform`}
                />
              </button>

              {isDropdownOpen && (
                <div className="mt-4 absolute bg-white shadow-lg rounded-lg z-50">
                  <Link
                    href={"/../../pages/membros"}
                    className="block text2 text-black text-xl p-3 rounded hover:bg-slate-200"
                  >
                    Membros
                  </Link>
                  <Link
                    href={"/../../pages/obreiros"}
                    className="block text2 text-black text-xl p-3 rounded hover:bg-slate-200"
                  >
                    Obreiros
                  </Link>
                  <Link
                    href={"/../../pages/departamentos"}
                    className="block text2 text-black text-xl p-3 rounded hover:bg-slate-200"
                  >
                    Departamentos
                  </Link>
                </div>
              )}
            </div>
            <div className="flex">
              <div className="mt-10 relative sm:right-[5vh] md:left-[20vh] lg:left-[63vh]">
                <div className="flex mb-4">
                  {/* Botão de filtro */}
                  <div className="flex gap-5 relative">
                    <button
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="flex items-center justify-center px-5 py-2 hover:bg-slate-200 cursor-pointer rounded-lg focus:outline-none"
                    >
                      <Image
                        src={filter}
                        width={30}
                        height={30}
                        alt="Filtrar"
                      />
                    </button>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Pesquisar igrejas..."
                        className="sm:h-[5.2vh] md:h-[5.5vh] lg:h-[7vh] sm:w-[21vh] md:w-[28vh] lg:w-[32vh] sm:text-xl md:text-lg lg:text-xl text-gray-600 pl-5 text2 text-left content-center justify-center rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                    </div>
                    {/* Dropdown de filtros */}
                    {isFilterOpen && (
                      <div className="absolute right-100 top-20 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                        <button
                          className={`block w-full text-left px-4 py-2 ${
                            sortCriteria === "recent"
                              ? "bg-blue-100 text-blue-500 text1"
                              : "text-gray-800 hover:bg-gray-100 text1"
                          }`}
                          onClick={() => {
                            setSortCriteria("recent");
                            setIsFilterOpen(false);
                          }}
                        >
                          Adicionados recentemente
                        </button>

                        <button
                          className={`block w-full text-left px-4 py-2 ${
                            sortCriteria === "oldest"
                              ? "bg-blue-100 text-blue-500 text1"
                              : "text-gray-800 hover:bg-gray-100 text1"
                          }`}
                          onClick={() => {
                            setSortCriteria("oldest");
                            setIsFilterOpen(false);
                          }}
                        >
                          Adicionados antigamente
                        </button>

                        <button
                          className={`block w-full text-left px-4 py-2 ${
                            sortCriteria === "name-asc"
                              ? "bg-blue-100 text-blue-500 text1"
                              : "text-gray-800 hover:bg-gray-100 text1"
                          }`}
                          onClick={() => {
                            setSortCriteria("name-asc");
                            setIsFilterOpen(false);
                          }}
                        >
                          Nome A-Z
                        </button>

                        <button
                          className={`block w-full text-left px-4 py-2 ${
                            sortCriteria === "name-desc"
                              ? "bg-blue-100 text-blue-500 text1"
                              : "text-gray-800 hover:bg-gray-100 text1"
                          }`}
                          onClick={() => {
                            setSortCriteria("name-desc");
                            setIsFilterOpen(false);
                          }}
                        >
                          Nome Z-A
                        </button>

                        <button
                          className={`block w-full text-left px-4 py-2 ${
                            sortCriteria === "birth"
                              ? "bg-blue-100 text-blue-500 text1"
                              : "text-gray-800 hover:bg-gray-100 text1"
                          }`}
                          onClick={() => {
                            setSortCriteria("birth");
                            setIsFilterOpen(false);
                          }}
                        >
                          Data de Fundação
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex relative sm:right-[10vh] md:left-[35vh] lg:left-[64.4vh]">
                <div className="mt-10 ml-1 flex justify-center">
                  <p
                    className="bg-azul sm:h-[5.2vh] md:h-[5.5vh] lg:h-[7vh] sm:w-[21vh] md:w-[28vh] lg:w-[32vh] sm:text-2xl md:text-2xl lg:text-3xl text-white text2 text-center content-center justify-center rounded-xl cursor-pointer hover:bg-blue-600 active:bg-blue-400"
                    // onClick={() => openModal("new")}
                  >
                    Nova Igreja +
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="ml-[20vh] pr-2">
            <div className="space-x-16 shadow-xl absolute rounded-xl top-[24%] sm:left-[2vh] md:left-[20vh] lg:left-[35vh] h-[72vh] max-h-[72vh] overflow-y-auto overflow-x-auto">
              {sortedIgrejas.length === 0 ? (
                <p className="text-center text-black text1 text-4xl mt-5 text-gray-4 px-[40.5vh]">
                  Nenhuma igreja encontrada.
                </p>
              ) : (
                <table className="text-black w-[160vh]">
                  <thead className="sticky top-0">
                    <tr className="bg-azul text-white rounded-xl">
                      <th className="text1 text-white text-2xl sm:px-5 md:px-10 lg:px-[12vh] py-2">
                        CNPJ
                      </th>
                      <th className="text1 text-white text-2xl sm:px-5 md:px-10 lg:px-[15vh] py-2">
                        Nome
                      </th>
                      <th className="text1 text-white text-2xl sm:px-5 md:px-10 lg:px-[10vh] py-2">
                        Cidade
                      </th>
                      <th className="text1 text-white text-2xl sm:px-5 md:px-10 lg:px-[10vh] py-2">
                        Bairro
                      </th>
                      <th className="text1 text-white text-2xl sm:px-5 md:px-10 lg:px-[10vh] py-2">
                        Setor
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedIgrejas.map((igreja) => (
                      <tr
                        key={igreja.id_igreja}
                        // onClick={() => igreja && openModal("edit", igreja)}
                        className="cursor-pointer hover:bg-slate-200"
                      >
                        <td className="text-center text2 text-xl">
                          {igreja.cnpj}
                        </td>
                        <td className="text-center text2 text-xl py-3">
                          {igreja.nome}
                        </td>
                        <td className="text-center text2 text-xl">
                          {igreja.cidade}
                        </td>
                        <td className="text-center text2 text-xl">
                          {igreja.bairro}
                        </td>
                        <td className="text-center text2 text-xl">
                          {igreja.setor}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
