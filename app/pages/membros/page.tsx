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
import close from '@/public/icons/close.svg';
import lixo from '@/public/icons/delete.svg';
import filter from '@/public/icons/filter.png';

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
  const [novo_convertido, setNovoConvertido] = useState<'Sim' | 'Não'>('Não')
  const [numero, setNumero] = useState<string>('')
  const [nome_departamento, setNomeDepartamento] = useState<number>(0);
  const [nomeIgreja, setNomeIgreja] = useState<number>(0);

  const [editCodMembro, setEditCodMembro] = useState<string>('')
  const [editNome, setEditNome] = useState<string>('')
  const [editBirth, setEditBirth] = useState<string>('')
  const [editNovoConvertido, setEditNovoConvertido] = useState<'Sim' | 'Não'>('Não')
  const [editNumero, setEditNumero] = useState<string>('')
  const [editNomeDepartamento, setEditNomeDepartamento] = useState<number>(0);
  const [editNomeIgreja, setEditNomeIgreja] = useState<number>(0);

  const [departamento, setDepartamento] = useState<Departamento[]>([])

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [allMembros, setAllMembros] = useState<Membro[]>([]); // Lista completa
  const [filteredMembros, setFilteredMembros] = useState<Membro[]>([]); // Lista filtrada

  const handleDeleteClick = (id_membro: number) => {
    setMemberToDelete(id_membro);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;

    try {
      await api.delete(`/membro/${memberToDelete}`);
      const notifyDelete = () => {
      toast.success('Membro deletado com sucesso!', {
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
     
      setMembro(membros.filter(m => m.id_membro !== memberToDelete));
      notifyDelete();
    } catch (error) {
      toast.error('Erro ao remover membro.');
    } finally {
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
    }
  };

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
          setAllMembros(membroResponse.data);
          setFilteredMembros(membroResponse.data);
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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (term.trim() === '') {
        setFilteredMembros(allMembros);
        return;
    }

    const lowercasedTerm = term.toLowerCase();

    const filtered = allMembros.filter(membro => {
        // Converte todos os campos para string antes de verificar
        const nomeStr = membro.nome ? membro.nome.toString().toLowerCase() : '';
        const codStr = membro.cod_membro ? membro.cod_membro.toString().toLowerCase() : '';
        const numeroStr = membro.numero ? membro.numero.toString() : '';
        
        return (
            nomeStr.includes(lowercasedTerm) ||
            codStr.includes(lowercasedTerm) ||
            numeroStr.includes(lowercasedTerm)
        );
    });


    setFilteredMembros(filtered);
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<'recent' | 'oldest' | 'name-asc' | 'name-desc' | 'birth'>('recent');

  const sortMembros = (membros: Membro[]) => {
    const sorted = [...membros];
    
    switch (sortCriteria) {
      case 'recent':
          // Adicionados recentemente (maior ID primeiro)
        return sorted.sort((a, b) => b.id_membro - a.id_membro);
      
      case 'oldest':
          // Adicionados há mais tempo (menor ID primeiro)
          return sorted.sort((a, b) => a.id_membro - b.id_membro);
      
      case 'name-asc':
          // Ordem alfabética A-Z
        return sorted.sort((a, b) => a.nome.localeCompare(b.nome));
      
      case 'name-desc':
          // Ordem alfabética Z-A
        return sorted.sort((a, b) => b.nome.localeCompare(a.nome));
      
      case 'birth':
          // Por data de nascimento (mais jovens primeiro)
        return sorted.sort((a, b) => 
          new Date(b.birth).getTime() - new Date(a.birth).getTime()
        );
      
      default:
        return sorted;
    }
  };

  const sortedMembros = sortMembros(filteredMembros);

  const [modalType, setModalType] = useState<'new' | 'edit' | null>(null);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = (type: 'new' | 'edit', membro?: Membro) => {
    setModalType(type);
    if (type === 'new') {
      setCodMembro('');
      setNome('');
      setBirth('');
      setNumero('');
      setNovoConvertido('Sim');
      setNomeDepartamento(0);
      setNomeIgreja(0);
    } else if (type === 'edit' && membro) {
      setSelectedMember(membro);
      setEditCodMembro(membro.cod_membro);
      setEditNome(membro.nome);
      setEditBirth(format(new Date(membro.birth), 'yyyy-MM-dd'));
      setEditNumero(membro.numero);
      setEditNovoConvertido(membro.novo_convertido === 'Sim' ? 'Sim' : 'Não');
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
      setNovoConvertido(selectedMember.novo_convertido === 'Sim' ? 'Sim' : 'Não');
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
      if(nome === "" || birth === "" || numero === "" || nome_departamento === 0 || nomeIgreja === 0) {
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

            <div className='flex'>
              <div className="mt-10 relative sm:right-[5vh] md:left-[20vh] lg:left-[54vh]">
                <div className="flex mb-4">            
              {/* Botão de filtro */}
              <div className="flex gap-5 relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center justify-center px-5 py-2 hover:bg-slate-200 cursor-pointer rounded-lg focus:outline-none"
                >                  
                  <Image 
                    src={filter} 
                    width={30} 
                    height={30} 
                    alt="Filtrar"                    
                  />
                </button>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Pesquisar membros..."
                    className="sm:h-[5.2vh] md:h-[5.5vh] lg:h-[7vh] sm:w-[21vh] md:w-[28vh] lg:w-[32vh] sm:text-xl md:text-lg lg:text-xl text-gray-600 pl-5 text2 text-left content-center justify-center rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
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
                    Data de nascimento
                  </button>
                </div>
                )}
                </div>
              </div>
            </div>
              <div className='flex relative sm:right-[10vh] md:left-[35vh] lg:left-[56vh]'>            
                <div className='mt-10 ml-1 flex justify-center'>
                  <p className='bg-azul sm:h-[5.2vh] md:h-[5.5vh] lg:h-[7vh] sm:w-[21vh] md:w-[28vh] lg:w-[32vh] sm:text-2xl md:text-2xl lg:text-3xl text-white text2 text-center content-center justify-center rounded-xl cursor-pointer hover:bg-blue-600 active:bg-blue-400' onClick={() => openModal('new')}>Novo Membro +</p>
                </div>
              </div>

            </div>

            <div className='ml-[20vh] pr-2'>
              <div className="space-x-16 shadow-xl absolute rounded-xl top-[24%] sm:left-[2vh] md:left-[20vh] lg:left-[35vh] h-[72vh] max-h-[72vh] overflow-y-auto overflow-x-auto">
                {sortedMembros.length === 0 ? (
                  <p className="text-center text-black text1 text-4xl mt-5 text-gray-4 px-[40.5vh]">Nenhum membro encontrado.</p>
                ) : (                                      
                <table className='text-black'>
                  <thead className='sticky top-0'>
                    <tr className='bg-azul text-white rounded-xl'>
                      <th className='text1 text-white text-2xl sm:px-5 md:px-10 lg:px-24 py-2 '>Cód. Membro</th>
                      <th className='text1 text-white text-2xl sm:px-5 md:px-10 lg:px-40 py-2'>Nome</th>
                      <th className='text1 text-white text-2xl sm:px-5 md:px-10 lg:px-[7.8vh] py-2'>Numero</th>
                      <th className='text1 text-white text-2xl sm:px-5 md:px-10 lg:px-24 py-2'>Data de Nascimento</th>    
                      <th className='sm:px-1 md:px-1 lg:px-1 py-2'></th>                  
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMembros.map((members) => (                                          
                      <tr key={members.id_membro} onClick={() => members && openModal('edit', members)} className='cursor-pointer hover:bg-slate-200'>
                        <td className='text-center text2 text-xl py-3'>{members.cod_membro}</td>
                        <td className='text-center text2 text-xl'>{members.nome}</td>
                        <td className='text-center text2 text-xl'>{members.numero}</td>
                        <td className='text-center text2 text-xl'>{format(new Date(members.birth), 'dd/MM/yyyy')}</td>
                        <td className='text-center text2 text-xl py-3 pr-10'>                                                     
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(members.id_membro);
                            }}
                            className='px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600'
                          >
                            <Image src={lixo} width={30} height={40} alt='lixo Icon' />
                          </button>                          
                        </td>    
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>
            </div>
            
            <Modal
              isOpen={isDeleteModalOpen}
              onRequestClose={() => setIsDeleteModalOpen(false)}
              contentLabel="Confirmar exclusão"
              className="fixed inset-0 flex items-center justify-center p-4"
              overlayClassName="fixed inset-0 bg-white bg-opacity-70"
            >
              <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                <h2 className="text1 text-xl text-black font-bold mb-4">Confirmar Exclusão</h2>
                <p className="text2 text-gray-600 mb-6">Você tem certeza que deseja remover este membro?</p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="text2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="text2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </Modal>

            <Modal
              className="text-white flex flex-col" 
              isOpen={modalIsOpen && modalType === 'new'} 
              onRequestClose={closeModal}
              contentLabel="Novo Membro"            
            > 
              <div className='flex flex-col justify-center self-center bg-azul mt-[15vh] rounded-lg shadow-xl'>
                <div className='cursor-pointer flex place-content-start rounded-lg'>
                  <Image onClick={closeModal} src={close} width={40} height={40} alt='close Icon' className='bg-red-500 hover:bg-red-600 rounded-tl-lg'/>
                </div>

                <h2 className='text-white text1 text-4xl flex justify-center'>Novo Membro</h2>
                
                <div className='flex flex-col px-10'>
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

                <div className='flex flex-col px-10'>
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

                <div className='flex px-10'>
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
                      onChange={(e) => setNovoConvertido(e.target.value as 'Sim' | 'Não')}
                    >
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                </div>

                <div className='flex flex-col px-10'>
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

                <div className="flex px-10">
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
                
                <div className='flex flex-col px-10 pb-10'>                  
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
              <div className='flex flex-col justify-center self-center bg-azul mt-[15vh] rounded-lg shadow-xl'>
                <div className='cursor-pointer flex place-content-start rounded-lg'>
                  <Image onClick={closeModal} src={close} width={40} height={40} alt='close Icon' className='bg-red-500 hover:bg-red-600 rounded-tl-lg'/>
                </div>
                <h2 className='text-white text1 text-4xl flex justify-center'>Editar Membro</h2>
                
                <div className='flex flex-col px-10'>
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

                <div className='flex flex-col px-10'>
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

                <div className='flex px-10'>
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
                      onChange={(e) => setEditNovoConvertido(e.target.value as 'Sim' | 'Não')}
                    >
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                </div>

                <div className='flex flex-col px-10 '>
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

                <div className='flex flex-col px-10'>
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

                <div className='flex flex-col px-10 pb-10'>                  
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