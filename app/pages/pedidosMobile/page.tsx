'use client'
import React, { useState, useEffect } from 'react'
import api from '@/app/api/api'
import MenuInferior from '@/app/components/menuInferior/menuInferior'
import MenuSuperior from '@/app/components/menuSuperior/menuSuperior'
import { format } from 'date-fns';
import Image from 'next/image'
import Modal from 'react-modal'
import close from '@/public/icons/close.svg';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import cesta from '@/public/icons/cesta.svg';
import filter from '@/public/icons/filter.png';
import lupa from '@/public/icons/lupa.svg';

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
    <main>
      <div>
        <div>
          <MenuSuperior/>
          <MenuInferior/>
        </div>

        <div className="flex gap-5 items-center">
          <h1 className='text1 text-black text-3xl ml-4'>Pedidos</h1>
          
          <div className="flex">
            <div className="mt-5 relative sm:left-[4vh] md:left-[20vh] lg:left-[54vh]">
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
                <button className="bg-azul text-3xl text2 text-white py-1 px-4 rounded-lg" onClick={openModal}>
                  +
                </button>

                {/* Dropdown de filtros */}
                {isFilterOpen && (
                  <div className="absolute right-100 top-16 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
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

        <div className="flex justify-center">
          <div className='bg-white shadow-xl rounded-xl self-center mt-4 w-[40vh] h-[70vh] overflow-y-auto'>
            {sortedPedidos.map((ped) => (
              <div key={ped.id_pedido} className='flex p-4'>
                <Image src={cesta} width={40} height={40} alt=''/>
                <div className="ml-4">
                  <h4 className='text1 text-black text-lg leading-5'>{ped.nome_produto}</h4>
                  <p className='text2 text-black relative bottom-1.5'>{ped.categoria_produto}</p>
                </div>
                <h4 className='flex self-center text2 text-black sticky left-[35vh]'>{format(new Date(ped.data_pedido), 'dd/MM')}</h4>
              </div>
            ))}
          </div>
        </div>
        
        <Modal
          className="text-white flex flex-col bg-black bg-opacity-0"
          isOpen={searchModalIsOpen}
          onRequestClose={() => setSearchModalIsOpen(false)}
          contentLabel="Pesquisar Pedidos"
        >
          <div className="flex flex-col justify-center self-center bg-white mt-[15vh] rounded-lg shadow-xl">            
            <div className='cursor-pointer flex place-content-start rounded-lg'>
              <Image onClick={() => setSearchModalIsOpen(false)} src={close} width={40} height={40} alt='close Icon' className='bg-red-500 hover:bg-red-600 rounded-tl-lg'/>
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
                  setSearchTerm('');
                  setSearchModalIsOpen(false);                
                  window.location.reload();              
                }}
                >
                Limpar
              </button>
            

          </div>
        </Modal>

        <Modal
          className="text-white flex flex-col" 
          isOpen={modalIsOpen} 
          onRequestClose={closeModal}
          contentLabel="Novo Pedido"
        >
          <div className='flex flex-col justify-center self-center bg-azul mt-[15vh] rounded-lg shadow-xl'>
            <div className='cursor-pointer flex place-content-end rounded-lg'>
              <Image onClick={closeModal} src={close} width={40} height={40} alt='close Icon' className='bg-red-500 hover:bg-red-600 rounded-tr-lg'/>
            </div>
            <div className='flex flex-col px-7 pb-10'>
              <h2 className='text-white text1 text-3xl flex justify-center'>Novo Pedido</h2>                  
              
                <div className='flex flex-col'>
                  <label className='text-white text1 text-lg mt-5 mb-1'>Nome</label>

                  <input                    
                    type="text" 
                    className='px-4 py-3 rounded-lg text2 text-slate-500'
                    placeholder='Digite o Nome...'
                    value={nome_produto}
                    onChange={(e) => setNomeProduto(e.target.value)}
                    maxLength={150}
                    required 
                    />
                </div>

                <div className='flex flex-col'>
                  <label className='text-white text1 text-lg mt-5 mb-1'>Categoria</label>

                  <select                    
                    className='px-4 py-3 rounded-lg text2 bg-white text-slate-500'
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
            

              <div className='flex flex-col'>
                <label className='text-white text1 text-lg mt-5 mb-1'>Quantidade</label>

                <input                    
                  type="text" 
                  className='px-4 py-3 rounded-lg text2 text-slate-500'                      
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                  required 
                  />
              </div>

              <div className='flex flex-col'>
                <label className='text-white text1 text-lg mt-5 mb-1'>Data do Pedido</label>

                <input                    
                  type="date" 
                  className='px-4 py-3 rounded-lg text2 text-slate-500'
                  placeholder='Digite o Nome...'
                  value={data_pedido}
                  onChange={(e) => setDataPedido(e.target.value)}
                  required 
                  />
              </div>                         
              <button className='border-2 px-4 py-2 mt-7 rounded-lg text2 text-white text-lg' onClick={handleRegister}>Enviar</button>
            </div>
          </div>
          <ToastContainer />
        </Modal>

      </div>
    </main>
  )
}
