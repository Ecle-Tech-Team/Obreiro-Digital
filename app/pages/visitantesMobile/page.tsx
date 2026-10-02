'use client'
import { AddButton, AppModal, PageTitle } from '@/app/components/shared/MemberStyle';
import React, { useState, useEffect } from 'react'
import { UserRound, X } from 'lucide-react'
import { format } from 'date-fns';
import MenuInferior from '@/app/components/menuInferior/menuInferior'
import MenuSuperior from '@/app/components/menuSuperior/menuSuperior'
import api from '../../api/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


interface Membro {
    id_membro: number;
    nome: string;
};

interface Igreja {
    id_igreja: number;
    nome: string;
};

interface User {
    id_user: number;
    id_igreja: number;
  };

  interface Visitante {
    id_visitante: number;
    nome: string;
    congregacao: string;
    data_visita: string; 
}
export default function visitantesMobile() {

    const [nome, setNome] = useState<string>('')
    const [cristao, setCristao] = useState<string>('')
    const [dataVisita, setDataVisita] = useState<string>('');
    const [congregacao, setCongregacao] = useState<string>('')
    const [ministerio, setMinisterio] = useState<string>('')
    const [convidadoPor, setConvidadoPor] = useState<number | string>(0);
    const [nomeIgreja, setNomeIgreja] = useState<number>(0)

    const [membros, setMembros] = useState<Membro[]>([]); 

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await api.get('/visitante/membros'); // 
            setMembros(response.data);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };    
        fetchMembers();
    }, []);    

    const [visitantes, setVisitantes] = useState<Visitante[]>([]);

    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        const fetchUserData = async () => {
          try {        
            const userResponse = await api.get('/cadastro');
            setUser(userResponse.data);

            if (userResponse.data && userResponse.data.id_igreja) {
              const visitanteResponse = await api.get(`/visitante/${userResponse.data.id_igreja}`);
              setVisitantes(visitanteResponse.data);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        };

        fetchUserData();
      }, []);

    useEffect(() => {
        const fetchVisitantes = async () => {
            try {
                const userResponse = await api.get('/cadastro');
                const response = await api.get(`/visitante/${userResponse.data.id_igreja}`)
                const sortedVisitantes = response.data.sort((a: { data_visita: string; }, b: { data_visita: string; }) => {
                    const dateA = new Date(a.data_visita as string);
                    const dateB = new Date(b.data_visita as string);                      
                    return dateB.getTime() - dateA.getTime();
                });               

                const visitantesWithAdjustedDate = sortedVisitantes.map((visitante: { data_visita: string | number | Date; }) => {
                    const date = new Date(visitante.data_visita);
                    date.setDate(date.getDate() + 1);
                    return { ...visitante, data_visita: date.toISOString().split('T')[0] };
                });

                setVisitantes(visitantesWithAdjustedDate);
            } catch (error) {
                console.error('Error fetching visitantes:', error);
            }
        };

        fetchVisitantes();
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

    const [modalIsOpen, setModalIsOpen] = useState(false);

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
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

      async function handleRegister(event: React.FormEvent) {
        event.preventDefault();        

        const specialCharactersRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
        const invalidCharactersRegex = /[^a-zA-Z\s]/;

        const notifySuccess = () => {
          toast.success('Visitante cadastrado com sucesso!', {
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
          if(nome === "" || (cristao === "Sim" && (congregacao === "" || ministerio === "")) || dataVisita === "" || convidadoPor === 0 || nomeIgreja === 0) {
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
              cristao,
              data_visita: dataVisita,
              congregacao,
              ministerio,
              convidado_por: convidadoPor,
              id_igreja: nomeIgreja
            }           

            const response = await api.post('/visitante', data)           

            notifySuccess();

            setTimeout(() => {
               window.location.reload();
            }, 1500);
          }
        } catch{
          notifyError();
        }
    }  

  return (
    <main className="mobile-page">
        <div>
            <div>
                <MenuSuperior/>
                <MenuInferior/>
            </div>

            <div>
                <div className='mobile-list-header'>
                    <PageTitle>Visitantes</PageTitle>

                    <AddButton onClick={openModal}>Novo Visitante</AddButton>
                </div>
            </div>

            <div className='px-4'>
                <div className='bg-white shadow-xl rounded-xl mt-5 w-full min-w-0 max-h-[65vh] overflow-y-auto'>
                {visitantes.map((visitante) => (
                        <div key={visitante.id_visitante} className='flex min-w-0 gap-3 p-4'>
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-azul"><UserRound size={22} aria-hidden="true" /></span>
                            <div className='min-w-0 flex-1'>
                                <h4 className='text1 text-black text-lg leading-5'>{visitante.nome}</h4>
                                <p className='text2 text-black relative bottom-1.5'>{visitante.congregacao}</p>
                            </div>
                            <h4 className='ml-auto shrink-0 self-center text2 text-black'>{format(new Date(visitante.data_visita), 'dd/MM')}</h4>
                        </div>
                    ))}
                </div>
            </div>

            <ToastContainer />
            <AppModal
                className="responsive-modal"
                isOpen={modalIsOpen} 
                onRequestClose={closeModal}
                contentLabel="Novo Visitante +"
            >
                <div className='od-modal-surface flex flex-col !p-0'>
                    <div className='sticky top-0 z-10 flex items-center justify-between gap-3 bg-azul px-5 py-4'>
                        <h2 className='text1 text-xl text-white sm:text-2xl'>Novo Visitante</h2>
                        <button type='button' onClick={closeModal} aria-label='Fechar modal' className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white hover:bg-white/20'>
                            <X size={22} aria-hidden='true' />
                        </button>
                    </div>
                    <div className='grid min-w-0 gap-4 p-5 sm:p-6'>

                    <div className='flex min-w-0 flex-col gap-1'>
                        <label className='text1 text-sm text-gray-700'>Nome</label>

                        <input 
                            type="text" 
                            className='text2 w-full min-w-0 rounded-lg border border-gray-300 bg-slate-50 px-4 py-3 text-gray-800'
                            placeholder='Digite o Nome...'
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}   
                            maxLength={150}                 
                            required 
                        />
                    </div>

                    <div className='flex min-w-0 flex-col gap-1'>
                        <label className='text1 text-sm text-gray-700'>Convidado Por</label>

                        <select                              
                            className='text2 w-full min-w-0 rounded-lg border border-gray-300 bg-slate-50 px-4 py-3 text-gray-800'
                            value={convidadoPor}
                            onChange={(e) => setConvidadoPor(Number(e.target.value))}                
                            required 
                        >
                            <option value={0} disabled>Selecione um membro</option>
                            <option value={'Sem Membro'}>Sem Membro</option>                            
                            {membros.map((membro) => (
                                <option key={membro.id_membro} value={membro.id_membro}>
                                    {membro.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2'>
                        <div className='flex min-w-0 flex-col gap-1'>
                            <label className='text1 text-sm text-gray-700'>Cristão?</label>

                            <select                              
                                className='text2 w-full min-w-0 rounded-lg border border-gray-300 bg-slate-50 px-4 py-3 text-gray-800'
                                value={cristao}
                                onChange={(e) => setCristao(e.target.value)}                 
                                required 
                            >   
                                <option value="">Selecione</option>                             
                                <option value="Sim">Sim</option>
                                <option value="Não">Não</option>
                            </select>
                        </div>

                        <div className='flex min-w-0 flex-col gap-1'>
                            <label className='text1 text-sm text-gray-700'>Data da Visita</label>

                            <input 
                                type="date" 
                                className='text2 w-full min-w-0 rounded-lg border border-gray-300 bg-slate-50 px-4 py-3 text-gray-800'
                                value={dataVisita}
                                onChange={(e) => setDataVisita (e.target.value)}
                                required 
                            />
                        </div>                        
                    </div>

                    <div className='flex min-w-0 flex-col gap-1'>
                        <label className='text1 text-sm text-gray-700'>Congregação</label>

                        <input 
                            type="text" 
                            className='text2 w-full min-w-0 rounded-lg border border-gray-300 bg-slate-50 px-4 py-3 text-gray-800'
                            placeholder='Digite a Congregação...'
                            value={congregacao}
                            onChange={(e) => setCongregacao (e.target.value)}
                            maxLength={200}
                        />
                    </div>

                    <div className='flex min-w-0 flex-col gap-1'>
                        <label className='text1 text-sm text-gray-700'>Ministério</label>

                        <input 
                            type="text" 
                            className='text2 w-full min-w-0 rounded-lg border border-gray-300 bg-slate-50 px-4 py-3 text-gray-800'
                            placeholder='Digite o Ministério...'
                            value={ministerio}
                            onChange={(e) => setMinisterio (e.target.value)}
                            maxLength={150}
                        />
                    </div>

                    <div className='flex min-w-0 flex-col gap-1'>
                        <label className='text1 text-sm text-gray-700'>Igreja Realizadora</label>

                        <select                              
                            className='text2 w-full min-w-0 rounded-lg border border-gray-300 bg-slate-50 px-4 py-3 text-gray-800'
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

                    <button className='text2 min-h-12 rounded-lg bg-azul px-4 py-3 font-semibold text-white hover:bg-blue-600' onClick={handleRegister}>Enviar</button>

                    </div>
                </div>
            </AppModal>

        </div>
    </main>
  )
}
