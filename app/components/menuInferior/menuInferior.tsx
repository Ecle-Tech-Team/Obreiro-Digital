'use client'
import React from 'react'
import { CalendarDays, House, Package, Users } from "lucide-react";
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MenuInferior() {
  const pathname = usePathname()

  return (
    <nav className="mobile-bottom-nav" aria-label="Navegação principal">
        <div className='grid grid-cols-4 gap-1'>
          <div>
            <Link className="mobile-bottom-link" href={'/../../pages/inicioMobile'} aria-label="Início" aria-current={pathname === '/pages/inicioMobile' ? 'page' : undefined}>
              <House size={24} aria-hidden="true"/>
              <span>Início</span>
            </Link>
          </div>

          <div>
            <Link className="mobile-bottom-link" href={'/../../pages/eventosMobile'} aria-label="Eventos" aria-current={pathname === '/pages/eventosMobile' ? 'page' : undefined}>
              <CalendarDays size={24} aria-hidden="true"/>
              <span>Eventos</span>
            </Link>
          </div>
          
          <div>
            <Link className="mobile-bottom-link" href={'/../../pages/visitantesMobile'} aria-label="Visitantes" aria-current={pathname === '/pages/visitantesMobile' ? 'page' : undefined}>
              <Users size={24} aria-hidden="true"/>
              <span>Visitantes</span>
            </Link>
          </div>

          <div>
            <Link className="mobile-bottom-link" href={'/../../pages/pedidosMobile'} aria-label="Pedidos" aria-current={pathname === '/pages/pedidosMobile' ? 'page' : undefined}>
              <Package size={24} aria-hidden="true"/>
              <span>Pedidos</span>
            </Link>
          </div>
        
        </div>
    </nav>
  )
}
