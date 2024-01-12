'use client'
import React, { useState, useEffect} from 'react'
import { motion } from 'framer-motion';
import Image from 'next/image'
import Link from 'next/link'
import logo from '@/public/images/icon.png'
import perfilPastor from '@/public/images/Pastor 1.png'
import inicio from '@/public/icons/inicio.png'
import evento from '@/public/icons/evento.png'
import membros from '@/public/icons/groups_black_24dp(1).svg'
import financas from '@/public/icons/financas.png'
import relatorio from '@/public/icons/relatorios.png'
import pedidos from '@/public/icons/pedidos.png'
import estoque from '@/public/icons/inventory_2_black_24dp.svg'
import config from '@/public/icons/config.png'

export default function MenuLateral() {

  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');

  useEffect(() => {
    setNome(sessionStorage.getItem('nome') || '');
    setCargo(sessionStorage.getItem('cargo') || '');
  }, []);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >    
      <div className='ml-6'>
        <div className='flex mt-12'>
          <Image src={logo} width={75} height={50} alt=''/>
          <h2 className='ml-3 font-extrabold text-4xl text-black text1'>OBREIRO<br/>DIGITAL</h2>
        </div>

        <div className='mt-[8vh] flex'>
          <Image src={perfilPastor} width={70} height={50} alt=''/>
          <div className='ml-3 flex flex-col justify-center'>
            <h2 className='font-bold text-black text-xl text1'>{nome}</h2>
            <h3 className='font-bold text-black text-lg text2'>{cargo}</h3>
          </div>  
        </div>

        <div className='ml-5 mt-20'>
          <Link className='flex w-[13vh]' href={'/../../pages/inicio'}>
            <Image src={inicio} width={30} height={30} alt=''/>
            <p className='ml-4 font-bold text-2xl text1'>Início</p>
          </Link>

          <Link className='flex mt-7 w-[16vh]' href={'/../../pages/eventos'}>
            <Image src={evento} width={30} height={30} alt=''/>
            <p className='ml-4 font-bold text-2xl text1'>Eventos</p>
          </Link>
        </div>

        <div className='ml-5 mt-[7vh]'>
          <Link className='flex mt-7 w-[18vh]' href={'/../../pages/membros'}>
            <Image src={membros} width={35} height={0} alt=''/>
            <p className='ml-3 font-bold text-2xl text1'>Membros</p>
          </Link>
          
          <Link className='flex mt-7 w-[19vh]' href={'/../../pages/financeiro'}>
            <Image src={financas} width={30} height={30} alt=''/>
            <p className='ml-4 font-bold text-2xl text1'>Financeiro</p>
          </Link>
          
          {/* <Link className='flex mt-7 w-[17vh]' href={'/../../pages/relatorio'}>
            <Image src={relatorio} width={30} height={30} alt=''/>
            <p className='ml-4 font-bold text-2xl text1'>Relatório</p>
          </Link> */}

          <Link className='flex mt-7 w-[16vh]' href={'/../../pages/pedidos'}>
            <Image src={pedidos} width={30} height={30} alt=''/>
            <p className='ml-4 font-bold text-2xl text1'>Pedidos</p>
          </Link>
          
          <Link className='flex mt-7 w-[16vh]' href={'/../../pages/estoque'}>
            <Image src={estoque} width={35} height={30} alt=''/>
            <p className='ml-3 font-bold text-2xl text1'>Estoque</p>
          </Link>
        </div>

        <div className='ml-5 mt-20 w-[25vh]'>
          {/* <Link className='flex mt-7' href={'/../../pages/configuracoes'}>
            <Image src={config} width={30} height={30} alt=''/>
            <p className='ml-4 font-bold text-2xl text1'>Configurações</p>
          </Link> */}
        </div>  
      </div>
    </motion.main>
  )
}
