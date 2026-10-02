'use client'
import { AddButton, AppModal, FilterButton, PageTitle, SearchField } from '@/app/components/shared/MemberStyle';
import React, { useState, useEffect } from 'react'
import { Search, ShoppingBasket, X } from "lucide-react";
import api from '@/app/api/api'
import MenuInferior from '@/app/components/menuInferior/menuInferior'
import MenuSuperior from '@/app/components/menuSuperior/menuSuperior'
import { format } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Igreja {
  id_igreja: number;
  nome: string;
};

interface User {
  id_user: number;
  id_igreja: number;
};

interface Pedidos {
  id_pedido: number;
  nome_produto: string;
  categoria_produto: string;
  quantidade: number;
  data_pedido: string;
  status_pedido: string;
  data_entrega: string;
  motivo_recusa: string;
  id_igreja: number;
};

export default function pedidosMobile() {
  const [nome_produto, setNomeProduto] = useState<string>('');
  const [categoria_produto, setCategoriaProduto] = useState<string>('');
  const [quantidade, setQuantidade] = useState<number>(0);
  const [data_pedido, setDataPedido] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [allPedidos, setAllPedidos] = useState<Pedidos[]>([]); // Lista completa
  const [filteredPedidos, setFilteredPedidos] = useState<Pedidos[]>([]); //Lista filtrada
  const [pedidos, setPedidos] = useState<Pedidos[]>([]);

  const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        const fetchUserData = async () => {
          try {        
            const id_igreja = sessionStorage.getItem('id_igreja');
            const pedidoResponse = await api.get(`/pedido/${id_igreja}`);
            setPedidos(pedidoResponse.data);
            setAllPedidos(pedidoResponse.data);
            setFilteredPedidos(pedidoResponse.data);

          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        };

        fetchUserData();
      }, []);

  const [igreja, setIgreja] = useState<Igreja[]>([]);

    useEffect(() => {
        const fetchIgrejas = async () => {
        try {
            const response = await api.get('/visitante/igreja');
            setIgreja(response.data);
        } catch (error) {
            console.error('Error fetching igrejas:', error);
        }
        };

        fetchIgrejas()
    }, []);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<'recent' | 'oldest' | 'name-asc' | 'name-desc' | 'birth'>('recent');

  const sortPedidos = (pedidos: Pedidos[]) => {
    const sorted = [...pedidos];

    switch (sortCriteria) {
      case 'recent':
        return sorted.sort((a, b) => b.id_pedido - a.id_pedido);
      case 'oldest':
        return sorted.sort((a, b) => a.id_pedido - b.id_pedido);
      case 'name-asc':
        return sorted.sort((a, b) => a.nome_produto.localeCompare(b.nome_produto));
      case 'name-desc':
        return sorted.sort((a, b) => b.nome_produto.localeCompare(a.nome_produto));
      case 'birth':
        return sorted.sort((a, b) => 
          new Date(b.data_pedido).getTime() - new Date(a.data_pedido).getTime()
        );
      default:
        return sorted;
    }
  };

  const [searchModalIsOpen, setSearchModalIsOpen] = useState(false);

  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (term.trim() === '') {
        setFilteredPedidos(allPedidos);
        return;
    }

    const lowercasedTerm = term.toLowerCase();

    const filtered = allPedidos.filter(pedidos => {
        // Converte todos os campos para string antes de verificar
        const nomeStr = pedidos.nome_produto ? pedidos.nome_produto.toString().toLowerCase() : '';
        const catStr = pedidos.categoria_produto ? pedidos.categoria_produto.toString().toLowerCase() : '';
        const numeroStr = pedidos.data_pedido ? pedidos.data_pedido.toString() : '';

        return (
            nomeStr.includes(lowercasedTerm) ||
            catStr.includes(lowercasedTerm) ||
            numeroStr.includes(lowercasedTerm)
        );
    });

    setFilteredPedidos(filtered);
  };

