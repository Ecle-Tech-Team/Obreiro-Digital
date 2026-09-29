"use client";
import { AddButton, DataTable, FilterButton, PageTitle, SearchField } from '@/app/components/shared/MemberStyle';
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { format } from "date-fns";
import MenuLateral from "@/app/components/menuLateral/menuLateral";
import ModalIgrejaDetalhes from "@/app/components/igrejaModal/ModalIgreja";
import Link from "next/link";
import api from "../../api/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

export default function Igrejas({ igrejas } : { igrejas: Igreja[] }) {
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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [igrejaToDelete, setIgrejaToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allIgrejas, setAllIgrejas] = useState<Igreja[]>([]); // Lista completa
  const [filteredIgrejas, setFilteredIgrejas] = useState<Igreja[]>([]); // Lista filtrada

  const handleDeleteClick = (id_igreja: number) => {
    setIgrejaToDelete(id_igreja);
    setIsDeleteModalOpen(true);
  };

  // const handleDeleteConfirm = async () => {
  //   if (!igrejaToDelete) return;

  //   try {
  //     await api.delete(`/igreja/${igrejaToDelete}`);
  //     const notifyDelete = () => {
  //       toast.success("Igreja deletada com sucesso!", {
  //         position: "top-center",
  //         autoClose: 1500,
  //         hideProgressBar: false,
  //         closeOnClick: true,
  //         pauseOnHover: true,
  //         draggable: true,
  //         progress: undefined,
  //         theme: "colored",
  //       });
  //     };

  //     setIgrejas(igrejas.filter((i) => i.id_igreja !== igrejaToDelete));
  //     notifyDelete();
  //   } catch (error) {
  //     toast.error("Erro ao remover igreja.");
  //   } finally {
  //     setIsDeleteModalOpen(false);
  //     setIgrejaToDelete(null);
  //   }
  // };

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

  const [modalIgreja, setModalIgreja] = useState<Igreja | null>(null);

  return (
    <main>
      <div className="flex">
        <MenuLateral />
        <div className="app-content">
          <div className="od-breadcrumb pt-2">
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

          <div className="page-toolbar mt-6">
            <div
              className="relative min-w-0"
              ref={dropdownRef}
            >
              <button onClick={toggleDropdown} className="flex items-center gap-2">
                <PageTitle>Igrejas</PageTitle>
                <ChevronDown
                  width={24}
                  height={24} aria-label="Arrow Icon"
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
            <div className="page-toolbar-actions">
              <div className="relative flex min-w-0 flex-1">
                <div className="flex w-full min-w-0">
                  {/* Botão de filtro */}
                  <div className="od-list-controls relative flex w-full min-w-0 items-center gap-2">
                    <FilterButton
                      onClick={() => setIsFilterOpen(!isFilterOpen)}

                     />
                    <div className="flex-1">
                      <SearchField
                        type="text"
                        placeholder="Pesquisar igrejas..."

                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                    </div>
                    {/* Dropdown de filtros */}
                    {isFilterOpen && (
                      <div className="od-filter-menu absolute right-100 top-20 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
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
              <div className="flex min-w-0">
                <div className="flex justify-center">
                  <AddButton>Nova Igreja</AddButton>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 min-w-0">
            <div className="page-table-scroll max-h-[70vh]">
              {sortedIgrejas.length === 0 ? (
                <p className="p-6 text-center text-black text1 text-xl sm:text-2xl">
                  Nenhuma igreja encontrada.
                </p>
              ) : (
                <DataTable className="text-black">
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
                        onClick={() => setModalIgreja(igreja)}
                        className="cursor-pointer hover:bg-slate-200"
                      >
                        <td data-label="CNPJ" className="text-center text2 text-xl">
                          {igreja.cnpj}
                        </td>
                        <td data-label="Nome" className="text-center text2 text-xl py-3">
                          {igreja.nome}
                        </td>
                        <td data-label="Cidade" className="text-center text2 text-xl">
                          {igreja.cidade}
                        </td>
                        <td data-label="Bairro" className="text-center text2 text-xl">
                          {igreja.bairro}
                        </td>
                        <td data-label="Setor" className="text-center text2 text-xl">
                          {igreja.setor}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              )}
            </div>
          </div>
          {/* Modal de detalhes da igreja */}
          {modalIgreja && (
            <ModalIgrejaDetalhes
              igreja={modalIgreja}
              onClose={() => setModalIgreja(null)}
            />
          )}
        </div>
      </div>
    </main>
  );
}
