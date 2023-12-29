'use client'
import React from 'react'
import { useRouter } from 'next/navigation';
import Link from 'next/link'
import Image from 'next/image'
import inicio from '@/public/icons/inicio-white.svg'
import evento from '@/public/icons/evento-white.svg'
import visitantes from '@/public/icons/visitantes-white.svg'
import pedidos from '@/public/icons/pedidos-white.svg'

export default function MenuInferior() {
  
  const router = useRouter()

  return (
    <main>
      <div className='flex bg-azul py-4 justify-center absolute bottom-0 w-full'>
        <div className='flex flex-row'>
          <div className='px-3'>
            <Link href={'/../../pages/inicioMobile'}>
              <Image src={inicio} width={40} height={30} alt=''/>
            </Link>
          </div>

          <div className='px-7'>
            <Link href={'/../../pages/eventosMobile'}>
              <Image src={evento} width={40} height={30} alt=''/>
            </Link>
          </div>
          
          <div className='px-3'>
            <Link href={'/../../pages/visitantesMobile'}>
              <Image src={visitantes} width={65} height={30} alt=''/>
            </Link>
          </div>

          <div className='px-3'>
            <Link href={'/../../pages/pedidosMobile'}>
              <Image src={pedidos} width={40} height={30} alt=''/>
            </Link>
          </div>
        
        </div>
      </div>
    </main>
  )
}
