'use client'
import React from 'react'
import Image from 'next/image'
import api from '../../api/api';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '@/public/images/icon-white.png';
import on from '@/public/icons/on.svg';
import off from '@/public/icons/off.svg';

interface Igreja {
  id_igreja: number;
  nome: string;
};

export default function cadastroPastor() {
  const [cod_membro, setCodMembro] = useState<string>('');
  const [nome, setNome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [birth, setBirth] = useState<string>('');
  const [cargo, setCargo] = useState<string>('Pastor');
  const [nomeIgreja, setNomeIgreja] = useState<number>(0)

  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const [igreja, setIgreja] = useState<Igreja[]>([]);

  useEffect(() => {
    const fetchIgrejas = async () => {
      try {
        const response = await api.get('/departamento/igreja');
        setIgreja(response.data);
      } catch (error) {
        console.error('Error fetching igrejas:', error);
      }
    };

    fetchIgrejas()
  }, []);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();        

    const specialCharactersRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    const invalidCharactersRegex = /[^a-zA-Z\s]/;

    const notifySuccess = () => {
      toast.success('Pastor cadastrado com sucesso!', {
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
      toast.warn('Todos os campos devem ser preenchidos!', {
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
      toast.error('Erro no cadastro, Tente novamente.', {
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
    
    try{
      if(cod_membro === "" || nome === "" || email === "" || senha === "" ||  birth === "" || cargo === "" || nomeIgreja === 0) {
          notifyWarn();
          return;
      } else {
        const data = {              
          cod_membro,
          nome,
          email,
          senha,
          birth,
          cargo,
          id_igreja: nomeIgreja
        }           
       
        const response = await api.post('/cadastro', data)           
        
        notifySuccess();

        setTimeout(() => {
          router.push('/pages/login', { scroll: false });
      }, 1500);
      }
    } catch{
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
                            <h1 className='text-white text-4xl mt-10 text1 flex justify-center'>Cadastro de Pastor</h1>
                            <p className='text-white text-xl text2 mt-2 flex justify-center mb-6'>Agora, cadastre o Pastor da sua igreja para acessar o sistema</p>
                        </div>
                        <div className=''>
                            <div className='flex flex-col'>
                                <label className='text-white text1 text-xl mt-2 mb-1'>Código de Membro</label>

                                <input 
                                  className='px-4 py-3.5 mb-1 text2 rounded-lg text-black' 
                                  type="text" 
                                  placeholder='Digite o Código...'
                                  value={cod_membro}
                                  onChange={e => setCodMembro(e.target.value)}
                                  maxLength={16}                                    
                                />
                            </div>
                            
                            
                            <div className='flex flex-col'>
                              <label className='text-white text1 text-xl mt-2 mb-1'>Nome</label>

                              <input 
                                className='px-4 py-3 mb-1 text2 rounded-lg text-black' 
                                type="text" 
                                placeholder='Digite o Nome...'
                                value={nome}
                                onChange={e => setNome(e.target.value)}
                                maxLength={150}
                                required
                              />
                            </div>

                            <div className='flex flex-col'>
                              <label className='text-white text1 text-xl mt-2 mb-1'>Email</label>

                              <input 
                                className='px-4 py-3 mb-1 text2 rounded-lg text-black' 
                                type="email" 
                                placeholder='Digite o Email'
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                maxLength={150}
                                required
                              />
                            </div>
                            

                                <div className='flex flex-col'>
                                    <label className='text-white text1 text-xl mt-2 mb-1'>Senha</label>

                                    <div className='flex'>
                                      <input 
                                        className='px-4 py-3 mb-1 w-[30vh] text2 rounded-lg text-black' 
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder='Digite a Senha...'
                                        value={senha}
                                        onChange={e => setSenha(e.target.value)}
                                        maxLength={16}
                                        required
                                      />

                                      <button 
                                        type='button'
                                        className='ml-[1vh]'
                                        onClick={() => setShowPassword(!showPassword)}
                                      >
                                        <Image src={showPassword ? on : off} width={40} height={40} alt={showPassword ? 'Open' : 'Closed'}/>
                                      </button>
                                    </div>                                
                                </div>                            

                            <div className='flex'>
                              <div className='flex flex-col'>
                                <label className='text-white text1 text-xl mt-2 mb-1'>Data de Nascimento</label>

                                <input 
                                  className='px-4 py-3 mb-1 w-[30vh] text2 rounded-lg text-black' 
                                  type="date" 
                                  value={birth}
                                  onChange={e => setBirth(e.target.value)}
                                  required
                                />
                              </div>

                              <div className='flex flex-col ml-5'>
                                <label className='text-white text1 text-xl mt-2 mb-1'>Endereço</label>

                                <select 
                                  className='bg-white px-4 py-3 mb-1 w-[32vh] text2 rounded-lg text-black'
                                  value={nomeIgreja}
                                  onChange={e => setNomeIgreja(Number(e.target.value))}                                      
                                  required
                                >
                                  <option value={0} disabled>Selecione uma Igreja</option>
                                  {igreja.map((igreja) => (
                                    <option
                                      key={igreja.id_igreja}
                                      value={igreja.id_igreja}
                                    >
                                      {igreja.nome}
                                    </option>                      
                                  ))}       
                                </select>
                              </div>
                            </div>                           
                            
                            <button type='submit' className='border-2 rounded-lg h-12 w-[64dvh] mt-3 border-white text2 text-white active:bg-white active:text-azul' onClick={handleRegister}>Cadastrar</button>
                            <ToastContainer />
                        </div>
                    </div>
              </div>
            </div>
        </div>
    </main>
  )
}
