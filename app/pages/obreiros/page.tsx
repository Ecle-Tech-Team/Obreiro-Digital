'use client'
import React, { useState, useEffect } from 'react'
import { format } from 'date-fns';
import MenuLateral from '@/app/components/menuLateral/menuLateral'
import Link from 'next/link'
import Image from 'next/image';
import Modal from 'react-modal'
import api from '../../api/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import on from '@/public/icons/on.svg'
import off from '@/public/icons/off.svg'

interface Igreja {
  id_igreja: number;
  nome: string;
};

interface User {
  id_user: number;
  cod_membro: string;
  nome: string;
  email: string;
  senha: string;
  birth: string;
  cargo: string;
  id_igreja: number;
};

export default function obreiros() {
  
  const [cod_membro, setCodMembro] = useState<string>('');
  const [nome, setNome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [birth, setBirth] = useState<string>('');
  const [cargo, setCargo] = useState<string>('');
  const [nomeIgreja, setNomeIgreja] = useState<number>(0);

  const [editCodMembro, setEditCodMembro] = useState<string>('');
  const [editNome, setEditNome] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editSenha, setEditSenha] = useState<string>('');
  const [editBirth, setEditBirth] = useState<string>('');
  const [editCargo, setEditCargo] = useState<string>('');
  const [editNomeIgreja, setEditNomeIgreja] = useState<number>(0);

  const [modalType, setModalType] = useState<'new' | 'edit' | null>(null);

  const [showPassword, setShowPassword] = useState(false);
 
  const [users, setUsers] = useState<User[]>([])
  
  useEffect(() =>{
    const igreja = sessionStorage.getItem("igreja");
    async function fetchUsers () {
      const response = await api.get(`/cadastro/obreiros/${igreja}`);
      setUsers(response.data);
    }
    fetchUsers();
  }, []);
    
  const [igreja, setIgreja] = useState<Igreja[]>([]);

  useEffect(() => {
    const fetchIgrejas = async () => {
      try {
        const response = await api.get('/cadastro/cadastro/igreja');
        setIgreja(response.data);
      } catch (error) {
        console.error('Error fetching igrejas:', error);
      }
    };

    fetchIgrejas()
  }, []);

  const [modalIsOpen, setModalIsOpen] = useState(false);
    
  const openModal = (type: 'new' | 'edit', user?: User) => {
    setModalType(type);
    if (type === 'new') {      
      setCodMembro('');
      setNome('');
      setEmail('');
      setSenha('');
      setBirth('');
      setCargo('');
      setNomeIgreja(0);
    } else if (type === 'edit' && user) {     
      setSelectedUser(user); 
      setEditCodMembro(user.cod_membro);
      setEditNome(user.nome);
      setEditEmail(user.email);
      setEditSenha(user.senha);
      setEditBirth(format(new Date(user.birth), 'yyyy-MM-dd'));
      setEditCargo(user.cargo);
      setEditNomeIgreja(user.id_igreja);
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
  }
    
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
  }

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (selectedUser) {
      setCodMembro(selectedUser.cod_membro || '');
      setNome(selectedUser.nome || '');
      setEmail(selectedUser.email || '');
      setSenha(selectedUser.senha || '');
      setBirth(selectedUser.birth || '');
      setCargo(selectedUser.cargo || '');
      setNomeIgreja(selectedUser.id_igreja || 0);
    }
  }, [selectedUser]);

  const [isEditMode, setIsEditMode] = useState(false);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();        

    const specialCharactersRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    const invalidCharactersRegex = /[^a-zA-Z\s]/;

    const notifySuccess = () => {
      toast.success('Obreiro cadastrado com sucesso!', {
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
    }
    
    try{
      if(cod_membro === "" || nome === "" || email === "" || senha === "" ||  birth === "" || cargo === "" || nomeIgreja === 0) {
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
          id_igreja: nomeIgreja
        }           
       
        const response = await api.post('/cadastro', data)           
        
        notifySuccess();

        setTimeout(() => {
           window.location.reload();
        }, 1500);
      }
    } catch{
      notifyError();
    }
  }  

  const handleUpdate = async (user: User | null) => {
    const notifySuccess = () => {
      toast.success('Obreiro Atualizado com sucesso!', {
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
      if (!user) {
        console.error('No selected user for update');
        return;
      }
  
      if (!editCodMembro || !editNome || !editEmail || !editBirth || !editCargo || !editNomeIgreja) {
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
        nomeIgreja: editNomeIgreja
      };  
      
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id_user === user.id_user ? { ...u, ...data } : u))
      );
  
      const response = await api.put(`/cadastro/${user.id_user}/${user.id_igreja}`, data);
  
      notifySuccess();
  
      closeModal();
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
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
            <Link href={'/../../pages/obreiros'} className='text-cinza text-lg text3 ml-2'>Obreiros &#62;</Link>
          </div>

          <div className='flex'>
            <div className='mt-10'>
              <h1 className='text-black text1 text-5xl'>Obreiros</h1>
            </div>
            
            <div className='flex mt-10 ml-10 relative left-[86vh]'>
              <p className='bg-azul px-10 py-2.5 text-white text2 text-3xl rounded-xl cursor-pointer' onClick={() => openModal('new')}>
                Novo Obreiro +
              </p>
            </div>

            <div className='ml-[20vh]'>
              <div className="space-x-16 shadow-xl absolute rounded-xl top-[24%] left-[50vh] h-[72vh] max-h-[72vh] overflow-y-auto">
              {Array.isArray(users) && users.length > 0 ? (
              <table className='text-black'>
                <thead className='sticky top-0'>
                  <tr className='bg-azul text-white rounded-xl'>
                    <th className='text1 text-white text-2xl px-[7vh] py-2 '>Cód. Membro</th>
                    <th className='text1 text-white text-2xl px-[9vh] py-2'>Nome</th>                      
                    <th className='text1 text-white text-2xl px-[7vh] py-2'>Data de Nascimento</th>                      
                    <th className='text1 text-white text-2xl px-[8vh] py-2'>Email</th>                      
                    <th className='text1 text-white text-2xl px-[7vh] py-2'>Cargo</th>                      
                  </tr>
                </thead>
                {<tbody>
                  {users.map((obreiro) => {                                         
                    return (
                      <tr key={obreiro.id_user} onClick={() => openModal('edit', obreiro)} className="cursor-pointer hover:bg-slate-200">
                        <td className="text-center text2 text-xl py-3">{obreiro.cod_membro}</td>
                        <td className="text-center text2 text-xl">{obreiro.nome}</td>
                        <td className="text-center text2 text-xl">{format(new Date(obreiro.birth), 'dd/MM/yyyy')}</td>
                        <td className="text-center text2 text-xl">{obreiro.email}</td>
                        <td className="text-center text2 text-xl">{obreiro.cargo}</td>
                      </tr>
                    );
                  })}   
                </tbody>}
              </table>
            ) : (
              <p className="text-center text-black text1 text-4xl mt-5 text-gray-4">Nenhum obreiro encontrado.</p>
            )} 
              </div>
            </div>

            <Modal
              className="text-white flex flex-col" 
              isOpen={modalIsOpen && modalType === 'new'} 
              onRequestClose={closeModal}
              contentLabel="Novo Obreiro"
            >             
              <div className='flex flex-col justify-center self-center bg-azul p-10 mt-[15vh] rounded-lg shadow-xl'>
                <h2 className='text-white text1 text-4xl flex justify-center'>Novo Obreiro</h2>

                  <div className='flex flex-col'>
                    <label className='text-white text1 text-xl mt-5 mb-1'>Cód. Membro</label>

                    <input 
                      type="text" 
                      className='px-4 py-3 rounded-lg text2 text-slate-500'
                      placeholder='Digite o Código...'
                      value={cod_membro}
                      onChange={(e) => {setCodMembro(e.target.value)}}
                      maxLength={16}                     
                      required 
                    />

                  </div>

                    <div className='flex flex-col'>
                      <label className='text-white text1 text-xl mt-5 mb-1'>Nome</label>

                      <input 
                        type="text" 
                        className='px-4 py-3 rounded-lg text2 text-slate-500'
                        placeholder='Digite o Nome...'
                        value={nome}
                        onChange={(e) => setNome (e.target.value)}
                        maxLength={150}                    
                        required 
                      />
                    </div> 

                    <div className='flex flex-col'>
                      <label className='text-white text1 text-xl mt-5 mb-1'>Email</label>

                      <input 
                        type="text" 
                        className='px-4 py-3 rounded-lg text2 text-slate-500'
                        placeholder='Digite a Email...'
                        value={email}
                        onChange={(e) => setEmail (e.target.value)}
                        maxLength={150}
                        required
                      />
                    </div>

                    <div className='flex flex-col'>
                        <label className='text-white text1 text-xl mt-5 mb-1'>Senha</label>

                        <div className="flex">
                          <input 
                            type={showPassword ? 'text' : 'password'}
                            className='pl-4 py-3 rounded-lg text2 text-slate-500'
                            placeholder='Digite a Senha...'
                            value={senha}
                            onChange={(e) => setSenha (e.target.value)}
                            maxLength={16}
                            />                            
                            <button 
                              type='button'
                              className='ml-[1vh]'
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              <Image src={showPassword ? on : off} width={40} height={40} alt={showPassword ? 'Open' : 'Closed'}/>
                            </button>                            
                        </div>
                    </div>                   

                    <div className='flex'>
                      <div className='flex flex-col'>
                        <label className='text-white text1 text-xl mt-5 mb-1'>Data da Nascimento</label>

                        <input 
                          type="date" 
                          className='px-4 py-3 rounded-lg text2 text-slate-500'
                          value={birth}
                          onChange={(e) => setBirth (e.target.value)}
                          required 
                        />
                      </div> 

                      <div className='flex flex-col ml-5'>
                        <label className='text-white text1 text-xl mt-5 mb-1'>Cargo</label>

                        <select                              
                          className='bg-white px-4 py-3 rounded-lg text2 text-slate-500'
                          value={cargo}
                          onChange={(e) => setCargo (e.target.value)}                 
                          required 
                        >   
                          <option value="" disabled>Selecione o Cargo</option>                             
                          <option value="Pastor">Pastor</option>
                          <option value="Obreiro">Obreiro</option>
                        </select>
                      </div>                                              
                    </div>                   

                    <button className='border-2 px-4 py-2 mt-7 rounded-lg text2 text-white text-lg' onClick={handleRegister}>Enviar</button>

                </div>              
            </Modal>

            <Modal
              className="text-white flex flex-col" 
              isOpen={modalIsOpen && modalType === 'edit'} 
              onRequestClose={closeModal}
              contentLabel="Editar Obreiro"
            >              
              <div className='flex flex-col justify-center self-center bg-azul p-10 mt-[15vh] rounded-lg shadow-xl'>
                <h2 className='text-white text1 text-4xl flex justify-center'>Editar Obreiro</h2>

                  <div className='flex flex-col'>
                    <label className='text-white text1 text-xl mt-5 mb-1'>Cód. Membro</label>

                    <input 
                      type="text" 
                      className='px-4 py-3 rounded-lg text2 text-slate-500'
                      placeholder='Digite o Código...'
                      value={editCodMembro}
                      onChange={(e) => {setEditCodMembro(e.target.value)}}    
                      maxLength={16}                 
                      required 
                    />

                  </div>

                    <div className='flex flex-col'>
                      <label className='text-white text1 text-xl mt-5 mb-1'>Nome</label>

                      <input 
                        type="text" 
                        className='px-4 py-3 rounded-lg text2 text-slate-500'
                        placeholder='Digite o Nome...'
                        value={editNome}
                        onChange={(e) => setEditNome (e.target.value)} 
                        maxLength={150}                   
                        required 
                      />
                    </div> 

                    <div className='flex flex-col'>
                      <label className='text-white text1 text-xl mt-5 mb-1'>Email</label>

                      <input 
                        type="text" 
                        className='px-4 py-3 rounded-lg text2 text-slate-500'
                        placeholder='Digite a Email...'
                        value={editEmail}
                        onChange={(e) => setEditEmail (e.target.value)}
                        maxLength={150}
                        required
                      />
                    </div>

                    <div className='flex flex-col'>
                        <label className='text-white text1 text-xl mt-5 mb-1'>Senha</label>
                        
                        <div className="flex">
                          <input 
                            type={showPassword ? 'text' : 'password'}
                            className='px-4 py-3 rounded-lg text2 text-slate-500'
                            placeholder='Digite a Senha...'
                            value={editSenha}
                            onChange={(e) => setEditSenha (e.target.value)}
                            maxLength={16}                        
                          />

                            <button 
                              type='button'
                              className='ml-[1vh]'
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              <Image src={showPassword ? on : off} width={40} height={40} alt={showPassword ? 'Open' : 'Closed'}/>
                            </button>
                        </div>
                    </div>                   

                    <div className='flex'>
                      <div className='flex flex-col'>
                        <label className='text-white text1 text-xl mt-5 mb-1'>Data da Nascimento</label>

                        <input 
                          type="date" 
                          className='px-4 py-3 rounded-lg text2 text-slate-500'
                          value={editBirth}
                          onChange={(e) => setEditBirth (e.target.value)}
                          required 
                        />
                      </div> 

                      <div className='flex flex-col ml-5'>
                        <label className='text-white text1 text-xl mt-5 mb-1'>Cargo</label>

                        <select                              
                          className='bg-white px-4 py-3 rounded-lg text2 text-slate-500'
                          value={editCargo}
                          onChange={(e) => setEditCargo (e.target.value)}                 
                          required 
                        >   
                          <option value="" disabled>Selecione o Cargo</option>                             
                          <option value="Pastor">Pastor</option>
                          <option value="Obreiro">Obreiro</option>
                        </select>
                      </div>                                              
                    </div>                   

                    <button className='border-2 px-4 py-2 mt-7 rounded-lg text2 text-white text-lg' onClick={() => selectedUser && handleUpdate(selectedUser)}>Atualizar</button>

                </div>
            </Modal>

          </div>
        </div>
        <ToastContainer />
      </div>
    </main>
  )
}
