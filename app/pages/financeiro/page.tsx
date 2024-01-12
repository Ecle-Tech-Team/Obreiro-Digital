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
import onWhite from '@/public/icons/on.svg'
import offWhite from '@/public/icons/off.svg'
import onBlack from '@/public/icons/on-black.svg'
import offBlack from '@/public/icons/off-black.svg'
import saldoImg from '@/public/icons/saldo-white.svg'
import gastos from '@/public/icons/gastos.svg'
import entradas from '@/public/icons/entradas.svg'
import doacoes from '@/public/icons/doacoes.svg'

interface Saldo {
  id_saldo: number;
  saldo: number;
}

export default function financeiro() {
  const [allVisible, setAllVisible] = useState(true);
  const [saldoVisivel, setSaldoVisivel] = useState(false);
  const [gastoVisivel, setGastoVisivel] = useState(false);
  const [entradaVisivel, setEntradaVisivel] = useState(false);
  
  const [tipo, setTipo] = useState<string>('')
  const [categoria, setCategoria] = useState<string>('')
  const [valor, setValor] = useState<string>('')
  const [descricao, setDescricao] = useState<string>('')
  const [data, setData] = useState<string>('')

  const [editTipo, setEditTipo] = useState<string>('')
  const [editCategoria, setEditCategoria] = useState<string>('')
  const [editValor, setEditValor] = useState<string>('')
  const [editDescricao, setEditDescricao] = useState<string>('')
  const [editData, setEditData] = useState<string>('') 
    
  const [saldoAtual, setSaldo] = useState<Saldo | null>(null);
  
  useEffect(() => {
    const fetchSaldo = async () => {
      try {
        const response = await api.get('/financas/saldo');        
        setSaldo(response.data)
      } catch (error) {
        console.error('Error fetching saldo:', error);
      }
    };

    fetchSaldo();
  }, [])
  
  interface Financas {
    id_financas: number;
    tipo: string;
    categoria: string;
    valor: string;
    descricao: string;
    data: string;
  }

  const [financas, setFinancas] = useState<Financas[]>([]);

  useEffect(() => {
    const fetchFinancas = async () => {
      try {
        const response = await api.get('/financas/financas');
        setFinancas(response.data);
      } catch (error) {
        console.error('Error fetching finanças:', error)
      }
    };

    fetchFinancas()
  }, []);

  const [modalType, setModalType] = useState<'new' | 'edit' | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = (type: 'new' | 'edit', financas?: Financas) => {
    setModalType(type);
    if (type === 'new') {
      setTipo('');
      setCategoria('');
      setValor('');
      setDescricao('');
      setData('');      
    } else if (type === 'edit'&& financas) {
      setSelectedFinancas(financas);
      setEditTipo(financas.tipo);
      setEditCategoria(financas.categoria);
      setEditValor(financas.valor);
      setEditDescricao(financas.descricao);
      setEditData(format(new Date(financas.data), 'yyyy-MM-dd'));      
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalType(null);
  };

  const [selectedFinancas, setSelectedFinancas] = useState<Financas | null>(null)

  useEffect(() => {
    if (selectedFinancas) {
      setTipo(selectedFinancas.tipo || '');
      setCategoria(selectedFinancas.categoria || '');
      setValor(selectedFinancas.valor || '');
      setDescricao(selectedFinancas.descricao || '');
      setData(selectedFinancas.data || '');      
    }
  }, [selectedFinancas]);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();

    const notifySuccess = () => {
      toast.success('Movimentação realizada com sucesso!', {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        });
    }

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
    }

    const notifyError = () => {
      toast.error('Erro na movimentação, Tente novamente.', {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }

    try {
      if (tipo === "Selecione um Tipo" || categoria === "Selecione" || valor === "" || descricao === "" || data === "") {
        notifyWarn();
        return;
      } else {
        const dados = {
          tipo,
          categoria,
          valor,
          descricao,
          data
        }

        const response = await api.post('/financas', dados)

        notifySuccess()

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch {
      notifyError();
    }
  }

  const handleUpdate = async (financas: Financas | null) => {
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

    try {
      if(!financas) {
        console.error('No selected financas for update');
        return;
      }

      if (!editTipo || !editCategoria || !editValor || !editDescricao || !editData) {
        notifyWarn();
        return;
      }

      const dados = {
        tipo: editTipo,
        categoria: editCategoria,
        valor: editValor,
        descricao: editDescricao,
        data: editData
      }

      const response = await api.put(`/financas/${financas?.id_financas}`, dados);

      notifySuccess();
  
      closeModal();
      setSelectedFinancas(null);
    } catch (error) {
      console.error('Error updating financas:', error);
      notifyError();
    }
  }

  return (
    <main>
      <div className='flex'>
        <MenuLateral/>
        <div className='ml-[20vh]'>
          <div className='flex mt-12'>
            <Link href={'/../../pages/inicio'} className='text-cinza text-lg text3'>Início &#62;</Link>
            <Link href={'/../../pages/financeiro'} className='text-cinza text-lg text3 ml-2'>Financeiro &#62;</Link>
          </div>

          <div className='flex'>            
            <div className='mt-10 flex'>
              <h1 className='text-black text1 text-5xl'>Financeiro</h1>
              <button onClick={() => {
                setAllVisible(!allVisible);
                setSaldoVisivel(!allVisible); 
                setEntradaVisivel(!allVisible); 
                setGastoVisivel(!allVisible); 
              }}>
                <Image className='absolute left-[80vh] top-[13.2vh]' src={allVisible ? onBlack : offBlack} width={50} height={50} alt=''/>
              </button>
            </div>

            <div className='flex mt-10 ml-10 relative left-[70.6vh]'>
              <p className='bg-azul px-10 py-2.5 text-white text2 text-3xl rounded-xl cursor-pointer' onClick={() => openModal('new')}>
                Nova Movimentação +
              </p>
            </div>

          </div>

          <div className='flex mt-10'>
            <div className='bg-azul py-5 pl-8 w-[30vh] rounded-xl'>
              <div>
                <Image src={saldoImg} width={40} height={40} alt=''/>
                <h3 className='text-white text1 text-3xl mr-6 mt-2'>Saldo</h3>
              </div>
              <div className='flex mt-2'>              
              {allVisible && saldoVisivel && saldoAtual && (
                <p className='text-white text2 text-xl'>R$ {saldoAtual.saldo}</p>
              )}
                <button className='ml-3 mr-6' onClick={() => setSaldoVisivel(!saldoVisivel)}>
                  <Image src={saldoVisivel ? onWhite : offWhite} width={30} height={30} alt=''/>
                </button>
              </div>
            </div>

            <div className='bg-white py-5 pl-8 pr-20 rounded-xl shadow-xl ml-[6.5vh]'>
              <div>
                <Image src={gastos} width={60} height={60} alt=''/>
                <h3 className='text-black text1 text-3xl mr-6 mt-2'>Gastos</h3>
              </div>
              <div className='flex mt-2'>
                <p className='text-black text2 text-xl'>R$ 1.000,00</p>
                <button className='ml-3 mr-6'>
                  <Image src={onBlack} width={30} height={30} alt=''/>
                </button>
              </div>
            </div>

            <div className='bg-white py-5 pl-8 pr-20 rounded-xl shadow-xl ml-[6.5vh]'>
              <div>
                <Image src={entradas} width={60} height={60} alt=''/>
                <h3 className='text-black text1 text-3xl mr-6 mt-2'>Entradas</h3>
              </div>
              <div className='flex mt-2'>
                <p className='text-black text2 text-xl'>R$ 1.000,00</p>
                <button className='ml-3 mr-6'>
                  <Image src={onBlack} width={30} height={30} alt=''/>
                </button>
              </div>
            </div>            
          </div>

          <div className='ml-[20vh]'>
            <div className="space-x-16 shadow-xl absolute rounded-xl mt-10 left-[50vh] h-[54vh] max-h-[54vh] overflow-y-auto overflow-x-hidden">
              {financas.length === 0 ? (
                <p className="text-center text-black text1 text-4xl mt-5 text-gray-4">Nenhuma movimentação encontrada.</p>
              ) : (            
                <table className='text-black'>
                  <thead className='sticky top-0'>
                    <tr className='bg-azul text-white rounded-xl'>
                      <th className='text1 text-white text-2xl px-[13.9vh] py-2'>Tipo</th>
                      <th className='text1 text-white text-2xl px-[13.9vh] py-2'>Categoria</th>
                      <th className='text1 text-white text-2xl px-[13.9vh] py-2'>Valor</th>
                      <th className='text1 text-white text-2xl px-[13.9vh] py-2'>Data</th>                      
                    </tr>
                  </thead>
                  <tbody>
                    {financas.map((mov) => (                    
                      <tr key={mov.id_financas} onClick={() => mov && openModal('edit', mov)} className='cursor-pointer hover:bg-slate-200'>
                        <td className='text-center text2 text-xl py-3'>{mov.tipo}</td>
                        <td className='text-center text2 text-xl py-3'>{mov.categoria}</td>
                        <td className='text-center text2 text-xl py-3'>{mov.valor}</td>
                        <td className='text-center text2 text-xl py-3'>{format(new Date(mov.data), 'dd/MM/yyyy')}</td>
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
            contentLabel="Nova Movimentação"
          >
            <div className='flex flex-col justify-center self-center bg-azul p-10 mt-[15vh] rounded-lg shadow-xl'>
              
              <h2 className='text-white text1 text-4xl flex justify-center'>Nova Movimentação</h2>

              <div className='flex flex-col'>
                <label className='text-white text1 text-xl mt-5 mb-1'>Tipo</label>
                
                <select 
                  className='px-4 py-3 rounded-lg text2 bg-white text-slate-500' 
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                >
                  <option value="" disabled>Selecione um Tipo</option>
                  <option value="Entrada">Entrada</option>
                  <option value="Saída">Saída</option>
                </select>
              </div>  

              <div className='flex flex-col'>
                <label className='text-white text1 text-xl mt-5 mb-1'>Categoria</label>
                
                <select 
                  className='px-4 py-3 rounded-lg text2 bg-white text-slate-500' 
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                >                  
                  <option value="" disabled>Selecione</option>
                  <option value="OFerta Simples">OFerta Simples</option>
                  <option value="Oferta Especial">Oferta Especial</option>
                  <option value="Dízimo">Dízimo</option>
                  <option value="Contribuição para Missões">Contribuição para Missões</option>
                  <option value="Contribuição para Obras">Contribuição para Obras</option>
                </select>
              </div> 

              <div className='flex'>
                <div className='flex flex-col mr-5'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Valor</label>

                  <input                    
                    type="text" 
                    className='px-4 py-3 rounded-lg text2 text-slate-500'
                    placeholder='Digite o Valor...'
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    required 
                  />
                </div>

                <div className='flex flex-col'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Data</label>

                  <input                    
                    type="date" 
                    className='px-4 py-3 rounded-lg text2 text-slate-500'
                    placeholder='Digite o Valor...'
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    required 
                    />
                </div>
              </div>

              <div className='flex flex-col'>
                <label className='text-white text1 text-xl mt-5 mb-1'>Descrição</label>

                <input                    
                  type="text" 
                  className='px-4 pt-3 pb-14 rounded-lg text2 text-slate-500'
                  placeholder='Digite a Descrição...'
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required 
                  />
              </div>

              <div className='flex flex-col'>                  
                <button className='border-2 px-4 py-3 mt-7 rounded-lg text2 text-white text-lg' onClick={handleRegister}>Enviar</button>
              </div>

            </div>
          </Modal>
          <Modal
            className="text-white flex flex-col" 
            isOpen={modalIsOpen && modalType === 'edit'} 
            onRequestClose={closeModal}
            contentLabel="Editar Movimentação"
          >
            <div className='flex flex-col justify-center self-center bg-azul p-10 mt-[15vh] rounded-lg shadow-xl'>
              
              <h2 className='text-white text1 text-4xl flex justify-center'>Editar Movimentação</h2>

              <div className='flex flex-col'>
                <label className='text-white text1 text-xl mt-5 mb-1'>Tipo</label>
                
                <select 
                  className='px-4 py-3 rounded-lg text2 bg-white text-slate-500' 
                  value={editTipo}
                  onChange={(e) => setEditTipo(e.target.value)}
                >
                  <option value="" disabled>Selecione um tipo</option>
                  <option value="Entrada">Entrada</option>
                  <option value="Saída">Saída</option>
                </select>
              </div>  

              <div className='flex flex-col'>
                <label className='text-white text1 text-xl mt-5 mb-1'>Categoria</label>
                
                <select 
                  className='px-4 py-3 rounded-lg text2 bg-white text-slate-500' 
                  value={editCategoria}
                  onChange={(e) => setEditCategoria(e.target.value)}
                >                  
                  <option value="OFerta Simples">OFerta Simples</option>
                  <option value="Oferta Especial">Oferta Especial</option>
                  <option value="Dízimo">Dízimo</option>
                  <option value="Contribuição para Missões">Contribuição para Missões</option>
                  <option value="Contribuição para Obras">Contribuição para Obras</option>
                </select>
              </div> 

              <div className='flex'>
                <div className='flex flex-col mr-5'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Valor</label>

                  <input                    
                    type="text" 
                    className='px-4 py-3 rounded-lg text2 text-slate-500'
                    placeholder='Digite o Valor...'
                    value={editValor}
                    onChange={(e) => setEditValor(e.target.value)}
                    required 
                  />
                </div>

                <div className='flex flex-col'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Data</label>

                  <input                    
                    type="date" 
                    className='px-4 py-3 rounded-lg text2 text-slate-500'
                    placeholder='Digite o Valor...'
                    value={editData}
                    onChange={(e) => setEditData(e.target.value)}
                    required 
                    />
                </div>
              </div>

              <div className='flex flex-col'>
                <label className='text-white text1 text-xl mt-5 mb-1'>Descrição</label>

                <input                    
                  type="text" 
                  className='px-4 pt-3 pb-14 rounded-lg text2 text-slate-500'
                  placeholder='Digite a Descrição...'
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                  required 
                  />
              </div>

              <div className='flex flex-col'>                  
                <button className='border-2 px-4 py-3 mt-7 rounded-lg text2 text-white text-lg' onClick={() => selectedFinancas && handleUpdate(selectedFinancas)}>Enviar</button>
              </div>

            </div>
          </Modal>

        </div>
        <ToastContainer />
      </div>
    </main>
  )
}
