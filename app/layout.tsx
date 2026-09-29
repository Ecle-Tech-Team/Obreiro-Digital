import type { Metadata, Viewport } from 'next'
import { Nunito, Poppins } from 'next/font/google'
import './globals.css'

// Otimização de fontes com display: swap para melhor performance
const poppinsBold = Poppins({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-poppinsBold",
  display: 'swap',
  preload: true,
})
const poppinsSemiBold = Poppins({
  weight: "600",
  subsets: ["latin"],
  variable: "--font-poppinsSemiBold",
  display: 'swap',
  preload: true,
})
const nunito = Nunito({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-nunito",
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'Obreiro Digital - Sistema de Gerenciamento de Igrejas',
  description: 'Sistema completo para gerenciamento de igrejas, membros, eventos e finanças',
  keywords: ['igreja', 'gestão', 'membros', 'eventos', 'finanças', 'sistema'],
  authors: [{ name: 'Ecle-Tech-Team' }],
  creator: 'Ecle-Tech-Team',
  publisher: 'Ecle-Tech-Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#5271FF',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body className={`${poppinsBold.variable} ${poppinsSemiBold.variable} ${nunito.variable}`}>{children}</body>
    </html>
  )
}
