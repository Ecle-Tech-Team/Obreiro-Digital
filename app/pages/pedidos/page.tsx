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
  

  useEffect(() => {
    const fetchTotalPedidos = async () => {
      try {
        const response = await api.get('/pedido/count/total');
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
        const response = await api.get('/pedido/count/entregue');
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
        const response = await api.get('pedido/count/em-andamento');
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
        const response = await api.get('pedido/count/recusados');
        setPedidosRecusados(response.data);
      } catch (error) {
        console.error('Erro ao buscar pedidos em andamento:', error);
      }
    }

    fetchPedidosRecusados();
  }, []);

  interface Pedidos {
    id_pedido: number;
    nome_produto: string;
    categoria_produto: string;
    quantidade: number;
    data_pedido: string;
    status_pedido: string;
    data_entrega: string;
    motivo_recusa: string;
  };

  const [pedidos, setPedidos] = useState<Pedidos[]>([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await api.get('/pedido');
        setPedidos(response.data);
      } catch (error) {
        console.error('Error fetching pedidos:', error)
      }
    };

    fetchPedidos();
  }, []);

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
      setEditDataPedido(pedidos.data_pedido);
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
      if(nome_produto === "" || categoria_produto === "" || quantidade === 0 || data_pedido === "") {
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

      if (!editNomeProduto || !editCategoriaProduto || !editQuantidade || !editDataPedido || !status_pedido) {
        notifyWarn();
        return;
      }

      const dados = {
        nome_produto: editNomeProduto,
        categoria_produto: editCategoriaProduto,
        quantidade: editQuantidade,
        data_pedido: editDataPedido,
        status_pedido,
        // data_entrega,
        // motivo_recusa
      }

      const response = await api.put(`/pedido/${pedidos?.id_pedido}`, dados);

      notifySuccess();

      closeModal();
      setSelectedPedidos(null)
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

          <div className="flex">
            <div className='mt-10'>
              <h1 className='text-black text1 text-5xl'>Pedidos</h1>
            </div>

            <div className='flex mt-10 ml-10 relative left-[86vh]'>
              <p className='bg-azul px-10 py-2.5 text-white text2 text-3xl rounded-xl cursor-pointer' onClick={() => openModal('new')}>
                Novo Pedido +
              </p>
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
                {pedidos.length === 0 ? (
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
                      {pedidos.map((ped) =>(
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
