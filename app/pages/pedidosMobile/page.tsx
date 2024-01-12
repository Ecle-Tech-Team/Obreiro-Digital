'use client'
import React, { useState, useEffect } from 'react'
import api from '@/app/api/api'
import MenuInferior from '@/app/components/menuInferior/menuInferior'
import MenuSuperior from '@/app/components/menuSuperior/menuSuperior'
import { format } from 'date-fns';
import Image from 'next/image'
import Modal from 'react-modal'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import cesta from '@/public/icons/cesta.svg';

export default function pedidosMobile() {
  const [nome_produto, setNomeProduto] = useState<string>('');
  const [categoria_produto, setCategoriaProduto] = useState<string>('');
  const [quantidade, setQuantidade] = useState<number>(0);
  const [data_pedido, setDataPedido] = useState<string>('');

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
    };
  }

  return (
    <main>
      <div>
        <div>
          <MenuSuperior/>
          <MenuInferior/>
        </div>

        <div className="flex">
          <h1 className='text1 text-black text-3xl ml-4'>Pedidos</h1>

          <button className='bg-azul text2 text-white py-1 px-4 rounded-lg ml-[8vh]' onClick={openModal}>Novo Pedido +</button>
        </div>

        <div className="flex justify-center">
          <div className='bg-white shadow-xl rounded-xl self-center mt-7 w-[40vh] h-[70vh]'>
            {pedidos.map((ped) => (
              <div key={ped.id_pedido} className='flex p-4'>
                <Image src={cesta} width={40} height={40} alt=''/>
                <div className="ml-4">
                  <h4 className='text1 text-black text-lg'>{ped.nome_produto}</h4>
                  <p className='text2 text-black relative bottom-1.5'>{ped.categoria_produto}</p>
                </div>
                <h4 className='flex self-center text2 text-black absolute left-[35vh]'>{format(new Date(ped.data_pedido), 'dd/MM')}</h4>
              </div>
            ))}
          </div>
        </div>

        <Modal
          className="text-white flex flex-col" 
          isOpen={modalIsOpen} 
          onRequestClose={closeModal}
          contentLabel="Novo Pedido"
        >
          <div className='flex flex-col justify-center self-center bg-azul px-5 py-6 mt-[15vh] rounded-lg shadow-xl'>
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
          <ToastContainer />
        </Modal>

      </div>
    </main>
  )
}
