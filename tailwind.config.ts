import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'fundo': '#F5F5F5',
        'azul': '#5271FF',
        'cinza': '#D9D9D9',
        'verde': '#30CD36',
        'amarelo': '#FFCF52',
        'vermelho': '#FF5252'
      },
      boxShadow: {
        'xl': '0px 0px 22px -5px rgba(0, 0, 0, 0.25)'
      }
    },
  },
  plugins: [],
}
export default config
