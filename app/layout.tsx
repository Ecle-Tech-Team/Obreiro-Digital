import type { Metadata } from 'next'
import { Nunito, Poppins } from 'next/font/google'
import './globals.css'

const poppinsBold = Poppins({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-poppinsBold",
})
const poppinsSemiBold = Poppins({
  weight: "600",
  subsets: ["latin"],
  variable: "--font-poppinsSemiBold",
})
const nunito = Nunito({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-nunito",
})

export const metadata: Metadata = {
  title: 'Obreiro Digital',
  description: 'Sistema de Gerenciamento de Igrejas',
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
