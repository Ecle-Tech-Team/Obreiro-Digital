"use client";

import { AddButton, AppModal, FilterButton, PageTitle, SearchField } from '@/app/components/shared/MemberStyle';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import Modal from "react-modal";
import { toast, ToastContainer } from "react-toastify";
import {
  CalendarDays,
  Cast,
  ChevronDown,
  X,
} from "lucide-react";

import MenuLateral from "@/app/components/menuLateral/menuLateral";
import EventosCard from "@/app/components/eventosCard/eventosCard";
import api from "../../api/api";

import "react-toastify/dist/ReactToastify.css";

interface Evento {
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

type SortCriteria = "recent" | "oldest" | "name-asc" | "name-desc";
type ModalType = "new" | "edit" | null;

const toastConfig = {
  position: "top-center" as const,
  autoClose: 1500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored" as const,
};

const inputClass =
  "text2 w-full rounded-lg px-4 py-3 text-black outline-none border border-transparent focus:border-blue-300 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100";

function toInputDate(value: string) {
  if (!value) return "";
  return value.slice(0, 10);
}

function toInputTime(value: string) {
  if (!value) return "";
  return value.slice(0, 5);
}

function formatDateCard(value: string) {
  if (!value) return "";
  try {
    return format(parseISO(value.slice(0, 10)), "dd/MM/yyyy");
  } catch {
    return value;
  }
}

function formatTimeCard(value: string) {
  if (!value) return "";
  return value.slice(0, 5);
}

export default function eventos() {
  const [nome, setNome] = useState("");
  const [local, setLocal] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [horarioInicio, setHorarioInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [horarioFim, setHorarioFim] = useState("");
  const [tipoEvento, setTipoEvento] = useState<"local" | "matriz">("local");

  const [editNome, setEditNome] = useState("");
  const [editLocal, setEditLocal] = useState("");
  const [editDataInicio, setEditDataInicio] = useState("");
  const [editHorarioInicio, setEditHorarioInicio] = useState("");
  const [editDataFim, setEditDataFim] = useState("");
  const [editHorarioFim, setEditHorarioFim] = useState("");

  const [cargoUsuario, setCargoUsuario] = useState<string | null>(null);
  const [idIgreja, setIdIgreja] = useState<string | null>(null);
  const [idMatriz, setIdMatriz] = useState<string | null>(null);

  const [allEventos, setAllEventos] = useState<Evento[]>([]);
  const [filteredEventos, setFilteredEventos] = useState<Evento[]>([]);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>("recent");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventoToDelete, setEventoToDelete] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Modal.setAppElement("body");
  }, []);

  useEffect(() => {
    const cargo = sessionStorage.getItem("cargo");
    const igreja = sessionStorage.getItem("id_igreja");
    const matriz = sessionStorage.getItem("id_matriz");

    setCargoUsuario(cargo);
    setIdIgreja(igreja);
    setIdMatriz(matriz);
  }, []);

  const loadEventos = useCallback(async () => {
    try {
      const igreja = sessionStorage.getItem("id_igreja");

      if (!igreja) {
        setAllEventos([]);
        setFilteredEventos([]);
        return;
      }

      const response = await api.get(`/evento/matriz/${igreja}`);
      const eventos = Array.isArray(response.data) ? response.data : [];

      setAllEventos(eventos);
      setFilteredEventos(eventos);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      toast.error("Erro ao carregar eventos.", toastConfig);
    }
  }, []);

  useEffect(() => {
    void loadEventos();
  }, [loadEventos]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }

      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      setFilteredEventos(allEventos);
      return;
    }

    const filtered = allEventos.filter((evento) => {
      const nomeStr = evento.nome?.toLowerCase() || "";
      const localStr = evento.local?.toLowerCase() || "";
      const dataInicioStr = evento.data_inicio || "";
      const dataFimStr = evento.data_fim || "";

      return (
        nomeStr.includes(term) ||
        localStr.includes(term) ||
        dataInicioStr.includes(term) ||
        dataFimStr.includes(term)
      );
    });

    setFilteredEventos(filtered);
  }, [searchTerm, allEventos]);

  const sortedEventos = useMemo(() => {
    const sorted = [...filteredEventos];

    switch (sortCriteria) {
      case "recent":
        return sorted.sort((a, b) => b.id_evento - a.id_evento);
      case "oldest":
        return sorted.sort((a, b) => a.id_evento - b.id_evento);
      case "name-asc":
        return sorted.sort((a, b) => a.nome.localeCompare(b.nome));
      case "name-desc":
        return sorted.sort((a, b) => b.nome.localeCompare(a.nome));
      default:
        return sorted;
    }
  }, [filteredEventos, sortCriteria]);

  const isReadOnlyEvento =
    !!selectedEvento &&
    selectedEvento.id_matriz != null &&
    cargoUsuario !== "Pastor Matriz";

  function resetNewForm() {
    setNome("");
    setLocal("");
    setDataInicio("");
    setHorarioInicio("");
    setDataFim("");
    setHorarioFim("");
    setTipoEvento("local");
  }

  function resetEditForm() {
    setEditNome("");
    setEditLocal("");
    setEditDataInicio("");
    setEditHorarioInicio("");
    setEditDataFim("");
    setEditHorarioFim("");
  }

  function openModal(type: Exclude<ModalType, null>, evento?: Evento) {
    setModalType(type);

    if (type === "new") {
      setSelectedEvento(null);
      resetNewForm();
    }

    if (type === "edit" && evento) {
      setSelectedEvento(evento);
      setEditNome(evento.nome || "");
      setEditLocal(evento.local || "");
      setEditDataInicio(toInputDate(evento.data_inicio));
      setEditHorarioInicio(toInputTime(evento.horario_inicio));
      setEditDataFim(toInputDate(evento.data_fim));
      setEditHorarioFim(toInputTime(evento.horario_fim));
    }

    setModalIsOpen(true);
  }

  function closeModal() {
    setModalIsOpen(false);
    setModalType(null);
    setSelectedEvento(null);
    resetNewForm();
    resetEditForm();
  }

  function handleDeleteClick(id_evento: number) {
    setEventoToDelete(id_evento);
    setIsDeleteModalOpen(true);
  }

  async function handleDeleteConfirm() {
    if (eventoToDelete === null) return;

    try {
      await api.delete(`/evento/${eventoToDelete}`);
      await loadEventos();
      toast.success("Evento deletado com sucesso!", toastConfig);
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      toast.error("Erro ao remover evento.", toastConfig);
    } finally {
      setIsDeleteModalOpen(false);
      setEventoToDelete(null);
    }
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !nome.trim() ||
      !local.trim() ||
      !dataInicio ||
      !horarioInicio ||
      !dataFim ||
      !horarioFim
    ) {
      toast.warn("Todos os campos devem ser preenchidos!", toastConfig);
      return;
    }

    try {
      const body: Record<string, unknown> = {
        nome: nome.trim(),
        local: local.trim(),
        data_inicio: dataInicio,
        horario_inicio: horarioInicio,
        data_fim: dataFim,
        horario_fim: horarioFim,
      };

      if (tipoEvento === "matriz" && cargoUsuario === "Pastor Matriz") {
        body.is_global = true;
        body.id_matriz = idMatriz ?? idIgreja;
      } else {
        body.is_global = false;
        body.id_matriz = null;
      }

      await api.post("/evento", body);
      await loadEventos();

      toast.success("Evento cadastrado com sucesso!", toastConfig);
      closeModal();
    } catch (error) {
      console.error("Erro ao cadastrar evento:", error);
      toast.error("Erro no cadastro. Tente novamente.", toastConfig);
    }
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedEvento) return;

    if (
      !editNome.trim() ||
      !editLocal.trim() ||
      !editDataInicio ||
      !editHorarioInicio ||
      !editDataFim ||
      !editHorarioFim
    ) {
      toast.warn("Todos os campos devem ser preenchidos!", toastConfig);
      return;
    }

    const dados = {
      nome: editNome.trim(),
      local: editLocal.trim(),
      data_inicio: editDataInicio,
      horario_inicio: editHorarioInicio,
      data_fim: editDataFim,
      horario_fim: editHorarioFim,
    };

    try {
      await api.put(`/evento/${selectedEvento.id_evento}`, dados);
      await loadEventos();

      toast.success("Evento atualizado com sucesso!", toastConfig);
      closeModal();
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      toast.error("Erro na atualização. Tente novamente.", toastConfig);
    }
  }

  return (
    <div className="min-h-screen bg-fundo">
      <div className="flex flex-col lg:flex-row">
        <MenuLateral />

        <div className="app-content">
          <nav className="mb-6 lg:mb-8" aria-label="Navegação">
            <ol className="flex flex-wrap items-center text-sm text-gray-600">
              <li>
                <Link
                  href="/pages/inicio"
                  className="text3 transition-colors duration-200 hover:text-azul"
                >
                  Início
                </Link>
              </li>
              <li className="mx-2">&#62;</li>
              <li className="text3 font-semibold text-azul">
                <span aria-current="page">Eventos</span>
              </li>
            </ol>
          </nav>

          <div className="mb-6 flex flex-col gap-4 lg:mb-8">
            <div className="relative" ref={dropdownRef}>
              <div onClick={() => setIsDropdownOpen((prev) => !prev)} className="flex items-center cursor-pointer">
                <PageTitle>Eventos</PageTitle>

                <button
                  type="button"
                  className="ml-2 rounded-full p-2 transition-colors duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-azul focus:ring-opacity-50 lg:ml-4"
                  aria-label="Menu de navegação"
                  aria-expanded={isDropdownOpen}
                >
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {isDropdownOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-xl xs:w-56 sm:w-64">
                  <Link
                    href="/pages/avisos"
                    className="text1 block px-4 py-3 text-sm text-gray-700 transition-colors duration-200 hover:bg-blue-50 hover:text-azul sm:text-base"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Avisos
                  </Link>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="w-full flex-1">
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <SearchField
                        type="text"
                        placeholder="Pesquisar eventos..."

                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Pesquisar eventos"
                      />
                    </div>

                    <div className="relative" ref={filterRef}>
                      <FilterButton
                        type="button"
                        onClick={() => setIsFilterOpen((prev) => !prev)}

                        aria-label="Filtrar resultados"
                        aria-expanded={isFilterOpen}
                       />

                      {isFilterOpen && (
                        <div className="od-filter-menu absolute right-0 top-full z-10 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-xl xs:w-56">
                          <div className="py-2">
                            <button
                              type="button"
                              className={`w-full px-4 py-2 text-left text-sm ${
                                sortCriteria === "recent"
                                  ? "bg-blue-50 text-azul font-semibold"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                              onClick={() => {
                                setSortCriteria("recent");
                                setIsFilterOpen(false);
                              }}
                            >
                              Adicionados recentemente
                            </button>

                            <button
                              type="button"
                              className={`w-full px-4 py-2 text-left text-sm ${
                                sortCriteria === "oldest"
                                  ? "bg-blue-50 text-azul font-semibold"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                              onClick={() => {
                                setSortCriteria("oldest");
                                setIsFilterOpen(false);
                              }}
                            >
                              Adicionados antigamente
                            </button>

                            <button
                              type="button"
                              className={`w-full px-4 py-2 text-left text-sm ${
                                sortCriteria === "name-asc"
                                  ? "bg-blue-50 text-azul font-semibold"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                              onClick={() => {
                                setSortCriteria("name-asc");
                                setIsFilterOpen(false);
                              }}
                            >
                              Nome A-Z
                            </button>

                            <button
                              type="button"
                              className={`w-full px-4 py-2 text-left text-sm ${
                                sortCriteria === "name-desc"
                                  ? "bg-blue-50 text-azul font-semibold"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                              onClick={() => {
                                setSortCriteria("name-desc");
                                setIsFilterOpen(false);
                              }}
                            >
                              Nome Z-A
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex w-full gap-3 md:w-auto">
                <Link
                  href="/pages/apresentacao"
                  aria-label="Ir para apresentação"
                  className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-azul text-white shadow-md transition-all duration-200 hover:bg-blue-600 hover:shadow-lg"
                >
                  <Cast className="h-5 w-5" />
                </Link>

                <AddButton
                  type="button"
                  onClick={() => openModal("new")}
                  className="w-full xs:w-auto"
                >
                  Novo Evento
                </AddButton>
              </div>
            </div>
          </div>

          <div className="mt-6 lg:mt-8">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
              <div className="p-4 sm:p-6">
                {sortedEventos.length === 0 ? (
                  <div className="py-12 text-center lg:py-16">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 lg:h-20 lg:w-20">
                      <CalendarDays className="h-8 w-8 text-gray-400 lg:h-10 lg:w-10" />
                    </div>
                    <h3 className="text1 mb-2 text-xl text-gray-600 lg:text-2xl">
                      Nenhum evento encontrado
                    </h3>
                    <p className="text2 text-gray-500">
                      {searchTerm
                        ? "Tente ajustar sua busca"
                        : "Adicione seu primeiro evento"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {sortedEventos.map((evento) => (
                      <EventosCard
                        key={evento.id_evento}
                        h3={evento.nome}
                        h4={evento.local}
                        data_inicio={formatDateCard(evento.data_inicio)}
                        hora_inicio={formatTimeCard(evento.horario_inicio)}
                        data_fim={formatDateCard(evento.data_fim)}
                        hora_fim={formatTimeCard(evento.horario_fim)}
                        tipo_evento={
                          evento.tipo_evento ??
                          (Boolean(evento.is_global) ? "matriz" : "local")
                        }
                        onClick={() => openModal("edit", evento)}
                        onDelete={() => handleDeleteClick(evento.id_evento)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />

      <AppModal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        contentLabel="Confirmar exclusão"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-white bg-opacity-70 z-50"
      >
        <div className="w-full max-w-sm rounded-lg bg-white p-6">
          <h2 className="text1 mb-4 text-xl font-bold text-black">
            Confirmar Exclusão
          </h2>
          <p className="text2 mb-6 text-gray-600">
            Você tem certeza que deseja remover este evento?
          </p>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="text2 rounded px-4 py-2 text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="text2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Confirmar
            </button>
          </div>
        </div>
      </AppModal>

      <AppModal
        className="text-white flex flex-col"
        isOpen={modalIsOpen && modalType === "new"}
        onRequestClose={closeModal}
        contentLabel="Novo Evento"
        overlayClassName="fixed inset-0 z-50 bg-black/40"
      >
        <div className="mx-auto mt-[5vh] flex max-w-[90vw] flex-col justify-center rounded-lg bg-azul shadow-xl xs:mt-[10vh] xs:max-w-md sm:mt-[15vh] sm:max-w-lg lg:max-w-2xl">
          <div className="flex place-content-start rounded-lg">
            <button
              type="button"
              onClick={closeModal}
              className="flex items-center justify-center rounded-tl-lg bg-red-500 p-2 hover:bg-red-600 xs:p-3"
              aria-label="Fechar modal"
            >
              <X className="h-5 w-5 text-white xs:h-6 xs:w-6" />
            </button>
          </div>

          <h2 className="text1 mt-4 flex justify-center text-2xl text-white xs:mt-6 xs:text-3xl sm:text-4xl">
            Novo Evento
          </h2>

          <form onSubmit={handleRegister}>
            <div className="flex flex-col px-4 xs:px-6 sm:px-8 lg:px-10">
              <label className="text1 mt-4 mb-1 text-base text-white xs:mt-5 xs:text-lg sm:text-xl">
                Nome
              </label>
              <input
                type="text"
                className={inputClass}
                placeholder="Digite o nome..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                maxLength={150}
                required
              />
            </div>

            <div className="flex flex-col px-4 xs:px-6 sm:px-8 lg:px-10">
              <label className="text1 mt-4 mb-1 text-base text-white xs:mt-5 xs:text-lg sm:text-xl">
                Local
              </label>
              <input
                type="text"
                className={inputClass}
                placeholder="Digite o local..."
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                maxLength={150}
                required
              />
            </div>

            <div className="flex flex-col gap-4 px-4 xs:px-6 sm:flex-row sm:px-8 lg:px-10">
              <div className="flex flex-1 flex-col">
                <label className="text1 mt-5 mb-1 text-base text-white sm:text-xl">
                  Data de Início
                </label>
                <input
                  type="date"
                  className={inputClass}
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-1 flex-col">
                <label className="text1 mt-5 mb-1 text-base text-white sm:text-xl">
                  Horário de Início
                </label>
                <input
                  type="time"
                  className={inputClass}
                  value={horarioInicio}
                  onChange={(e) => setHorarioInicio(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 px-4 xs:px-6 sm:flex-row sm:px-8 lg:px-10">
              <div className="flex flex-1 flex-col">
                <label className="text1 mt-5 mb-1 text-base text-white sm:text-xl">
                  Data de Término
                </label>
                <input
                  type="date"
                  className={inputClass}
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-1 flex-col">
                <label className="text1 mt-5 mb-1 text-base text-white sm:text-xl">
                  Horário de Término
                </label>
                <input
                  type="time"
                  className={inputClass}
                  value={horarioFim}
                  onChange={(e) => setHorarioFim(e.target.value)}
                  required
                />
              </div>
            </div>

            {cargoUsuario === "Pastor Matriz" && (
              <div className="flex flex-col px-4 xs:px-6 sm:px-8 lg:px-10">
                <label className="text1 mt-5 mb-1 text-base text-white sm:text-xl">
                  Tipo de Evento
                </label>
                <select
                  className={inputClass}
                  value={tipoEvento}
                  onChange={(e) =>
                    setTipoEvento(e.target.value as "local" | "matriz")
                  }
                >
                  <option value="local">Evento Local</option>
                  <option value="matriz">Evento da Matriz</option>
                </select>
              </div>
            )}

            <div className="flex flex-col px-4 pb-6 xs:px-6 xs:pb-8 sm:px-8 sm:pb-10 lg:px-10">
              <button
                type="submit"
                className="text2 mt-6 rounded-lg border-2 px-4 py-2 text-base text-white transition-colors duration-200 hover:bg-blue-600 xs:mt-7 xs:py-3 xs:text-lg"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      </AppModal>

      <AppModal
        className="text-white flex flex-col"
        isOpen={modalIsOpen && modalType === "edit"}
        onRequestClose={closeModal}
        contentLabel="Editar Evento"
        overlayClassName="fixed inset-0 z-50 bg-black/40"
      >
        <div className="mx-auto mt-[5vh] flex max-w-[90vw] flex-col justify-center rounded-lg bg-azul shadow-xl xs:mt-[10vh] xs:max-w-md sm:mt-[15vh] sm:max-w-lg lg:max-w-2xl">
          <div className="flex place-content-start rounded-lg">
            <button
              type="button"
              onClick={closeModal}
              className="flex items-center justify-center rounded-tl-lg bg-red-500 p-2 hover:bg-red-600 xs:p-3"
              aria-label="Fechar modal"
            >
              <X className="h-5 w-5 text-white xs:h-6 xs:w-6" />
            </button>
          </div>

          <h2 className="text1 mt-4 flex justify-center text-2xl text-white xs:mt-6 xs:text-3xl sm:text-4xl">
            {isReadOnlyEvento ? "Ver Evento" : "Editar Evento"}
          </h2>

          <form onSubmit={handleUpdate}>
            <div className="flex flex-col px-4 xs:px-6 sm:px-8 lg:px-10">
              <label className="text1 mt-4 mb-1 text-base text-white xs:mt-5 xs:text-lg sm:text-xl">
                Nome
              </label>
              <input
                type="text"
                className={inputClass}
                placeholder="Digite o nome..."
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
                maxLength={150}
                required
                disabled={isReadOnlyEvento}
              />
            </div>

            <div className="flex flex-col px-4 xs:px-6 sm:px-8 lg:px-10">
              <label className="text1 mt-4 mb-1 text-base text-white xs:mt-5 xs:text-lg sm:text-xl">
                Local
              </label>
              <input
                type="text"
                className={inputClass}
                placeholder="Digite o local..."
                value={editLocal}
                onChange={(e) => setEditLocal(e.target.value)}
                maxLength={150}
                required
                disabled={isReadOnlyEvento}
              />
            </div>

            <div className="flex flex-col gap-4 px-4 xs:px-6 sm:flex-row sm:px-8 lg:px-10">
              <div className="flex flex-1 flex-col">
                <label className="text1 mt-5 mb-1 text-base text-white sm:text-xl">
                  Data de Início
                </label>
                <input
                  type="date"
                  className={inputClass}
                  value={editDataInicio}
                  onChange={(e) => setEditDataInicio(e.target.value)}
                  required
                  disabled={isReadOnlyEvento}
                />
              </div>

              <div className="flex flex-1 flex-col">
                <label className="text1 mt-5 mb-1 text-base text-white sm:text-xl">
                  Horário de Início
                </label>
                <input
                  type="time"
                  className={inputClass}
                  value={editHorarioInicio}
                  onChange={(e) => setEditHorarioInicio(e.target.value)}
                  required
                  disabled={isReadOnlyEvento}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 px-4 xs:px-6 sm:flex-row sm:px-8 lg:px-10">
              <div className="flex flex-1 flex-col">
                <label className="text1 mt-5 mb-1 text-base text-white sm:text-xl">
                  Data de Término
                </label>
                <input
                  type="date"
                  className={inputClass}
                  value={editDataFim}
                  onChange={(e) => setEditDataFim(e.target.value)}
                  required
                  disabled={isReadOnlyEvento}
                />
              </div>

              <div className="flex flex-1 flex-col">
                <label className="text1 mt-5 mb-1 text-base text-white sm:text-xl">
                  Horário de Término
                </label>
                <input
                  type="time"
                  className={inputClass}
                  value={editHorarioFim}
                  onChange={(e) => setEditHorarioFim(e.target.value)}
                  required
                  disabled={isReadOnlyEvento}
                />
              </div>
            </div>

            {!isReadOnlyEvento && (
              <div className="flex flex-col px-4 pb-6 xs:px-6 xs:pb-8 sm:px-8 sm:pb-10 lg:px-10">
                <button
                  type="submit"
                  className="text2 mt-6 rounded-lg border-2 px-4 py-2 text-base text-white transition-colors duration-200 hover:bg-blue-600 xs:mt-7 xs:py-3 xs:text-lg"
                >
                  Atualizar
                </button>
              </div>
            )}
          </form>
        </div>
      </AppModal>
    </div>
  );
}
