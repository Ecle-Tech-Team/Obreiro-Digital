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

export default function eventos() {
  const [nome, setNome] = useState<string>('');
  const [local, setLocal] = useState<string>('');
  const [data_inicio, setDataInicio] = useState<string>('');
  const [horario_inicio, setHorarioInicio] = useState<string>('');
  const [data_fim, setDataFim] = useState<string>('');
  const [horario_fim, setHorarioFim] = useState<string>('');

  const [editNome, setEditNome] = useState<string>('');
  const [editLocal, setEditLocal] = useState<string>('');
  const [editDataInicio, setEditDataInicio] = useState<string>('');
  const [editHorarioInicio, setEditHorarioInicio] = useState<string>('');
  const [editDataFim, setEditDataFim] = useState<string>('');
  const [editHorarioFim, setEditHorarioFim] = useState<string>('');

  interface Eventos {
    id_evento: number;
    nome: string;
    data_inicio: string; 
    horario_inicio: string;
    data_fim: string;
    horario_fim: string; 
    local: string;
  };

  const [eventos, setEventos] = useState<Eventos[]>([]);

  useEffect(() => {
      const fetchEventos = async () => {
        try {
            const response = await api.get('/evento');
            setEventos(response.data);
        } catch (error) {
            console.error('Error fetching evento:', error);
        }
      };

      fetchEventos();
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
    } else if (type === 'edit' && eventos) {
      setSelectedEvento(eventos);
      setEditNome(eventos.nome);
      setEditLocal(eventos.local);
      setEditDataInicio(eventos.data_inicio);
      setEditHorarioInicio(eventos.horario_inicio);
      setEditDataFim(eventos.data_fim);
      setEditHorarioFim(eventos.horario_fim)      
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
  };

  const [selectedEvento, setSelectedEvento] = useState<Eventos | null>(null);

  useEffect(() => {
    if (selectedEvento) {
      console.log('Data de Início:', selectedEvento.data_inicio);
      console.log('Data de Fim:', selectedEvento.data_fim);
      setNome(selectedEvento.nome || '');
      setLocal(selectedEvento.local || '');
      setEditDataInicio(format(new Date(selectedEvento.data_inicio), 'yyyy-MM-dd'));;      
      setHorarioInicio(selectedEvento.horario_inicio || '');
      setEditDataFim(selectedEvento.data_fim ? format(new Date(selectedEvento.data_fim), 'yyyy-MM-dd') : '');
      setHorarioFim(selectedEvento.horario_fim || '');
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
      if (nome === "" || local === "" || data_inicio === "" || horario_inicio === "" || data_fim === "" || horario_fim === "") {
        notifyWarn();
        return;
      } else {
        const dados = {
          nome,
          local,
          data_inicio,
          horario_inicio,
          data_fim,
          horario_fim
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

      if (!editNome || !editLocal || !editDataInicio || !editHorarioInicio || !data_fim || !horario_fim) {
        notifyWarn();
        return;
      };

      const dados = {
        nome: editNome,
        local: editLocal,
        data_inicio: editDataInicio,
        horario_inicio: editHorarioInicio,
        data_fim: editDataFim,
        horario_fim: editHorarioFim
      };

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
        <div className="ml-[20vh]">
          <div className='flex mt-12'>
            <Link href={'/../../pages/inicio'} className='text-cinza text-lg text3'>Início &#62;</Link>
            <Link href={'/../../pages/financeiro'} className='text-cinza text-lg text3 ml-2'>Eventos &#62;</Link>
          </div>

          <div className="flex">
            <div className='mt-10'>
              <h1 className='text-black text1 text-5xl'>Eventos</h1>
            </div>

            <div className='flex mt-10 ml-10 relative left-[86vh]'>
              <p className='bg-azul px-10 py-2.5 text-white text2 text-3xl rounded-xl cursor-pointer' onClick={() => openModal('new')}>
                Novo Evento +
              </p>
            </div>
          </div>

          <div className=''>
            <div className=" bg-white h-[75vh] max-h-[75vh] mt-10 shadow-xl p-8 rounded-xl overflow-y-scroll">
              <div className="grid grid-cols-4 gap-[4.8vh]">              
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
