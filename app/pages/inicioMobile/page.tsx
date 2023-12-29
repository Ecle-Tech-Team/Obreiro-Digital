'use client'
import React, { useState, useEffect } from 'react'
import MenuInferior from '@/app/components/menuInferior/menuInferior'
import MenuSuperior from '@/app/components/menuSuperior/menuSuperior'
import eventos from '@/public/icons/evento.svg'
import visitantes from '@/public/icons/visitantes.svg'
import pedidos from '@/public/icons/pedidos.svg'
import calendar from '@/public/icons/calendar.svg'
import Image from 'next/image'

export default function inicioMobile() {
  
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
                  <p className='text2 text-black text-base relative bottom-1'>123</p>
                </div>
              </div>

              <div className='bg-white shadow-xl w-[20vh] rounded-xl py-2 mt-6 ml-8'>
                <div className='ml-4 mt-3'>
                  <Image src={visitantes} width={40} height={40} alt=''/>
                  <h4 className='text3 text-xl text-black mt-1'>Visitantes</h4>
                </div>

                <div className='ml-4 mt-3'>
                  <p className='text2 text-azul text-base'>Visitantes Totais</p>
                  <p className='text2 text-black text-base relative bottom-1'>123</p>
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
                    <p className='text2 text-verde text-base'>Concluídos</p>
                    <p className='text2 text-black text-base relative bottom-1'>1</p>
                  </div>
                  <div>
                    <p className='text2 text-amarelo text-base'>Em Andamento</p>
                    <p className='text2 text-black text-base relative bottom-1'>2</p>
                  </div>
                  <div>
                    <p className='text2 text-vermelho text-base'>Expirados</p>
                    <p className='text2 text-black text-base relative bottom-1'>0</p>
                  </div>
                </div>

                <div className='ml-4'>
                  <p className='text2 text-azul text-base'>Pedidos Totais</p>
                  <p className='text2 text-black text-base relative bottom-1'>3</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
