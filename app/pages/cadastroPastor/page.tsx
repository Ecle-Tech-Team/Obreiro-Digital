'use client'
import React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import api from '../../api/api';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '@/public/images/icon-white.png';
import axios from 'axios';

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
  const [cargo, setCargo] = useState<string>('Pastor Matriz');
  const [nomeIgreja, setNomeIgreja] = useState<number>(0)

  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const [igreja, setIgreja] = useState<Igreja[]>([]);

  // Convite de filial: o código chega depois do "#" no link enviado pela matriz.
  const [conviteToken, setConviteToken] = useState<string>('');
  const [convite, setConvite] = useState<{ igreja: string; matriz: string | null } | null>(null);
  const [conviteErro, setConviteErro] = useState<string>('');

  useEffect(() => {
    let token = '';
    try {
      const match = window.location.hash.match(/convite=([A-Za-z0-9_-]+)/);
      if (match) {
        token = match[1];
        sessionStorage.setItem('conviteToken', token);
        // Tira o código da barra de endereço (histórico e capturas de tela).
        window.history.replaceState(null, '', window.location.pathname);
      } else {
        token = sessionStorage.getItem('conviteToken') || '';
      }
    } catch { /* armazenamento indisponível */ }
    if (!token) return;
    setConviteToken(token);
    setCargo('Pastor');
    api.post('/convite/validar', { token })
      .then(({ data }) => setConvite(data))
      .catch(() => setConviteErro('Este convite é inválido, expirou ou já foi utilizado. Peça um novo link à sua igreja matriz.'));
  }, []);

  useEffect(() => {
    const fetchIgrejas = async () => {
      try {
        const igrejaCadastroId = Number(sessionStorage.getItem('igrejaCadastroId'));
        if (igrejaCadastroId) {
          setIgreja([{ id_igreja: igrejaCadastroId, nome: sessionStorage.getItem('igrejaCadastroNome') || 'Igreja cadastrada' }]);
          setNomeIgreja(igrejaCadastroId);
        }
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
      if(cod_membro === "" || nome === "" || email === "" || senha === "" ||  birth === "" || cargo === "" || (!conviteToken && nomeIgreja === 0)) {
          notifyWarn();
          return;
      } else if (senha.length < 10) {
        toast.warn('A senha deve ter pelo menos 10 caracteres.', { position: "top-center", autoClose: 3000 });
        return;
      } else if (conviteToken) {
        if (!convite) { toast.error(conviteErro || 'Convite inválido.', { position: "top-center" }); return; }
        await api.post('/cadastro', { cod_membro, nome, email, senha, birth, convite_token: conviteToken });
        try { sessionStorage.removeItem('conviteToken'); } catch { /* armazenamento indisponível */ }
        notifySuccess();
        setTimeout(() => { router.push('/pages/login', { scroll: false }); }, 1500);
      } else {
        const data = {              
          cod_membro,
          nome,
          email,
          senha,
          birth,
          cargo,
          id_igreja: nomeIgreja,
          registration_token: sessionStorage.getItem('igrejaCadastroToken')
        }           
       
        await api.post('/cadastro', data)
        sessionStorage.removeItem('igrejaCadastroId');
        sessionStorage.removeItem('igrejaCadastroToken');
        sessionStorage.removeItem('igrejaCadastroNome');
        
        notifySuccess();

        setTimeout(() => {
          router.push('/pages/login', { scroll: false });
      }, 1500);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(String(error.response.data.message), { position: "top-center", autoClose: 4000 });
      } else {
        notifyError();
      }
    }
  }  
  return (
    <main className='registration-page'>
        <div className='bg-azul min-h-screen flex justify-center px-4 py-8'>
            <div className='flex justify-center items-center w-full'>
              <div className='w-full max-w-xl'>
                <div className='flex justify-center'>
                  <Image src={logo} width={75} height={10} alt=''/>
                  <h2 className='ml-3 font-extrabold text-4xl text-white text1'>OBREIRO<br/>DIGITAL</h2>
                </div>

                <div className='flex flex-col'>
                        <div>
                            <h1 className='text-white text-4xl mt-10 text1 flex justify-center'>Cadastro de Pastor</h1>
                            {conviteToken ? (
                              <p className='text-white text-xl text2 mt-2 flex justify-center text-center mb-6'>
                                {conviteErro || (convite
                                  ? `Você foi convidado para ser pastor da ${convite.igreja}${convite.matriz ? ` (filial de ${convite.matriz})` : ''}. Crie sua conta abaixo.`
                                  : 'Verificando convite...')}
                              </p>
                            ) : (
                              <p className='text-white text-xl text2 mt-2 flex justify-center mb-6'>Agora, cadastre o Pastor da sua igreja para acessar o sistema</p>
                            )}
                        </div>
                        <div className='registration-fields'>
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
                                        placeholder='Mínimo de 10 caracteres'
                                        value={senha}
                                        onChange={e => setSenha(e.target.value)}
                                        minLength={10}
                                        maxLength={64}
                                        autoComplete='new-password'
                                        required
                                      />

                                      <button 
                                        type='button'
                                        className='ml-[1vh]'
                                        onClick={() => setShowPassword(!showPassword)}
                                      >
                                        {showPassword ? <Eye size={28} aria-hidden="true" /> : <EyeOff size={28} aria-hidden="true" />}
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

                              {conviteToken ? (
                              <div className='flex flex-col ml-5'>
                                <label className='text-white text1 text-xl mt-2 mb-1'>Igreja</label>
                                <p className='bg-white px-4 py-3 mb-1 w-[32vh] text2 rounded-lg text-black'>{convite?.igreja || '—'}</p>
                              </div>
                              ) : (
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
                              )}
                            </div>                           
                            
                            <button type='submit' className='border-2 rounded-lg h-12 w-full mt-3 border-white text2 text-white active:bg-white active:text-azul' onClick={handleRegister}>Cadastrar</button>
                            <ToastContainer />
                        </div>
                    </div>
              </div>
            </div>
        </div>
    </main>
  )
}
