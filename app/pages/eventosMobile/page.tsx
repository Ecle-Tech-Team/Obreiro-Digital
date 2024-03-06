'use client'
import React, { useState, useEffect } from 'react'
import api from '@/app/api/api'
import MenuInferior from '@/app/components/menuInferior/menuInferior'
import MenuSuperior from '@/app/components/menuSuperior/menuSuperior'
import EventosCardMobile from '@/app/components/eventosCardMobile/eventosCardMobile' 
import { format } from 'date-fns';
import Image from 'next/image'
import Modal from 'react-modal'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

export default function eventosMobile() {
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


  return (
    <main>
      <div>
        <div>
          <MenuSuperior/>
          <MenuInferior/>
        </div>

        <div className="flex">
          <h1 className='text1 text-black text-3xl ml-4'>Eventos</h1>          
        </div>

        <div className="flex justify-center">
          <div className='bg-white shadow-xl rounded-xl self-center mt-7 w-[40vh] h-[70vh] max-h-[70vh] p-10 overflow-y-scroll'>
            <div className="grid grid-cols-1 gap-[3vh]">
              {eventos && eventos && eventos.map((evento) => (
                <EventosCardMobile
                  key={evento.id_evento}
                  h4={evento.local}
                  h3={evento.nome}
                  data_inicio={format(new Date(evento.data_inicio), 'dd/MM/yyyy')}
                  hora_inicio={evento.horario_inicio}
                  data_fim={format(new Date(evento.data_fim), 'dd/MM/yyyy')}
                  hora_fim={evento.horario_fim}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
