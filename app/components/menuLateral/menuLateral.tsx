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
import hamburger from '@/public/icons/hamburguer.svg'

export default function MenuLateral() {

  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setNome(sessionStorage.getItem('nome') || '');
    setCargo(sessionStorage.getItem('cargo') || '');
  }, []);
  
  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
      },
    },
    closed: {
      opacity: 1,
      x: '-2%',
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className=''
    >    
      <div className='ml-6 fixed inset-y-0 left-0 sm:w-[20vh] md:w-20 lg:w-64 overflow-y-hidden lg:sticky lg:h-screen z-50'>
        <div className=''>
          <div className="lg:hidden mt-12">
            <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
              <svg width="55" height="51" viewBox="0 0 45 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="45" height="41" rx="5" fill="#5271FF"/>
                <line x1="9.94128" y1="10" x2="35.0589" y2="10" stroke="white" stroke-width="4" stroke-linecap="round"/>
                <line x1="9.94128" y1="20" x2="35.0589" y2="20" stroke="white" stroke-width="4" stroke-linecap="round"/>
                <line x1="9.94128" y1="30" x2="35.0589" y2="30" stroke="white" stroke-width="4" stroke-linecap="round"/>
              </svg>
            </button>
          </div>


          <motion.div 
            initial="closed"
            animate={menuOpen ? 'open' : 'closed'}
            variants={itemVariants}>

            <div className={`lg:ml-6 mt-14 ${menuOpen ? 'block' : 'hidden'} lg:block`}>
              <Image src={logo} width={55} height={50} alt=''/>          
            </div>
          </motion.div>

          <motion.div 
            initial="closed"
            animate={menuOpen ? 'open' : 'closed'}
            variants={itemVariants}>

            <div className={`lg:ml-6 mt-[8vh] flex ${menuOpen ? 'block' : 'hidden'} sm:flex-col md:flex-col lg:flex`}>
              <Image src={perfilPastor} width={60} height={50} alt=''/>
              <div className='flex flex-col justify-center mt-4'>
                <h2 className='font-bold text-black text-xl text1'>{nome}</h2>
                <h3 className='font-bold text-black text-lg text2'>{cargo}</h3>
              </div>  
            </div>
          </motion.div>


          <div className={`ml-5 mt-7 sm:mt-12 md:mt-12 ${menuOpen ? 'block' : 'hidden'} lg:block`}>
            <motion.div 
              initial="closed"
              animate={menuOpen ? 'open' : 'closed'}
              variants={itemVariants}>

              <Link className='flex w-[13vh]' href={'/../../pages/inicio'}>
                <Image src={inicio} width={30} height={30} alt=''/>
                <p className='ml-4 font-bold text-2xl text-black text1 sm:hidden md:hidden lg:block'>Início</p>
              </Link>
            </motion.div>

            <motion.div 
              initial="closed"
              animate={menuOpen ? 'open' : 'closed'}
              variants={itemVariants}>

              <Link className='flex mt-7 w-[16vh]' href={'/../../pages/eventos'}>
                <Image src={evento} width={30} height={30} alt=''/>
                <p className='ml-4 font-bold text-2xl text-black text1 sm:hidden md:hidden lg:block'>Eventos</p>
              </Link>
            </motion.div>
          </div>

          <div className={`ml-5 mt-[7vh] ${menuOpen ? 'block' : 'hidden'} lg:block`}>
            <motion.div 
              initial="closed"
              animate={menuOpen ? 'open' : 'closed'}
              variants={itemVariants}>

              <Link className='flex mt-7 w-[18vh]' href={'/../../pages/membros'}>
                <Image src={membros} width={35} height={0} alt=''/>
                <p className='ml-3 font-bold text-2xl text-black text1 sm:hidden md:hidden lg:block'>Membros</p>
              </Link>
            </motion.div>
            
            <motion.div 
              initial="closed"
              animate={menuOpen ? 'open' : 'closed'}
              variants={itemVariants}>

              <Link className='flex mt-7 w-[19vh]' href={'/../../pages/financeiro'}>
                <Image src={financas} width={30} height={30} alt=''/>
                <p className='ml-4 font-bold text-2xl text-black text1 sm:hidden md:hidden lg:block'>Financeiro</p>
              </Link>
            </motion.div>
            
            {/* <Link className='flex mt-7 w-[17vh]' href={'/../../pages/relatorio'}>
              <Image src={relatorio} width={30} height={30} alt=''/>
              <p className='ml-4 font-bold text-2xl text1'>Relatório</p>
              </Link> */}

            <motion.div 
              initial="closed"
              animate={menuOpen ? 'open' : 'closed'}
              variants={itemVariants}>
            
              <Link className='flex mt-7 w-[16vh]' href={'/../../pages/pedidos'}>
                <Image src={pedidos} width={30} height={30} alt=''/>
                <p className='ml-4 font-bold text-2xl text-black text1 sm:hidden md:hidden lg:block'>Pedidos</p>
              </Link>
            </motion.div>
            
            <motion.div 
              initial="closed"
              animate={menuOpen ? 'open' : 'closed'}
              variants={itemVariants}>

              <Link className='flex mt-7 w-[16vh]' href={'/../../pages/estoque'}>
                <Image src={estoque} width={35} height={30} alt=''/>
                <p className='ml-3 font-bold text-2xl text-black text1 sm:hidden md:hidden lg:block'>Estoque</p>
              </Link>
            </motion.div>
            
            <motion.div
              initial="closed"
              animate={menuOpen ? 'open' : 'closed'}
              variants={itemVariants}>
            
              <Link className='flex mt-7 w-[16vh]' href={'/../../pages/configuracoes'}>
                <Image src={config} width={30} height={30} alt=''/>
                <p className='ml-4 font-bold text-2xl text1 sm:hidden md:hidden lg:block'>Configurações</p>
              </Link>
            </motion.div>
          </div>               
        </div>
        
      </div>
    </motion.main>
  )
}
