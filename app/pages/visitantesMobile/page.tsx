'use client'
import React, { useState, useEffect } from 'react'
import { format } from 'date-fns';
import MenuInferior from '@/app/components/menuInferior/menuInferior'
import MenuSuperior from '@/app/components/menuSuperior/menuSuperior'
import Image from 'next/image'
import Modal from 'react-modal'
import api from '../../api/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import perfilVisitante from '@/public/images/Visitante 1.svg'


interface Membro {
    id_membro: number;
    nome: string;
}


export default function visitantesMobile() {
    
    const [nome, setNome] = useState<string>('')
    const [cristao, setCristao] = useState<string>('')
    const [dataVisita, setDataVisita] = useState<string>('');
    const [congregacao, setCongregacao] = useState<string>('')
    const [ministerio, setMinisterio] = useState<string>('')
    const [convidadoPor, setConvidadoPor] = useState<number | string>(0);
    
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

    interface Visitante {
        id_visitante: number;
        nome: string;
        congregacao: string;
        data_visita: string; 
    }

    const [visitantes, setVisitantes] = useState<Visitante[]>([]);

    useEffect(() => {
        const fetchVisitantes = async () => {
            try {
                const response = await api.get('/visitante');
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
          if(nome === "" || (cristao === "Sim" && (congregacao === "" || ministerio === "")) || dataVisita === "" || convidadoPor === 0) {
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
    <main>
        <div>
            <div>
                <MenuSuperior/>
                <MenuInferior/>
            </div>

            <div>
                <div className='flex'>
                    <h1 className='text1 text-black text-3xl ml-4'>Visitantes</h1>
                    
                    <button className='bg-azul text2 text-white py-1 px-4 rounded-lg sticky left-[29.5vh]' onClick={openModal}>Novo Visitante +</button>                    
                </div>
            </div>

            <div className='flex justify-center'>
                <div className='bg-white shadow-xl rounded-xl self-center mt-7 w-[40vh] h-[70vh] overflow-y-auto'>
                {visitantes.map((visitante) => (
                        <div key={visitante.id_visitante} className='flex p-4'>
                            <Image src={perfilVisitante} width={40} height={40} alt=''/>
                            <div className='ml-4'>
                                <h4 className='text1 text-black text-lg leading-5'>{visitante.nome}</h4>
                                <p className='text2 text-black relative bottom-1.5'>{visitante.congregacao}</p>
                            </div>
                            <h4 className='flex self-center text2 text-black sticky left-[35vh]'>{format(new Date(visitante.data_visita), 'dd/MM')}</h4>
                        </div>
                    ))}
                </div>
            </div>

            <Modal
                className="text-white flex flex-col" 
                isOpen={modalIsOpen} 
                onRequestClose={closeModal}
                contentLabel="Novo Visitante +"
            >
                <div className='flex flex-col justify-center self-center bg-azul px-5 py-6 mt-[10vh] rounded-lg shadow-xl'>
                    <h2 className='text-white text1 text-3xl flex justify-center'>Novo Visitante</h2>

                    <div className='flex flex-col'>
                        <label className='text-white text1 text-lg mt-5 mb-1'>Nome</label>

                        <input 
                            type="text" 
                            className='px-4 py-3 rounded-lg text2'
                            placeholder='Digite o Nome...'
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}   
                            maxLength={150}                 
                            required 
                        />
                    </div>

                    <div className='flex flex-col'>
                        <label className='text-white text1 text-lg mt-5 mb-1'>Convidado Por</label>

                        <select                              
                            className='bg-white px-4 py-3 rounded-lg text2'
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

                    <div className='flex'>
                        <div className='flex flex-col'>
                            <label className='text-white text1 text-lg mt-5 mb-1'>Cristão?</label>

                            <select                              
                                className='bg-white px-4 py-3 rounded-lg text2'
                                value={cristao}
                                onChange={(e) => setCristao(e.target.value)}                 
                                required 
                            >   
                                <option value="">Selecione</option>                             
                                <option value="Sim">Sim</option>
                                <option value="Não">Não</option>
                            </select>
                        </div>

                        <div className='flex flex-col ml-4'>
                            <label className='text-white text1 text-lg mt-5 mb-1'>Data da Visita</label>

                            <input 
                                type="date" 
                                className='px-4 py-3 rounded-lg text2'
                                value={dataVisita}
                                onChange={(e) => setDataVisita (e.target.value)}
                                required 
                            />
                        </div>                        
                    </div>

                    <div className='flex flex-col'>
                        <label className='text-white text1 text-lg mt-5 mb-1'>Congregação</label>

                        <input 
                            type="text" 
                            className='px-4 py-3 rounded-lg text2'
                            placeholder='Digite a Congregação...'
                            value={congregacao}
                            onChange={(e) => setCongregacao (e.target.value)}
                            maxLength={200}
                        />
                    </div>

                    <div className='flex flex-col'>
                        <label className='text-white text1 text-lg mt-5 mb-1'>Ministério</label>

                        <input 
                            type="text" 
                            className='px-4 py-3 rounded-lg text2 t'
                            placeholder='Digite o Ministério...'
                            value={ministerio}
                            onChange={(e) => setMinisterio (e.target.value)}
                            maxLength={150}
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
