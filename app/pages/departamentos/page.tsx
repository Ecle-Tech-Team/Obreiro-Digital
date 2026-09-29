"use client";
import { AddButton, AppModal, DataTable, FilterButton, ModalCloseButton, PageTitle, SearchField } from '@/app/components/shared/MemberStyle';
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { format } from "date-fns";
import api from "@/app/api/api";
import MenuLateral from "@/app/components/menuLateral/menuLateral";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { isMatriz } from "@/app/utils/auth";

interface Igreja {
  id_igreja: number;
  nome: string;
}

interface Departamento {
  id_departamento: number;
  nome: string;
  birth: string;
  data_congresso: string;
  qtd_membros: number;
  id_igreja: number;
}

interface User {
  id_user: number;
  id_igreja: number;
}
export default function departamentos() {
  const [nome, setNome] = useState<string>("");
  const [birth, setBirth] = useState<string>("");
  const [data_congresso, setDataCongresso] = useState<string>("");

  const [editNome, setEditNome] = useState<string>("");
  const [editBirth, setEditBirth] = useState<string>("");
  const [editDataCongresso, setEditDataCongresso] = useState<string>("");

  const [searchTerm, setSearchTerm] = useState("");
  const [allDepartamentos, setAllDepartamentos] = useState<Departamento[]>([]); // Lista completa
  const [filteredDepartamentos, setFilteredDepartamentos] = useState<
    Departamento[]
  >([]); // Lista filtrada

  const [modalType, setModalType] = useState<"new" | "edit" | null>(null);

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

  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const id_igreja = sessionStorage.getItem("id_igreja");

        const departamentoResponse = await api.get(`/departamento/${id_igreja}`);
        setAllDepartamentos(departamentoResponse.data);
        setFilteredDepartamentos(departamentoResponse.data);

      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const [igreja, setIgreja] = useState<Igreja[]>([]);

  useEffect(() => {
    const fetchIgrejas = async () => {
      try {
        const response = await api.get("/departamento/igreja");
        setIgreja(response.data);
      } catch (error) {
        console.error("Error fetching igrejas:", error);
      }
    };

    fetchIgrejas();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (term.trim() === "") {
      setFilteredDepartamentos(allDepartamentos);
      return;
    }

    const lowercasedTerm = term.toLowerCase();

    const filtered = allDepartamentos.filter((departamento) => {
      // Converte todos os campos para string antes de verificar
      const nomeStr = departamento.nome
        ? departamento.nome.toString().toLowerCase()
        : "";
      const birthStr = departamento.birth
        ? departamento.birth.toString().toLowerCase()
        : "";
      const congressoStr = departamento.data_congresso
        ? departamento.data_congresso.toString()
        : "";

      return (
        nomeStr.includes(lowercasedTerm) ||
        birthStr.includes(lowercasedTerm) ||
        congressoStr.includes(lowercasedTerm)
      );
    });

    setFilteredDepartamentos(filtered);
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<
    "recent" | "oldest" | "name-asc" | "name-desc" | "birth"
  >("recent");

  const sortDepartamentos = (departamentos: Departamento[]) => {
    const sorted = [...departamentos];

    switch (sortCriteria) {
      case "recent":
        // Adicionados recentemente (maior ID primeiro)
        return sorted.sort((a, b) => b.id_departamento - a.id_departamento);

      case "oldest":
        // Adicionados há mais tempo (menor ID primeiro)
        return sorted.sort((a, b) => a.id_departamento - b.id_departamento);

      case "name-asc":
        // Ordem alfabética A-Z
        return sorted.sort((a, b) => a.nome.localeCompare(b.nome));

      case "name-desc":
        // Ordem alfabética Z-A
        return sorted.sort((a, b) => b.nome.localeCompare(a.nome));

      case "birth":
        // Por data de nascimento (mais jovens primeiro)
        return sorted.sort(
          (a, b) => new Date(b.birth).getTime() - new Date(a.birth).getTime()
        );

      default:
        return sorted;
    }
  };

  const sortedDepartamentos = sortDepartamentos(filteredDepartamentos);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = (type: "new" | "edit", departamento?: Departamento) => {
    setModalType(type);
    if (type === "new") {
      setNome("");
      setBirth("");
      setDataCongresso("");
    } else if (type === "edit" && departamento) {
      setSelectedDepartamento(departamento);
      setEditNome(departamento.nome);
      setEditBirth(format(new Date(departamento.birth), "yyyy-MM-dd"));
      setEditDataCongresso(
        format(new Date(departamento.data_congresso), "yyyy-MM-dd")
      );
    }

    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalType(null);
  };

  const notifyTypingError = () => {
    toast.error("O nome não pode conter caracteres especiais.", {
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

  const notifyTypingErrorSpecial = () => {
    toast.error("O nome contém caracteres inválidos.", {
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

  const [selectedDepartamento, setSelectedDepartamento] =
    useState<Departamento | null>(null);

  useEffect(() => {
    if (selectedDepartamento) {
      setNome(selectedDepartamento.nome || "");
      setBirth(selectedDepartamento.birth || "");
      setDataCongresso(selectedDepartamento.data_congresso || "");
    }
  }, [selectedDepartamento]);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();

    const specialCharactersRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    const invalidCharactersRegex = /[^a-zA-Z\s]/;

    const notifySuccess = () => {
      toast.success("Departamento cadastrado com sucesso!", {
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
    };

    try {
      if (nome === "" || birth === "" || data_congresso === "") {
        notifyWarn();
        return;
      } else if (specialCharactersRegex.test(nome)) {
        notifyTypingError();
        return;
      } else if (invalidCharactersRegex.test(nome)) {
        notifyTypingErrorSpecial();
        return;
      } else {
        const data = {
          nome,
          birth,
          data_congresso,
        };

        const response = await api.post("/departamento", data);

        notifySuccess();

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch {
      notifyError();
    }
  }

  const handleUpdate = async (departamento: Departamento | null) => {
    const notifySuccess = () => {
      toast.success("Departamento Atualizado com sucesso!", {
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
      if (!departamento) {
        console.error("No selected departamentp for update");
        return;
      }

      if (!editNome || !editBirth || !editDataCongresso) {
        notifyWarn();
        return;
      }

      const data = {
        nome: editNome,
        birth: editBirth,
        data_congresso: editDataCongresso,
      };

      setDepartamentos((prevDepartamentos) =>
        prevDepartamentos.map((u) =>
          u.id_departamento === departamento.id_departamento
            ? { ...u, ...data }
            : u
        )
      );

      const response = await api.put(
        `/cadastro/${departamento.id_departamento}`,
        data
      );

      notifySuccess();

      closeModal();
      setSelectedDepartamento(null);
    } catch (error) {
      console.error("Error updating departamento:", error);
      notifyError();
    }
  };

  return (
    <main>
      <div className="flex">
        <MenuLateral />

        <div className="app-content">
          <nav className="mb-6 md:mb-0" aria-label="Navegação">
            <ol className="flex flex-wrap items-center text-sm text-gray-600">
              <li><Link href={"/../../pages/inicio"} className="text3 transition-colors hover:text-azul">Início</Link></li>
              <li className="mx-2" aria-hidden="true">&#62;</li>
              <li><Link href={"/../../pages/membros"} className="text3 transition-colors hover:text-azul">Membros</Link></li>
              <li className="mx-2" aria-hidden="true">&#62;</li>
              <li className="text3 font-semibold text-azul" aria-current="page">Departamentos</li>
            </ol>
          </nav>

          <div className="page-toolbar od-reference-toolbar mt-6">
            <div
              className="relative min-w-0"
              ref={dropdownRef}
            >
              <button onClick={toggleDropdown} className="flex items-center gap-2">
                <PageTitle>Departamentos</PageTitle>
                <ChevronDown
                  width={24}
                  height={24} aria-label="Arrow Icon"
                  className={`${
                    isDropdownOpen ? "rotate-180" : ""
                  } transition-transform`}
                />
              </button>

              {isDropdownOpen && (
                <div className="mt-4 absolute bg-white w-[16vh] shadow-lg rounded-lg z-50">
                  {isMatriz() && (
                    <Link
                      href={"/../../pages/igrejas"}
                      className="block text2 text-black text-xl p-3 rounded hover:bg-slate-200"
                    >
                      Igreja
                    </Link>
                  )}
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
                        placeholder="Pesquisar departamentos..."

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
                          Data de nascimento
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex min-w-0">
                <div className="flex justify-center">
                  <AddButton onClick={() => openModal("new")}>Novo Departamento</AddButton>
                </div>
              </div>
            </div>

            <div className="page-list-region">
              <div className="page-table-scroll mt-4 max-h-[70vh]">
                {sortedDepartamentos.length === 0 ? (
                  <p className="text-center text-black text1 text-4xl mt-5 text-gray-4">
                    Nenhum departamento encontrado.
                  </p>
                ) : (
                  <DataTable className="text-black">
                    <thead className="sticky top-0">
                      <tr className="bg-azul text-white rounded-xl">
                        <th className="text1 text-white text-2xl sm:px-5 md:px-10 lg:px-24 py-2 ">
                          Cód. Depart.
                        </th>
                        <th className="text1 text-white text-2xl sm:px-5 md:px-10 lg:px-[11.5vh] py-2">
                          Nome
                        </th>
                        <th className="text1 text-white text-2xl sm:px-5 md:px-10 lg:px-10 py-2">
                          Fundação
                        </th>
                        <th className="text1 text-white text-2xl sm:px-5 md:px-10 lg:px-10 py-2">
                          Data do Congresso
                        </th>
                        <th className="text1 text-white text-2xl sm:px-5 md:px-10 lg:pr-24 py-2">
                          Qtd. Membros
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedDepartamentos.map((departs) => (
                        <tr
                          key={departs.id_departamento}
                          onClick={() => openModal("edit", departs)}
                          className="cursor-pointer hover:bg-slate-200"
                        >
                          <td data-label="Cód. Depart." className="text-center text2 text-xl py-3">
                            {departs.id_departamento}
                          </td>
                          <td data-label="Nome" className="text-center text2 text-xl">
                            {departs.nome}
                          </td>
                          <td data-label="Fundação" className="text-center text2 text-xl">
                            {format(new Date(departs.birth), "dd/MM/yyyy")}
                          </td>
                          <td data-label="Data do Congresso" className="text-center text2 text-xl">
                            {format(
                              new Date(departs.data_congresso),
                              "dd/MM/yyyy"
                            )}
                          </td>
                          <td data-label="Qtd. Membros" className="text-center text2 text-xl">
                            {departs.qtd_membros}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </DataTable>
                )}
              </div>
            </div>
          </div>

          <AppModal
            className="text-white flex flex-col"
            isOpen={modalIsOpen && modalType === "new"}
            onRequestClose={closeModal}
            contentLabel="Novo Departamento"
          >
            <div className="flex flex-col justify-center self-center bg-azul mt-[25vh] rounded-lg shadow-xl">
              <ModalCloseButton onClick={closeModal} />
              <h2 className="text-white text1 text-4xl flex justify-center">
                Novo Departamento
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
                  required
                />
              </div>

              <div className="flex px-10">
                <div className="flex flex-col">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Data da Fundação
                  </label>

                  <input
                    type="date"
                    className="px-4 py-3 rounded-lg text2 text-slate-500"
                    value={birth}
                    onChange={(e) => setBirth(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col ml-5">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Data do Congresso
                  </label>

                  <input
                    type="date"
                    className="px-4 py-3 rounded-lg text2 text-slate-500"
                    value={data_congresso}
                    onChange={(e) => setDataCongresso(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col px-10 pb-10">
                <button
                  className="border-2 px-4 py-2 mt-7 rounded-lg text2 text-white text-lg"
                  onClick={handleRegister}
                  >
                  Enviar
                </button>
              </div>
            </div>
          </AppModal>

          <AppModal
            className="text-white flex flex-col"
            isOpen={modalIsOpen && modalType === "edit"}
            onRequestClose={closeModal}
            contentLabel="Editar Departamento"
          >
            <div className="flex flex-col justify-center self-center bg-azul mt-[25vh] rounded-lg shadow-xl">
              <ModalCloseButton onClick={closeModal} />
              <h2 className="text-white text1 text-4xl flex justify-center">
                Editar Departamento
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
                  required
                />
              </div>

              <div className="flex px-10">
                <div className="flex flex-col">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Data da Aniversário
                  </label>

                  <input
                    type="date"
                    className="px-4 py-3 rounded-lg text2 text-slate-500"
                    value={editBirth}
                    onChange={(e) => setEditBirth(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col ml-5">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Data do Congresso
                  </label>

                  <input
                    type="date"
                    className="px-4 py-3 rounded-lg text2 text-slate-500"
                    value={editDataCongresso}
                    onChange={(e) => setEditDataCongresso(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col px-10 pb-10">
                <button
                  className="border-2 px-4 py-2 mt-7 rounded-lg text2 text-white text-lg"
                  onClick={() =>
                    selectedDepartamento && handleUpdate(selectedDepartamento)
                  }
                  >
                  Enviar
                </button>
              </div>
            </div>
          </AppModal>
        </div>
        <ToastContainer />
      </div>
    </main>
  );
}
