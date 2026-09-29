"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/public/images/icon.png";
import perfilPastor from "@/public/images/Pastor 1.png";
import { isMatriz } from "@/app/utils/auth";

import {
  Home,
  Calendar,
  Users,
  Church,
  DollarSign,
  FileText,
  Package,
  Settings,
  Menu,
  X,
} from "lucide-react";

type MenuItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  onlyMatriz?: boolean;
  hideForMatriz?: boolean;
};

export default function MenuLateral() {
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setNome(sessionStorage.getItem("nome") || "");
    setCargo(sessionStorage.getItem("cargo") || "");
    setMounted(true);
  }, []);

  const matriz = useMemo(() => {
    if (!mounted) return false;
    return isMatriz();
  }, [mounted]);

  const menuItems: MenuItem[] = [
    {
      href: "/pages/inicio",
      label: "Início",
      icon: Home,
    },
    {
      href: "/pages/eventos",
      label: "Eventos",
      icon: Calendar,
    },
    {
      href: "/pages/igrejas",
      label: "Igrejas",
      icon: Church,
      onlyMatriz: true,
    },
    {
      href: "/pages/membros",
      label: "Membros",
      icon: Users,
      hideForMatriz: true,
    },
    {
      href: "/pages/financeiro",
      label: "Financeiro",
      icon: DollarSign,
    },
    {
      href: "/pages/relatorios",
      label: "Relatórios",
      icon: FileText,
    },
    {
      href: "/pages/pedidos",
      label: "Pedidos",
      icon: Package,
    },
    {
      href: "/pages/estoque",
      label: "Estoque",
      icon: Package,
    },
    {
      href: "/pages/configuracoes",
      label: "Configurações",
      icon: Settings,
    },
  ];

  const visibleItems = menuItems.filter((item) => {
    if (item.onlyMatriz && !matriz) return false;
    if (item.hideForMatriz && matriz) return false;
    return true;
  });

  return (
    <>
    <button
      type="button"
      className="sidebar-trigger"
      onClick={() => setOpen(true)}
      aria-label="Abrir menu"
      aria-expanded={open}
      aria-controls="menu-lateral"
    >
      <Menu aria-hidden="true" size={24} />
    </button>
    {open && <button type="button" className="sidebar-backdrop" onClick={() => setOpen(false)} aria-label="Fechar menu" />}
    <aside id="menu-lateral" className={`app-sidebar fixed inset-y-0 left-0 z-50 h-screen w-64 overflow-y-auto border-r border-gray-200 bg-white shadow-xl ${open ? "is-open" : ""}`}>
      <div className="flex h-full flex-col">
        {/* Topo */}
        <div className="flex min-h-[80px] items-center justify-center border-b border-gray-100 px-3 lg:justify-start lg:px-6">
          <div className="flex items-center justify-center lg:justify-start">
            <Image
              src={logo}
              width={42}
              height={42}
              alt="Obreiro Digital"
              className="flex-shrink-0"
              priority
            />
            <button type="button" className="sidebar-close" onClick={() => setOpen(false)} aria-label="Fechar menu">
              <X aria-hidden="true" size={22} />
            </button>
          </div>
        </div>

        {/* Perfil */}
        <div className="border-b border-gray-100 px-3 py-4">
          <div className="flex items-center justify-center lg:justify-start lg:space-x-3">
            <Image
              src={perfilPastor}
              width={48}
              height={48}
              alt={`Foto de ${nome || "usuário"}`}
              className="rounded-full border-2 border-azul flex-shrink-0"
            />

            <div className="hidden min-w-0 flex-1 lg:block">
              <h2 className="text1 truncate text-sm font-bold text-black">
                {nome}
              </h2>
              <h3 className="text2 truncate text-xs text-gray-600">
                {cargo}
              </h3>
            </div>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 py-4">
          <div className="space-y-2 px-2">
            {visibleItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  aria-label={item.label}
                  onClick={() => setOpen(false)}
                  className="group flex h-12 items-center justify-start rounded-xl px-4 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50 hover:text-azul"
                >
                  <Icon className="h-6 w-6 flex-shrink-0 text-gray-600 transition-colors duration-200 group-hover:text-azul" />

                  <span className="text1 ml-3 block min-w-0 truncate">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
    </>
  );
}
