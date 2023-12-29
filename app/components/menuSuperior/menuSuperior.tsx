'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import logo from '@/public/images/icon.png'
import perfilObreiro from '@/public/images/Obreiro 1.png'
import config from '@/public/icons/config-black.svg'

export default function MenuSuperior() {
    const [nome, setNome] = useState('');
    const [cargo, setCargo] = useState('');
  
    useEffect(() => {
      setNome(sessionStorage.getItem('nome') || '');
      setCargo(sessionStorage.getItem('cargo') || '');
    }, []);

  return (
    <main>
        <div className='flex p-3'>
            <div>
                <Image src={perfilObreiro} width={55} height={50} alt=''/>
            </div>
            <div className='flex flex-col ml-2'>
                <h3 className='text3 text-black text-lg relative bottom-1'>{nome}</h3>
                <p className='text2 text-black relative bottom-3'>{cargo}</p>
            </div>
            <div className='ml-[20vh] flex'>
              <div className='relative right-2'>
                <Link href={'/../../pages/configuracoesMobile'}>
                  <Image src={config} width={47} height={50} alt=''/>
                </Link>
              </div>
              <div>
                <Image src={logo} width={50} height={50} alt=''/>
              </div>
            </div>
        </div>
    </main>
  )
}
