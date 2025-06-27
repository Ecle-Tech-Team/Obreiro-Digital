'use client'
import React, { useState, useEffect, useRef } from 'react';
import MenuLateral from '@/app/components/menuLateral/menuLateral';
import { format } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Modal from 'react-modal';
import logout from '@/public/icons/logout.svg';
import close from '@/public/icons/close.svg';
import igrejaIcon from '@/public/icons/igreja.svg';
import mailIcon from '@/public/icons/mail.svg';
import keyIcon from '@/public/icons/key.svg';
import bugIcon from '@/public/icons/bug.svg';
import chatIcon from '@/public/icons/chat.svg';
import shieldIcon from '@/public/icons/shield.svg';
import apagarContaIcon from '@/public/icons/apagar-conta.svg';
import api from '@/app/api/api';

interface Igreja {
  id_igreja: number;
  nome: string;
  cnpj: string;
  setor: string;
  ministerio: string;
  cep:string;
  endereco: string;
  bairro: string;
  cidade: string;
  data_fundacao: Date;
}

export default function configuracoes() {
  const router = useRouter();  
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPriavcyModalOpen, setIsPrivacyModalOpen] = useState(false);
  
  const handleLogout = () => {
    // Limpar todos os dados de autenticação
    sessionStorage.clear();
    localStorage.clear();
    
    // Redirecionar para a página de login
    router.push('/pages/login');
  };  

  const [isIgrejaModalOpen, setIsIgrejaModalOpen] = useState(false);
  const [igrejaData, setIgrejaData] = useState<any>(null);
  
   // Buscar dados da igreja
  const fetchIgrejaData = async () => {
    try {
      const id_igreja = sessionStorage.getItem('id_igreja');
      if (!id_igreja) {
        console.error('ID da igreja não encontrado');
        return;
      }
      
      const response = await api.get(`/igreja/${id_igreja}`);
      setIgrejaData(response.data);
      setIsIgrejaModalOpen(true);
    } catch (error) {
      console.error('Erro ao buscar dados da igreja:', error);
    }
  };

  const notifySuccess = () => {
    toast.success('Igreja atualizada com sucesso!', {
      position: 'top-center',
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored',
    });
  };
  
  const notifySuccessAlterEmail = () => {
    toast.success('Email atualizado com sucesso!', {
      position: 'top-center',
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored',
    });
  };

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isConfirmEmailModalOpen, setIsConfirmEmailModalOpen] = useState(false);
  const [novoEmail, setNovoEmail] = useState('');

  return (
    <main>
      <div className='flex'>
        <MenuLateral/>
         <div className='sm:ml-[10vh] md:ml-[20vh] lg:ml-[5vh] mr-[10vh] mb-[5vh]'>
          <div className='flex mt-12'>
            <Link href={'/../../pages/inicio'} className='text-cinza text-lg text3'>Início &#62;</Link>
            <Link href={'/../../pages/configuracoes'} className='text-cinza text-lg text3 ml-2'>Configurações</Link>
          </div>

          <div className="flex">
            <div className='mt-10'>
              <h1 className='text-black text1 text-5xl'>Configurações</h1>

              <div className='flex ml-10 relative left-[86vh] bottom-12 bg-red-500 hover:bg-red-600 px-8 py-2.5 text-white text-3xl rounded-xl cursor-pointer gap-2'>
                <p className='' onClick={() => setIsLogoutModalOpen(true)}>Encerrar Sessão</p>
                <Image src={logout} width={32} height={32} alt=''/>
            </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7 max-w-3xl">
            <div className="bg-white py-6 px-8 rounded-lg shadow flex flex-col gap-2 hover:shadow-md cursor-pointer" onClick={fetchIgrejaData}>
              <Image src={igrejaIcon} width={32} height={32} alt='' className="text-black" />
              <span className="font-bold text-black">Dados da Igreja</span>
              <span className="text-gray-500 text-sm">Visualizar dados da igreja</span>
            </div>

            <div className="bg-white py-6 px-8 rounded-lg shadow flex flex-col gap-2 hover:shadow-md cursor-pointer" onClick={() => setIsEmailModalOpen(true)}>
              <Image src={mailIcon} width={32} height={32} alt='' className="text-black" />
              <span className="font-bold text-black">Alterar Email</span>
              <span className="text-gray-500 text-sm">Novo email</span>
            </div>

            <div className="bg-white py-6 px-8 rounded-lg shadow flex flex-col gap-2 hover:shadow-md cursor-pointer">
              <Image src={keyIcon} width={32} height={32} alt='' className="text-black" />
              <span className="font-bold text-black">Alterar Senha</span>
              <span className="text-gray-500 text-sm">Nova senha</span>
            </div>

            <div className="bg-white py-6 px-8 rounded-lg shadow flex flex-col gap-2 hover:shadow-md cursor-pointer">
              <Image src={bugIcon} width={32} height={32} alt='' className="text-black" />
              <span className="font-bold text-black">Relatar Bug</span>
              <span className="text-gray-500 text-sm">Descreva o seu bug</span>
            </div>

            <div className="bg-white py-6 px-8 rounded-lg shadow flex flex-col gap-2 hover:shadow-md cursor-pointer">
              <Image src={chatIcon} width={32} height={32} alt='' className="text-black" />
              <span className="font-bold text-black">Solicitar Suporte</span>
              <span className="text-gray-500 text-sm">Solicite suporte técnico</span>
            </div>

            <div className="bg-white py-6 px-8 rounded-lg shadow flex flex-col gap-2 hover:shadow-md cursor-pointer" onClick={() => setIsPrivacyModalOpen(true)}>
              <Image src={shieldIcon} width={32} height={32} alt='' className="text-black" />
              <span className="font-bold text-black">Privacidade</span>
              <span className="text-gray-500 text-sm">Termos de privacidade</span>
            </div>

            {/* Botão apagar conta */}
            <div className="bg-white py-6 px-8 rounded-lg shadow flex flex-col gap-2 hover:shadow-md cursor-pointer">
              <Image src={apagarContaIcon} width={32} height={32} alt='' className="text-red-500" />
              <span className="font-bold text-red-500">Apagar Conta</span>
              <span className="text-red-400 text-sm">Deletar sua conta</span>
            </div>
          </div>

          <Modal
            isOpen={isLogoutModalOpen}
            onRequestClose={() => setIsLogoutModalOpen(false)}
            contentLabel="Confirmar Logout"
            className="fixed inset-0 flex items-center justify-center p-4"
            overlayClassName="fixed inset-0 bg-white bg-opacity-70"
          >
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Sair da Conta</h2>
                <button 
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja sair da sua conta? Você será desconectado e
                precisará fazer login novamente para acessar o sistema.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="px-5 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Sim, Sair
                </button>
              </div>
            </div>
          </Modal>

          <Modal
            isOpen={isIgrejaModalOpen}
            onRequestClose={() => setIsIgrejaModalOpen(false)}
            contentLabel="Dados da Igreja"
            className="fixed inset-0 flex items-center justify-center"            
          >
            <div className="flex flex-col justify-center self-center bg-azul mt-[1vh] rounded-lg shadow-xl">
               <div className='cursor-pointer flex place-content-end rounded-lg'>
                  <Image onClick={() => setIsIgrejaModalOpen(false)} src={close} width={40} height={40} alt='close Icon' className='bg-red-500 hover:bg-red-600 rounded-tr-lg'/>
                </div>

              <h2 className='text-white text1 text-4xl flex justify-center'>Sua Igreja</h2>
              
              {igrejaData ? (
                <div className="space-y-4 flex flex-col px-10">
                  <div className='flex flex-col'>
                    <label className="text-white text1 text-xl mt-1 mb-1">Nome</label>
                    <input
                      type="text"
                      className="px-4 py-3 rounded-lg text2 text-black"
                      value={igrejaData.nome}
                      onChange={(e) => setIgrejaData({ ...igrejaData, nome: e.target.value })}
                    />
                  </div>
                  
                  <div className='flex flex-col'>
                    <label className="text-white text1 text-xl mt-1 mb-1">CNPJ</label>
                    <input
                      type="text"
                      className="px-4 py-3 rounded-lg text2 text-black"
                      value={igrejaData.cnpj || ''}
                      onChange={(e) => setIgrejaData({ ...igrejaData, cnpj: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-4">                  
                    <div className='text-white flex flex-col'>
                      <label className="text-white text1 text-xl mt-1 mb-1">Ministério</label>
                      <input
                        type="text"
                        className="px-4 py-3 rounded-lg text2 text-black"
                        value={igrejaData.ministerio || ''}
                        onChange={(e) => setIgrejaData({ ...igrejaData, ministerio: e.target.value })}
                      />
                    </div>

                    <div className='text-white flex flex-col'>
                      <label className="text-white text1 text-xl mt-1 mb-1">Setor</label>
                      <input
                        type="text"
                        className="px-4 py-3 rounded-lg text2 text-black"
                        value={igrejaData.setor || ''}
                        onChange={(e) => setIgrejaData({ ...igrejaData, setor: e.target.value })}
                      />
                    </div>  
                  </div>                  

                  <div className='text-white flex flex-col'>
                    <label className="text-white text1 text-xl mt-1 mb-1">CEP</label>
                    <input
                        type="text"
                        className="px-4 py-3 rounded-lg text2 text-black"
                        value={igrejaData.cep || ''}
                        onChange={(e) => setIgrejaData({ ...igrejaData, cep: e.target.value })}
                      />
                  </div>

                  <div className='text-white flex flex-col'>
                    <label className="text-white text1 text-xl mt-1 mb-1">Endereço</label>
                    <input
                      type="text"
                      className="px-4 py-3 rounded-lg text2 text-black"
                      value={igrejaData.endereco || ''}
                      onChange={(e) => setIgrejaData({ ...igrejaData, endereco: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <div className='text-white flex flex-col'>
                      <label className="text-white text1 text-xl mt-1 mb-1">Bairro</label>
                      <input
                        type="text"
                        className="px-4 py-3 rounded-lg text2 text-black"
                        value={igrejaData.bairro || ''}
                        onChange={(e) => setIgrejaData({ ...igrejaData, bairro: e.target.value })}
                      />
                    </div>

                    <div className='text-white flex flex-col'>
                      <label className="text-white text1 text-xl mt-1 mb-1">Cidade</label>
                      <input
                        type="text"
                        className="px-4 py-3 rounded-lg text2 text-black"
                        value={igrejaData.cidade || ''}
                        onChange={(e) => setIgrejaData({ ...igrejaData, cidade: e.target.value })}
                        />
                    </div>
                  </div>

                  <div className='text-white flex flex-col'>
                    <label className="text-white text1 text-xl mt-1 mb-1">Data de Fundação</label>
                    <input
                      type="date"
                      className="px-4 py-3 rounded-lg text2 text-black"
                      value={(format( new Date (igrejaData.data_fundacao), 'yyyy-MM-dd')) || ''}
                      onChange={(e) => setIgrejaData({ ...igrejaData, data_fundacao: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-center py-4">Carregando dados da igreja...</p>
              )}              
              <div className="flex flex-col px-10 pb-10">
                <button
                  onClick={async () => {
                  try {
                    await api.put(`/igreja/${igrejaData.id_igreja}`, {
                    ...igrejaData,
                    data_fundacao: format(new Date(igrejaData.data_fundacao), 'yyyy-MM-dd'),
                  });;
                    setIsIgrejaModalOpen(false);
                    notifySuccess();
                  } catch (error) {
                    console.error('Erro ao atualizar igreja:', error);
                    alert('Erro ao atualizar. Tente novamente.');
                  }
                }}
                  className="border-2 px-4 py-3 mt-7 rounded-lg text2 text-white text-lg"
                >
                  Editar
                </button>
              </div>
            </div>
          </Modal>

          <Modal
            isOpen={isEmailModalOpen}
            onRequestClose={() => setIsEmailModalOpen(false)}
            contentLabel="Alterar Email"
            className="fixed inset-0 flex items-center justify-center"            
          >
            <div className="flex flex-col justify-center self-center bg-azul mt-[1vh] rounded-lg shadow-xl">
              <div className='cursor-pointer flex place-content-end rounded-lg'>
                <Image onClick={() => setIsEmailModalOpen(false)} src={close} width={40} height={40} alt='close Icon' className='bg-red-500 hover:bg-red-600 rounded-tr-lg'/>
              </div>
              
              <div className="px-10">
              <h2 className="text-xl text1 font-bold text-white mb-4">Novo Email</h2>

                <input
                  type="email"
                  placeholder="Digite o novo email"
                  className="px-4 py-3 rounded-lg text2 text-black"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-3 py-5 pr-4">                
                <button
                  onClick={() => {
                    if (!novoEmail || !novoEmail.includes('@')) {
                      alert('Digite um email válido.');
                      return;
                    }
                    setIsEmailModalOpen(false);
                    setIsConfirmEmailModalOpen(true);
                  }}
                  className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-lg hover:bg-azul-escuro"
                >
                  Avançar
                </button>
              </div>
            </div>
          </Modal>

          <Modal
            isOpen={isConfirmEmailModalOpen}
            onRequestClose={() => setIsConfirmEmailModalOpen(false)}
            contentLabel="Confirmar Alteração de Email"
            className="fixed inset-0 flex items-center bg-black bg-opacity-5 justify-center"
          >
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Confirmar Alteração</h2>
              
              <p className="text-gray-600 mb-6">Tem certeza que deseja alterar o email para <b>{novoEmail}</b>?</p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsConfirmEmailModalOpen(false)}
                  className="px-5 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    try {
                      const id_user = sessionStorage.getItem('id_user');
                      await api.put(`/cadastro/${id_user}`, { email: novoEmail });
                      setIsConfirmEmailModalOpen(false);
                      notifySuccessAlterEmail();
                    } catch (error) {
                      console.error('Erro ao alterar email:', error);
                      alert('Erro ao alterar email. Tente novamente.');
                    }
                  }}
                  className="px-5 py-2 bg-azul text-white rounded-lg hover:bg-azul-escuro"
                >
                  Sim, Alterar
                </button>
              </div>
            </div>
          </Modal>

          <Modal
            isOpen={isPriavcyModalOpen} 
            onRequestClose={() => setIsPrivacyModalOpen(false)}
            contentLabel="Termo de Uso"
            className="fixed inset-0 flex flex-col items-center justify-center p-4"
            overlayClassName="fixed inset-0 bg-white bg-opacity-70"
          >
            <div className='flex flex-col justify-center self-center bg-azul mt-[15vh] rounded-lg shadow-xl'>
              <div className='cursor-pointer flex place-content-end rounded-lg'>
                  <Image onClick={() => setIsPrivacyModalOpen(false)} src={close} width={40} height={40} alt='close Icon' className='bg-red-500 hover:bg-red-600 rounded-tr-lg'/>
                </div>
              <h2 className='text-white text1 text-4xl flex justify-center'>Termos de uso</h2>

              <div className='flex flex-col justify-center self-center bg-white m-10 p-10 py-5 mt-[2vh] rounded-lg max-h-[45vh] overflow-y-auto'>
                <div className='mt-[127vh]'>
                  <h3 className='text1 text-black text-lg'>1. Consentimento</h3>
                  <p className='text2 text-black leading-4 mt-1'>Ao utilizar o Sistema, você expressa seu<br/>consentimento para a coleta, armazenamento,<br/>processamento e uso dos seus dados pessoais de <br/>acordo com os termos estabelecidos neste Termo. <br/>Caso não concorde com estes termos, por favor, não <br/>prossiga utilizando o Sistema.</p>
                </div>

                <div className='mt-5'>
                  <h3 className='text1 text-black text-lg'>2. Dados Coletados</h3>

                  <p className='text2 text-black leading-4 mt-1'>O Sistema coleta e armazena os seguintes dados <br/>pessoais fornecidos por você:</p>
                  <ul className='list-disc mt-2 pl-7'>
                    <li className='text2 text-black leading-4'>Informações de identificação pessoal: nome, <br/>endereço de e-mail, número de telefone, entre <br/>outros, conforme necessário para o uso dos <br/>serviços oferecidos pelo Sistema.</li>

                    <li className='text2 text-black leading-4 mt-2'>Informações de acesso: endereço IP, tipo de <br/>navegador, dados de cookies e outras <br/>informações de rastreamento coletadas <br/>automaticamente durante o uso do Sistema.</li>

                    <li className='text2 text-black leading-4 mt-2'>Outras informações fornecidas voluntariamente <br/>por você durante a interação com o Sistema.</li>
                  </ul>
                </div>

                <div className='mt-5'>
                  <h3 className='text1 text-black text-lg'>3. Uso dos Dados</h3>

                  <p className='text2 text-black leading-4 mt-1'>Os dados pessoais coletados são utilizados <br/>para os seguintes propósitos:</p>
                  <ul className='list-disc mt-2 pl-7'>
                    <li className='text2 text-black leading-4'>Prestação de serviços: para fornecer os serviços <br/>solicitados por você por meio do Sistema.</li>

                    <li className='text2 text-black leading-4 mt-2'>Personalização: para personalizar sua experiência <br/>de usuário e fornecer conteúdo relevante.</li>

                    <li className='text2 text-black leading-4 mt-2'>Comunicação: para responder a suas solicitações, <br/>fornecer suporte ao cliente e enviar comunicações <br/>relacionadas ao uso do Sistema.</li>

                    <li className='text2 text-black leading-4 mt-2'>Melhoria do Sistema: para analisar o desempenho <br/>do Sistema, realizar pesquisas e desenvolver novos <br/>recursos.</li>
                  </ul>
                </div>

                <div className='mt-5'>
                  <h3 className='text1 text-black text-lg'>4. Compartilhamento de Dados</h3>

                  <p className='text2 text-black leading-4 mt-1'>Seus dados pessoais podem ser compartilhados <br/>com terceiros apenas nas seguintes circunstâncias:</p>
                  <ul className='list-disc mt-2 pl-7'>
                    <li className='text2 text-black leading-4'>Parceiros de negócios: para fornecer serviços <br/>em conjunto ou facilitar transações relacionadas ao <br/>Sistema.</li>

                    <li className='text2 text-black leading-4 mt-2'>Cumprimento legal: para cumprir obrigações legais, <br/>responder a processos legais ou proteger os direitos, <br/>propriedade ou segurança do Sistema ou de terceiros.</li>                                    
                  </ul>
                </div>

                <div className='mt-5'>
                  <h3 className='text1 text-black text-lg'>5. Segurança dos Dados</h3>

                  <p className='text2 text-black leading-4 mt-1'>Empregamos medidas de segurança técnicas, <br/>administrativas e físicas para proteger seus dados <br/>pessoais contra acesso não autorizado, divulgação, <br/>alteração ou destruição.</p>                                
                </div>

                <div className='mt-5'>
                  <h3 className='text1 text-black text-lg'>6. Seus Direitos</h3>

                  <p className='text2 text-black leading-4 mt-1'>Você possui os seguintes direitos em relação aos <br/>seus dados pessoais:</p>
                  <ul className='list-disc mt-2 pl-7'>
                    <li className='text2 text-black leading-4'>Acessar e corrigir seus dados pessoais.</li>

                    <li className='text2 text-black leading-4 mt-2'>Solicitar a exclusão de seus dados pessoais, sujeito <br/>às obrigações legais ou contratuais.</li>

                    <li className='text2 text-black leading-4 mt-2'>Retirar o consentimento para o processamento de <br/>seus dados pessoais, quando aplicável.</li>
                  </ul>
                </div>

                <div className='mt-5'>
                  <h3 className='text1 text-black text-lg'>7. Alterações no Termo</h3>

                  <p className='text2 text-black leading-4 mt-1'>Reservamo-nos o direito de atualizar este Termo <br/>periodicamente. Recomendamos que você reveja <br/>este Termo regularmente para estar ciente de <br/>quaisquer alterações.</p>
                  <ul className='list-disc mt-2 pl-7'>
                    <li className='text2 text-black leading-4'>Acessar e corrigir seus dados pessoais.</li>

                    <li className='text2 text-black leading-4 mt-2'>Solicitar a exclusão de seus dados pessoais, sujeito <br/>às obrigações legais ou contratuais.</li>

                    <li className='text2 text-black leading-4 mt-2'>Retirar o consentimento para o processamento de <br/>seus dados pessoais, quando aplicável.</li>
                  </ul>
                </div>

                <div className='mt-5'>
                  <h3 className='text1 text-black text-lg'>8. Contato</h3>

                  <p className='text2 text-black leading-4 mt-1'>Se você tiver dúvidas ou preocupações sobre este <br/>Termo ou o uso de seus dados pessoais, entre em <br/>contato conosco através dos canais de comunicação <br/>fornecidos no Sistema.</p>                                
                </div>

                <div className='mt-5'>                                
                  <p className='text2 text-black leading-4'>Ao aceitar este Termo, você reconhece ter lido, <br/>compreendido e concordado com os termos e <br/>condições aqui estabelecidos, bem como com o <br/>uso dos seus dados pessoais conforme descrito.</p>                                
                </div>
              </div>                
            </div>
          </Modal>
         </div>
         <ToastContainer />
      </div>
    </main>
  )
}
