"use client";
import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import MenuLateral from "@/app/components/menuLateral/menuLateral";
import EventosCard from "@/app/components/eventosCard/eventosCard";
import Image from "next/image";
import Link from "next/link";
import api from "../../api/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import seta from "@/public/icons/seta-down.svg";
import close from "@/public/icons/close.svg";
import cast from "@/public/icons/cast.svg";
import filter from "@/public/icons/filter.png";

interface Igreja {
  id_igreja: number;
  nome: string;
}

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
}

export default function eventos() {
  const [nome, setNome] = useState<string>("");
  const [local, setLocal] = useState<string>("");
  const [data_inicio, setDataInicio] = useState<string>("");
  const [horario_inicio, setHorarioInicio] = useState<string>("");
  const [data_fim, setDataFim] = useState<string>("");
  const [horario_fim, setHorarioFim] = useState<string>("");

  const [editNome, setEditNome] = useState<string>("");
  const [editLocal, setEditLocal] = useState<string>("");
  const [editDataInicio, setEditDataInicio] = useState<string>("");
  const [editHorarioInicio, setEditHorarioInicio] = useState<string>("");
  const [editDataFim, setEditDataFim] = useState<string>("");
  const [editHorarioFim, setEditHorarioFim] = useState<string>("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventoToDelete, setEventoToDelete] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [allEventos, setAllEventos] = useState<Eventos[]>([]); // Lista completa
  const [filteredEventos, setFilteredEventos] = useState<Eventos[]>([]); // Lista filtrada

  const handleDeleteClick = (id_evento: number) => {
    setEventoToDelete(id_evento);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventoToDelete) return;

    try {
      await api.delete(`/evento/${eventoToDelete}`);
      const notifyDelete = () => {
        toast.success("Evento deletado com sucesso!", {
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

      setEventos(eventos.filter((m) => m.id_evento !== eventoToDelete));
      notifyDelete();
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error("Erro ao remover evento.");
    } finally {
      setIsDeleteModalOpen(false);
      setEventoToDelete(null);
    }
  };
  const [eventos, setEventos] = useState<Eventos[]>([]);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const id_igreja = sessionStorage.getItem("id_igreja");

        const eventoResponse = await api.get(`/evento/${id_igreja}`);
        setAllEventos(eventoResponse.data);
        setFilteredEventos(eventoResponse.data);
        console.log("ID Igreja recebido:", id_igreja);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const [igreja, setIgreja] = useState<Igreja[]>([]);

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

  const [modalType, setModalType] = useState<"new" | "edit" | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = (type: "new" | "edit", eventos?: Eventos) => {
    setModalType(type);
    if (type === "new") {
      setNome("");
      setLocal("");
      setDataInicio("");
      setHorarioInicio("");
      setDataFim("");
      setHorarioFim("");
    } else if (type === "edit" && eventos) {
      setSelectedEvento(eventos);
      setEditNome(eventos.nome);
      setEditLocal(eventos.local);
      setEditDataInicio(format(new Date(eventos.data_inicio), "yyyy-MM-dd"));
      setEditHorarioInicio(eventos.horario_inicio);
      setEditDataFim(format(new Date(eventos.data_fim), "yyyy-MM-dd"));
      setEditHorarioFim(eventos.horario_fim);
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalType(null);
    setEditNome("");
    setEditLocal("");
    setEditDataInicio("");
    setEditHorarioInicio("");
    setEditDataFim("");
    setEditHorarioFim("");
  };

  const [selectedEvento, setSelectedEvento] = useState<Eventos | null>(null);

  useEffect(() => {
    if (selectedEvento) {
      setNome(selectedEvento.nome || "");
      setLocal(selectedEvento.local || "");
      setDataInicio(selectedEvento.data_inicio || "");
      setHorarioInicio(selectedEvento.horario_inicio || "");
      setDataFim(selectedEvento.data_fim || "");
      setHorarioFim(selectedEvento.horario_fim || "");
    }
  }, [selectedEvento]);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();

    const notifySuccess = () => {
      toast.success("Evento cadastrado com sucesso!", {
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

    const notifyWarn = () => {
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
    };

    const notifyError = () => {
      toast.error("Erro na cadastro, Tente novamente.", {
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

    try {
      if (
        nome === "" ||
        local === "" ||
        data_inicio === "" ||
        horario_inicio === "" ||
        data_fim === "" ||
        horario_fim === ""
      ) {
        notifyWarn();
        return;
      } else {
        const dados = {
          nome,
          local,
          data_inicio,
          horario_inicio,
          data_fim,
          horario_fim,
        };

        const response = await api.post("/evento", dados);

        notifySuccess();

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      notifyError();
    }
  }

  const handleUpdate = async (eventos: Eventos | null) => {
    const notifySuccess = () => {
      toast.success("Evento atualizado com sucesso!", {
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

    const notifyWarn = () => {
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
    };

    const notifyError = () => {
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
    };

    try {
      if (!eventos) {
        console.error("No selected financas for update");
        return;
      }

      if (
        !editNome ||
        !editLocal ||
        !editDataInicio ||
        !editHorarioInicio ||
        !data_fim ||
        !horario_fim
      ) {
        notifyWarn();
        return;
      }

      const dados = {
        nome: editNome,
        local: editLocal,
        data_inicio: editDataInicio,
        horario_inicio: editHorarioInicio,
        data_fim: editDataFim,
        horario_fim: editHorarioFim,
      };

      setEventos((prevEventos) =>
        prevEventos.map((u) =>
          u.id_evento === eventos.id_evento ? { ...u, ...dados } : u
        )
      );

      const response = await api.put(`/evento/${eventos.id_evento}`, dados);

      notifySuccess();
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      closeModal();
      setSelectedEvento(null);
    } catch (error) {
      console.error("Error updating eventos:", error);
      notifyError();
    }
  };

  return (
    <main>
      <div className="flex">
        <MenuLateral />
        <div className="sm:ml-[12vh] md:ml-[20vh] lg:ml-[5vh] mr-[10vh] mb-[5vh]">
          <div className="flex mt-12">
            <Link
              href={"/../../pages/inicio"}
              className="text-cinza text-lg text3"
            >
              Início &#62;
            </Link>
            <Link
              href={"/../../pages/financeiro"}
              className="text-cinza text-lg text3 ml-2"
            >
              Eventos &#62;
            </Link>
          </div>

          <div className="flex">
            <div
              className="mt-10 relative sm:right-20 md:right-2"
              ref={dropdownRef}
            >
              <button onClick={toggleDropdown} className="ml-2 flex">
                <h1 className="text-black text1 sm:mr-[2vh]  sm:text-4xl md:text-4xl lg:text-5xl">
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
                    href={"/../../pages/avisos"}
                    className="block text2 text-black text-xl p-3 rounded hover:bg-slate-200"
                  >
                    Avisos
                  </Link>
                </div>
              )}
            </div>

            <div className="flex">
              <div className="mt-10 relative sm:right-[5vh] md:left-[20vh] lg:left-[42.8vh]">
                <div className="flex mb-4">
                  {/* Botão de filtro */}
                  <div className="flex gap-5 relative">
                    <Link
                      className="flex bg-azul items-center justify-center px-5 py-2 cursor-pointer rounded-lg focus:outline-none"
                      href={"/../../pages/apresentacao"}
                    >
                        <Image src={cast} 
                        width={30} 
                        height={30} 
                        alt="Filtrar" 
                      />
                    </Link>
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
                        placeholder="Pesquisar eventos..."
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
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex relative sm:right-[10vh] md:left-[35vh] lg:left-[43.8vh]">
                <div className="mt-10 ml-1 flex justify-center">
                  <p
                    className="bg-azul sm:h-[5.2vh] md:h-[5.5vh] lg:h-[7vh] sm:w-[21vh] md:w-[28vh] lg:w-[32vh] sm:text-2xl md:text-2xl lg:text-3xl text-white text2 text-center content-center justify-center rounded-xl cursor-pointer hover:bg-blue-600 active:bg-blue-400"
                    onClick={() => openModal("new")}
                  >
                    Novo Evento +
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pr-2">
            <div className="bg-white space-x-16 shadow-xl absolute rounded-xl top-[24%] sm:left-[2vh] md:left-[20vh] lg:left-[35vh] h-[72vh] max-h-[72vh] max-w-[151vh] overflow-y-auto overflow-x-auto">
              <div className="m-9 grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-3 gap-[4vh]">
                {sortedEventos.length === 0 ? (
                  <p className="text-center text-black text1 text-4xl mt-5 text-gray-4]">
                    Nenhum evento encontrado.
                  </p>
                ) : (
                  sortedEventos.map((evento) => (
                    <EventosCard
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
                      onClick={() => openModal("edit", evento)}
                      onDelete={() => handleDeleteClick(evento.id_evento)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <Modal
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
                Você tem certeza que deseja remover este evento?
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
          </Modal>

          <Modal
            className="text-white flex flex-col"
            isOpen={modalIsOpen && modalType === "new"}
            onRequestClose={closeModal}
            contentLabel="Novo Evento"
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
                Novo Evento
              </h2>

              <div className="flex flex-col px-10">
                <label className="text-white text1 text-xl mt-5 mb-1">
                  Nome
                </label>

                <input
                  type="text"
                  className="px-4 py-3 rounded-lg text2 text-slate-500"
                  placeholder="Digite o Nome..."
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  maxLength={150}
                  required
                />
              </div>

              <div className="flex flex-col px-10">
                <label className="text-white text1 text-xl mt-5 mb-1">
                  Local
                </label>

                <input
                  type="text"
                  className="px-4 py-3 rounded-lg text2 text-slate-500"
                  placeholder="Digite o Local..."
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  maxLength={150}
                  required
                />
              </div>

              <div className="flex px-10">
                <div className="flex flex-col mr-5">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Data de Início
                  </label>

                  <input
                    type="date"
                    className="px-4 py-3 rounded-lg text2 text-slate-500"
                    placeholder="Digite a Data..."
                    value={data_inicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Horário de Início
                  </label>

                  <input
                    type="time"
                    className="px-4 py-3 rounded-lg text2 text-slate-500"
                    placeholder="Digite o Horário..."
                    value={horario_inicio}
                    onChange={(e) => setHorarioInicio(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex px-10">
                <div className="flex flex-col mr-5">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Data de Término
                  </label>

                  <input
                    type="date"
                    className="px-4 py-3 rounded-lg text2 text-slate-500"
                    placeholder="Digite a Data..."
                    value={data_fim}
                    onChange={(e) => setDataFim(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col mr-5">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Horário de Término
                  </label>

                  <input
                    type="time"
                    className="px-4 py-3 rounded-lg text2 text-slate-500"
                    placeholder="Digite o Horário..."
                    value={horario_fim}
                    onChange={(e) => setHorarioFim(e.target.value)}
                    required
                  />
                </div>
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

          <Modal
            className="text-white flex flex-col"
            isOpen={modalIsOpen && modalType === "edit"}
            onRequestClose={closeModal}
            contentLabel="Ver Evento"
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
                Ver Evento
              </h2>

              <div className="flex flex-col px-10">
                <label className="text-white text1 text-xl mt-5 mb-1">
                  Nome
                </label>

                <input
                  type="text"
                  className="px-4 py-3 rounded-lg text2 text-slate-500"
                  placeholder="Digite o Nome..."
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  maxLength={150}
                  required
                />
              </div>

              <div className="flex flex-col px-10">
                <label className="text-white text1 text-xl mt-5 mb-1">
                  Local
                </label>

                <input
                  type="text"
                  className="px-4 py-3 rounded-lg text2 text-slate-500"
                  placeholder="Digite o Local..."
                  value={editLocal}
                  onChange={(e) => setEditLocal(e.target.value)}
                  maxLength={150}
                  required
                />
              </div>

              <div className="flex px-10">
                <div className="flex flex-col mr-5">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Data de Início
                  </label>

                  <input
                    type="date"
                    className="px-4 py-3 rounded-lg text2 text-slate-500"
                    placeholder="Digite a Data..."
                    value={editDataInicio}
                    onChange={(e) => setEditDataInicio(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Horário de Início
                  </label>

                  <input
                    type="time"
                    className="px-4 py-3 rounded-lg text2 text-slate-500"
                    placeholder="Digite o Horário..."
                    value={editHorarioInicio}
                    onChange={(e) => setEditHorarioInicio(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex px-10">
                <div className="flex flex-col mr-5">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Data de Término
                  </label>

                  <input
                    type="date"
                    className="px-4 py-3 rounded-lg text2 text-slate-500"
                    placeholder="Digite a Data..."
                    value={editDataFim}
                    onChange={(e) => setEditDataFim(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Horário de Término
                  </label>

                  <input
                    type="time"
                    className="px-4 py-3 rounded-lg text2 text-slate-500"
                    placeholder="Digite o Horário..."
                    value={editHorarioFim}
                    onChange={(e) => setEditHorarioFim(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col px-10 pb-10">
                <button
                  className="border-2 px-4 py-3 mt-7 rounded-lg text2 text-white text-lg"
                  onClick={() => selectedEvento && handleUpdate(selectedEvento)}
                >
                  Atualizar
                </button>
              </div>
            </div>
          </Modal>
        </div>
        <ToastContainer />
      </div>
    </main>
  );
}
