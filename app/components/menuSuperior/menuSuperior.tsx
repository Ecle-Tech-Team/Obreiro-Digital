'use client'
import { useState, useEffect } from 'react'
import { Settings } from "lucide-react";
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import logo from '@/public/images/icon.png'
import perfilObreiro from '@/public/images/Obreiro 1.png'

export default function MenuSuperior() {
    const pathname = usePathname();
    const [nome, setNome] = useState('');
    const [cargo, setCargo] = useState('');
  
    useEffect(() => {
      setNome(sessionStorage.getItem('nome') || '');
      setCargo(sessionStorage.getItem('cargo') || '');
    }, []);

  return (
    <header className="mobile-topbar">
        <div className="mx-auto w-full max-w-5xl px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <Image src={logo} width={40} height={40} alt="Obreiro Digital" className="h-10 w-10 shrink-0 rounded-xl" />

            <Link href="/pages/configuracoesMobile" aria-label="Configurações" title="Configurações" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-azul shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul">
              <Settings size={22} aria-hidden="true" />
            </Link>
          </div>

          {pathname === '/pages/configuracoesMobile' && (
            <div className="mt-3 flex min-w-0 items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-3 py-2">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-white shadow-sm">
                <Image src={perfilObreiro} width={36} height={36} alt="" className="h-9 w-9 object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Meu perfil</p>
                <p className="text3 truncate text-sm font-semibold text-slate-900 sm:text-base">{nome}</p>
                <p className="text2 truncate text-xs text-slate-600">{cargo}</p>
              </div>
            </div>
          )}
        </div>
    </header>
  )
}
