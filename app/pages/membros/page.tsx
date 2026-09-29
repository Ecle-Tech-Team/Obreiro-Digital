"use client";

import { AddButton, AppModal, DataTable, FilterButton, PageTitle, SearchField } from '@/app/components/shared/MemberStyle';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import Modal from "react-modal";
import { toast, ToastContainer } from "react-toastify";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Phone,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import MemberFormModal, {
  MemberFormData,
} from "@/app/components/memberFormModal/memberFormModal";
import MenuLateral from "@/app/components/menuLateral/menuLateral";
import { isMatriz } from "@/app/utils/auth";
import api from "../../api/api";

import "react-toastify/dist/ReactToastify.css";

interface Igreja {
  id_igreja: number;
  nome: string;
}

interface Departamento {
  id_departamento: number;
  nome: string;
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

interface User {
  id_user: number;
  id_igreja: number;
}

type SortCriteria = "recent" | "oldest" | "name-asc" | "name-desc" | "birth";

function formatBirthDate(dateString: string) {
  try {
    return format(parseISO(dateString), "dd/MM/yyyy");
  } catch {
    return dateString;
  }
}

function toInputDate(dateString: string) {
  if (!dateString) return "";
  return dateString.slice(0, 10);
}

export default function MembrosPage() {
  const [cod_membro, setCodMembro] = useState<string>("");
  const [nome, setNome] = useState<string>("");
  const [birth, setBirth] = useState<string>("");
  const [novo_convertido, setNovoConvertido] = useState<"Sim" | "Não">("Não");
  const [numero, setNumero] = useState<string>("");
  const [nome_departamento, setNomeDepartamento] = useState<number>(0);

  const [editCodMembro, setEditCodMembro] = useState<string>("");
  const [editNome, setEditNome] = useState<string>("");
  const [editBirth, setEditBirth] = useState<string>("");
  const [editNovoConvertido, setEditNovoConvertido] = useState<"Sim" | "Não">(
    "Não",
  );
  const [editNumero, setEditNumero] = useState<string>("");
  const [editNomeDepartamento, setEditNomeDepartamento] = useState<number>(0);

  const [departamento, setDepartamento] = useState<Departamento[]>([]);
  const [igreja, setIgreja] = useState<Igreja[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [allMembros, setAllMembros] = useState<Membro[]>([]);
  const [filteredMembros, setFilteredMembros] = useState<Membro[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [modalType, setModalType] = useState<"new" | "edit" | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Membro | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const specialCharactersRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  const validNameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;

  useEffect(() => {
    Modal.setAppElement("body");
  }, []);

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
    const fetchDepartamentos = async () => {
      try {
        const response = await api.get("/departamento");
        setDepartamento(response.data);
      } catch (error) {
        console.error("Error fetching departamentos:", error);
      }
    };

    fetchDepartamentos();
  }, []);

  useEffect(() => {
    const fetchMembros = async () => {
      try {
        const id_igreja = sessionStorage.getItem("id_igreja");
        const membroResponse = await api.get(`/membro/igreja/${id_igreja}`);
        setAllMembros(membroResponse.data);
        setFilteredMembros(membroResponse.data);
      } catch (error) {
        console.error("Error fetching membros:", error);
      }
    };

    fetchMembros();
  }, []);

  useEffect(() => {
    const fetchIgrejas = async () => {
      try {
        const response = await api.get("/membro/membro/igreja");
        setIgreja(response.data);
      } catch (error) {
        console.error("Error fetching igrejas:", error);
      }
    };

    fetchIgrejas();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMembros(allMembros);
      setCurrentPage(1);
      return;
    }

    const lower = searchTerm.toLowerCase();

    const filtered = allMembros.filter((membro) => {
      const nomeStr = membro.nome?.toLowerCase() || "";
      const codStr = membro.cod_membro?.toLowerCase() || "";
      const numeroStr = membro.numero || "";

      return (
        nomeStr.includes(lower) ||
        codStr.includes(lower) ||
        numeroStr.includes(lower)
      );
    });

    setFilteredMembros(filtered);
    setCurrentPage(1);
  }, [searchTerm, allMembros]);

