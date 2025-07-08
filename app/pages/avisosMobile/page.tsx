"use client";
import React, { useState, useEffect, useRef } from "react";
import api from "@/app/api/api";
import MenuInferior from "@/app/components/menuInferior/menuInferior";
import MenuSuperior from "@/app/components/menuSuperior/menuSuperior";
import AvisosCardMobile from "@/app/components/avisosCardMobile/avisosCardMobile";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import Modal from "react-modal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import seta from "@/public/icons/seta-down.svg";
import filter from "@/public/icons/filter.png";
import close from "@/public/icons/close.svg";
import lupa from "@/public/icons/lupa.svg";

interface Aviso {
  id_aviso: number;
  titulo: string;
  conteudo: string;
  data_criacao: string;
}

export default function avisosMobile() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [titulo, setTitulo] = useState<string>("");
  const [conteudo, setConteudo] = useState<string>("");
  const [editTitulo, setEditTitulo] = useState<string>("");
  const [editConteudo, setEditConteudo] = useState<string>("");
  const [selectedAviso, setSelectedAviso] = useState<Aviso | null>(null);
  const [modalType, setModalType] = useState<"new" | "edit" | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [allAvisos, setAllAvisos] = useState<Aviso[]>([]); // Lista completa
  const [filteredAvisos, setFilteredAvisos] = useState<Aviso[]>([]); // Lista filtrada

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
    const fetchUserData = async () => {
      try {
        const id_igreja = sessionStorage.getItem("id_igreja");

        const avisoResponse = await api.get(`/avisos/${id_igreja}`);
        setAllAvisos(avisoResponse.data);
        setFilteredAvisos(avisoResponse.data);
        console.log("ID Igreja recebido:", id_igreja);
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

  const [searchModalIsOpen, setSearchModalIsOpen] = useState(false);

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
      const dados = { titulo, conteudo };
      await api.post("/avisos", dados);

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
      const token = localStorage.getItem("token");
      const dados = { titulo: editTitulo, conteudo: editConteudo };
      await api.put(`/avisos/${selectedAviso.id_aviso}`, dados, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    setTimeout(() => window.location.reload(), 1500);
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
      <div>
        <div>
          <MenuSuperior />
          <MenuInferior />
        </div>

        <div className="flex">
          <div className="mt-5 relative sm:left-[2vh]" ref={dropdownRef}>
            <button onClick={toggleDropdown} className="ml-2 flex">
              <h1 className="text-black text1 sm:mr-[1vh] sm:text-3xl md:text-4xl lg:text-5xl">
                Avisos
              </h1>
              <Image
                src={seta}
                width={21}
                height={21}
                alt="Arrow Icon"
                className={`${
                  isDropdownOpen ? "rotate-180" : ""
                } transition-transform`}
              />
            </button>

            {isDropdownOpen && (
              <div className="mt-4 absolute bg-white shadow-lg rounded-lg z-50 w-52">
                <Link
                  href={"/../../pages/eventosMobile"}
                  className="block text2 text-black text-xl p-3 rounded hover:bg-slate-200"
                >
                  Eventos
                </Link>
              </div>
            )}
          </div>
          <div className="flex">
            <div className="mt-5 relative sm:left-[6vh] md:left-[20vh] lg:left-[54vh]">
              <div className="flex mb-4 items-center gap-5">
                {/* Botão de filtro */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center justify-center px-2 py-2 hover:bg-slate-200 cursor-pointer rounded-lg focus:outline-none"
                  >
                    <Image src={filter} width={30} height={30} alt="Filtrar" />
                  </button>
                </div>

                {/* Campo de pesquisa */}
                <div className="flex-1">
                  <button
                    onClick={() => setSearchModalIsOpen(true)}
                    className="bg-azul  py-[1.2vh] px-4 rounded-lg"
                  >
                    <Image src={lupa} width={23} height={30} alt="Pesquisar" />
                  </button>
                </div>

                {/* Botão de novo pedido */}
                <button
                  className="bg-azul text-3xl text2 text-white py-1 px-4 rounded-lg"
                  onClick={() => openModal("new")}
                >
                  +
                </button>

                {/* Dropdown de filtros */}
                {isFilterOpen && (
                  <div className="absolute right-100 top-16 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
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
                      Data do Pedido
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="bg-white shadow-xl rounded-xl self-center mt-4 w-[40vh] h-[70vh] max-h-[70vh] p-10 overflow-y-scroll">
            <div className="grid grid-cols-1 gap-[3vh]">
              {sortedAvisos.length === 0 ? (
                <p className="text-center text-black text1 text-4xl mt-5 text-gray-4]">
                  Nenhum aviso encontrado.
                </p>
              ) : (
                sortedAvisos.map((aviso) => (
                  <AvisosCardMobile
                    key={aviso.id_aviso}
                    titulo={aviso.titulo}
                    conteudo={aviso.conteudo}
                    data={format(new Date(aviso.data_criacao), "dd/MM/yyyy")}
                    onClick={() => openModal("edit", aviso)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <Modal
          className="text-white flex flex-col bg-black bg-opacity-0"
          isOpen={searchModalIsOpen}
          onRequestClose={() => setSearchModalIsOpen(false)}
          contentLabel="Pesquisar Pedidos"
        >
          <div className="flex flex-col justify-center self-center bg-white mt-[15vh] rounded-lg shadow-xl">
            <div className="cursor-pointer flex place-content-start rounded-lg">
              <Image
                onClick={() => setSearchModalIsOpen(false)}
                src={close}
                width={40}
                height={40}
                alt="close Icon"
                className="bg-red-500 hover:bg-red-600 rounded-tl-lg"
              />
            </div>

            <div className="flex flex-row gap-3 px-5 py-2 mt-3">
              <input
                type="text"
                placeholder="Digite o nome, categoria ou data..."
                className="px-4 py-3 rounded-lg text2 text-slate-500 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <button
                className="bg-azul px-4 py-1 rounded-lg"
                onClick={() => {
                  handleSearch(searchTerm);
                  setSearchModalIsOpen(false);
                }}
              >
                <Image src={lupa} width={23} height={20} alt="Pesquisar" />
              </button>
            </div>

            <button
              className="border-2 mx-5 mb-6 px-4 py-2 mt-2 rounded-lg text2 text-gray-600 text-lg"
              onClick={() => {
                setSearchTerm("");
                setSearchModalIsOpen(false);
                window.location.reload();
              }}
            >
              Limpar
            </button>
          </div>
        </Modal>
        {/* Modal Novo Aviso */}
        <Modal
          className="text-white flex flex-col"
          isOpen={modalIsOpen && modalType === "new"}
          onRequestClose={closeModal}
          contentLabel="Novo Aviso"
        >
          <div className="flex flex-col justify-center self-center bg-azul mt-[15vh] rounded-lg shadow-xl">
            <div className="cursor-pointer flex place-content-end rounded-lg">
              <Image
                onClick={closeModal}
                src={close}
                width={40}
                height={40}
                alt="close Icon"
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

            <div className="flex flex-col px-10 pb-10">
              <button
                className="border-2 px-4 py-3 mt-7 rounded-lg text2 text-white text-lg"
                onClick={handleRegister}
              >
                Enviar
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal Editar Aviso */}
        <Modal
          className="text-white flex flex-col"
          isOpen={modalIsOpen && modalType === "edit"}
          onRequestClose={closeModal}
          contentLabel="Editar Aviso"
        >
          <div className="flex flex-col justify-center self-center bg-azul mt-[15vh] rounded-lg shadow-xl">
            <div className="cursor-pointer flex place-content-end rounded-lg">
              <Image
                onClick={closeModal}
                src={close}
                width={40}
                height={40}
                alt="close Icon"
                className="bg-red-500 hover:bg-red-600 rounded-tr-lg"
              />
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
              />
            </div>

            <div className="flex flex-col px-10 pb-10">
              <button
                className="border-2 px-4 py-3 mt-7 rounded-lg text2 text-white text-lg"
                onClick={handleUpdate}
              >
                Atualizar
              </button>
            </div>
          </div>
        </Modal>
        <ToastContainer />
      </div>
    </main>
  );
}
