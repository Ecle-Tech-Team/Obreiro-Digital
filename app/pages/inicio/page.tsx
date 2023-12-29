'use client'
import React, { useState, useEffect } from 'react'
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

export default function inicio() {
  
  const [saldoVisivel, setSaldoVisivel] = useState(false);
  
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
                      <p className='text2 text-black text-xl'>123</p>
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
                      <p className='text2 text-black text-xl'>123</p>
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
                        {saldoVisivel ? (
                          <div className='flex'>
                            <p className='text2 text-black text-xl'>1.000,00</p>
                            <button
                              className='ml-2'
                              type="button"
                              onClick={() => setSaldoVisivel(false)}
                            >
                              <Image src={on} width={30} height={30} alt=''/>
                            </button>
                          </div>
                        ) : (
                          <button
                            className='ml-2'
                            type="button"
                            onClick={() => setSaldoVisivel(true)}
                          >
                            <Image src={off} width={30} height={30} alt=''/>
                          </button>
                        )}
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
                        <p className='text2 text-black text-xl'>123</p>
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
                        <p className='text2 text-verde text-xl'>Concluídos</p>
                        <p className='text2 text-black text-xl'>1</p>
                      </div>
                      <div className='mt-7'>
                        <p className='text2 text-amarelo text-xl'>Em Andamento</p>
                        <p className='text2 text-black text-xl'>2</p>
                      </div>
                      <div className='mt-7'>
                        <p className='text2 text-vermelho text-xl'>Expirados</p>
                        <p className='text2 text-black text-xl'>0</p>
                      </div>
                    </div>
                    <div className='ml-10 my-14 flex'>
                      <div>
                        <p className='text2 text-azul text-xl'>Pedidos Totais</p>
                        <p className='text2 text-black text-xl'>3</p>
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
