"use client";
import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import MenuLateral from "@/app/components/menuLateral/menuLateral";
import Link from "next/link";
import Image from "next/image";
import Modal from "react-modal";
import api from "../../api/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import seta from "@/public/icons/seta-down.svg";
import close from "@/public/icons/close.svg";
import lixo from "@/public/icons/delete.svg";
import on from "@/public/icons/on.svg";
import off from "@/public/icons/off.svg";
import filter from "@/public/icons/filter.png";
import { isMatriz } from "@/app/utils/auth";

interface Igreja {
  id_igreja: number;
  nome: string;
}

interface User {
  id_user: number;
  cod_membro: string;
  nome: string;
  email: string;
  senha: string;
  birth: string;
  cargo: string;
  id_igreja: number;
}

export default function obreiros() {
  const [cod_membro, setCodMembro] = useState<string>("");
  const [nome, setNome] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [birth, setBirth] = useState<string>("");
  const [cargo, setCargo] = useState<string>("");

  const [editCodMembro, setEditCodMembro] = useState<string>("");
  const [editNome, setEditNome] = useState<string>("");
  const [editEmail, setEditEmail] = useState<string>("");
  const [editSenha, setEditSenha] = useState<string>("");
  const [editBirth, setEditBirth] = useState<string>("");
  const [editCargo, setEditCargo] = useState<string>("");

  const [modalType, setModalType] = useState<"new" | "edit" | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const handleDeleteClick = (id_user: number) => {
    setUserToDelete(id_user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await api.delete(`/cadastro/${userToDelete}`);
      const notifyDelete = () => {
        toast.success("Usuário deletado com sucesso!", {
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

      setUsers(user.filter((m) => m.id_user !== userToDelete));
      notifyDelete();
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error("Erro ao remover usuário.");
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
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

  const [user, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const id_igreja = sessionStorage.getItem("id_igreja");

        const response = await api.get(`/cadastro/obreiros/${id_igreja}`);
        setAllUsers(response.data);
        setFilteredUsers(response.data);
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
        const response = await api.get("/cadastro/cadastro/igreja");
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
      setFilteredUsers(allUsers);
      return;
    }

    const lowercasedTerm = term.toLowerCase();

    const filtered = allUsers.filter((user) => {
      // Converte todos os campos para string antes de verificar
      const nomeStr = user.nome ? user.nome.toString().toLowerCase() : "";
      const codStr = user.cod_membro
        ? user.cod_membro.toString().toLowerCase()
        : "";
      const emailStr = user.email ? user.email.toString().toLowerCase() : "";

      return (
        nomeStr.includes(lowercasedTerm) ||
        codStr.includes(lowercasedTerm) ||
        emailStr.includes(lowercasedTerm)
      );
    });

    setFilteredUsers(filtered);
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<
    "recent" | "oldest" | "name-asc" | "name-desc" | "birth"
  >("recent");

  const sortUsers = (users: User[]) => {
    const sorted = [...users];

    switch (sortCriteria) {
      case "recent":
        // Adicionados recentemente (maior ID primeiro)
        return sorted.sort((a, b) => b.id_user - a.id_user);

      case "oldest":
        // Adicionados há mais tempo (menor ID primeiro)
        return sorted.sort((a, b) => a.id_user - b.id_user);

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

  const sortedUsers = sortUsers(filteredUsers);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = (type: "new" | "edit", user?: User) => {
    setModalType(type);
    if (type === "new") {
      setCodMembro("");
      setNome("");
      setEmail("");
      setSenha("");
      setBirth("");
      setCargo("");
    } else if (type === "edit" && user) {
      setSelectedUser(user);
      setEditCodMembro(user.cod_membro);
      setEditNome(user.nome);
      setEditEmail(user.email);
      setEditSenha(user.senha);
      setEditBirth(format(new Date(user.birth), "yyyy-MM-dd"));
      setEditCargo(user.cargo);
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

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (selectedUser) {
      setCodMembro(selectedUser.cod_membro || "");
      setNome(selectedUser.nome || "");
      setEmail(selectedUser.email || "");
      setSenha(selectedUser.senha || "");
      setBirth(selectedUser.birth || "");
      setCargo(selectedUser.cargo || "");
    }
  }, [selectedUser]);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();

    const specialCharactersRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    const invalidCharactersRegex = /[^a-zA-Z\s]/;

    const notifySuccess = () => {
      toast.success("Obreiro cadastrado com sucesso!", {
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
      if (
        cod_membro === "" ||
        nome === "" ||
        email === "" ||
        senha === "" ||
        birth === "" ||
        cargo === ""
      ) {
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
          cod_membro,
          nome,
          email,
          senha,
          birth,
          cargo,
        };

        const response = await api.post("/cadastro", data);

        notifySuccess();

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch {
      notifyError();
    }
  }

  const handleUpdate = async (user: User | null) => {
    const notifySuccess = () => {
      toast.success("Obreiro Atualizado com sucesso!", {
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
      if (!user) {
        console.error("No selected user for update");
        return;
      }

      if (
        !editCodMembro ||
        !editNome ||
        !editEmail ||
        !editBirth ||
        !editCargo
      ) {
        notifyWarn();
        return;
      }

      const data = {
        cod_membro: editCodMembro,
        nome: editNome,
        email: editEmail,
        senha: editSenha,
        birth: editBirth,
        cargo: editCargo,
      };

      const response = await api.put(
        `/cadastro/${user.id_user}/${user.id_igreja}`,
        data
      );

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id_user === user.id_user ? { ...u, ...data } : u
        )
      );
      setFilteredUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id_user === user.id_user ? { ...u, ...data } : u
        )
      );

      notifySuccess();

      closeModal();
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      notifyError();
    }
  };

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
              Início
            </Link>
            <Link
              href={"/../../pages/membros"}
              className="text-cinza text-lg text3 ml-2"
            >
              Membros
            </Link>
            <Link
              href={"/../../pages/obreiros"}
              className="text-cinza text-lg text3 ml-2"
            >
              Obreiros
            </Link>
          </div>

          <div className="flex">
            <div
              className="mt-10 relative sm:right-20 md:right-2"
              ref={dropdownRef}
            >
              <button onClick={toggleDropdown} className="ml-2 flex">
                <h1 className="text-black text1 sm:mr-[2vh] sm:text-4xl md:text-4xl lg:text-5xl">
                  Obreiros
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
                    href={"/../../pages/departamentos"}
                    className="block text2 text-black text-xl p-3 rounded hover:bg-slate-200"
                  >
                    Departamentos
                  </Link>
                </div>
              )}
            </div>
            <div className="flex">
              <div className="mt-10 relative sm:right-[5vh] md:left-[20vh] lg:left-[54vh]">
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
                        placeholder="Pesquisar obreiros..."
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
                          Data de nascimento
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex relative sm:right-[10vh] md:left-[35vh] lg:left-[56vh]">
                <div className="mt-10 ml-1 flex justify-center">
                  <p
                    className="bg-azul sm:h-[5.2vh] md:h-[5.5vh] lg:h-[7vh] sm:w-[21vh] md:w-[28vh] lg:w-[32vh] sm:text-2xl md:text-2xl lg:text-3xl text-white text2 text-center content-center justify-center rounded-xl cursor-pointer hover:bg-blue-600 active:bg-blue-400"
                    onClick={() => openModal("new")}
                  >
                    Novo Obreiro +
                  </p>
                </div>
              </div>
            </div>

            <div className="space-x-16 shadow-xl absolute rounded-xl top-[24%] sm:left-[2vh] md:left-[20vh] lg:left-[35vh] h-[72vh] max-h-[72vh] overflow-y-auto overflow-x-auto">
              {sortedUsers.length > 0 ? (
                <table className="text-black w-[160vh]">
                  <thead className="sticky top-0">
                    <tr className="bg-azul text-white rounded-xl">
                      <th className="text1 text-white text-2xl sm:px-5 md:px-10 lg:px-[7.1vh] py-2">
                        Cód. Membro
                      </th>
                      <th className="text1 text-white text-2xl sm:px-5 md:px-10 lg:px-[7.3vh] py-2">
                        Nome
                      </th>
                      <th className="text1 text-white text-2xl sm:px-5 md:px-10 lg:px-[7.1vh] py-2">
                        Data de Nascimento
                      </th>
                      <th className="text1 text-white text-2xl sm:px-5 md:px-10 lg:px-[7.1vh] py-2">
                        Email
                      </th>
                      <th className="text1 text-white text-2xl sm:px-5 md:px-10 lg:px-[7.1vh] py-2">
                        Cargo
                      </th>
                      <th className="sm:px-1 md:px-1 lg:px-1 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUsers.map((obreiro) => (
                      <tr
                        key={obreiro.id_user}
                        onClick={() => openModal("edit", obreiro)}
                        className="cursor-pointer hover:bg-slate-200"
                      >
                        <td className="text-center text2 text-xl py-3">
                          {obreiro.cod_membro}
                        </td>
                        <td className="text-center text2 text-xl">
                          {obreiro.nome}
                        </td>
                        <td className="text-center text2 text-xl">
                          {format(new Date(obreiro.birth), "dd/MM/yyyy")}
                        </td>
                        <td className="text-center text2 text-xl">
                          {obreiro.email}
                        </td>
                        <td className="text-center text2 text-xl">
                          {obreiro.cargo}
                        </td>
                        <td className="text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(obreiro.id_user);
                            }}
                            className="px-2 py-1 mr-5 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <Image
                              src={lixo}
                              width={30}
                              height={40}
                              alt="lixo Icon"
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-black text1 text-4xl mt-5 text-gray-4">
                  Nenhum obreiro encontrado.
                </p>
              )}
            </div>
          </div>

          <Modal
            isOpen={isDeleteModalOpen}
            onRequestClose={() => setIsDeleteModalOpen(false)}
            contentLabel="Confirmar exclusão"
            className="fixed inset-0 flex items-center justify-center p-4"
            overlayClassName="fixed inset-0 bg-white bg-opacity-70"
          >
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h2 className="text1 text-xl text-black font-bold mb-4">
                Confirmar Exclusão
              </h2>
              <p className="text2 text-gray-600 mb-6">
                Você tem certeza que deseja remover este obreiro?
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
            contentLabel="Novo Obreiro"
          >
            <div className="flex flex-col justify-center self-center bg-azul mt-[10vh] rounded-lg shadow-xl">
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
                Novo Obreiro
              </h2>

              <div className="flex flex-col px-10">
                <label className="text-white text1 text-xl mt-5 mb-1">
                  Cód. Membro
                </label>
                <input
                  type="text"
                  className="px-4 py-3 rounded-lg text2 text-slate-500"
                  placeholder="Digite o Código..."
                  value={cod_membro}
                  onChange={(e) => setCodMembro(e.target.value)}
                  maxLength={16}
                  required
                />
              </div>

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
                  Email
                </label>
                <input
                  type="text"
                  className="px-4 py-3 rounded-lg text2 text-slate-500"
                  placeholder="Digite o Email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={150}
                  required
                />
              </div>

              <div className="flex flex-col px-10">
                <label className="text-white text1 text-xl mt-5 mb-1">
                  Senha
                </label>
                <div className="flex">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="pl-4 py-3 rounded-lg text2 text-slate-500"
                    placeholder="Digite a Senha..."
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    maxLength={16}
                  />
                  <button
                    type="button"
                    className="ml-[1vh]"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Image
                      src={showPassword ? on : off}
                      width={40}
                      height={40}
                      alt={showPassword ? "Open" : "Closed"}
                    />
                  </button>
                </div>
              </div>

              <div className="flex px-10">
                <div className="flex flex-col">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Data de Nascimento
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
                    Cargo
                  </label>
                  <select
                    className="bg-white px-4 py-3 rounded-lg text2 text-slate-500"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Selecione o Cargo
                    </option>
                    <option value="Pastor">Pastor</option>
                    <option value="Obreiro">Obreiro</option>
                  </select>
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
          </Modal>

          <Modal
            className="text-white flex flex-col"
            isOpen={modalIsOpen && modalType === "edit"}
            onRequestClose={closeModal}
            contentLabel="Editar Obreiro"
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
                Editar Obreiro
              </h2>

              <div className="flex flex-col px-10">
                <label className="text-white text1 text-xl mt-5 mb-1">
                  Cód. Membro
                </label>
                <input
                  type="text"
                  className="px-4 py-3 rounded-lg text2 text-slate-500"
                  placeholder="Digite o Código..."
                  value={editCodMembro}
                  onChange={(e) => setEditCodMembro(e.target.value)}
                  maxLength={16}
                  required
                />
              </div>

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
                  Email
                </label>
                <input
                  type="text"
                  className="px-4 py-3 rounded-lg text2 text-slate-500"
                  placeholder="Digite o Email..."
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  maxLength={150}
                  required
                />
              </div>

              <div className="flex flex-col px-10">
                <label className="text-white text1 text-xl mt-5 mb-1">
                  Senha
                </label>
                <div className="flex">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="px-4 py-3 rounded-lg text2 text-slate-500"
                    placeholder="Digite a Senha..."
                    value={editSenha}
                    onChange={(e) => setEditSenha(e.target.value)}
                    maxLength={16}
                  />
                  <button
                    type="button"
                    className="ml-[1vh]"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Image
                      src={showPassword ? on : off}
                      width={40}
                      height={40}
                      alt={showPassword ? "Open" : "Closed"}
                    />
                  </button>
                </div>
              </div>

              <div className="flex px-10">
                <div className="flex flex-col">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Data de Nascimento
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
                    Cargo
                  </label>
                  <select
                    className="bg-white px-4 py-3 rounded-lg text2 text-slate-500"
                    value={editCargo}
                    onChange={(e) => setEditCargo(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Selecione o Cargo
                    </option>
                    <option value="Pastor">Pastor</option>
                    <option value="Obreiro">Obreiro</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col px-10 pb-10">
                <button
                  className="border-2 px-4 py-2 mt-7 rounded-lg text2 text-white text-lg"
                  onClick={() => selectedUser && handleUpdate(selectedUser)}
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