  useEffect(() => {
    if (selectedMember) {
      setEditCodMembro(selectedMember.cod_membro || "");
      setEditNome(selectedMember.nome || "");
      setEditBirth(toInputDate(selectedMember.birth || ""));
      setEditNumero(selectedMember.numero || "");
      setEditNovoConvertido(
        selectedMember.novo_convertido === "Sim" ? "Sim" : "Não",
      );
      setEditNomeDepartamento(selectedMember.id_departamento || 0);
    }
  }, [selectedMember]);

  const sortedMembros = useMemo(() => {
    const sorted = [...filteredMembros];

    switch (sortCriteria) {
      case "recent":
        return sorted.sort((a, b) => b.id_membro - a.id_membro);
      case "oldest":
        return sorted.sort((a, b) => a.id_membro - b.id_membro);
      case "name-asc":
        return sorted.sort((a, b) => a.nome.localeCompare(b.nome));
      case "name-desc":
        return sorted.sort((a, b) => b.nome.localeCompare(a.nome));
      case "birth":
        return sorted.sort(
          (a, b) => new Date(b.birth).getTime() - new Date(a.birth).getTime(),
        );
      default:
        return sorted;
    }
  }, [filteredMembros, sortCriteria]);

  const totalPages = Math.ceil(sortedMembros.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMembros = sortedMembros.slice(startIndex, endIndex);

  const notifySuccess = (message: string) => {
    toast.success(message, {
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

  const notifyWarn = (message: string) => {
    toast.warn(message, {
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

  const notifyError = (message: string) => {
    toast.error(message, {
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

  const notifyTypingError = () => {
    notifyError("O nome não pode conter caracteres especiais.");
  };

  const notifyTypingErrorSpecial = () => {
    notifyError(
      "O nome contém caracteres inválidos. Use apenas letras, acentos, espaços, hífens e apóstrofos.",
    );
  };

  const resetNewForm = () => {
    setCodMembro("");
    setNome("");
    setBirth("");
    setNumero("");
    setNovoConvertido("Sim");
    setNomeDepartamento(0);
  };

  const resetEditForm = () => {
    setEditCodMembro("");
    setEditNome("");
    setEditBirth("");
    setEditNumero("");
    setEditNovoConvertido("Não");
    setEditNomeDepartamento(0);
  };

  const openModal = (type: "new" | "edit", membro?: Membro) => {
    setModalType(type);

    if (type === "new") {
      setSelectedMember(null);
      resetNewForm();
    } else if (type === "edit" && membro) {
      setSelectedMember(membro);
    }

    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalType(null);
    setSelectedMember(null);
    resetEditForm();
  };

  const handleDeleteClick = (id_membro: number) => {
    setMemberToDelete(id_membro);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;

    try {
      await api.delete(`/membro/${memberToDelete}`);

      setAllMembros((prev) =>
        prev.filter((m) => m.id_membro !== memberToDelete),
      );
      setFilteredMembros((prev) =>
        prev.filter((m) => m.id_membro !== memberToDelete),
      );

      notifySuccess("Membro deletado com sucesso!");
    } catch (error) {
      console.error("Erro ao remover membro:", error);
      notifyError("Erro ao remover membro.");
    } finally {
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
    }
  };

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (
        nome.trim() === "" ||
        birth === "" ||
        numero.trim() === "" ||
        nome_departamento === 0
      ) {
        notifyWarn("Todos os campos devem ser preenchidos!");
        return;
      }

      if (specialCharactersRegex.test(nome)) {
        notifyTypingError();
        return;
      }

      if (!validNameRegex.test(nome.trim())) {
        notifyTypingErrorSpecial();
        return;
      }

      const data = {
        cod_membro,
        nome: nome.trim(),
        birth,
        novo_convertido,
        numero: numero.trim(),
        id_departamento: nome_departamento,
      };

      const response = await api.post("/membro", data);
      const novoMembro = response.data;

      setAllMembros((prev) => [...prev, novoMembro]);
      setFilteredMembros((prev) => [...prev, novoMembro]);

      notifySuccess("Membro cadastrado com sucesso!");

      setTimeout(() => {
        closeModal();
        resetNewForm();
      }, 1500);
    } catch (error) {
      console.error("Erro no cadastro:", error);
      notifyError("Erro no cadastro, tente novamente.");
    }
  }

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      if (!selectedMember) {
        console.error("No selected member for update");
        return;
      }

      if (
        !editCodMembro.trim() ||
        !editNome.trim() ||
        !editBirth ||
        !editNumero.trim() ||
        !editNovoConvertido ||
        editNomeDepartamento === 0
      ) {
        notifyWarn("Todos os campos devem ser preenchidos!");
        return;
      }

      if (specialCharactersRegex.test(editNome)) {
        notifyTypingError();
        return;
      }

      if (!validNameRegex.test(editNome.trim())) {
        notifyTypingErrorSpecial();
        return;
      }

      const data = {
        cod_membro: editCodMembro.trim(),
        nome: editNome.trim(),
        birth: editBirth,
        numero: editNumero.trim(),
        novo_convertido: editNovoConvertido,
        id_departamento: editNomeDepartamento,
      };

      const response = await api.put(
        `/membro/${selectedMember.id_membro}/${selectedMember.id_igreja}`,
        data,
      );

      const membroAtualizado = response.data;

      setAllMembros((prev) =>
        prev.map((m) =>
          m.id_membro === selectedMember.id_membro
            ? { ...m, ...membroAtualizado }
            : m,
        ),
      );

      setFilteredMembros((prev) =>
        prev.map((m) =>
          m.id_membro === selectedMember.id_membro
            ? { ...m, ...membroAtualizado }
            : m,
        ),
      );

      notifySuccess("Membro atualizado com sucesso!");

      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (error) {
      console.error("Error updating member:", error);
      notifyError("Erro na atualização, tente novamente.");
    }
  };

  const renderPaginationButtons = () => {
    return Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
      let pageNum;

      if (totalPages <= 5) {
        pageNum = i + 1;
      } else if (currentPage <= 3) {
        pageNum = i + 1;
      } else if (currentPage >= totalPages - 2) {
        pageNum = totalPages - 4 + i;
      } else {
        pageNum = currentPage - 2 + i;
      }

      return (
        <button
          key={pageNum}
          onClick={() => setCurrentPage(pageNum)}
          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors duration-200 ${
            currentPage === pageNum
              ? "bg-azul text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {pageNum}
        </button>
      );
    });
  };

  function handleNewFormChange(
    field: keyof MemberFormData,
    value: string | number,
  ) {
    switch (field) {
      case "cod_membro":
        setCodMembro(String(value));
        break;
      case "nome":
        setNome(String(value));
        break;
      case "birth":
        setBirth(String(value));
        break;
      case "novo_convertido":
        setNovoConvertido(value as "Sim" | "Não");
        break;
      case "numero":
        setNumero(String(value));
        break;
      case "id_departamento":
        setNomeDepartamento(Number(value));
        break;
    }
  }

  function handleEditFormChange(
    field: keyof MemberFormData,
    value: string | number,
  ) {
    switch (field) {
      case "cod_membro":
        setEditCodMembro(String(value));
        break;
      case "nome":
        setEditNome(String(value));
        break;
      case "birth":
        setEditBirth(String(value));
        break;
      case "novo_convertido":
        setEditNovoConvertido(value as "Sim" | "Não");
        break;
      case "numero":
        setEditNumero(String(value));
        break;
      case "id_departamento":
        setEditNomeDepartamento(Number(value));
        break;
    }
  }

  const newMemberFormData: MemberFormData = {
    cod_membro,
    nome,
    birth,
    novo_convertido,
    numero,
    id_departamento: nome_departamento,
  };

  const editMemberFormData: MemberFormData = {
    cod_membro: editCodMembro,
    nome: editNome,
    birth: editBirth,
    novo_convertido: editNovoConvertido,
    numero: editNumero,
    id_departamento: editNomeDepartamento,
  };

  return (
    <div className="min-h-screen bg-fundo">
    <MenuLateral />

    <main className="app-content min-h-screen">
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
            <span aria-current="page">Membros</span>
          </li>
        </ol>
      </nav>

      <div className="mb-6 flex flex-col gap-4 lg:mb-8">
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex cursor-pointer items-center"
          >
            <PageTitle>Membros</PageTitle>

            <button
              className="ml-2 rounded-full p-2 transition-colors duration-200 hover:bg-gray-100 focus:outline-none lg:ml-4"
              aria-label="Menu de navegação"
              aria-expanded={isDropdownOpen}
              type="button"
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
              {isMatriz() && (
                <Link
                  href="/pages/igrejas"
                  className="block border-b border-gray-100 px-4 py-3 text-sm text-gray-700 transition-colors duration-200 hover:bg-blue-50 hover:text-azul sm:text-base"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Igrejas
                </Link>
              )}

              <Link
                href="/pages/obreiros"
                className="text1 block border-b border-gray-100 px-4 py-3 text-sm text-gray-700 transition-colors duration-200 hover:bg-blue-50 hover:text-azul sm:text-base"
                onClick={() => setIsDropdownOpen(false)}
              >
                Obreiros
              </Link>

              <Link
                href="/pages/departamentos"
                className="text1 block px-4 py-3 text-sm text-gray-700 transition-colors duration-200 hover:bg-blue-50 hover:text-azul sm:text-base"
                onClick={() => setIsDropdownOpen(false)}
              >
                Departamentos
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
                    placeholder="Pesquisar membros..."

                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Pesquisar membros"
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
                              ? "bg-blue-50 font-semibold text-azul"
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
                              ? "bg-blue-50 font-semibold text-azul"
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
                              ? "bg-blue-50 font-semibold text-azul"
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
                              ? "bg-blue-50 font-semibold text-azul"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setSortCriteria("name-desc");
                            setIsFilterOpen(false);
                          }}
                        >
                          Nome Z-A
                        </button>

                        <button
                          type="button"
                          className={`w-full px-4 py-2 text-left text-sm ${
                            sortCriteria === "birth"
                              ? "bg-blue-50 font-semibold text-azul"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setSortCriteria("birth");
                            setIsFilterOpen(false);
                          }}
                        >
                          Data de nascimento
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <AddButton
              type="button"
              onClick={() => openModal("new")}
              className="w-full md:w-auto"
            >              
              Novo Membro
            </AddButton>
          </div>
        </div>

        <div className="mt-6 lg:mt-8">
          {sortedMembros.length === 0 ? (
            <div className="py-12 text-center lg:py-16">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 lg:h-20 lg:w-20">
                <UserPlus className="h-8 w-8 text-gray-400 lg:h-10 lg:w-10" />
              </div>
              <h3 className="text1 mb-2 text-xl text-gray-600 lg:text-2xl">
                Nenhum membro encontrado
              </h3>
              <p className="text2 text-gray-500">
                {searchTerm
                  ? "Tente ajustar sua busca"
                  : "Adicione seu primeiro membro"}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
              <div className="hidden overflow-x-auto lg:block">
                <DataTable className="w-full">
                  <thead className="bg-azul">
                    <tr>
                      <th className="text1 px-6 py-4 text-left text-sm font-semibold text-white">
                        Cód. Membro
                      </th>
                      <th className="text1 px-6 py-4 text-left text-sm font-semibold text-white">
                        Nome
                      </th>
                      <th className="text1 px-6 py-4 text-left text-sm font-semibold text-white">
                        Telefone
                      </th>
                      <th className="text1 px-6 py-4 text-left text-sm font-semibold text-white">
                        Data de Nascimento
                      </th>
                      <th className="text1 px-6 py-4 text-left text-sm font-semibold text-white">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {paginatedMembros.map((member) => (
                      <tr
                        key={member.id_membro}
                        onClick={() => openModal("edit", member)}
                        className="cursor-pointer transition-colors duration-150 hover:bg-blue-50"
                      >
                        <td className="text2 px-6 py-4 text-gray-700">
                          {member.cod_membro}
                        </td>
                        <td className="text2 px-6 py-4 font-medium text-gray-800">
                          {member.nome}
                        </td>
                        <td className="text2 px-6 py-4 text-gray-700">
                          {member.numero}
                        </td>
                        <td className="text2 px-6 py-4 text-gray-700">
                          {formatBirthDate(member.birth)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(member.id_membro);
                            }}
                            className="rounded-lg bg-red-50 p-2 text-red-600 transition-colors duration-200 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                            aria-label="Excluir membro"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              </div>

              <div className="divide-y divide-gray-100 lg:hidden">
                {paginatedMembros.map((member) => (
                  <div
                    key={member.id_membro}
                    onClick={() => openModal("edit", member)}
                    className="cursor-pointer p-4 transition-colors duration-150 hover:bg-blue-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center">
                          <span className="text2 rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                            {member.cod_membro}
                          </span>
                        </div>

                        <h3 className="text1 mb-1 font-semibold text-gray-800">
                          {member.nome}
                        </h3>

                        <div className="text2 flex flex-wrap gap-2 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Phone className="mr-1 h-4 w-4" />
                            {member.numero}
                          </span>

                          <span className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            {formatBirthDate(member.birth)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(member.id_membro);
                        }}
                        className="ml-2 rounded-lg bg-red-50 p-2 text-red-600 transition-colors duration-200 hover:bg-red-100"
                        aria-label="Excluir membro"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {sortedMembros.length > itemsPerPage && (
                <div className="mt-6 flex flex-col items-center justify-between gap-4 p-4 xs:flex-row xs:p-6">
                  <div className="text2 text-sm text-gray-600">
                    Mostrando {startIndex + 1}-
                    {Math.min(endIndex, sortedMembros.length)} de{" "}
                    {sortedMembros.length} membros
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-gray-700 transition-colors duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Página anterior"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-1">
                      {renderPaginationButtons()}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-gray-700 transition-colors duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Próxima página"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <AppModal
          isOpen={isDeleteModalOpen}
          onRequestClose={() => setIsDeleteModalOpen(false)}
          contentLabel="Confirmar exclusão"
          className="fixed inset-0 flex items-center justify-center p-4"
          overlayClassName="fixed inset-0 bg-white bg-opacity-70"
        >
          <div className="w-full max-w-sm rounded-lg bg-white p-6">
            <h2 className="text1 mb-4 text-xl font-bold text-black">
              Confirmar Exclusão
            </h2>
            <p className="text2 mb-6 text-gray-600">
              Você tem certeza que deseja remover este membro?
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

        <MemberFormModal
          isOpen={modalIsOpen && modalType === "new"}
          mode="new"
          title="Novo Membro"
          subtitle="Cadastre um membro com nome, contato e departamento."
          submitLabel="Cadastrar membro"
          departamentos={departamento}
          formData={newMemberFormData}
          onChange={handleNewFormChange}
          onClose={closeModal}
          onSubmit={handleRegister}
        />

        <MemberFormModal
          isOpen={modalIsOpen && modalType === "edit"}
          mode="edit"
          title="Editar Membro"
          subtitle="Atualize as informações do membro selecionado."
          submitLabel="Salvar alterações"
          departamentos={departamento}
          formData={editMemberFormData}
          onChange={handleEditFormChange}
          onClose={closeModal}
          onSubmit={handleUpdate}
        />
      </div>

      <ToastContainer />
      </main>
    </div>
  );
}
