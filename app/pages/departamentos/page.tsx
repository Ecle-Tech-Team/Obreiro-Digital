'use client'
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '@/app/api/api';
import MenuLateral from '@/app/components/menuLateral/menuLateral';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import Link from 'next/link';

interface Igreja {
  id_igreja: number;
  nome: string;
};

interface User {
  id_user: number;
  id_igreja: number;
};

interface Departamento {
  id_departamento: number;
  nome: string;
  birth: string;
  data_congresso: string;
  id_igreja: number;
};

export default function departamentos() {  
  const [nome, setNome] = useState<string>('')
  const [birth, setBirth] = useState<string>('')
  const [data_congresso, setDataCongresso] = useState<string>('')
  const [nomeIgreja, setNomeIgreja] = useState<number>(0)

  const [editNome, setEditNome] = useState<string>('')
  const [editBirth, setEditBirth] = useState<string>('')
  const [editDataCongresso, setEditDataCongresso] = useState<string>('')
  const [editNomeIgreja, setEditNomeIgreja] = useState<number>(0)

  
  const [modalType, setModalType] = useState<'new' | 'edit' | null>(null);
  
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {        
        const userResponse = await api.get('/cadastro');
        setUser(userResponse.data);
        
        if (userResponse.data && userResponse.data.id_igreja) {
          const departamentoResponse = await api.get(`/departamento/${userResponse.data.id_igreja}`);
          setDepartamentos(departamentoResponse.data);
        }
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
        const response = await api.get('/departamento/igreja');
        setIgreja(response.data);
      } catch (error) {
        console.error('Error fetching igrejas:', error);
      }
    };

    fetchIgrejas()
  }, []);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = (type: 'new' | 'edit', departamento?: Departamento) => {
    setModalType(type);
    if (type === 'new') {     
      setNome('');      
      setBirth('');
      setDataCongresso('');
      setNomeIgreja(0)
    } else if (type === 'edit' && departamento) {     
      setSelectedDepartamento(departamento); 
      setEditNome(departamento.nome);
      setEditBirth(format(new Date(departamento.birth), 'yyyy-MM-dd'));     
      setEditDataCongresso(format(new Date(departamento.data_congresso), 'yyyy-MM-dd'));
      setEditNomeIgreja(departamento.id_igreja)      
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

  const [selectedDepartamento, setSelectedDepartamento] = useState<Departamento | null>(null);

  useEffect(() => {
    if (selectedDepartamento) {
      setNome(selectedDepartamento.nome || '');
      setBirth(selectedDepartamento.birth || '');
      setDataCongresso(selectedDepartamento.data_congresso || '');
      setNomeIgreja(selectedDepartamento.id_igreja || 0)
    };
  }, [selectedDepartamento]);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();        

    const specialCharactersRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    const invalidCharactersRegex = /[^a-zA-Z\s]/;

    const notifySuccess = () => {
      toast.success('Departamento cadastrado com sucesso!', {
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
    
    try{
      if(nome === "" || birth === "" || data_congresso === "" || nomeIgreja === 0) {
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
          id_igreja: nomeIgreja
        };           
       
        const response = await api.post('/departamento', data)           
        
        notifySuccess();

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      };
    } catch{
      notifyError();
    };
  };
  
  const handleUpdate = async (departamento: Departamento | null) => {
    const notifySuccess = () => {
      toast.success('Departamento Atualizado com sucesso!', {
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
      if (!departamento) {
        console.error('No selected departamentp for update');
        return;
      }
  
      if (!editNome || !editBirth || !editDataCongresso || !editNomeIgreja) {
        notifyWarn();
        return;
      }
  
      const data = {        
        nome: editNome,
        birth: editBirth,
        data_congresso: editDataCongresso, 
        nomeIgreja: editNomeIgreja       
      };  
      
      setDepartamentos((prevDepartamentos) =>
        prevDepartamentos.map((u) => (u.id_departamento === departamento.id_departamento ? { ...u, ...data } : u))
      );
  
      const response = await api.put(`/cadastro/${departamento.id_departamento}`, data);
  
      notifySuccess();
  
      closeModal();
      setSelectedDepartamento(null);
    } catch (error) {
      console.error('Error updating departamento:', error);
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
            <Link href={'/../../pages/membros'} className='text-cinza text-lg text3 ml-2'>Membros &#62;</Link>
            <Link href={'/../../pages/departamentos'} className='text-cinza text-lg text3 ml-2'>Departamentos &#62;</Link>
          </div>

          <div className='flex'>
            <div className='mt-10'>
              <h1 className='text-black text1 text-5xl'>Departamentos</h1>
            </div>

            <div className='flex relative left-[57vh]'>              
              <div className='mt-10 ml-10 flex justify-center'>
                <p className='bg-azul px-10 py-2.5 text-white text2 text-3xl rounded-xl cursor-pointer' onClick={() => openModal('new')}>Novo Departamento +</p>
              </div>
            </div>

            <div className='ml-[20vh]'>
              <div className="space-x-16 shadow-xl absolute rounded-xl top-[24%] left-[50vh] h-[72vh] max-h-[72vh] overflow-y-auto">
                {departamentos.length === 0 ? (
                  <p className="text-center text-black text1 text-4xl mt-5 text-gray-4">Nenhum departamento encontrado.</p>
                ) : (                                
                  <table className='text-black'>
                    <thead className='sticky top-0'>
                      <tr className='bg-azul text-white rounded-xl'>
                        <th className='text1 text-white text-2xl px-[8vh] py-2 '>Cód. Depart.</th>
                        <th className='text1 text-white text-2xl px-[12.5vh] py-2'>Nome</th>
                        <th className='text1 text-white text-2xl px-[7vh] py-2'>Data de Aniversário</th>                                             
                        <th className='text1 text-white text-2xl px-[7vh] py-2'>Data do Congresso</th>                                                               
                      </tr>
                    </thead>
                    <tbody>
                      {departamentos.map((departs) => (                      
                        <tr key={departs.id_departamento} onClick={() => openModal('edit', departs)} className='cursor-pointer hover:bg-slate-200'>
                          <td className='text-center text2 text-xl py-3'>{departs.id_departamento}</td>
                          <td className='text-center text2 text-xl'>{departs.nome}</td>
                          <td className='text-center text2 text-xl'>{format(new Date(departs.birth), 'dd/MM/yyyy')}</td>
                          <td className='text-center text2 text-xl'>{format(new Date(departs.data_congresso), 'dd/MM/yyyy')}</td>                          
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  )}
              </div>
            </div>
          </div>

          <Modal
            className="text-white flex flex-col" 
            isOpen={modalIsOpen && modalType === 'new'} 
            onRequestClose={closeModal}
            contentLabel="Novo Departamento"
          >
            <div className='flex flex-col justify-center self-center bg-azul p-10 mt-[25vh] rounded-lg shadow-xl'>
              <h2 className='text-white text1 text-4xl flex justify-center'>Novo Departamento</h2>
                
                <div className='flex flex-col'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Nome</label>

                  <input 
                    type="text" 
                    className='px-4 py-3 rounded-lg text2 text-slate-500'
                    placeholder='Digite o Nome...'
                    value={nome}
                    onChange={(e) => setNome (e.target.value)}                    
                    required 
                  />
                </div>

                <div className='flex'>
                  <div className='flex flex-col'>
                  
                    <label className='text-white text1 text-xl mt-5 mb-1'>Data da Aniversário</label>

                    <input 
                      type="date" 
                      className='px-4 py-3 rounded-lg text2 text-slate-500'
                      value={birth}
                      onChange={(e) => setBirth (e.target.value)}
                      required 
                    />
                  </div>

                  <div className='flex flex-col ml-5'>
                  
                    <label className='text-white text1 text-xl mt-5 mb-1'>Data do Congresso</label>

                    <input 
                      type="date" 
                      className='px-4 py-3 rounded-lg text2 text-slate-500'
                      value={data_congresso}
                      onChange={(e) => setDataCongresso (e.target.value)}                     
                    />
                  </div>  
                </div>

                <div className='flex flex-col'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Igreja</label>

                  <select                              
                    className='bg-white px-4 py-3 rounded-lg text2 text-slate-500'
                    value={nomeIgreja}
                    onChange={(e) => setNomeIgreja(Number(e.target.value))}                 
                    required 
                  >   
                    <option value={0} disabled>Selecione uma Igreja</option>
                    {igreja.map((igreja) => (
                      <option
                        key={igreja.id_igreja}
                        value={igreja.id_igreja}
                      >
                        {igreja.nome}
                      </option>                      
                    ))}                            
                  </select>
                </div>

                <button className='border-2 px-4 py-2 mt-7 rounded-lg text2 text-white text-lg' onClick={handleRegister}>Enviar</button>
              </div> 
          </Modal>

          <Modal
            className="text-white flex flex-col" 
            isOpen={modalIsOpen && modalType === 'edit'} 
            onRequestClose={closeModal}
            contentLabel="Editar Departamento"
          >
            <div className='flex flex-col justify-center self-center bg-azul p-10 mt-[25vh] rounded-lg shadow-xl'>
              <h2 className='text-white text1 text-4xl flex justify-center'>Editar Departamento</h2>
                
                <div className='flex flex-col'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Nome</label>

                  <input 
                    type="text" 
                    className='px-4 py-3 rounded-lg text2 text-slate-500'
                    placeholder='Digite o Nome...'
                    value={editNome}
                    onChange={(e) => setEditNome (e.target.value)}                    
                    required 
                  />
                </div>

                <div className='flex'>
                  <div className='flex flex-col'>
                  
                    <label className='text-white text1 text-xl mt-5 mb-1'>Data da Aniversário</label>

                    <input 
                      type="date" 
                      className='px-4 py-3 rounded-lg text2 text-slate-500'
                      value={editBirth}
                      onChange={(e) => setEditBirth (e.target.value)}
                      required 
                    />
                  </div>

                  <div className='flex flex-col ml-5'>
                  
                    <label className='text-white text1 text-xl mt-5 mb-1'>Data do Congresso</label>

                    <input 
                      type="date" 
                      className='px-4 py-3 rounded-lg text2 text-slate-500'
                      value={editDataCongresso}
                      onChange={(e) => setEditDataCongresso (e.target.value)}                     
                    />
                  </div>  
                </div>

                <button className='border-2 px-4 py-2 mt-7 rounded-lg text2 text-white text-lg' onClick={() => selectedDepartamento && handleUpdate(selectedDepartamento)}>Enviar</button>
              </div> 
          </Modal>
        </div>
        <ToastContainer />
      </div>
    </main>
  )
}
