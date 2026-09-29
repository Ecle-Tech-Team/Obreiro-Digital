'use client'
import React, { useState, useEffect } from 'react'
import { Settings } from "lucide-react";
import Image from 'next/image'
import Link from 'next/link'
import logo from '@/public/images/icon.png'
import perfilObreiro from '@/public/images/Obreiro 1.png'

export default function MenuSuperior() {
    const [nome, setNome] = useState('');
    const [cargo, setCargo] = useState('');
  
    useEffect(() => {
      setNome(sessionStorage.getItem('nome') || '');
      setCargo(sessionStorage.getItem('cargo') || '');
    }, []);

  return (
    <header className="mobile-topbar">
        <div className='flex min-w-0 items-center gap-2 px-3 py-2'>
            <div>
                <Image src={perfilObreiro} width={55} height={50} alt=''/>
            </div>
            <div className='flex min-w-0 flex-1 flex-col'>
                <h3 className='text3 truncate text-black text-base sm:text-lg'>{nome}</h3>
                <p className='text2 truncate text-sm text-black'>{cargo}</p>
            </div>
            <div className='flex shrink-0 items-center gap-2'>
              <div>
                <Link href={'/../../pages/configuracoesMobile'} aria-label="Configurações" className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-blue-50">
                  <Settings size={26} className="text-azul" aria-hidden="true"/>
                </Link>
              </div>
              <div>
                <Image src={logo} width={38} height={38} alt='Obreiro Digital'/>
              </div>
            </div>
        </div>
    </header>
  )
}
