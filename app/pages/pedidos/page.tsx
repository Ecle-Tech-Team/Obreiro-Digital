'use client'
import React, { useState, useEffect } from 'react'
import { format } from 'date-fns';
import MenuLateral from '@/app/components/menuLateral/menuLateral'
import Image from 'next/image';
import Link from 'next/link'
import api from '../../api/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import pedidoWhite from '@/public/icons/pedidos-white.svg';
import emAndamento from '@/public/icons/em_andamento.svg';
import recusado from '@/public/icons/recusado.svg';
import concluido from '@/public/icons/concluido.svg';
import filter from '@/public/icons/filter.png';

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

export default function pedidos() {
  const [nome_produto, setNomeProduto] = useState<string>('');
  const [categoria_produto, setCategoriaProduto] = useState<string>('');
  const [quantidade, setQuantidade] = useState<number>(0);
  const [data_pedido, setDataPedido] = useState<string>('');

  const [editNomeProduto, setEditNomeProduto] = useState<string>('');
  const [editCategoriaProduto, setEditCategoriaProduto] = useState<string>('');
  const [editQuantidade, setEditQuantidade] = useState<number>(0);
  const [editDataPedido, setEditDataPedido] = useState<string>('');

  const [status_pedido, setStatusPedido] = useState<string>('');
  // const [data_entrega, setDataEntrega] = useState<string>('');
  // const [motivo_recusa, setMotivoRecusa] = useState<string>('');
  
  const [totalPedidos, setTotalPedidos] = useState<number>(0);
  const [pedidosEntregues, setPedidosEntregues] = useState<number>(0);
  const [pedidosEmAndamento, setPedidosEmAndamento] = useState<number>(0);
  const [pedidosRecusados, setPedidosRecusados] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [allPedidos, setAllPedidos] = useState<Pedidos[]>([]); // Lista completa
  const [filteredPedidos, setFilteredPedidos] = useState<Pedidos[]>([]); //Lista filtrada

  useEffect(() => {
    const fetchTotalPedidos = async () => {
      try {
        const id_igreja = sessionStorage.getItem('id_igreja');
        const response = await api.get(`/pedido/count/total/${id_igreja}`);
        setTotalPedidos(response.data);
      } catch (error) {
        console.error('Erro ao buscar total de pedidos:', error);
      }
    }

    fetchTotalPedidos();
  }, []);

  useEffect(() => {
    const fetchPedidosEntregues = async () => {
      try {
        const id_igreja = sessionStorage.getItem('id_igreja');
        const response = await api.get(`/pedido/count/entregue/${id_igreja}`);
        setPedidosEntregues(response.data);
      } catch (error) {
        console.error('Erro ao buscar pedidos entregues:', error);
      }
    }

    fetchPedidosEntregues();
  }, []);

  useEffect(() => {
    const fetchPedidosEmAndamento = async () => {
      try {
        const id_igreja = sessionStorage.getItem('id_igreja');
        const response = await api.get(`pedido/count/em-andamento/${id_igreja}`);
        setPedidosEmAndamento(response.data);
      } catch (error) {
        console.error('Erro ao buscar pedidos em andamento:', error);
      }
    }

    fetchPedidosEmAndamento();
  }, []);

  useEffect(() => {
    const fetchPedidosRecusados = async() => {
      try {
        const id_igreja = sessionStorage.getItem('id_igreja');
        const response = await api.get(`pedido/count/recusados/${id_igreja}`);
        setPedidosRecusados(response.data);
      } catch (error) {
        console.error('Erro ao buscar pedidos em andamento:', error);
      }
    }

    fetchPedidosRecusados();
  }, []); 

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
        const response = await api.get('/pedido/igreja');
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
  
  const sortedPedidos = sortPedidos(filteredPedidos);

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
  
  const [modalType, setModalType] = useState<'new' | 'edit' | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  
  const openModal = (type: 'new' | 'edit', pedidos?: Pedidos) => {
    setModalType(type);
    if (type === 'new') {
      setNomeProduto('');
      setCategoriaProduto('');
      setQuantidade(0);
      setDataPedido('');      
    } else if (type === 'edit' && pedidos) {
      setSelectedPedidos(pedidos);
      setEditNomeProduto(pedidos.nome_produto);
      setEditCategoriaProduto(pedidos.categoria_produto);
      setEditQuantidade(pedidos.quantidade);
      setEditDataPedido(format(new Date(pedidos.data_pedido), 'yyyy-MM-dd'));
      setStatusPedido(pedidos.status_pedido);      
      // setMotivoRecusa(pedidos.motivo_recusa);
      // setDataEntrega(pedidos.data_entrega);
    }
    setModalIsOpen(true);
  }; 

  const closeModal = () => {
    setModalIsOpen(false);
    setModalType(null);
  }; 
  
  const [selectedPedidos, setSelectedPedidos] = useState<Pedidos | null>(null);

  useEffect(() => {
    if (selectedPedidos) {
      setNomeProduto(selectedPedidos.nome_produto || '');
      setCategoriaProduto(selectedPedidos.categoria_produto || '');
      setQuantidade(selectedPedidos.quantidade || 0);
      setDataPedido(selectedPedidos.data_pedido || '');
      setStatusPedido(selectedPedidos.status_pedido || '');      
    }
  }, [selectedPedidos]);
  
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
    }
  };

  const handleUpdate = async (pedidos: Pedidos | null) => {
    const notifySuccess = () => {
      toast.success('Movimentação atualizada com sucesso!', {
        position: 'top-center',
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    };

    const notifySuccessResponse = () => {
      toast.success('Pedido Respondido com sucesso!', {
        position: 'top-center',
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    };
  
    const notifyWarn = () => {
      toast.warn('Todos os campos devem ser preenchidos!', {
        position: 'top-center',
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    };
  
    const notifyError = () => {
      toast.error('Erro na atualização, Tente novamente.', {
        position: 'top-center',
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    };

    const notifyResponseFalse = () => {
      toast.error('Pedido Recusado com sucesso!', {
        position: 'top-center',
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    };

    try {
      if (!pedidos) {
        console.error('No selected pedidos for update');
        return;
      }

      if (!editNomeProduto || !editCategoriaProduto || !editQuantidade || !editDataPedido || !status_pedido ) {
        notifyWarn();
        return;
      }

      const dados = {
        nome_produto: editNomeProduto,
        categoria_produto: editCategoriaProduto,
        quantidade: editQuantidade,
        data_pedido: editDataPedido,
        status_pedido        
        // data_entrega,
        // motivo_recusa
      }

      setPedidos((prevPedidos) =>
        prevPedidos.map((u) => (u.id_pedido === pedidos.id_pedido ? { ...u, ...dados } : u))
      );

      const response = await api.put(`/pedido/${pedidos?.id_pedido}/${pedidos?.id_igreja}`, dados);

      notifySuccess();

      closeModal();
      setSelectedPedidos(null)
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error updating financas:', error);
      notifyError();
    }
  };

  return (
    <main>
      <div className='flex'>
        <MenuLateral/>
        <div className='ml-[20vh]'>
          <div className='flex mt-12'>
            <Link href={'/../../pages/inicio'} className='text-cinza text-lg text3'>Início &#62;</Link>
            <Link href={'/../../pages/pedidos'} className='text-cinza text-lg text3 ml-2'>Pedidos &#62;</Link>            
          </div>

          <div className="flex items-center">
            <div className='mt-10'>
              <h1 className='text-black text1 text-5xl'>Pedidos</h1>
            </div>
            
            <div className="flex">
              <div className="mt-10 relative sm:right-[5vh] md:left-[20vh] lg:left-[46vh]">
                <div className="flex mb-4 items-center gap-5">
                  
                  {/* Botão de filtro */}
                  <div className="flex gap-5 relative">
                    <button
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="flex items-center justify-center px-5 py-2 hover:bg-slate-200 cursor-pointer rounded-lg focus:outline-none"
                    >
                      <Image src={filter} width={30} height={30} alt="Filtrar" />
                    </button>
                  </div>
  
                  {/* Campo de pesquisa */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Pesquisar pedidos..."
                      className="sm:h-[5.2vh] md:h-[5.5vh] lg:h-[7vh] sm:w-[21vh] md:w-[28vh] lg:w-[32vh] sm:text-xl md:text-lg lg:text-xl text-gray-600 pl-5 text2 text-left content-center justify-center rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
  
                  {/* Botão de novo pedido */}
                  <button className="bg-azul sm:h-[5.2vh] md:h-[5.5vh] lg:h-[7vh] sm:w-[21vh] md:w-[28vh] lg:w-[32vh] sm:text-2xl md:text-2xl lg:text-3xl text-white text2 text-center content-center justify-center rounded-xl cursor-pointer hover:bg-blue-600 active:bg-blue-400" onClick={() => openModal ('new')}>
                    Novo Pedido +
                  </button>
  
                  {/* Dropdown de filtros */}
                  {isFilterOpen && (
                    <div className="absolute right-100 top-20 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
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

          <div className="flex mt-10">
            <div className='bg-azul py-5 pl-8 w-[32vh] rounded-xl'>
              <div>
                <Image src={pedidoWhite} width={40} height={40} alt=''/>
                <h3 className='text-white text1 text-3xl mr-6 mt-2'>Pedidos</h3>
              </div>
              <div className="flex mt-2">
                <p className='text-white text2 text-xl'>{totalPedidos}</p>
              </div>
            </div>

            <div className='bg-white py-5 pl-8 w-[32vh] rounded-xl shadow-xl ml-[4.5vh]'>
              <div>
                <Image src={emAndamento} width={60} height={40} alt=''/>
                <h3 className='text-black text1 text-3xl mr-6 mt-2'>Em Andamento</h3>
              </div>
              <div className="flex mt-2">
                <p className='text-black text2 text-xl'>{pedidosEmAndamento}</p>
              </div>
            </div>

            <div className='bg-white py-5 pl-8 w-[32vh] rounded-xl shadow-xl ml-[4.5vh]'>
              <div>
                <Image src={recusado} width={60} height={40} alt=''/>
                <h3 className='text-black text1 text-3xl mr-6 mt-2'>Recusados</h3>
              </div>
              <div className="flex mt-2">
                <p className='text-black text2 text-xl'>{pedidosRecusados}</p>
              </div>
            </div>

            <div className='bg-white py-5 pl-8 w-[32vh] rounded-xl shadow-xl ml-[4.5vh]'>
              <div>
                <Image src={concluido} width={60} height={40} alt=''/>
                <h3 className='text-black text1 text-3xl mr-6 mt-2'>Entregues</h3>
              </div>
              <div className="flex mt-2">
                <p className='text-black text2 text-xl'>{pedidosEntregues}</p>
              </div>
            </div>
          </div>

          <div className="flex">
            <div className='ml-[20vh]'>
              <div className="space-x-16 shadow-xl absolute rounded-xl mt-10 left-[50vh] h-[54vh] max-h-[54vh] overflow-y-auto overflow-x-hidden">
                {sortedPedidos.length === 0 ? (
                  <p className="text-center text-black text1 text-4xl mt-5 text-gray-4">Nenhum pedido encontrado.</p>
                ) : (
                  <table>
                    <thead className='sticky top-0'>
                      <tr className='bg-azul text-white rounded-xl'>
                        <th className='text1 text-white text-2xl px-[7.6vh] py-2 '>Nome</th>                                              
                        <th className='text1 text-white text-2xl px-[7.6vh] py-2'>Categoria</th>                      
                        <th className='text1 text-white text-2xl px-[7.6vh] py-2'>Quantidade</th>                      
                        <th className='text1 text-white text-2xl px-[7.6vh] py-2'>Status</th>                      
                        <th className='text1 text-white text-2xl px-[7.6vh] py-2'>Data do Pedido</th>                      
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPedidos.map((ped) =>(
                        <tr key={ped.id_pedido} onClick={() => ped && openModal('edit', ped)} className='cursor-pointer hover:bg-slate-200'>
                          <td className='text-center text2 text-xl py-3'>{ped.nome_produto}</td>
                          <td className='text-center text2 text-xl py-3'>{ped.categoria_produto}</td>
                          <td className='text-center text2 text-xl py-3'>{ped.quantidade}</td>
                          <td className='text-center text2 text-xl py-3'>{ped.status_pedido}</td>
                          <td className='text-center text2 text-xl py-3'>{format(new Date(ped.data_pedido), 'dd/MM/yyyy')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <Modal
              className="text-white flex flex-col" 
              isOpen={modalIsOpen && modalType === 'new'} 
              onRequestClose={closeModal}
              contentLabel="Novo Pedido"
            >
              <div className='flex flex-col justify-center self-center bg-azul p-10 mt-[20vh] rounded-lg shadow-xl'>

                <h2 className='text-white text1 text-4xl flex justify-center'>Novo Pedido</h2>

                <div className='flex flex-col mr-5'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Nome</label>

                  <input                    
                    type="text" 
                    className='px-4 py-3 rounded-lg text2 text-slate-500'
                    placeholder='Digite o Nome...'
                    value={nome_produto}
                    onChange={(e) => setNomeProduto(e.target.value)}
                    required 
                  />
                </div>

                <div className='flex flex-col mr-5'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Categoria</label>

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

                <div className="flex">
                  <div className='flex flex-col mr-5'>
                    <label className='text-white text1 text-xl mt-5 mb-1'>Quantidade</label>

                    <input                    
                      type="text" 
                      className='px-4 py-3 rounded-lg text2 text-slate-500'                      
                      value={quantidade}
                      onChange={(e) => setQuantidade(Number(e.target.value))}
                      required 
                    />
                  </div>

                  <div className='flex flex-col mr-5'>
                    <label className='text-white text1 text-xl mt-5 mb-1'>Data do Pedido</label>

                    <input                    
                      type="date" 
                      className='px-4 py-3 rounded-lg text2 text-slate-500'
                      placeholder='Digite o Nome...'
                      value={data_pedido}
                      onChange={(e) => setDataPedido(e.target.value)}
                      required 
                    />
                  </div>
                </div>                
                <button className='border-2 px-4 py-3 mt-7 rounded-lg text2 text-white text-lg' onClick={handleRegister}>Enviar</button>
              </div>
            </Modal>

            <Modal
              className="text-white flex flex-col" 
              isOpen={modalIsOpen && modalType === 'edit'} 
              onRequestClose={closeModal}
              contentLabel="Ver Pedido"
            >
              <div className='flex flex-col justify-center self-center bg-azul p-10 mt-[20vh] rounded-lg shadow-xl'>

                <h2 className='text-white text1 text-4xl flex justify-center'>Ver Pedido</h2>

                <div className='flex flex-col mr-5'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Nome</label>

                  <input                    
                    type="text" 
                    className='px-4 py-3 rounded-lg text2 text-slate-500'
                    placeholder='Digite o Nome...'
                    value={editNomeProduto}
                    onChange={(e) => setEditNomeProduto(e.target.value)}
                    required 
                  />
                </div>

                <div className='flex flex-col mr-5'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Categoria</label>

                  <select                    
                    className='px-4 py-3 rounded-lg text2 bg-white text-slate-500'
                    value={editCategoriaProduto}
                    onChange={(e) => setEditCategoriaProduto(e.target.value)}
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

                <div className="flex">
                  <div className='flex flex-col mr-5'>
                    <label className='text-white text1 text-xl mt-5 mb-1'>Quantidade</label>

                    <input                    
                      type="text" 
                      className='px-4 py-3 rounded-lg text2 text-slate-500'                      
                      value={editQuantidade}
                      onChange={(e) => setEditQuantidade(Number(e.target.value))}
                      required 
                    />
                  </div>

                  <div className='flex flex-col mr-5'>
                    <label className='text-white text1 text-xl mt-5 mb-1'>Data do Pedido</label>

                    <input                    
                      type="date" 
                      className='px-4 py-3 rounded-lg text2 text-slate-500'                      
                      value={editDataPedido}
                      onChange={(e) => setEditDataPedido(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className='flex flex-col mr-5'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Status</label>

                  <select                    
                    className='px-4 py-3 rounded-lg text2 bg-white text-slate-500'
                    value={status_pedido}
                    onChange={(e) => setStatusPedido(e.target.value)}
                    required 
                  >
                    <option value="" disabled>Selecione</option>
                    <option value="Entregue">Entregue</option>
                    <option value="Recusado">Recusar</option>                    
                  </select>     
                </div>
                
                <button className='border-2 px-4 py-3 mt-7 rounded-lg text2 text-white text-lg' onClick={() => selectedPedidos && handleUpdate(selectedPedidos)}>Atualizar</button>
              </div>
            </Modal>

          </div>
        </div>
        <ToastContainer />
      </div>
    </main>
  )
}
