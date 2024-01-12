'use client'
import React, { useState, useEffect } from 'react'
import api from '@/app/api/api'
import MenuInferior from '@/app/components/menuInferior/menuInferior'
import MenuSuperior from '@/app/components/menuSuperior/menuSuperior'
import eventos from '@/public/icons/evento.svg'
import visitantes from '@/public/icons/visitantes.svg'
import pedidos from '@/public/icons/pedidos.svg'
import calendar from '@/public/icons/calendar.svg'
import Image from 'next/image'

export default function inicioMobile() {
  
  const [totalPedidos, setTotalPedidos] = useState<number>(0);
  const [pedidosEntregues, setPedidosEntregues] = useState<number>(0);
  const [pedidosEmAndamento, setPedidosEmAndamento] = useState<number>(0);
  const [pedidosRecusados, setPedidosRecusados] = useState<number>(0);
    
  useEffect(() => {
    const fetchTotalPedidos = async () => {
      try {
        const response = await api.get('/pedido/count/total');
        setTotalPedidos(response.data);
      } catch (error) {
        console.error('Erro ao buscar total de pedidos:', error);
      }
    }

    fetchTotalPedidos();
  }, []);

  useEffect(() => {
    const fetchPedidosEntregues = async () => {
      try {
        const response = await api.get('/pedido/count/entregue');
        setPedidosEntregues(response.data);
      } catch (error) {
        console.error('Erro ao buscar pedidos entregues:', error);
      }
    }

    fetchPedidosEntregues();
  }, []);

  useEffect(() => {
    const fetchPedidosEmAndamento = async () => {
      try {
        const response = await api.get('pedido/count/em-andamento');
        setPedidosEmAndamento(response.data);
      } catch (error) {
        console.error('Erro ao buscar pedidos em andamento:', error);
      }
    }

    fetchPedidosEmAndamento();
  }, []);

  useEffect(() => {
    const fetchPedidosRecusados = async() => {
      try {
        const response = await api.get('pedido/count/recusados');
        setPedidosRecusados(response.data);
      } catch (error) {
        console.error('Erro ao buscar pedidos em andamento:', error);
      }
    }

    fetchPedidosRecusados();
  }, []);

  const [totalEventos, setTotalEventos] = useState<number>(0);
  const [totalVisitantes, setTotalVisitantes] = useState<number>(0);

  useEffect(() => {
    const fetchEventos = async() => {
      try {
        const response = await api.get('evento/count');
        setTotalEventos(response.data);
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
      }
    }

    fetchEventos();
  }, []);

  useEffect(() => {
    const fetchVisitantes = async() => {
      try {
        const response = await api.get('visitante/count');
        setTotalVisitantes(response.data);
      } catch (error) {
        console.error('Erro ao buscar visitantes:', error);
      }
    }

    fetchVisitantes();
  }, []);

  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');

  useEffect(() => {
    setNome(sessionStorage.getItem('nome') || '');
    setCargo(sessionStorage.getItem('cargo') || '');
  }, []);

  return (
    <main>
      <div>
        <div>
          <MenuSuperior/>
          <MenuInferior/>
        </div>

        <div className='px-3'>
          <div className='bg-azul rounded-xl p-4'>
            <h1 className='text1 text-white text-2xl '>A Paz {nome} {cargo}!</h1>
            <h2 className='text2 text-white text-base mt-1 leading-5'>Veja as principais informações<br/>sobre a sua igreja:</h2>
          </div>

          <div className='flex flex-col'>
            <div className='flex'>              
              <div className='bg-white shadow-xl w-[20vh] rounded-xl py-2 mt-6'>
                <div className='ml-4 mt-3'>
                  <Image src={eventos} width={25} height={25} alt=''/>
                  <h4 className='text3 text-xl text-black mt-1'>Eventos</h4>
                </div>

                <div className='ml-4 mt-3'>
                  <p className='text2 text-azul text-base'>Eventos Totais</p>
                  <p className='text2 text-black text-base relative bottom-1'>{totalEventos}</p>
                </div>
              </div>

              <div className='bg-white shadow-xl w-[20vh] rounded-xl py-2 mt-6 ml-8'>
                <div className='ml-4 mt-3'>
                  <Image src={visitantes} width={40} height={40} alt=''/>
                  <h4 className='text3 text-xl text-black mt-1'>Visitantes</h4>
                </div>

                <div className='ml-4 mt-3'>
                  <p className='text2 text-azul text-base'>Visitantes Totais</p>
                  <p className='text2 text-black text-base relative bottom-1'>{totalVisitantes}</p>
                </div>
              </div>                            
            </div>

            <div className='flex'>
              <div className='bg-white shadow-xl w-[20vh] h-[37vh] rounded-xl py-2 mt-6'>
                <div className='ml-4 mt-3'>
                  <Image src={pedidos} width={25} height={25} alt=''/>
                  <h4 className='text3 text-xl text-black mt-1'>Pedidos</h4>
                </div>

                <div className='ml-4 mt-2 flex flex-col'>
                  <div>
                    <p className='text2 text-verde text-base'>Entregues</p>
                    <p className='text2 text-black text-base relative bottom-1'>{pedidosEntregues}</p>
                  </div>
                  <div>
                    <p className='text2 text-amarelo text-base'>Em Andamento</p>
                    <p className='text2 text-black text-base relative bottom-1'>{pedidosEmAndamento}</p>
                  </div>
                  <div>
                    <p className='text2 text-vermelho text-base'>Recusados</p>
                    <p className='text2 text-black text-base relative bottom-1'>{pedidosRecusados}</p>
                  </div>
                </div>

                <div className='ml-4'>
                  <p className='text2 text-azul text-base'>Pedidos Totais</p>
                  <p className='text2 text-black text-base relative bottom-1'>{totalPedidos}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
