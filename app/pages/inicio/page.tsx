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
import cast from '@/public/icons/cast.svg'

interface Saldo {
  id_saldo: number;
  saldo: number;
  id_igreja: number;
}

interface User {
  id_user: number;
  id_igreja: number;
};

export default function inicio() {
  const [user, setUser] = useState<User | null>(null);
  const [totalPedidos, setTotalPedidos] = useState<number>(0);
  const [pedidosEntregues, setPedidosEntregues] = useState<number>(0);
  const [pedidosEmAndamento, setPedidosEmAndamento] = useState<number>(0);
  const [pedidosRecusados, setPedidosRecusados] = useState<number>(0);
  
  useEffect(() => {
    const fetchTotalPedidos = async () => {
      try {
        const id_igreja = sessionStorage.getItem('id_igreja');
        const response = await api.get(`/pedido/count/total/${id_igreja}`);
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
        const id_igreja = sessionStorage.getItem('id_igreja');
        const response = await api.get(`/pedido/count/entregue/${id_igreja}`);
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
        const id_igreja = sessionStorage.getItem('id_igreja');
        const response = await api.get(`pedido/count/em-andamento/${id_igreja}`);
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
        const id_igreja = sessionStorage.getItem('id_igreja');
        const response = await api.get(`pedido/count/recusados/${id_igreja}`);
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
        const id_igreja = sessionStorage.getItem('id_igreja');
        const response = await api.get(`membro/count/${id_igreja}`);
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
        const id_igreja = sessionStorage.getItem('id_igreja');
        const response = await api.get(`evento/count/${id_igreja}`);
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
        const id_igreja = sessionStorage.getItem('id_igreja');
        const response = await api.get(`visitante/count/${id_igreja}`);
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
        const userResponse = await api.get('/cadastro');
        setUser(userResponse.data);
        if (userResponse.data && userResponse.data.id_igreja) {
          const response = await api.get(`/financas/saldo/${userResponse.data.id_igreja}`);       
          setSaldo(response.data)
        }
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
    <main className="min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row">
        <MenuLateral/>

        <div className="sm:ml-[15vh] md:ml-[30vh] lg:ml-[15vh] mr-[10vh] mb-[5vh]">
          <div className='flex justify-between items-center mt-12'>
            <Link href={'/../../pages/inicio'} className='text-cinza text-lg text3'>Início &#62;</Link>
            
            <Link
              className="flex bg-azul items-center justify-center px-5 py-2 cursor-pointer rounded-lg focus:outline-none"
              href={"/../../pages/apresentacao"}
            >
                <Image src={cast} 
                width={30} 
                height={30} 
                alt="Filtrar" 
                />
          </Link>            
          </div>

          <div className='bg-azul sm:p-8 md:p-10 lg:p-12 rounded-xl mt-2'>
            <h1 className='text-white text1 ml-3 sm:text-2xl md:text-3xl lg:text-5xl'>A Paz {cargo} {nome}!</h1>
            <h3 className='text-white text2 mt-1 ml-3 sm:text-xl md:text-xl lg:text-3xl'>Veja as principais informações sobre a sua igreja:</h3>
          </div>  

          <div className='grid grid-cols-1 md:grid-cols-2 gap-10 mt-6 lg:w-[130vh]'>
            <div className='bg-white shadow-xl rounded-xl p-6'>
              <div className='flex items-center'>
                <Image src={membros} width={50} height={50} alt=''/>
                <h4 className='text1 text-black sm:text-xl md:text-xl lg:text-3xl ml-3'>Membros</h4>
              </div>
              <div className='mt-4'>
                <p className='text2 text-azul text-xl'>Membros Totais</p>
                <p className='text2 text-black text-xl'>{totalMembros}</p>
              </div>
              <Link className='mt-4 inline-flex items-center' href={'/../../pages/membros'}>
                <span className='text2 text-blue-500'>Ver detalhes</span>
                <Image src={arrow} width={30} height={30} alt='' className='ml-1'/>
              </Link>
            </div>

            <div className='bg-white shadow-xl rounded-xl p-6'>
              <div className='flex items-center'>
                <Image src={evento} width={40} height={40} alt=''/>
                <h4 className='text1 text-black sm:text-xl md:text-xl lg:text-3xl ml-3'>Eventos</h4>
              </div>
              <div className='mt-4'>
                <p className='text2 text-azul text-xl'>Eventos Totais</p>
                <p className='text2 text-black text-xl'>{totalEventos}</p>
              </div>
              <Link className='mt-4 inline-flex items-center' href={'/../../pages/eventos'}>
                <span className='text2 text-blue-500'>Ver detalhes</span>
                <Image src={arrow} width={30} height={30} alt='' className='ml-1'/>
              </Link>
            </div>

            <div className='bg-white shadow-xl rounded-xl p-6 '>
              <div className='flex items-center'>
                <Image src={saldo} width={45} height={45} alt=''/>
                <h4 className='text1 text-black sm:text-xl md:text-xl lg:text-3xl ml-3'>Saldo</h4>
              </div>
              <div className='mt-4'>
                <p className='text2 text-azul text-xl'>Saldo Total</p>
                <p className='text2 text-black text-xl'>{saldoVisivel && saldoAtual ? `R$ ${saldoAtual.saldo}` : '---'}</p>
              </div>
              <button className='mt-4 inline-flex items-center' onClick={() => setSaldoVisivel(!saldoVisivel)}>
                <span className='text2 text-blue-500'>{saldoVisivel ? 'Ocultar' : 'Mostrar'} saldo</span>
                <Image src={saldoVisivel ? on : off} width={30} height={30} alt='' className='ml-1'/>
              </button>
            </div>

            <div className='bg-white shadow-xl rounded-xl p-6'>
              <div className='flex items-center'>
                <Image src={visitantes} width={50} height={50} alt=''/>
                <h4 className='text1 text-black sm:text-xl md:text-xl lg:text-3xl ml-3'>Visitantes</h4>
              </div>
              <div className='mt-4'>
                <p className='text2 text-azul text-xl'>Visitantes Totais</p>
                <p className='text2 text-black text-xl'>{totalVisitantes}</p>
              </div>
              <Link className='mt-4 inline-flex items-center' href={'/../../pages/visitantes'}>
                <span className='text2 text-blue-500'>Ver detalhes</span>
                <Image src={arrow} width={30} height={30} alt='' className='ml-1'/>
              </Link>
            </div>

            <div className='bg-white shadow-xl rounded-xl p-6'>
              <div className='flex items-center'>
                <Image src={pedidos} width={40} height={40} alt=''/>
                <h4 className='text1 text-black sm:text-xl md:text-xl lg:text-3xl ml-3'>Pedidos</h4>
              </div>
              <div className='mt-4'>
                <p className='text2 text-verde sm:text-lg md:text-lg lg:text-xl'>Pedidos Entregues</p>
                <p className='text2 text-black sm:text-lg md:text-lg lg:text-xl'>{pedidosEntregues}</p>
                <p className='text2 text-amarelo sm:text-lg md:text-lg lg:text-xl mt-4'>Pedidos em Andamento</p>
                <p className='text2 text-black sm:text-lg md:text-lg lg:text-xl'>{pedidosEmAndamento}</p>
                <p className='text2 text-vermelho sm:text-lg md:text-lg lg:text-xl mt-4'>Pedidos Recusados</p>
                <p className='text2 text-black sm:text-lg md:text-lg lg:text-xl'>{pedidosRecusados}</p>
              </div>
              <Link className='mt-4 inline-flex items-center' href={'/../../pages/pedidos'}>
                <span className='text2 text-blue-500'>Ver detalhes</span>
                <Image src={arrow} width={30} height={30} alt='' className='ml-1'/>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>

  )
}
