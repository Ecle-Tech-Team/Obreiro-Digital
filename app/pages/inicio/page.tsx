'use client'
import React, { useState, useEffect } from 'react'
import api from '@/app/api/api'
import MenuLateral from '@/app/components/menuLateral/menuLateral'
import Link from 'next/link'
import Image from 'next/image'
import arrow from '@/public/icons/arrow.svg'
import membros from '@/public/icons/groups_black_24dp(1).svg'
import evento from '@/public/icons/evento.svg'
import saldo from '@/public/icons/saldo.svg'
import visitantes from '@/public/icons/visitantes.svg'
import pedidos from '@/public/icons/pedidos.svg'
import on from '@/public/icons/on-black.svg'
import off from '@/public/icons/off-black.svg'

interface Saldo {
  id_saldo: number;
  saldo: number;
}

export default function inicio() {

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

  const [totalMembros, setTotalMembros] = useState<number>(0);
  const [totalEventos, setTotalEventos] = useState<number>(0);
  const [totalVisitantes, setTotalVisitantes] = useState<number>(0);

  useEffect(() => {
    const fetchMembros = async() => {
      try {
        const response = await api.get('membro/count');
        setTotalMembros(response.data);
      } catch (error) {
        console.error('Erro ao buscar membros:', error);
      }
    }

    fetchMembros();
  }, []);

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
  
  const [saldoVisivel, setSaldoVisivel] = useState(false);
  const [saldoAtual, setSaldo] = useState<Saldo | null>(null);
  
  useEffect(() => {
    const fetchSaldo = async () => {
      try {
        const response = await api.get('/financas/saldo');        
        setSaldo(response.data)
      } catch (error) {
        console.error('Error fetching saldo:', error);
      }
    };

    fetchSaldo();
  }, [])
  
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');

  useEffect(() => {
    setNome(sessionStorage.getItem('nome') || '');
    setCargo(sessionStorage.getItem('cargo') || '');
  }, []);

  return (
    <main>
      <div className='flex'>
        <MenuLateral/>

        <div className='ml-[20vh]'>
          <div className='flex mt-12'>
            <Link href={'/../../pages/inicio'} className='text-cinza text-lg text3'>Início &#62;</Link>
          </div>

          <div className='bg-azul p-12 rounded-xl mt-12 w-[145vh]'>
            <h1 className='text-white text1 text-5xl ml-3'>A Paz {cargo} {nome}!</h1>
            <h3 className='text-white text2 text-3xl mt-1 ml-3'>Veja as principais informações sobre a sua igreja:</h3>
          </div>

          <div className='flex'>
            <div className='flex flex-col'>
              <div className='mt-10'>
                <div className='bg-white shadow-xl w-[45vh] rounded-xl py-5'>
                  <div className='ml-10'>
                    <Image src={membros} width={80} height={80} alt=''/>
                    <h4 className='text1 text-3xl relative bottom-3'>Membros</h4>
                  </div>
                  <div className='ml-10 my-5 flex'>
                    <div>
                      <p className='text2 text-azul text-xl'>Membros Totais</p>
                      <p className='text2 text-black text-xl'>{totalMembros}</p>
                    </div>
                    <Link className='relative left-24 h-8 flex self-center' href={'/../../pages/membros'}>
                      <Image src={arrow} width={50} height={50} alt=''/>
                    </Link>
                  </div>
                </div>            
              </div>

              <div className='mt-10'>
                <div className='bg-white shadow-xl w-[45vh] rounded-xl py-5'>
                  <div className='ml-10'>
                    <Image className='mt-4' src={evento} width={60} height={80} alt=''/>
                    <h4 className='text1 text-3xl mt-1'>Eventos</h4>
                  </div>
                  <div className='ml-10 my-5 flex'>
                    <div>
                      <p className='text2 text-azul text-xl'>Eventos Totais</p>
                      <p className='text2 text-black text-xl'>{totalEventos}</p>
                    </div>
                    <Link className='relative left-28 h-8 flex self-center' href={'/../../pages/eventos'}>
                      <Image src={arrow} width={50} height={50} alt=''/>
                    </Link>
                  </div>
                </div>            
              </div>
            </div>

            <div>
              <div className='flex flex-col ml-14'>
                <div className='mt-10'>
                  <div className='bg-white shadow-xl w-[45vh] rounded-xl py-5'>
                    <div className='ml-10'>
                      <Image className='mt-3' src={saldo} width={60} height={50} alt=''/>
                      <h4 className='text1 text-3xl mt-1'>Saldo</h4>
                    </div>
                    <div className='ml-10 my-5 flex'>
                      <div>
                        <p className='text2 text-azul text-xl'>Saldo Total</p>
                        <div className='flex'>
                          {saldoVisivel && saldoAtual &&  (
                            <p className='text2 text-black text-xl'>R$ {saldoAtual.saldo}</p>
                          )}
                          <button className='ml-3 mr-6' onClick={() => setSaldoVisivel(!saldoVisivel)}>
                            <Image src={saldoVisivel ? on : off} width={30} height={30} alt=''/>
                          </button>
                        </div>                                              
                      </div>
                      <Link className='relative left-32 h-8 flex self-center' href={'/../../pages/financeiro'}>
                        <Image src={arrow} width={50} height={50} alt=''/>
                      </Link>
                    </div>
                  </div>            
                </div>

                <div className='mt-10'>
                  <div className='bg-white shadow-xl w-[45vh] rounded-xl py-5'>
                    <div className='ml-10'>
                      <Image className='mt-4' src={visitantes} width={90} height={80} alt=''/>
                      <h4 className='text1 text-3xl mt-2'>Visitantes</h4>
                    </div>
                    <div className='ml-10 mt-7 mb-5 flex'>
                      <div>
                        <p className='text2 text-azul text-xl'>Visitantes Totais</p>
                        <p className='text2 text-black text-xl'>{totalVisitantes}</p>
                      </div>
                      <Link className='relative left-24 h-8 flex self-center' href={'/../../pages/visitantes'}>
                        <Image src={arrow} width={50} height={50} alt=''/>
                      </Link>
                    </div>
                  </div>            
                </div>
              </div>
            </div>

            <div>
              <div className='ml-14'>
                <div className='mt-10'>
                  <div className='bg-white shadow-xl w-[43vh] h-[59vh] rounded-xl py-5'>
                    <div className='ml-10'>
                      <Image className='mt-3' src={pedidos} width={60} height={80} alt=''/>
                      <h4 className='text1 text-3xl relative mt-2'>Pedidos</h4>
                    </div>
                    <div className='ml-10 my-6 flex flex-col'>
                      <div className='mt-3'>
                        <p className='text2 text-verde text-xl'>Entregues</p>
                        <p className='text2 text-black text-xl'>{pedidosEntregues}</p>
                      </div>
                      <div className='mt-7'>
                        <p className='text2 text-amarelo text-xl'>Em Andamento</p>
                        <p className='text2 text-black text-xl'>{pedidosEmAndamento}</p>
                      </div>
                      <div className='mt-7'>
                        <p className='text2 text-vermelho text-xl'>Recusados</p>
                        <p className='text2 text-black text-xl'>{pedidosRecusados}</p>
                      </div>
                    </div>
                    <div className='ml-10 my-14 flex'>
                      <div>
                        <p className='text2 text-azul text-xl'>Pedidos Totais</p>
                        <p className='text2 text-black text-xl'>{totalPedidos}</p>
                      </div>
                      <Link className='relative left-32 h-8 flex self-center' href={'/../../pages/pedidos'}>
                        <Image src={arrow} width={50} height={50} alt=''/>
                      </Link>
                    </div>
                  </div>            
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  )
}
