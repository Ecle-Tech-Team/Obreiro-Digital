"use client";
import { AddButton, AppModal, FilterButton, PageTitle, SearchField } from '@/app/components/shared/MemberStyle';
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Radio, X } from "lucide-react";
import { format } from "date-fns";
import MenuLateral from "@/app/components/menuLateral/menuLateral";
import AvisosCard from "@/app/components/avisosCard/avisosCard";
import Link from "next/link";
import api from "../../api/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Aviso {
  id_aviso: number;
  titulo: string;
  conteudo: string;
  data_criacao: string;
  is_global?: 0 | 1 | boolean;
  id_matriz?: number | null;
  tipo_aviso?: "matriz" | "local";
}

export default function avisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [titulo, setTitulo] = useState<string>("");
  const [conteudo, setConteudo] = useState<string>("");
  const [tipoAviso, setTipoAviso] = useState<"local" | "matriz">("local");
  const [editTitulo, setEditTitulo] = useState<string>("");
  const [editConteudo, setEditConteudo] = useState<string>("");

  const [selectedAviso, setSelectedAviso] = useState<Aviso | null>(null);

  const [modalType, setModalType] = useState<"new" | "edit" | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [avisoToDelete, setAvisoToDelete] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [allAvisos, setAllAvisos] = useState<Aviso[]>([]); // Lista completa
  const [filteredAvisos, setFilteredAvisos] = useState<Aviso[]>([]); // Lista filtrada

  const handleDeleteClick = (id_aviso: number) => {
    setAvisoToDelete(id_aviso);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!avisoToDelete) return;

    try {
      await api.delete(`/avisos/${avisoToDelete}`);
      const notifyDelete = () => {
        toast.success("Aviso deletado com sucesso!", {
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

      setAvisos(avisos.filter((m) => m.id_aviso !== avisoToDelete));
      notifyDelete();
    } catch (error) {
      toast.error("Erro ao remover membro.");
    } finally {
      setIsDeleteModalOpen(false);
      setAvisoToDelete(null);
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

  const [cargoUsuario, setCargoUsuario] = useState<string | null>(null);
  const [idIgreja, setIdIgreja] = useState<string | null>(null);
  const [idMatriz, setIdMatriz] = useState<string | null>(null);

  useEffect(() => {
    const cargo = sessionStorage.getItem("cargo");
    const id_igreja = sessionStorage.getItem("id_igreja");
    const id_matriz = sessionStorage.getItem("id_matriz");
    setCargoUsuario(cargo);
    setIdIgreja(id_igreja);
    setIdMatriz(id_matriz);
  }, []);

  const isReadOnlyAviso = selectedAviso?.id_matriz !== null && cargoUsuario !== "Pastor Matriz";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const id_igreja = sessionStorage.getItem("id_igreja");

        const avisoResponse = await api.get(`/avisos/matriz/${id_igreja}`);
        setAllAvisos(avisoResponse.data);
        setFilteredAvisos(avisoResponse.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (term.trim() === "") {
      setFilteredAvisos(allAvisos);
      return;
    }

    const lowercasedTerm = term.toLowerCase();

    const filtered = allAvisos.filter((aviso) => {
      // Converte todos os campos para string antes de verificar
      const nomeStr = aviso.titulo ? aviso.titulo.toString().toLowerCase() : "";
      const codStr = aviso.conteudo
        ? aviso.conteudo.toString().toLowerCase()
        : "";
      const numeroStr = aviso.data_criacao ? aviso.data_criacao.toString() : "";

      return (
        nomeStr.includes(lowercasedTerm) ||
        codStr.includes(lowercasedTerm) ||
        numeroStr.includes(lowercasedTerm)
      );
    });

    setFilteredAvisos(filtered);
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<
    "recent" | "oldest" | "name-asc" | "name-desc" | "birth"
  >("recent");

  const sortAvisos = (avisos: Aviso[]) => {
    const sorted = [...avisos];

    switch (sortCriteria) {
      case "recent":
        // Adicionados recentemente (maior ID primeiro)
        return sorted.sort((a, b) => b.id_aviso - a.id_aviso);

      case "oldest":
        // Adicionados há mais tempo (menor ID primeiro)
        return sorted.sort((a, b) => a.id_aviso - b.id_aviso);

      case "name-asc":
        // Ordem alfabética A-Z
        return sorted.sort((a, b) => a.titulo.localeCompare(b.titulo));

      case "name-desc":
        // Ordem alfabética Z-A
        return sorted.sort((a, b) => b.titulo.localeCompare(a.titulo));

      case "birth":
        // Por data de nascimento (mais jovens primeiro)
        return sorted.sort(
          (a, b) =>
            new Date(b.data_criacao).getTime() -
            new Date(a.data_criacao).getTime()
        );

      default:
        return sorted;
    }
  };

  const sortedAvisos = sortAvisos(filteredAvisos);

  const openModal = (type: "new" | "edit", aviso?: Aviso) => {
    setModalType(type);
    if (type === "new") {
      setTitulo("");
      setConteudo("");
    } else if (type === "edit" && aviso) {
      setSelectedAviso(aviso);
      setEditTitulo(aviso.titulo);
      setEditConteudo(aviso.conteudo);
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalType(null);
    setSelectedAviso(null);
    setEditTitulo("");
    setEditConteudo("");
  };

  const handleRegister = async () => {
    if (!titulo || !conteudo) {
      toast.warn("Todos os campos devem ser preenchidos!", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });

      return;
    }
    try {
      const body: any = { titulo, conteudo }
      if (tipoAviso === "matriz" && cargoUsuario === "Pastor Matriz") {
          body.is_global = true;
          body.id_matriz = idMatriz ?? idIgreja; // fallback
        } else {
          body.is_global = false;
          body.id_matriz = null;
        }
      await api.post("/avisos", body);

      toast.success("Aviso cadastrado com sucesso!", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });

      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error("Erro no cadastro, Tente novamente.", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedAviso || !editTitulo || !editConteudo) {
      toast.warn("Todos os campos devem ser preenchidos!", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    }
    try {
      const dados = { titulo: editTitulo, conteudo: editConteudo };
      await api.put(`/avisos/${selectedAviso.id_aviso}`, dados);
      toast.success("Aviso cadastrado com sucesso!", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      closeModal();
      setAvisos(
        avisos.map((a) =>
          a.id_aviso === selectedAviso.id_aviso ? { ...a, ...dados } : a
        )
      );
    } catch (error) {
      toast.error("Erro na atualização, Tente novamente.", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

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
              href={"/../../pages/eventos"}
              className="text-cinza text-lg text3 ml-2"
            >
              Eventos &#62;
            </Link>
            <Link
              href={"/../../pages/avisos"}
              className="text-cinza text-lg text3 ml-2"
            >
              Avisos
            </Link>
          </div>

          <div className="page-toolbar mt-6">
            <div
              className="relative min-w-0"
              ref={dropdownRef}
            >
              <button onClick={toggleDropdown} className="flex items-center gap-2">
                <PageTitle>Avisos</PageTitle>
                <ChevronDown
                  width={24}
                  height={24} aria-label="Arrow Icon"
                  className={`${
                    isDropdownOpen ? "rotate-180" : ""
                  } transition-transform`}
                />
              </button>

              {isDropdownOpen && (
                <div className="mt-4 absolute bg-white shadow-lg rounded-lg z-50 w-52">
                  <Link
                    href={"/../../pages/eventos"}
                    className="block text2 text-black text-xl p-3 rounded hover:bg-slate-200"
                  >
                    Eventos
                  </Link>
                </div>
              )}
            </div>

            <div className="page-toolbar-actions">
              <div className="relative flex min-w-0 flex-1">
                <div className="flex w-full min-w-0">
                  {/* Botão de filtro */}
                  <div className="od-list-controls relative flex w-full min-w-0 items-center gap-2">
                    <Link
                      className="flex bg-azul items-center justify-center px-5 py-2 cursor-pointer rounded-lg focus:outline-none"
                      href={"/../../pages/apresentacao"}
                    >
                      <Radio size={24} aria-label="Apresentação" />
                    </Link>
                    <FilterButton
                      onClick={() => setIsFilterOpen(!isFilterOpen)}

                     />
                    <div className="flex-1">
                      <SearchField
                        type="text"
                        placeholder="Pesquisar avisos..."

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
                          Data de Criação
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex min-w-0">
                <div className="flex justify-center">
                  <AddButton onClick={() => openModal("new")}>Novo Aviso</AddButton>
                </div>
              </div>
            </div>

            <div className="page-list-region">
              <div className="mt-4 max-h-[70vh] overflow-y-auto rounded-xl bg-white shadow-xl">
                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 sm:p-6">
                  {sortedAvisos.length === 0 ? (
                    <p className="text-center text-black text1 text-4xl mt-5 text-gray-4]">
                      Nenhum aviso encontrado.
                    </p>
                  ) : (
                    sortedAvisos.map((aviso) => (
                      <AvisosCard
                        key={aviso.id_aviso}
                        titulo={aviso.titulo}
                        conteudo={aviso.conteudo}
                        data={format(
                          new Date(aviso.data_criacao),
                          "dd/MM/yyyy"
                        )}
                        tipo_aviso={
                        aviso.tipo_aviso ??
                        (aviso.is_global ? "matriz" : "local")
                      }
                        onClick={() => openModal("edit", aviso)}
                        onDelete={() => handleDeleteClick(aviso.id_aviso)}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            <AppModal
              isOpen={isDeleteModalOpen}
              onRequestClose={() => setIsDeleteModalOpen(false)}
              contentLabel="Confirmar exclusão"
              className="fixed inset-0 flex items-center justify-center p-4"
              overlayClassName="fixed inset-0 bg-black bg-opacity-40"
            >
              <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                <h2 className="text1 text-xl text-black font-bold mb-4">
                  Confirmar Exclusão
                </h2>
                <p className="text2 text-gray-600 mb-6">
                  Você tem certeza que deseja remover este aviso?
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="text2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="text2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </AppModal>

            {/* Modal Novo Aviso */}
            <AppModal
              className="text-white flex flex-col"
              isOpen={modalIsOpen && modalType === "new"}
              onRequestClose={closeModal}
              contentLabel="Novo Aviso"
            >
              <div className="flex flex-col justify-center self-center bg-azul mt-[15vh] rounded-lg shadow-xl">
                <div className="cursor-pointer flex place-content-end rounded-lg">
                  <X
                    onClick={closeModal}
                    width={40}
                    height={40} aria-label="close Icon"
                    className="bg-red-500 hover:bg-red-600 rounded-tr-lg"
                  />
                </div>

                <h2 className="text-white text1 text-4xl flex justify-center">
                  Novo Aviso
                </h2>

                <div className="flex flex-col px-10">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    className="px-4 py-3 rounded-lg text2 text-slate-500"
                    placeholder="Digite o título..."
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                  />
                </div>

                <div className="flex flex-col px-10">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Conteúdo
                  </label>
                  <textarea
                    className="px-4 py-3 rounded-lg text2 text-slate-500 h-32"
                    placeholder="Digite o conteúdo..."
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                  />
                </div>

                {cargoUsuario === "Pastor Matriz" && (
                  <div className="flex flex-col px-10">
                    <label className="text-white text1 text-xl mt-5 mb-1">
                      Tipo Aviso
                    </label>

                    <select
                      className="px-4 py-3 rounded-lg text2 text-slate-500 bg-white"
                      value={tipoAviso}
                      onChange={(e) =>
                        setTipoAviso(e.target.value as "local" | "matriz")
                      }
                      required
                    >
                      <option disabled>Escolha o Tipo do Aviso</option>
                      <option value="local">Aviso Local</option>
                      <option value="matriz">Aviso da Matriz</option>
                    </select>
                  </div>
                )}

                <div className="flex flex-col px-10 pb-10">
                  <button
                    className="border-2 px-4 py-3 mt-7 rounded-lg text2 text-white text-lg"
                    onClick={handleRegister}
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </AppModal>

            {/* Modal Editar Aviso */}
            <AppModal
              className="text-white flex flex-col"
              isOpen={modalIsOpen && modalType === "edit"}
              onRequestClose={closeModal}
              contentLabel="Editar Aviso"
            >
              <div className={`flex flex-col justify-center self-center bg-azul mt-[15vh] rounded-lg shadow-xl ${isReadOnlyAviso ? "pb-20" : ""}`}>
                <div className='cursor-pointer flex place-content-end rounded-lg'>
                  <X onClick={closeModal} width={40} height={40} aria-label='close Icon' className='bg-red-500 hover:bg-red-600 rounded-tr-lg'/>
                </div>

                <h2 className="text-white text1 text-4xl flex justify-center">
                  Editar Aviso
                </h2>

                <div className="flex flex-col px-10">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    className="px-4 py-3 rounded-lg text2 text-slate-500"
                    placeholder="Digite o título..."
                    value={editTitulo}
                    onChange={(e) => setEditTitulo(e.target.value)}
                    readOnly={isReadOnlyAviso}
                  />
                </div>

                <div className="flex flex-col px-10">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Conteúdo
                  </label>
                  <textarea
                    className="px-4 py-3 rounded-lg text2 text-slate-500 h-32"
                    placeholder="Digite o conteúdo..."
                    value={editConteudo}
                    onChange={(e) => setEditConteudo(e.target.value)}
                    readOnly={isReadOnlyAviso}
                  />
                </div>
                {!isReadOnlyAviso && (
                  <div className="flex flex-col px-10 pb-10">
                    <button
                      className="border-2 px-4 py-3 mt-7 rounded-lg text2 text-white text-lg"
                      onClick={handleUpdate}
                    >
                      Atualizar
                    </button>
                  </div>
                )}
              </div>
            </AppModal>
          </div>
        </div>
        <ToastContainer />
      </div>
    </main>
  );
}
