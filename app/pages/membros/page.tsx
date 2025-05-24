'use client'
import React, { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns';
import MenuLateral from '@/app/components/menuLateral/menuLateral'
import Link from 'next/link'
import Image from 'next/image';
import api from '../../api/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import seta from '@/public/icons/seta-down.svg'

interface Igreja {
  id_igreja: number;
  nome: string;
};

interface Departamento {
  id_departamento: number;
  nome: string;
}

interface Membro {
  id_membro: number;
  cod_membro: string;
  nome: string;
  birth: string;
  novo_convertido: string;
  numero: string;
  id_departamento: number;  
  id_igreja: number;
}

interface User {
  id_user: number;
  id_igreja: number;
};

export default function membros() {
  const [cod_membro, setCodMembro] = useState<string>('')
  const [nome, setNome] = useState<string>('')
  const [birth, setBirth] = useState<string>('')
  const [novo_convertido, setNovoConvertido] = useState<string>('')
  const [numero, setNumero] = useState<string>('')
  const [nome_departamento, setNomeDepartamento] = useState<number>(0);
  const [nomeIgreja, setNomeIgreja] = useState<number>(0);

  const [editCodMembro, setEditCodMembro] = useState<string>('')
  const [editNome, setEditNome] = useState<string>('')
  const [editBirth, setEditBirth] = useState<string>('')
  const [editNovoConvertido, setEditNovoConvertido] = useState<string>('')
  const [editNumero, setEditNumero] = useState<string>('')
  const [editNomeDepartamento, setEditNomeDepartamento] = useState<number>(0);
  const [editNomeIgreja, setEditNomeIgreja] = useState<number>(0);

  const [departamento, setDepartamento] = useState<Departamento[]>([])

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        const response = await api.get('/membro/departamentos');
        setDepartamento(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchDepartamentos()
  }, []);
  
  const [membros, setMembro] = useState<Membro[]>([])
  
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {        
        const userResponse = await api.get('/cadastro');
        setUser(userResponse.data);

        if (userResponse.data && userResponse.data.id_igreja) {
          const membroResponse = await api.get(`/membro/igreja/${userResponse.data.id_igreja}`);          
          setMembro(membroResponse.data);
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
        const response = await api.get('/membro/membro/igreja');
        setIgreja(response.data);
      } catch (error) {
        console.error('Error fetching igrejas:', error);
      }
    };

    fetchIgrejas()
  }, []);

  const [modalType, setModalType] = useState<'new' | 'edit' | null>(null);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = (type: 'new' | 'edit', membro?: Membro) => {
    setModalType(type);
    if (type === 'new') {
      setCodMembro('');
      setNome('');
      setBirth('');
      setNumero('');
      setNovoConvertido('');
      setNomeDepartamento(0);
      setNomeIgreja(0);
    } else if (type === 'edit' && membro) {
      setSelectedMember(membro);
      setEditCodMembro(membro.cod_membro);
      setEditNome(membro.nome);
      setEditBirth(format(new Date(membro.birth), 'yyyy-MM-dd'));
      setEditNumero(membro.numero);
      setEditNovoConvertido(membro.novo_convertido);
      setEditNomeDepartamento(membro.id_departamento);
      setEditNomeIgreja(membro.id_igreja);
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

  const [selectedMember, setSelectedMember] = useState<Membro | null>(null)

  useEffect(() => {
    if (selectedMember) {
      setCodMembro(selectedMember.cod_membro || '');
      setNome(selectedMember.nome || '');
      setBirth(selectedMember.birth || '');
      setNumero(selectedMember.numero || '');
      setNovoConvertido(selectedMember.novo_convertido || '');
      setNomeDepartamento(selectedMember.id_departamento || 0);
      setNomeIgreja(selectedMember.id_igreja || 0);
    }
  }, [selectedMember])

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();

    const specialCharactersRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    const invalidCharactersRegex = /[^a-zA-Z\s]/;

    const notifySuccess = () => {
      toast.success('Membro cadastrado com sucesso!', {
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
      if(nome === "" || birth === "" || novo_convertido === "Selecione a Opção" || numero === "" || nome_departamento === 0 || nomeIgreja === 0) {
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
          birth,
          novo_convertido,
          numero,
          id_departamento: nome_departamento,
          id_igreja: nomeIgreja
        }

        const response = await api.post('/membro', data)

        notifySuccess();

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch{
      notifyError();
    }
  }

  const handleUpdate = async (membro: Membro | null) => {
    const notifySuccess = () => {
      toast.success('Membro atualizado com sucesso!', {
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
      if (!membro) {
        console.error('No selected member for update');
        return;
      }
  
      if (!editCodMembro || !editNome || !editBirth || !editNumero || !editNovoConvertido || !editNomeDepartamento || !editNomeIgreja) {
        console.error('Erro ao atualizar o membro:', membro);
        notifyWarn();
        return;
      }
  
      const data = {
        cod_membro: editCodMembro,
        nome: editNome,
        birth: editBirth,
        numero: editNumero,
        novo_convertido: editNovoConvertido,
        id_departamento: editNomeDepartamento,
        id_igreja: editNomeIgreja        
      };  
      
      console.log('Dados enviados para atualização:', data);
  
      const response = await api.put(`/membro/${membro.id_membro}/${membro.id_igreja}`, data);
  
      notifySuccess();
  
      setTimeout(() => {
        window.location.reload();
      }, 1500);

      setSelectedMember(null);
    } catch (error) {
      console.error('Error updating member:', error);
      notifyError();
    }

  }

  return (
    <main>
      <div className='flex'>
        <MenuLateral/>
        <div className='sm:ml-[10vh] md:ml-[20vh] lg:ml-[5vh] mr-[10vh] mb-[5vh]'>
          <div className='flex mt-12'>
            <Link href={'/../../pages/inicio'} className='text-cinza text-lg text3'>Início &#62;</Link>
            <Link href={'/../../pages/membros'} className='text-cinza text-lg text3 ml-2'>Membros &#62;</Link>
          </div>

          <div className='flex'>
            <div className='mt-10 relative sm:right-20 md:right-2' ref={dropdownRef}>
              <button onClick={toggleDropdown} className='ml-2 flex'>
                <h1 className='text-black text1 sm:mr-[2vh]  sm:text-4xl md:text-4xl lg:text-5xl'>Membros</h1>
                <Image src={seta} width={24} height={24} alt='Arrow Icon' className={`${isDropdownOpen ? 'rotate-180' : ''} transition-transform`} />
              </button>

              {isDropdownOpen && (
              <div className='mt-4 absolute bg-white shadow-lg rounded-lg z-50'>
                <Link href={'/../../pages/obreiros'} className='block text2 text-black text-xl p-3 rounded hover:bg-slate-200'>Obreiros</Link>
                <Link href={'/../../pages/departamentos'} className='block text2 text-black text-xl p-3 rounded hover:bg-slate-200'>Departamentos</Link>
              </div>
            )}
            </div>


            <div className='flex relative sm:right-[10vh] md:left-[35vh] lg:left-[75vh]'>            
              <div className='mt-10 ml-10 flex justify-center'>
                <p className='bg-azul sm:h-[5.2vh] md:h-[5.5vh] lg:h-[7vh] sm:w-[21vh] md:w-[28vh] lg:w-[32vh] sm:text-2xl md:text-2xl lg:text-3xl text-white text2 text-center content-center justify-center rounded-xl cursor-pointer hover:bg-blue-600 active:bg-blue-400' onClick={() => openModal('new')}>Novo Membro +</p>
              </div>
            </div>

            <div className='ml-[20vh] pr-2'>
              <div className="space-x-16 shadow-xl absolute rounded-xl top-[24%] sm:left-[2vh] md:left-[20vh] lg:left-[35vh] h-[72vh] max-h-[72vh] overflow-y-auto overflow-x-auto">
                {membros.length === 0 ? (
                  <p className="text-center text-black text1 text-4xl mt-5 text-gray-4">Nenhum membro encontrado.</p>
                ) : (                                      
                <table className='text-black'>
                  <thead className='sticky top-0'>
                    <tr className='bg-azul text-white rounded-xl'>
                      <th className='text1 text-white text-2xl sm:px-5 md:px-10 lg:px-24 py-2 '>Cód. Membro</th>
                      <th className='text1 text-white text-2xl sm:px-5 md:px-10 lg:px-24 py-2'>Nome</th>
                      <th className='text1 text-white text-2xl sm:px-5 md:px-10 lg:px-[9.5vh] py-2'>Numero</th>
                      <th className='text1 text-white text-2xl sm:px-5 md:px-10 lg:px-24 py-2'>Data de Nascimento</th>                      
                    </tr>
                  </thead>
                  <tbody>
                    {membros.map((members) => (                                          
                      <tr key={members.id_membro} onClick={() => members && openModal('edit', members)} className='cursor-pointer hover:bg-slate-200'>
                        <td className='text-center text2 text-xl py-3'>{members.cod_membro}</td>
                        <td className='text-center text2 text-xl'>{members.nome}</td>
                        <td className='text-center text2 text-xl'>{members.numero}</td>
                        <td className='text-center text2 text-xl'>{format(new Date(members.birth), 'dd/MM/yyyy')}</td>
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
              contentLabel="Novo Membro"            
            > 
              <div className='flex flex-col justify-center self-center bg-azul p-10 mt-[15vh] rounded-lg shadow-xl'>
                <h2 className='text-white text1 text-4xl flex justify-center'>Novo Membro</h2>
                
                <div className='flex flex-col'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Cód. Membro</label>

                  <input 
                    type="text" 
                    className='px-4 py-3 rounded-lg text2 text-black'
                    placeholder='Digite o Código...'
                    value={cod_membro}
                    onChange={(e) => setCodMembro(e.target.value)}
                    maxLength={16}
                    required 
                  />
                </div>

                <div className='flex flex-col'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Nome</label>

                  <input 
                    type="text" 
                    className='px-4 py-3 rounded-lg text2 text-black'
                    placeholder='Digite o Nome...'
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    maxLength={150}
                    required 
                  />
                </div>

                <div className='flex'>
                  <div className='flex flex-col'>
                    <label className='text-white text1 text-xl mt-5 mb-1'>Data de Nascimento</label>

                    <input 
                      type="date" 
                      className='px-4 py-3 rounded-lg text2 text-black'
                      placeholder='Selecione a Data...'
                      value={birth}
                      onChange={(e) => setBirth(e.target.value)}
                      required 
                    />
                  </div>

                  <div className='flex flex-col ml-7'>
                    <label className='text-white text1 text-xl mt-5 mt mb-1'>Novo Convertido</label>

                    <select 
                      className='px-4 py-3 rounded-lg text2 bg-white text-black' 
                      value={novo_convertido}
                      onChange={(e) => setNovoConvertido(e.target.value)}
                    >
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                </div>

                <div className='flex flex-col'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Número</label>

                  <input                     
                    type="text" 
                    className='px-4 py-3 rounded-lg text2 text-black'
                    placeholder='Digite o Número...'
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    maxLength={11}
                    required 
                  />
                </div>

                <div className="flex">
                  <div className='flex flex-col'>
                    <label className='text-white text1 text-xl mt-5 mb-1'>Departamento</label>

                    <select 
                      className='px-4 py-3 rounded-lg text2 bg-white text-black'
                      value={nome_departamento}
                      onChange={(e) => setNomeDepartamento(Number(e.target.value))}  
                    > 
                      <option value={0} disabled>Selecione um departamento</option> 
                      {departamento.map((departamento) => (
                        <option key={departamento.id_departamento} value={departamento.id_departamento}>
                          {departamento.nome}
                        </option>                      
                      ))}                    
                    </select>
                  </div>

                  <div className='flex flex-col ml-5'>
                    <label className='text-white text1 text-xl mt-5 mb-1'>Igreja</label>

                    <select                              
                      className='bg-white px-4 py-3 rounded-lg text2 text-black'
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
              contentLabel="Editar Membro"
            
            > 
              <div className='flex flex-col justify-center self-center bg-azul p-10 mt-[15vh] rounded-lg shadow-xl'>
                <h2 className='text-white text1 text-4xl flex justify-center'>Editar Membro</h2>
                
                <div className='flex flex-col'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Cód. Membro</label>

                  <input 
                    type="text" 
                    className='px-4 py-3 rounded-lg text2 text-black'
                    placeholder='Digite o Código...'
                    value={editCodMembro}
                    onChange={(e) => setEditCodMembro(e.target.value)}
                    maxLength={16}
                    required 
                  />
                </div>

                <div className='flex flex-col'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Nome</label>

                  <input 
                    type="text" 
                    className='px-4 py-3 rounded-lg text2 text-black'
                    placeholder='Digite o Nome...'
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    maxLength={150}
                    required 
                  />
                </div>

                <div className='flex'>
                  <div className='flex flex-col'>
                    <label className='text-white text1 text-xl mt-5 mb-1'>Data de Nascimento</label>

                    <input 
                      type="date" 
                      className='px-4 py-3 rounded-lg text2 text-black'
                      placeholder='Selecione a Data...'
                      value={editBirth}
                      onChange={(e) => setEditBirth(e.target.value)}
                      required 
                    />
                  </div>

                  <div className='flex flex-col ml-7'>
                    <label className='text-white text1 text-xl mt-5 mt mb-1'>Novo Convertido</label>

                    <select 
                      className='px-4 py-3 rounded-lg text2 bg-white text-black' 
                      value={editNovoConvertido}
                      onChange={(e) => setEditNovoConvertido(e.target.value)}
                    >
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                </div>

                <div className='flex flex-col'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Número</label>

                  <input                    
                    type="text" 
                    className='px-4 py-3 rounded-lg text2 text-black'
                    placeholder='Digite o Número...'
                    value={editNumero}
                    onChange={(e) => setEditNumero(e.target.value)}
                    maxLength={25}
                    required 
                  />
                </div>

                <div className='flex flex-col'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Departamento</label>

                  <select 
                    className='px-4 py-3 rounded-lg text2 bg-white text-black'
                    value={editNomeDepartamento}
                    onChange={(e) => setEditNomeDepartamento(Number(e.target.value))}  
                  >
                    <option value="" disabled>Selecione um departamento</option>
                    {departamento.map(departamentos => (
                      <option key={departamentos.id_departamento} value={departamentos.id_departamento}>{departamentos.nome}</option>                      
                    ))}                    
                  </select>
                </div>

                <div className='flex flex-col'>                  
                  <button className='border-2 px-4 py-3 mt-7 rounded-lg text2 text-white text-lg' onClick={() => selectedMember && handleUpdate(selectedMember)}>Enviar</button>
                </div>
              </div>
            </Modal>

          </div>
        </div>
        <ToastContainer />
      </div>
    </main>
  )
}