const sortedPedidos = sortPedidos(filteredPedidos);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();

    const notifySuccess = () => {
      toast.success('Pedido realizado com sucesso!', {
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
      toast.warn('Todos os campos devem ser preenchidos!', {
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
      toast.error('Erro no pedido, Tente novamente.', {
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
      if(nome_produto === "" || categoria_produto === "" || quantidade === 0 || data_pedido === "" ) {
        notifyWarn();
        return;
      } else {
        const data = {
          nome_produto,
          categoria_produto,
          quantidade,
          data_pedido
        };

        const response = await api.post('/pedido', data);

        notifySuccess();

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      notifyError();
    };
  }

  return (
    <main className="mobile-page">
      <div>
        <div>
          <MenuSuperior/>
          <MenuInferior/>
        </div>

        <div className="mobile-list-header">
          <PageTitle>Pedidos</PageTitle>

          <div className="flex">
            <div className="relative">
              <div className="mobile-list-controls">

                {/* Botão de filtro */}
                <div className="flex gap-2">
                  <FilterButton
                    onClick={() => setIsFilterOpen(!isFilterOpen)}

                   />
                </div>

                {/* Campo de pesquisa */}
                <div className="flex-1">
                  <SearchField
                    readOnly
                    className="cursor-pointer"
                    value={searchTerm}
                    placeholder="Pesquisar pedidos..."
                    aria-label="Abrir pesquisa de pedidos"
                    onClick={() => setSearchModalIsOpen(true)}
                    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSearchModalIsOpen(true); } }}
                  />
                </div>

                {/* Botão de novo pedido */}
                <AddButton onClick={openModal}>Novo Pedido</AddButton>

                {/* Dropdown de filtros */}
                {isFilterOpen && (
                  <div className="od-filter-menu absolute right-100 top-16 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                    <button
                        className={`block w-full text-left px-4 py-2 ${
                          sortCriteria === 'recent' ? 'bg-blue-100 text-blue-500 text1' : 'text-gray-800 hover:bg-gray-100 text1'
                        }`}

                        onClick={() => {
                          setSortCriteria('recent');
                          setIsFilterOpen(false);
                        }}
                      >
                        Adicionados recentemente
                      </button>

                      <button
                        className={`block w-full text-left px-4 py-2 ${
                          sortCriteria === 'oldest' ? 'bg-blue-100 text-blue-500 text1' : 'text-gray-800 hover:bg-gray-100 text1'
                        }`}

                        onClick={() => {
                          setSortCriteria('oldest');
                          setIsFilterOpen(false);
                        }}
                      >
                        Adicionados antigamente
                      </button>

                      <button
                        className={`block w-full text-left px-4 py-2 ${
                          sortCriteria === 'name-asc' ? 'bg-blue-100 text-blue-500 text1' : 'text-gray-800 hover:bg-gray-100 text1'
                        }`}

                        onClick={() => {
                          setSortCriteria('name-asc');
                          setIsFilterOpen(false);
                        }}
                      >
                        Nome A-Z
                      </button>

                      <button
                        className={`block w-full text-left px-4 py-2 ${
                          sortCriteria === 'name-desc' ? 'bg-blue-100 text-blue-500 text1' : 'text-gray-800 hover:bg-gray-100 text1'
                        }`}
                        onClick={() => {
                          setSortCriteria('name-desc');
                          setIsFilterOpen(false);
                        }}
                      >
                        Nome Z-A
                      </button>

                      <button
                        className={`block w-full text-left px-4 py-2 ${
                          sortCriteria === 'birth' ? 'bg-blue-100 text-blue-500 text1' : 'text-gray-800 hover:bg-gray-100 text1'
                        }`}
                        onClick={() => {
                          setSortCriteria('birth');
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

        <div className="px-4">
          <div className='bg-white shadow-xl rounded-xl mt-4 w-full min-w-0 max-h-[65vh] overflow-y-auto'>
            {sortedPedidos.map((ped) => (
              <div key={ped.id_pedido} className='flex min-w-0 gap-3 p-4'>
                <ShoppingBasket width={40} height={40} aria-hidden="true"/>
                <div className="min-w-0 flex-1">
                  <h4 className='text1 text-black text-lg leading-5'>{ped.nome_produto}</h4>
                  <p className='text2 text-black relative bottom-1.5'>{ped.categoria_produto}</p>
                </div>
                <h4 className='ml-auto shrink-0 self-center text2 text-black'>{format(new Date(ped.data_pedido), 'dd/MM')}</h4>
              </div>
            ))}
          </div>
        </div>

        <ToastContainer />
        <AppModal
          className="responsive-modal"
          isOpen={searchModalIsOpen}
          onRequestClose={() => setSearchModalIsOpen(false)}
          contentLabel="Pesquisar Pedidos"
        >
          <div className="od-modal-surface flex flex-col !p-0">
            <div className="flex items-center justify-between gap-3 bg-azul px-5 py-4">
              <h2 className="text1 !text-xl text-white sm:!text-2xl">Pesquisar pedidos</h2>
              <button type="button" onClick={() => setSearchModalIsOpen(false)} aria-label="Fechar modal" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white hover:bg-white/20">
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            <div className="flex min-w-0 gap-3 px-5 pt-5">
              <SearchField
                type="text"
                placeholder="Digite o nome, categoria ou data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              /> 

              <button
                type="button"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-azul text-white hover:bg-blue-600"
                onClick={() => {
                  handleSearch(searchTerm);
                  setSearchModalIsOpen(false);
                }}
              >
                <Search width={23} height={20} aria-label="Pesquisar" />
              </button>
            </div>


              <button
                type="button"
                className="text2 mx-5 mb-5 mt-4 min-h-11 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setSearchTerm('');
                  setSearchModalIsOpen(false);                
                  window.location.reload();              
                }}
                >
                Limpar
              </button>


          </div>
        </AppModal>

        <AppModal
          className="responsive-modal"
          isOpen={modalIsOpen} 
          onRequestClose={closeModal}
          contentLabel="Novo Pedido"
        >
          <div className='od-modal-surface flex flex-col !p-0'>
            <div className='sticky top-0 z-10 flex items-center justify-between gap-3 bg-azul px-5 py-4'>
              <h2 className='text1 text-xl text-white sm:text-2xl'>Novo Pedido</h2>
              <button type='button' onClick={closeModal} aria-label='Fechar modal' className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white hover:bg-white/20'>
                <X size={22} aria-hidden='true' />
              </button>
            </div>
            <div className='flex min-w-0 flex-col gap-4 p-5 sm:p-6'>

                <div className='flex min-w-0 flex-col gap-1'>
                  <label className='text1 text-sm text-gray-700'>Nome</label>

                  <input                    
                    type="text" 
                    className='text2 w-full min-w-0 rounded-lg border border-gray-300 bg-slate-50 px-4 py-3 text-gray-800'
                    placeholder='Digite o Nome...'
                    value={nome_produto}
                    onChange={(e) => setNomeProduto(e.target.value)}
                    maxLength={150}
                    required 
                    />
                </div>

                <div className='flex min-w-0 flex-col gap-1'>
                  <label className='text1 text-sm text-gray-700'>Categoria</label>

                  <select                    
                    className='text2 w-full min-w-0 rounded-lg border border-gray-300 bg-slate-50 px-4 py-3 text-gray-800'
                    value={categoria_produto}
                    onChange={(e) => setCategoriaProduto(e.target.value)}
                    required 
                    >
                    <option value="" disabled>Selecione</option>
                    <option value="Limpeza">Limpeza</option>
                    <option value="Cozinha">Cozinha</option>
                    <option value="Descartável">Descartável</option>
                    <option value="Material de Construção">Material de Construção</option>
                    <option value="Eletrônico">Eletrônico</option>
                    <option value="Eletroeletrônico">Eletroeletrônico</option>
                    <option value="Móvel">Móvel</option>
                  </select> 
                </div>                        


              <div className='flex min-w-0 flex-col gap-1'>
                <label className='text1 text-sm text-gray-700'>Quantidade</label>

                <input                    
                  type="text" 
                  className='text2 w-full min-w-0 rounded-lg border border-gray-300 bg-slate-50 px-4 py-3 text-gray-800'
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                  required 
                  />
              </div>

              <div className='flex min-w-0 flex-col gap-1'>
                <label className='text1 text-sm text-gray-700'>Data do Pedido</label>

                <input                    
                  type="date" 
                  className='text2 w-full min-w-0 rounded-lg border border-gray-300 bg-slate-50 px-4 py-3 text-gray-800'
                  placeholder='Digite o Nome...'
                  value={data_pedido}
                  onChange={(e) => setDataPedido(e.target.value)}
                  required 
                  />
              </div>                         
              <button className='text2 min-h-12 rounded-lg bg-azul px-4 py-3 font-semibold text-white hover:bg-blue-600' onClick={handleRegister}>Enviar</button>
            </div>
          </div>
        </AppModal>

      </div>
    </main>
  )
}
