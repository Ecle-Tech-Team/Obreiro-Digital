'use client'
import React, { useState, useEffect } from 'react'
import { format } from 'date-fns';
import MenuLateral from '@/app/components/menuLateral/menuLateral'
import Link from 'next/link'
import Modal from 'react-modal'
import api from '../../api/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function estoque() {
  const [cod_produto, setCodProduto] = useState<string>('');
  const [nome_produto, setNomeProduto] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('');
  const [quantidade, setQuantidade] = useState<number>(0);
  const [validade, setValidade] = useState<string>('');
  const [preco_unitario, setPrecoUnitario] = useState<number>(0);

  const [editCodProduto, setEditCodProduto] = useState<string>('');
  const [editNomeProduto, setEditNomeProduto] = useState<string>('');
  const [editCategoria, setEditCategoria] = useState<string>('');
  const [editQuantidade, setEditQuantidade] = useState<number>(0);
  const [editValidade, setEditValidade] = useState<string>('');
  const [editPrecoUnitario, setEditPrecoUnitario] = useState<number>(0);

  const [modalType, setModalType] = useState<'new' | 'edit' | null>(null);

  interface Estoque {
    id_produto: number,
    cod_produto: string, 
    categoria: string, 
    nome_produto: string, 
    quantidade: number, 
    validade: string, 
    preco_unitario: number,
  };

  const [produtos, setProdutos] = useState<Estoque[]>([]);

  useEffect(() => {
    const fetchEstoque = async () => {
      try {
        const response = await api.get('/estoque');
        setProdutos(response.data);
      } catch (error) {
        console.error('Error fetching Estoque:', error);
      }
    };

    fetchEstoque();
  }, []);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = (type: 'new' | 'edit', produto?: Estoque) => {
    setModalType(type);
    if (type === 'new') {      
      setCodProduto('');
      setNomeProduto('');
      setCategoria('');
      setQuantidade(0);
      setValidade('');
      setPrecoUnitario(0);
    } else if (type === 'edit' && produto) {     
      setSelectedProduto(produto); 
      setEditCodProduto(produto.cod_produto);
      setEditNomeProduto(produto.nome_produto);
      setEditCategoria(produto.categoria);
      setEditQuantidade(produto.quantidade);
      setEditValidade(format(new Date(produto.validade), 'yyyy-MM-dd'));
      setEditPrecoUnitario(produto.preco_unitario);
    }

    setModalIsOpen(true);
  };
    
  const closeModal = () => {
    setModalIsOpen(false);
    setModalType(null);
  };

  const notifyTypingError = () => {
    toast.error('O nome não pode conter caracteres especiais.', {
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
    toast.error('O nome contém caracteres inválidos.', {
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
    if(selectedProduto) {
      setCodProduto(selectedProduto.cod_produto || '');
      setNomeProduto(selectedProduto.nome_produto || '');
      setCategoria(selectedProduto.categoria || '')
      setQuantidade(selectedProduto.quantidade || 0);
      setValidade(selectedProduto.validade || '');
      setPrecoUnitario(selectedProduto.preco_unitario || 0);
    }
  }, [selectedProduto]);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();        

    const specialCharactersRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    const invalidCharactersRegex = /[^a-zA-Z\s]/;

    const notifySuccess = () => {
      toast.success('Produto cadastrado com sucesso!', {
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
      toast.error('Erro no cadastro, Tente novamente.', {
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
      if(cod_produto === "" || nome_produto === "" || categoria === "" || validade === "" ) {
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
          preco_unitario
        };

        const response = await api.post('/estoque', data);

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
      toast.success('Produto atualizado com sucesso!', {
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
      if (!produto) {
        console.error('No selected produto for update');
        return;
      }

      if (!editCodProduto || !editNomeProduto || !editCategoria || !editQuantidade || !editValidade || !editPrecoUnitario) {
        notifyWarn();
        return;
      }

      const data = {
        cod_produto: editCodProduto,
        nome_produto: editNomeProduto,
        categoria: editCategoria,
        quantidade: editQuantidade,
        validade: editValidade,
        preco_unitario: editPrecoUnitario
      };

      setProdutos((prevProdutos) =>
        prevProdutos.map((p) => (p.id_produto === produto.id_produto ? { ...p, ...data } : p))
      );

      const response = await api.put(`/estoque/${produto.id_produto}`, data);
      notifySuccess();
  
      closeModal();
      setSelectedProduto(null);
    } catch (error) {
      console.error('Error updating produto:', error);
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
            <Link href={'/../../pages/estoque'} className='text-cinza text-lg text3 ml-2'>Estoque &#62;</Link>            
          </div>

          <div className="flex">
            <div className='mt-10'>
              <h1 className='text-black text1 text-5xl'>Estoque</h1>
            </div>

            <div className='flex mt-10 ml-10 relative left-[86vh]'>
              <p className='bg-azul px-10 py-2.5 text-white text2 text-3xl rounded-xl cursor-pointer' onClick={() => openModal('new')}>
                Novo Produto +
              </p>
            </div>

            <div className="ml-[20vh]">
              <div className="space-x-16 shadow-xl absolute rounded-xl top-[24%] left-[50vh] h-[72vh] max-h-[72vh] overflow-y-auto">
                {produtos.length === 0 ? (
                  <p className="text-center text-black text1 text-4xl mt-5 text-gray-4">Nenhum produto encontrado.</p>
                ) : (
                  <table>
                    <thead className='sticky top-0'>
                      <tr className='bg-azul text-white rounded-xl'>
                        <th className='text1 text-white text-2xl px-[4.9vh] py-2 '>Cód. Produto</th>
                        <th className='text1 text-white text-2xl px-[4.9vh] py-2'>Nome</th>                      
                        <th className='text1 text-white text-2xl px-[4.9vh] py-2'>Categoria</th>                      
                        <th className='text1 text-white text-2xl px-[4.9vh] py-2'>Quantidade</th>                      
                        <th className='text1 text-white text-2xl px-[4.9vh] py-2'>Validade</th>                      
                        <th className='text1 text-white text-2xl px-[4.9vh] py-2'>Preço Unitário</th>                      
                      </tr>
                    </thead>
                    <tbody>
                      {produtos.map((prod) => (
                        <tr key={prod.id_produto} onClick={() => openModal('edit', prod)} className='cursor-pointer hover:bg-slate-200'>
                          <td className='text-center text2 text-xl py-3'>{prod.cod_produto}</td>
                          <td className='text-center text2 text-xl py-3'>{prod.nome_produto}</td>
                          <td className='text-center text2 text-xl py-3'>{prod.categoria}</td>
                          <td className='text-center text2 text-xl py-3'>{prod.quantidade}</td>
                          <td className='text-center text2 text-xl py-3'>{format(new Date(prod.validade), 'dd/MM/yyyy')}</td>
                          <td className='text-center text2 text-xl py-3'>{prod.preco_unitario}</td>
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
              contentLabel="Novo Produto"
            >
              <div className='flex flex-col justify-center self-center bg-azul p-10 mt-[15vh] rounded-lg shadow-xl'>
                <h2 className='text-white text1 text-4xl flex justify-center'>Novo Produto</h2>

                <div className='flex flex-col'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Cód. Produto</label>

                  <input 
                    type="text" 
                    className='px-4 py-3 rounded-lg text2 text-slate-500'
                    placeholder='Digite o Código...'
                    value={cod_produto}
                    onChange={(e) => {setCodProduto(e.target.value)}}                     
                    required 
                  />
                </div>

                <div className='flex flex-col'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Nome</label>

                  <input 
                    type="text" 
                    className='px-4 py-3 rounded-lg text2 text-slate-500'
                    placeholder='Digite o Código...'
                    value={nome_produto}
                    onChange={(e) => {setNomeProduto(e.target.value)}}   
                    maxLength={150}                  
                    required 
                  />
                </div>
                
                <div className='flex flex-col'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Categoria</label>

                  <select                              
                    className='bg-white px-4 py-3 rounded-lg text2 text-slate-500'
                    value={categoria}
                    onChange={(e) => setCategoria (e.target.value)}                 
                    required 
                  >
                    <option value="" disabled>Selecione a Categoria</option>
                    <option value="Cozinha">Cozinha</option>
                    <option value="Limpeza">Limpeza</option>
                    <option value="Materiais de Construção">Materiais de Construção</option>
                  </select>
                </div>

                <div className="flex">
                  <div className='flex flex-col'>
                    <label className='text-white text1 text-xl mt-5 mb-1'>Quantidade</label>

                    <input 
                      type="number" 
                      className='px-4 py-3 rounded-lg text2 text-slate-500'
                      placeholder='Digite a Quantidade...'
                      value={quantidade}
                      onChange={(e) => setQuantidade (Number(e.target.value))}                    
                      required 
                    />
                  </div>

                  <div className='flex flex-col ml-10'>
                    <label className='text-white text1 text-xl mt-5 mb-1'>Preço Unitário</label>

                    <input 
                      type="number" 
                      className='px-4 py-3 rounded-lg text2 text-slate-500'
                      placeholder='Digite o Preço Unitário...'
                      value={preco_unitario}
                      onChange={(e) => setPrecoUnitario (Number(e.target.value))}                    
                      required 
                    />
                  </div>
                </div>

                <div className='flex flex-col'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Validade</label>

                  <input 
                    type="date" 
                    className='px-4 py-3 rounded-lg text2 text-slate-500'
                    placeholder='Digite o Preço Unitário...'
                    value={validade}
                    onChange={(e) => setValidade (e.target.value)}                    
                    required 
                  />
                </div>
                
                <button className='border-2 px-4 py-2 mt-7 rounded-lg text2 text-white text-lg' onClick={handleRegister}>Enviar</button>
              </div>
            </Modal>

            <Modal
              className="text-white flex flex-col" 
              isOpen={modalIsOpen && modalType === 'edit'} 
              onRequestClose={closeModal}
              contentLabel="Editar Produto"
            >
              <div className='flex flex-col justify-center self-center bg-azul p-10 mt-[15vh] rounded-lg shadow-xl'>
                <h2 className='text-white text1 text-4xl flex justify-center'>Editar Produto</h2>

                <div className='flex flex-col'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Cód. Produto</label>

                  <input 
                    type="text" 
                    className='px-4 py-3 rounded-lg text2 text-slate-500'
                    placeholder='Digite o Código...'
                    value={editCodProduto}
                    onChange={(e) => {setEditCodProduto(e.target.value)}}                     
                    required 
                  />
                </div>

                <div className='flex flex-col'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Nome</label>

                  <input 
                    type="text" 
                    className='px-4 py-3 rounded-lg text2 text-slate-500'
                    placeholder='Digite o Código...'
                    value={editNomeProduto}
                    onChange={(e) => {setEditNomeProduto(e.target.value)}}   
                    maxLength={150}                  
                    required 
                  />
                </div>
                
                <div className='flex flex-col'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Categoria</label>

                  <select                              
                    className='bg-white px-4 py-3 rounded-lg text2 text-slate-500'
                    value={editCategoria}
                    onChange={(e) => setEditCategoria (e.target.value)}                 
                    required 
                  >
                    <option value="" disabled>Selecione a Categoria</option>
                    <option value="Cozinha">Cozinha</option>
                    <option value="Limpeza">Limpeza</option>
                    <option value="Materiais de Construção">Materiais de Construção</option>
                  </select>
                </div>

                <div className="flex">
                  <div className='flex flex-col'>
                    <label className='text-white text1 text-xl mt-5 mb-1'>Quantidade</label>

                    <input 
                      type="number" 
                      className='px-4 py-3 rounded-lg text2 text-slate-500'
                      placeholder='Digite a Quantidade...'
                      value={editQuantidade}
                      onChange={(e) => setEditQuantidade (Number(e.target.value))}                    
                      required 
                    />
                  </div>

                  <div className='flex flex-col ml-10'>
                    <label className='text-white text1 text-xl mt-5 mb-1'>Preço Unitário</label>

                    <input 
                      type="number" 
                      className='px-4 py-3 rounded-lg text2 text-slate-500'
                      placeholder='Digite o Preço Unitário...'
                      value={editPrecoUnitario}
                      onChange={(e) => setEditPrecoUnitario (Number(e.target.value))}                    
                      required 
                    />
                  </div>
                </div>

                <div className='flex flex-col'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Validade</label>

                  <input 
                    type="date" 
                    className='px-4 py-3 rounded-lg text2 text-slate-500'
                    placeholder='Digite o Preço Unitário...'
                    value={editValidade}
                    onChange={(e) => setEditValidade (e.target.value)}                    
                    required 
                  />
                </div>
                
                <button className='border-2 px-4 py-2 mt-7 rounded-lg text2 text-white text-lg' onClick={() => selectedProduto && handleUpdate(selectedProduto)}>Atualizar</button>
              </div>
            </Modal>

          </div>          
        </div>
        <ToastContainer />        
      </div>
    </main>
  )
}