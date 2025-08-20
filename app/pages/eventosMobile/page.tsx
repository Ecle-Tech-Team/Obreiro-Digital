"use client";
import React, { useState, useEffect, useRef } from "react";
import api from "@/app/api/api";
import MenuInferior from "@/app/components/menuInferior/menuInferior";
import MenuSuperior from "@/app/components/menuSuperior/menuSuperior";
import EventosCardMobile from "@/app/components/eventosCardMobile/eventosCardMobile";
import EventoModalMobile from "@/app/components/eventosMobileModal/eventosMobileModal";
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

interface User {
  id_user: number;
  id_igreja: number;
}

interface Eventos {
  id_evento: number;
  nome: string;
  data_inicio: string;
  horario_inicio: string;
  data_fim: string;
  horario_fim: string;
  local: string;
  id_igreja: number;
  is_global?: 0 | 1 | boolean;
  id_matriz?: number | null;
  tipo_evento?: "matriz" | "local";
}

export default function eventosMobile() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allEventos, setAllEventos] = useState<Eventos[]>([]); // Lista completa
  const [filteredEventos, setFilteredEventos] = useState<Eventos[]>([]); // Lista filtrada
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Eventos | null>(null);

  const openModal = (evento: Eventos) => {
    setSelectedEvento(evento);
    setModalIsOpen(true);
  };
  const [eventos, setEventos] = useState<Eventos[]>([]);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const id_igreja = sessionStorage.getItem("id_igreja");

        const eventoResponse = await api.get(`/evento/matriz/${id_igreja}`);
        setAllEventos(eventoResponse.data);
        setFilteredEventos(eventoResponse.data);
        console.log("ID Igreja recebido:", id_igreja);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

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

  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (term.trim() === "") {
      setFilteredEventos(allEventos);
      return;
    }

    const lowercasedTerm = term.toLowerCase();

    const filtered = allEventos.filter((evento) => {
      // Converte todos os campos para string antes de verificar
      const nomeStr = evento.nome ? evento.nome.toString().toLowerCase() : "";
      const codStr = evento.local ? evento.local.toString().toLowerCase() : "";
      const dataInicioStr = evento.data_inicio
        ? evento.data_inicio.toString()
        : "";
      const dataFimStr = evento.data_fim ? evento.data_fim.toString() : "";

      return (
        nomeStr.includes(lowercasedTerm) ||
        codStr.includes(lowercasedTerm) ||
        dataInicioStr.includes(lowercasedTerm) ||
        dataFimStr.includes(lowercasedTerm)
      );
    });

    setFilteredEventos(filtered);
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<
    "recent" | "oldest" | "name-asc" | "name-desc"
  >("recent");

  const sortEventos = (eventos: Eventos[]) => {
    const sorted = [...eventos];

    switch (sortCriteria) {
      case "recent":
        // Adicionados recentemente (maior ID primeiro)
        return sorted.sort((a, b) => b.id_evento - a.id_evento);

      case "oldest":
        // Adicionados há mais tempo (menor ID primeiro)
        return sorted.sort((a, b) => a.id_evento - b.id_evento);

      case "name-asc":
        // Ordem alfabética A-Z
        return sorted.sort((a, b) => a.nome.localeCompare(b.nome));

      case "name-desc":
        // Ordem alfabética Z-A
        return sorted.sort((a, b) => b.nome.localeCompare(a.nome));

      default:
        return sorted;
    }
  };

  const sortedEventos = sortEventos(filteredEventos);

  const [searchModalIsOpen, setSearchModalIsOpen] = useState(false);

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
                Eventos
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
              <div className="mt-4 absolute bg-white shadow-lg rounded-lg z-50 w-52">
                <Link
                  href={"/../../pages/avisosMobile"}
                  className="block text2 text-black text-xl p-3 rounded hover:bg-slate-200"
                >
                  Avisos
                </Link>
              </div>
            )}
          </div>
          <div className="flex">
            <div className="mt-5 relative sm:left-[11vh] md:left-[20vh] lg:left-[54vh]">
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
                {/* Dropdown de filtros */}
                {isFilterOpen && (
                  <div className="absolute right-5 top-20 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="bg-white shadow-xl rounded-xl self-center mt-7 w-[40vh] h-[70vh] max-h-[70vh] p-10 overflow-y-scroll">
            <div className="grid grid-cols-1 gap-[3vh]">
              {sortedEventos.length === 0 ? (
                <p className="text-center text-black text1 text-4xl mt-5 text-gray-4]">
                  Nenhum aviso encontrado.
                </p>
              ) : (
                sortedEventos.map((evento) => (
                  <div key={evento.id_evento} onClick={() => openModal(evento)}>
                    <EventosCardMobile
                      key={evento.id_evento}
                      h4={evento.local}
                      h3={evento.nome}
                      data_inicio={format(
                        new Date(evento.data_inicio),
                        "dd/MM/yyyy"
                      )}
                      hora_inicio={format(
                        new Date(`1970-01-01T${evento.horario_inicio}`),
                        "HH:mm"
                      )}
                      data_fim={format(new Date(evento.data_fim), "dd/MM/yyyy")}
                      hora_fim={format(
                        new Date(`1970-01-01T${evento.horario_fim}`),
                        "HH:mm"
                      )}
                      tipo_evento={
                        evento.tipo_evento ??
                        (evento.is_global ? "matriz" : "local")
                      }
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <EventoModalMobile
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          evento={
            selectedEvento
              ? {
                  nome: selectedEvento.nome,
                  local: selectedEvento.local,
                  data_inicio: format(
                    new Date(selectedEvento.data_inicio),
                    "dd/MM/yyyy"
                  ),
                  horario_inicio: format(
                    new Date(`1970-01-01T${selectedEvento.horario_inicio}`),
                    "HH:mm"
                  ),
                  data_fim: format(
                    new Date(selectedEvento.data_fim),
                    "dd/MM/yyyy"
                  ),
                  horario_fim: format(
                    new Date(`1970-01-01T${selectedEvento.horario_fim}`),
                    "HH:mm"
                  ),
                  tipo_evento: selectedEvento.tipo_evento                             
                }
              : null
          }
        />

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
      </div>
    </main>
  );
}
