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
import close from "@/public/icons/close.svg";
import lixo from "@/public/icons/delete.svg";
import filter from "@/public/icons/filter.png";

interface Igreja {
  id_igreja: number;
  nome: string;
}

interface User {
  id_user: number;
  id_igreja: number;
}

interface Estoque {
  id_produto: number;
  cod_produto: string;
  categoria: string;
  nome_produto: string;
  quantidade: number;
  validade: string;
  preco_unitario: number;
  id_igreja: number;
}

export default function estoque() {
  const [cod_produto, setCodProduto] = useState<string>("");
  const [nome_produto, setNomeProduto] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("");
  const [quantidade, setQuantidade] = useState<number>(0);
  const [validade, setValidade] = useState<string>("");
  const [preco_unitario, setPrecoUnitario] = useState<number>(0);

  const [editCodProduto, setEditCodProduto] = useState<string>("");
  const [editNomeProduto, setEditNomeProduto] = useState<string>("");
  const [editCategoria, setEditCategoria] = useState<string>("");
  const [editQuantidade, setEditQuantidade] = useState<number>(0);
  const [editValidade, setEditValidade] = useState<string>("");
  const [editPrecoUnitario, setEditPrecoUnitario] = useState<number>(0);

  const [modalType, setModalType] = useState<"new" | "edit" | null>(null);

  const [produtos, setProdutos] = useState<Estoque[]>([]);

  const [user, setUser] = useState<User | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [produtoToDelete, setProdutoToDelete] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [allEstoque, setAllEstoque] = useState<Estoque[]>([]); // Lista completa
  const [filteredEstoque, setFilteredEstoque] = useState<Estoque[]>([]); // Lista filtrada
  const handleDeleteClick = (id_produto: number) => {
    setProdutoToDelete(id_produto);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!produtoToDelete) return;

    try {
      await api.delete(`/estoque/${produtoToDelete}`);
      const notifyDelete = () => {
        toast.success("Produto deletado com sucesso!", {
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

      setProdutos(produtos.filter((m) => m.id_produto !== produtoToDelete));
      notifyDelete();
    } catch (error) {
      toast.error("Erro ao remover membro.");
    } finally {
      setIsDeleteModalOpen(false);
      setProdutoToDelete(null);
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
    const fetchUserData = async () => {
      try {
        const id_igreja = sessionStorage.getItem("id_igreja");

        const estoqueResponse = await api.get(`/estoque/${id_igreja}`);
        setAllEstoque(estoqueResponse.data);
        setFilteredEstoque(estoqueResponse.data);
        console.log("ID Igreja recebido:", id_igreja);
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
      setFilteredEstoque(allEstoque);
      return;
    }

    const lowercasedTerm = term.toLowerCase();

    const filtered = allEstoque.filter((produto) => {
      // Converte todos os campos para string antes de verificar
      const nomeStr = produto.nome_produto
        ? produto.nome_produto.toString().toLowerCase()
        : "";
      const codStr = produto.cod_produto
        ? produto.cod_produto.toString().toLowerCase()
        : "";

      return (
        nomeStr.includes(lowercasedTerm) || codStr.includes(lowercasedTerm)
      );
    });

    setFilteredEstoque(filtered);
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<
    "recent" | "oldest" | "name-asc" | "name-desc" | "birth"
  >("recent");

  const sortEstoque = (produtos: Estoque[]) => {
    const sorted = [...produtos];

    switch (sortCriteria) {
      case "recent":
        // Adicionados recentemente (maior ID primeiro)
        return sorted.sort((a, b) => b.id_produto - a.id_produto);

      case "oldest":
        // Adicionados há mais tempo (menor ID primeiro)
        return sorted.sort((a, b) => a.id_produto - b.id_produto);

      case "name-asc":
        // Ordem alfabética A-Z
        return sorted.sort((a, b) =>
          a.nome_produto.localeCompare(b.nome_produto)
        );

      case "name-desc":
        // Ordem alfabética Z-A
        return sorted.sort((a, b) =>
          b.nome_produto.localeCompare(a.nome_produto)
        );

      case "birth":
        // Por data de nascimento (mais jovens primeiro)
        return sorted.sort(
          (a, b) =>
            new Date(b.validade).getTime() - new Date(a.validade).getTime()
        );

      default:
        return sorted;
    }
  };

  const sortedEstoque = sortEstoque(filteredEstoque);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = (type: "new" | "edit", produto?: Estoque) => {
    setModalType(type);
    if (type === "new") {
      setCodProduto("");
      setNomeProduto("");
      setCategoria("");
      setQuantidade(0);
      setValidade("");
      setPrecoUnitario(0);
    } else if (type === "edit" && produto) {
      setSelectedProduto(produto);
      setEditCodProduto(produto.cod_produto);
      setEditNomeProduto(produto.nome_produto);
      setEditCategoria(produto.categoria);
      setEditQuantidade(produto.quantidade);
      setEditValidade(format(new Date(produto.validade), "yyyy-MM-dd"));
      setEditPrecoUnitario(produto.preco_unitario);
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

  const [selectedProduto, setSelectedProduto] = useState<Estoque | null>(null);

  useEffect(() => {
    if (selectedProduto) {
      setCodProduto(selectedProduto.cod_produto || "");
      setNomeProduto(selectedProduto.nome_produto || "");
      setCategoria(selectedProduto.categoria || "");
      setQuantidade(selectedProduto.quantidade || 0);
      setValidade(selectedProduto.validade || "");
      setPrecoUnitario(selectedProduto.preco_unitario || 0);
    }
  }, [selectedProduto]);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();

    const specialCharactersRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    const invalidCharactersRegex = /[^a-zA-Z\s]/;

    const notifySuccess = () => {
      toast.success("Produto cadastrado com sucesso!", {
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
        cod_produto === "" ||
        nome_produto === "" ||
        categoria === "" ||
        validade === "" ||
        preco_unitario === 0
      ) {
        notifyWarn();
        return;
      } else if (specialCharactersRegex.test(nome_produto)) {
        notifyTypingError();
        return;
      } else if (invalidCharactersRegex.test(nome_produto)) {
        notifyTypingErrorSpecial();
        return;
      } else {
        const data = {
          cod_produto,
          nome_produto,
          categoria,
          quantidade,
          validade,
          preco_unitario,
        };

        const response = await api.post("/estoque", data);

        notifySuccess();

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch {
      notifyError();
    }
  }

  const handleUpdate = async (produto: Estoque | null) => {
    const notifySuccess = () => {
      toast.success("Produto atualizado com sucesso!", {
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
      if (!produto) {
        console.error("No selected produto for update");
        return;
      }

      if (
        !editCodProduto ||
        !editNomeProduto ||
        !editCategoria ||
        !editQuantidade ||
        !editValidade ||
        !editPrecoUnitario
      ) {
        notifyWarn();
        return;
      }

      const data = {
        cod_produto: editCodProduto,
        nome_produto: editNomeProduto,
        categoria: editCategoria,
        quantidade: editQuantidade,
        validade: editValidade,
        preco_unitario: editPrecoUnitario,
      };

      setProdutos((prevProdutos) =>
        prevProdutos.map((p) =>
          p.id_produto === produto.id_produto ? { ...p, ...data } : p
        )
      );

      const response = await api.put(
        `/estoque/${produto.id_produto}/${produto.id_igreja}`,
        data
      );
      notifySuccess();

      closeModal();
      setSelectedProduto(null);
    } catch (error) {
      console.error("Error updating produto:", error);
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
              Início &#62;
            </Link>
            <Link
              href={"/../../pages/estoque"}
              className="text-cinza text-lg text3 ml-2"
            >
              Estoque &#62;
            </Link>
          </div>

          <div className="flex">
            <div className="mt-10">
              <h1 className="text-black text1 text-5xl">Estoque</h1>
            </div>

            <div className="flex">
              <div className="mt-10 relative sm:right-[5vh] md:left-[20vh] lg:left-[59vh]">
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
                        placeholder="Pesquisar produtos..."
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
                          Data de validade
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex relative sm:right-[10vh] md:left-[35vh] lg:left-[61.2vh]">
                <div className="mt-10 ml-1 flex justify-center">
                  <p
                    className="bg-azul sm:h-[5.2vh] md:h-[5.5vh] lg:h-[7vh] sm:w-[21vh] md:w-[28vh] lg:w-[32vh] sm:text-2xl md:text-2xl lg:text-3xl text-white text2 text-center content-center justify-center rounded-xl cursor-pointer hover:bg-blue-600 active:bg-blue-400"
                    onClick={() => openModal("new")}
                  >
                    Novo Produto +
                  </p>
                </div>
              </div>
            </div>

            <div className="ml-[20vh]">
              <div className="space-x-16 shadow-xl absolute rounded-xl top-[24%] sm:left-[2vh] md:left-[20vh] lg:left-[35vh] h-[72vh] max-h-[72vh] overflow-y-auto overflow-x-auto">
                {sortedEstoque.length === 0 ? (
                  <p className="text-center text-black text1 text-4xl mt-5 text-gray-4">
                    Nenhum produto encontrado.
                  </p>
                ) : (
                  <table>
                    <thead className="sticky top-0">
                      <tr className="bg-azul text-white rounded-xl">
                        <th className="text1 text-white text-2xl px-[4.9vh] py-2 ">
                          Cód. Produto
                        </th>
                        <th className="text1 text-white text-2xl px-[7.9vh] py-2">
                          Nome
                        </th>
                        <th className="text1 text-white text-2xl px-[4.9vh] py-2">
                          Categoria
                        </th>
                        <th className="text1 text-white text-2xl px-[4.9vh] py-2">
                          Quantidade
                        </th>
                        <th className="text1 text-white text-2xl px-[4.9vh] py-2">
                          Validade
                        </th>
                        <th className="text1 text-white text-2xl px-[4.9vh] py-2">
                          Preço Unitário
                        </th>
                        <th className="sm:px-1 md:px-1 lg:px-1 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedEstoque.map((prod) => (
                        <tr
                          key={prod.id_produto}
                          onClick={() => openModal("edit", prod)}
                          className="cursor-pointer hover:bg-slate-200"
                        >
                          <td className="text-center text2 text-xl py-3">
                            {prod.cod_produto}
                          </td>
                          <td className="text-center text2 text-xl py-3">
                            {prod.nome_produto}
                          </td>
                          <td className="text-center text2 text-xl py-3">
                            {prod.categoria}
                          </td>
                          <td className="text-center text2 text-xl py-3">
                            {prod.quantidade}
                          </td>
                          <td className="text-center text2 text-xl py-3">
                            {format(new Date(prod.validade), "dd/MM/yyyy")}
                          </td>
                          <td className="text-center text2 text-xl py-3">
                            {prod.preco_unitario}
                          </td>
                          <td className="text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(prod.id_produto);
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
                )}
              </div>
            </div>

            <Modal
              isOpen={isDeleteModalOpen}
              onRequestClose={() => setIsDeleteModalOpen(false)}
              contentLabel="Confirmar exclusão"
              className="fixed inset-0 flex items-center justify-center p-4"
              overlayClassName="fixed inset-0 bg-black bg-opacity-70"
            >
              <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                <h2 className="text1 text-xl text-black font-bold mb-4">
                  Confirmar Exclusão
                </h2>
                <p className="text2 text-gray-600 mb-6">
                  Você tem certeza que deseja remover este produto?
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
              contentLabel="Novo Produto"
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
                  Novo Produto
                </h2>

                <div className="flex flex-col px-10">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Cód. Produto
                  </label>

                  <input
                    type="text"
                    className="px-4 py-3 rounded-lg text2 text-black"
                    placeholder="Digite o Código..."
                    value={cod_produto}
                    onChange={(e) => {
                      setCodProduto(e.target.value);
                    }}
                    required
                  />
                </div>

                <div className="flex flex-col px-10">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Nome
                  </label>

                  <input
                    type="text"
                    className="px-4 py-3 rounded-lg text2 text-black"
                    placeholder="Digite o Código..."
                    value={nome_produto}
                    onChange={(e) => {
                      setNomeProduto(e.target.value);
                    }}
                    maxLength={150}
                    required
                  />
                </div>

                <div className="flex flex-col px-10">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Categoria
                  </label>

                  <select
                    className="bg-white px-4 py-3 rounded-lg text2 text-black"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Selecione a Categoria
                    </option>
                    <option value="Cozinha">Cozinha</option>
                    <option value="Limpeza">Limpeza</option>
                    <option value="Materiais de Construção">
                      Materiais de Construção
                    </option>
                  </select>
                </div>

                <div className="flex px-10">
                  <div className="flex flex-col">
                    <label className="text-white text1 text-xl mt-5 mb-1">
                      Quantidade
                    </label>

                    <input
                      type="number"
                      className="px-4 py-3 rounded-lg text2 text-black"
                      placeholder="Digite a Quantidade..."
                      value={quantidade}
                      onChange={(e) => setQuantidade(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="flex flex-col ml-10">
                    <label className="text-white text1 text-xl mt-5 mb-1">
                      Preço Unitário
                    </label>

                    <input
                      type="number"
                      className="px-4 py-3 rounded-lg text2 text-black"
                      placeholder="Digite o Preço Unitário..."
                      value={preco_unitario}
                      onChange={(e) => setPrecoUnitario(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col px-10">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Validade
                  </label>

                  <input
                    type="date"
                    className="px-4 py-3 rounded-lg text2 text-black"
                    placeholder="Digite o Preço Unitário..."
                    value={validade}
                    onChange={(e) => setValidade(e.target.value)}
                    required
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

            <Modal
              className="text-white flex flex-col"
              isOpen={modalIsOpen && modalType === "edit"}
              onRequestClose={closeModal}
              contentLabel="Editar Produto"
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
                  Editar Produto
                </h2>

                <div className="flex flex-col px-10">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Cód. Produto
                  </label>

                  <input
                    type="text"
                    className="px-4 py-3 rounded-lg text2 text-black"
                    placeholder="Digite o Código..."
                    value={editCodProduto}
                    onChange={(e) => {
                      setEditCodProduto(e.target.value);
                    }}
                    required
                  />
                </div>

                <div className="flex flex-col px-10">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Nome
                  </label>

                  <input
                    type="text"
                    className="px-4 py-3 rounded-lg text2 text-black"
                    placeholder="Digite o Código..."
                    value={editNomeProduto}
                    onChange={(e) => {
                      setEditNomeProduto(e.target.value);
                    }}
                    maxLength={150}
                    required
                  />
                </div>

                <div className="flex flex-col px-10">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Categoria
                  </label>

                  <select
                    className="bg-white px-4 py-3 rounded-lg text2 text-black"
                    value={editCategoria}
                    onChange={(e) => setEditCategoria(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Selecione a Categoria
                    </option>
                    <option value="Cozinha">Cozinha</option>
                    <option value="Limpeza">Limpeza</option>
                    <option value="Materiais de Construção">
                      Materiais de Construção
                    </option>
                  </select>
                </div>

                <div className="flex px-10">
                  <div className="flex flex-col">
                    <label className="text-white text1 text-xl mt-5 mb-1">
                      Quantidade
                    </label>

                    <input
                      type="number"
                      className="px-4 py-3 rounded-lg text2 text-black"
                      placeholder="Digite a Quantidade..."
                      value={editQuantidade}
                      onChange={(e) =>
                        setEditQuantidade(Number(e.target.value))
                      }
                      required
                    />
                  </div>

                  <div className="flex flex-col ml-10">
                    <label className="text-white text1 text-xl mt-5 mb-1">
                      Preço Unitário
                    </label>

                    <input
                      type="number"
                      className="px-4 py-3 rounded-lg text2 text-black"
                      placeholder="Digite o Preço Unitário..."
                      value={editPrecoUnitario}
                      onChange={(e) =>
                        setEditPrecoUnitario(Number(e.target.value))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col px-10">
                  <label className="text-white text1 text-xl mt-5 mb-1">
                    Validade
                  </label>

                  <input
                    type="date"
                    className="px-4 py-3 rounded-lg text2 text-black"
                    placeholder="Digite o Preço Unitário..."
                    value={editValidade}
                    onChange={(e) => setEditValidade(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col px-10 pb-10">                  
                  <button
                    className="border-2 px-4 py-2 mt-7 rounded-lg text2 text-white text-lg"
                    onClick={() =>
                      selectedProduto && handleUpdate(selectedProduto)
                    }
                  >
                    Atualizar
                  </button>
                </div>
              </div>
            </Modal>
          </div>
        </div>
        <ToastContainer />
      </div>
    </main>
  );
}
