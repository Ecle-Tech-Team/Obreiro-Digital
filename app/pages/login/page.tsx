'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link';
import api from '../../api/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { cookies } from 'next/dist/client/components/headers';
import logo from '@/public/images/icon-white.png'
import on from '@/public/icons/on.svg'
import off from '@/public/icons/off.svg'

export default function Login() {

  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  async function handleLogin(event: React.FormEvent){
    event.preventDefault()

    const notifySuccess = () => {
      toast.success('Login realizado com sucesso!', {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        });
    }

    const notifyWarn = () => {
      toast.warn('Preencha os campos!', {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        });
    }

    const notifyError = () => {
      toast.error('Erro no login, Tente novamente.', {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }

    try {
      if (!email || !senha) {
          notifyWarn();
          return;
      }

      else {
          const dataLogin = {
              email,
              senha
          }

          const response = await api.post('/login', dataLogin);
          const userData = response.data.user;

          sessionStorage.setItem("id_user", userData.id_user);
          sessionStorage.setItem("nome", userData.nome);
          sessionStorage.setItem("cargo", userData.cargo);
          sessionStorage.setItem("id_igreja", userData.id_igreja);
          sessionStorage.setItem('token', response.data.token);
          sessionStorage.setItem("email", email);
          sessionStorage.setItem("id_matriz", userData.id_matriz);
          
          notifySuccess();

          if (userData.cargo === "Pastor" || "Pastor Matriz") {
            setTimeout(() => {
                router.push('/pages/inicio', { scroll: false });
            }, 1500);
          } else if (userData.cargo === "Obreiro" || "Obreiro Matriz") {
            setTimeout(() => {
                router.push('/pages/inicioMobile', { scroll: false });
            }, 1500);
          }
      }
  } 
  
  catch {
      notifyError();
  }

  }
  return (
    <main className='overflow-hidden'>
      <div className='bg-azul min-h-screen flex justify-center'>
        <div className='flex justify-center items-center'>
          <div>
            <div className='flex justify-center'>
              <Image src={logo} width={75} height={10} alt=''/>
              <h2 className='ml-3 font-extrabold text-4xl text-white text1'>OBREIRO<br/>DIGITAL</h2>
            </div>

            <div className='flex flex-col'>
              <div>
                <h1 className='text-white text-4xl mt-10 text1 flex justify-center'>Login</h1>
                <p className='text-white text-xl text2 mt-2 flex justify-center mb-6'>Bem-vindo(a) de volta!</p>
              </div>

              <div className='flex flex-col'>
                <label className='text-white text1 text-xl mt-2 mb-1'>Email</label>

                <input 
                  className='px-4 py-3.5 w-[40vh] mb-3 text2 rounded-lg text-black' 
                  type="text" 
                  placeholder='Digite o Email...'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className='flex flex-col'>
                <label className='text-white text1 text-xl mb-1'>Senha</label>

                <input 
                  className='px-4 py-3.5 w-[40vh] mb-3 text2 rounded-lg text-black' 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder='Digite a Senha...'
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required 
                />
              </div>

              <div className='flex justify-center'>
                <input className='w-5' type="checkbox" name="" id="" />
                <p className='text-white text-lg mt-1 text2 ml-2'>Manter Conectado</p>
                <button 
                  type='button'
                  className='ml-[16vh]'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Image src={showPassword ? on : off} width={40} height={40} alt={showPassword ? 'Open' : 'Closed'}/>
                </button>
              </div>

              <button type='submit' className='border-2 rounded-lg h-12 mt-3 border-white text2 text-white active:bg-white active:text-azul' onClick={handleLogin}>Entrar</button>
              <ToastContainer />

              <button className='flex justify-center text-lg text2 text-white mt-6'>Esqueci a senha</button>
              
              <div className='flex justify-center mt-6'>
                <p className='text-lg text2 text-white'>Novo por aqui?<Link href={'/../../pages/cadastroIgreja'} className='text1 ml-1'>Cadastro</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}