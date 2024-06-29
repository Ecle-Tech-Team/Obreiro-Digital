'use client'
import React, { useState, useEffect } from 'react'
import { format } from 'date-fns';
import MenuLateral from '@/app/components/menuLateral/menuLateral';
import EventosCard from '@/app/components/eventosCard/eventosCard';
import Image from 'next/image';
import Link from 'next/link';
import api from '../../api/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';

interface Igreja {
  id_igreja: number;
  nome: string;
};

interface User {
  id_user: number;
  id_igreja: number;
};

interface Eventos {
  id_evento: number;
  nome: string;
  data_inicio: string; 
  horario_inicio: string;
  data_fim: string;
  horario_fim: string; 
  local: string;
  id_igreja: number
};

export default function eventos() {
  const [nome, setNome] = useState<string>('');
  const [local, setLocal] = useState<string>('');
  const [data_inicio, setDataInicio] = useState<string>('');
  const [horario_inicio, setHorarioInicio] = useState<string>('');
  const [data_fim, setDataFim] = useState<string>('');
  const [horario_fim, setHorarioFim] = useState<string>('');
  const [nomeIgreja, setNomeIgreja] = useState<number>(0)

  const [editNome, setEditNome] = useState<string>('');
  const [editLocal, setEditLocal] = useState<string>('');
  const [editDataInicio, setEditDataInicio] = useState<string>('');
  const [editHorarioInicio, setEditHorarioInicio] = useState<string>('');
  const [editDataFim, setEditDataFim] = useState<string>('');
  const [editHorarioFim, setEditHorarioFim] = useState<string>('');
  const [editNomeIgreja, setEditNomeIgreja] = useState<number>(0)

  const [eventos, setEventos] = useState<Eventos[]>([]);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {        
        const userResponse = await api.get('/cadastro');
        setUser(userResponse.data);

        if (userResponse.data && userResponse.data.id_igreja) {
          const eventoResponse = await api.get(`/evento/${userResponse.data.id_igreja}`);
          setEventos(eventoResponse.data);
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

  const [modalType, setModalType] = useState<'new' | 'edit' | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = (type: 'new' | 'edit', eventos?: Eventos) => {
    setModalType(type);
    if (type === 'new') {
      setNome('');
      setLocal('');
      setDataInicio('');
      setHorarioInicio('');
      setDataFim('');
      setHorarioFim(''); 
      setNomeIgreja(0)         
    } else if (type === 'edit' && eventos) {
      setSelectedEvento(eventos);
      setEditNome(eventos.nome);
      setEditLocal(eventos.local);
      setEditDataInicio(format(new Date(eventos.data_inicio), 'yyyy-MM-dd'));
      setEditHorarioInicio(eventos.horario_inicio);
      setEditDataFim(format(new Date(eventos.data_fim), 'yyyy-MM-dd'));
      setEditHorarioFim(eventos.horario_fim)   
      setEditNomeIgreja(eventos.id_igreja);   
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalType(null);
    setEditNome('');
    setEditLocal('');
    setEditDataInicio('');
    setEditHorarioInicio('');
    setEditDataFim('');
    setEditHorarioFim('');
    setEditNomeIgreja(0)
  };

  const [selectedEvento, setSelectedEvento] = useState<Eventos | null>(null);

  useEffect(() => {
    if (selectedEvento) {      
      setNome(selectedEvento.nome || '');
      setLocal(selectedEvento.local || '');
      setDataInicio(selectedEvento.data_inicio || '');      
      setHorarioInicio(selectedEvento.horario_inicio || '');
      setDataFim(selectedEvento.data_fim || '');
      setHorarioFim(selectedEvento.horario_fim || '');
      setNomeIgreja(selectedEvento.id_igreja || 0)
    }
  }, [selectedEvento]);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();

    const notifySuccess = () => {
      toast.success('Evento cadastrado com sucesso!', {
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
      toast.error('Erro na cadastro, Tente novamente.', {
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
      if (nome === "" || local === "" || data_inicio === "" || horario_inicio === "" || data_fim === "" || horario_fim === "" || nomeIgreja === 0) {
        notifyWarn();
        return;
      } else {
        const dados = {
          nome,
          local,
          data_inicio,
          horario_inicio,
          data_fim,
          horario_fim,
          id_igreja: nomeIgreja
        };

        const response = await api.post('/evento', dados);

        notifySuccess();

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      notifyError();
    }
  };

  const handleUpdate = async (eventos: Eventos | null) => {
    const notifySuccess = () => {
      toast.success('Evento atualizado com sucesso!', {
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
      if (!eventos) {
        console.error('No selected financas for update');
        return;
      };

      if (!editNome || !editLocal || !editDataInicio || !editHorarioInicio || !data_fim || !horario_fim || !editNomeIgreja) {
        notifyWarn();
        return;
      };

      const dados = {
        nome: editNome,
        local: editLocal,
        data_inicio: editDataInicio,
        horario_inicio: editHorarioInicio,
        data_fim: editDataFim,
        horario_fim: editHorarioFim,
        nomeIgreja: editNomeIgreja
      };

      setEventos((prevEventos) =>
        prevEventos.map((u) => (u.id_evento === eventos.id_evento ? { ...u, ...dados } : u))
      );

      const response = await api.put(`/evento/${eventos.id_evento}`, dados);

      notifySuccess();

      closeModal();
      setSelectedEvento(null);
    } catch (error) {
      console.error('Error updating eventos:', error);
      notifyError();
    };
  };

  return (
    <main>
      <div className='flex'>
        <MenuLateral/>
        <div className="sm:ml-[12vh] md:ml-[20vh] lg:ml-[5vh] mr-[10vh] mb-[5vh]">
          <div className='flex mt-12'>
            <Link href={'/../../pages/inicio'} className='text-cinza text-lg text3'>Início &#62;</Link>
            <Link href={'/../../pages/financeiro'} className='text-cinza text-lg text3 ml-2'>Eventos &#62;</Link>
          </div>
          
          <div className="flex">
            <div className='mt-10'>
              <h1 className='text-black text1 sm:mr-[2vh] md:mr-[28vh] sm:text-4xl md:text-4xl lg:text-5xl'>Eventos</h1>
            </div>

            <div className='flex mt-10 lg:ml-[60vh]'>
              <p className='bg-azul flex sm:h-[5.2vh] md:h-[5.5vh] lg:h-[7vh] sm:w-[21vh] md:w-[28vh] lg:w-[32vh] text-white text-center items-center justify-center text2 sm:text-2xl md:text-2xl lg:text-3xl rounded-xl cursor-pointer' onClick={() => openModal('new')}>
                Novo Evento +
              </p>
            </div>
          </div>

          <div className=''>
            <div className=" bg-white md:h-[70vh] lg:h-[70vh] max-h-[70vh] mt-10 shadow-xl p-8 sm:w-[36vh] md:w-[70vh] lg:w-[140vh] xl:w-[100vh] rounded-xl overflow-y-scroll mr-[10vh]">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-3 gap-[4.8vh]">              
                {eventos && eventos && eventos.map((evento) => (
                  <EventosCard
                    key={evento.id_evento}
                    h4={evento.local}
                    h3={evento.nome}
                    data_inicio={format(new Date(evento.data_inicio), 'dd/MM/yyyy')}
                    hora_inicio={evento.horario_inicio}
                    data_fim={format(new Date(evento.data_fim), 'dd/MM/yyyy')}
                    hora_fim={evento.horario_fim}
                    onClick={() => openModal('edit', evento)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <Modal
            className="text-white flex flex-col" 
            isOpen={modalIsOpen && modalType === 'new'} 
            onRequestClose={closeModal}
            contentLabel="Novo Evento"
          >
            <div className='flex flex-col justify-center self-center bg-azul p-10 mt-[15vh] rounded-lg shadow-xl'>
            
              <h2 className='text-white text1 text-4xl flex justify-center'>Novo Evento</h2>
              
              <div className='flex flex-col mr-5'>
                <label className='text-white text1 text-xl mt-5 mb-1'>Nome</label>

                <input                    
                  type="text" 
                  className='px-4 py-3 rounded-lg text2 text-slate-500'
                  placeholder='Digite o Nome...'
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  maxLength={150}
                  required 
                />
              </div>

              <div className='flex flex-col mr-5'>
                <label className='text-white text1 text-xl mt-5 mb-1'>Local</label>

                <input                    
                  type="text" 
                  className='px-4 py-3 rounded-lg text2 text-slate-500'
                  placeholder='Digite o Local...'
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  maxLength={150}
                  required 
                />
              </div>

              <div className="flex">              
                <div className='flex flex-col mr-5'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Data de Início</label>

                  <input                    
                    type="date" 
                    className='px-4 py-3 rounded-lg text2 text-slate-500'
                    placeholder='Digite a Data...'
                    value={data_inicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    required 
                  />
                </div>

                <div className='flex flex-col'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Horário de Início</label>

                  <input                    
                    type="time" 
                    className='px-4 py-3 rounded-lg text2 text-slate-500'
                    placeholder='Digite o Horário...'
                    value={horario_inicio}
                    onChange={(e) => setHorarioInicio(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="flex">              
                <div className='flex flex-col mr-5'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Data de Término</label>

                  <input                    
                    type="date" 
                    className='px-4 py-3 rounded-lg text2 text-slate-500'
                    placeholder='Digite a Data...'
                    value={data_fim}
                    onChange={(e) => setDataFim(e.target.value)}
                    required 
                  />
                </div>

                <div className='flex flex-col mr-5'>
                  <label className='text-white text1 text-xl mt-5 mb-1'>Horário de Término</label>

                  <input                    
                    type="time" 
                    className='px-4 py-3 rounded-lg text2 text-slate-500'
                    placeholder='Digite o Horário...'
                    value={horario_fim}
                    onChange={(e) => setHorarioFim(e.target.value)}
                    required 
                  />
                </div>  
              </div>

              <div className='flex flex-col'>
                <label className='text-white text1 text-xl mt-5 mb-1'>Igreja Realizadora</label>

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

              <button className='border-2 px-4 py-3 mt-7 rounded-lg text2 text-white text-lg' onClick={handleRegister}>Enviar</button>
            </div>
          </Modal>

          <Modal
            className="text-white flex flex-col" 
            isOpen={modalIsOpen && modalType === 'edit'} 
            onRequestClose={closeModal}
            contentLabel="Ver Evento"
          >
            <div className='flex flex-col justify-center self-center bg-azul p-10 mt-[15vh] rounded-lg shadow-xl'>
            
            <h2 className='text-white text1 text-4xl flex justify-center'>Ver Evento</h2>
            
            <div className='flex flex-col mr-5'>
              <label className='text-white text1 text-xl mt-5 mb-1'>Nome</label>

              <input                    
                type="text" 
                className='px-4 py-3 rounded-lg text2 text-slate-500'
                placeholder='Digite o Nome...'
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
                maxLength={150}
                required 
              />
            </div>

            <div className='flex flex-col mr-5'>
              <label className='text-white text1 text-xl mt-5 mb-1'>Local</label>

              <input                    
                type="text" 
                className='px-4 py-3 rounded-lg text2 text-slate-500'
                placeholder='Digite o Local...'
                value={editLocal}
                onChange={(e) => setEditLocal(e.target.value)}
                maxLength={150}
                required 
              />
            </div>

            <div className="flex">              
              <div className='flex flex-col mr-5'>
                <label className='text-white text1 text-xl mt-5 mb-1'>Data de Início</label>

                <input                    
                  type="date" 
                  className='px-4 py-3 rounded-lg text2 text-slate-500'
                  placeholder='Digite a Data...'
                  value={editDataInicio}
                  onChange={(e) => setEditDataInicio(e.target.value)}
                  required 
                />
              </div>

              <div className='flex flex-col'>
                <label className='text-white text1 text-xl mt-5 mb-1'>Horário de Início</label>

                <input                    
                  type="time" 
                  className='px-4 py-3 rounded-lg text2 text-slate-500'
                  placeholder='Digite o Horário...'
                  value={editHorarioInicio}
                  onChange={(e) => setEditHorarioInicio(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="flex">              
              <div className='flex flex-col mr-5'>
                <label className='text-white text1 text-xl mt-5 mb-1'>Data de Término</label>

                <input                    
                  type="date" 
                  className='px-4 py-3 rounded-lg text2 text-slate-500'
                  placeholder='Digite a Data...'
                  value={editDataFim}
                  onChange={(e) => setEditDataFim(e.target.value)}
                  required 
                />
              </div>

              <div className='flex flex-col mr-5'>
                <label className='text-white text1 text-xl mt-5 mb-1'>Horário de Término</label>

                <input                    
                  type="time" 
                  className='px-4 py-3 rounded-lg text2 text-slate-500'
                  placeholder='Digite o Horário...'
                  value={editHorarioFim}
                  onChange={(e) => setEditHorarioFim(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button className='border-2 px-4 py-3 mt-7 rounded-lg text2 text-white text-lg' onClick={() => selectedEvento && handleUpdate(selectedEvento)}>Atualizar</button>
          </div>
          </Modal>

        </div>
        <ToastContainer />
      </div>
    </main>
  )
}
