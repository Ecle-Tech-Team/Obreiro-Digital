'use client'
import React, { useState, useEffect } from 'react'
import MenuInferior from '@/app/components/menuInferior/menuInferior'
import MenuSuperior from '@/app/components/menuSuperior/menuSuperior'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Modal from 'react-modal';
import close from '@/public/icons/close.svg';
import igrejaIcon from '@/public/icons/igreja.svg';
import mailIcon from '@/public/icons/mail.svg';
import keyIcon from '@/public/icons/key.svg';
import bugIcon from '@/public/icons/bug.svg';
import chatIcon from '@/public/icons/chat.svg';
import shieldIcon from '@/public/icons/shield.svg';
import apagarContaIcon from '@/public/icons/apagar-conta.svg';

export default function configuracoesMobile() {
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

  return (
    <main>
      <div>
        <div>
          <MenuSuperior/>
          <MenuInferior/>
        </div>
        <div className="flex">
          <h1 className='text1 text-black text-3xl ml-4'>Configurações</h1>

          <button className='bg-red-500 hover:bg-red-600 text2 text-white py-1 px-4 rounded-lg  sticky left-[30vh] gap-1' onClick={() => setIsLogoutModalOpen(true)}>Encerrar Sessão            
          </button>
        </div>
        
        <div className="mt-10 mx-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl">
          <div className="bg-white py-4 px-8 rounded-lg shadow flex flex-col gap-2 hover:shadow-md cursor-pointer">
              <Image src={igrejaIcon} width={32} height={32} alt='' className="text-black" />
              <span className="font-bold text-black">Dados da Igreja</span>
              <span className="text-gray-500 text-sm">Visualizar dados da igreja</span>
            </div>

            <div className="bg-white py-4 px-8 rounded-lg shadow flex flex-col gap-2 hover:shadow-md cursor-pointer">
              <Image src={mailIcon} width={32} height={32} alt='' className="text-black" />
              <span className="font-bold text-black">Alterar Email</span>
              <span className="text-gray-500 text-sm">Novo email</span>
            </div>

            <div className="bg-white py-4 px-8 rounded-lg shadow flex flex-col gap-2 hover:shadow-md cursor-pointer">
              <Image src={keyIcon} width={32} height={32} alt='' className="text-black" />
              <span className="font-bold text-black">Alterar Senha</span>
              <span className="text-gray-500 text-sm">Nova senha</span>
            </div>

            <div className="bg-white py-4 px-8 rounded-lg shadow flex flex-col gap-2 hover:shadow-md cursor-pointer">
              <Image src={bugIcon} width={32} height={32} alt='' className="text-black" />
              <span className="font-bold text-black">Relatar Bug</span>
              <span className="text-gray-500 text-sm">Descreva o seu bug</span>
            </div>

            <div className="bg-white py-4 px-8 rounded-lg shadow flex flex-col gap-2 hover:shadow-md cursor-pointer">
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
            isOpen={isPriavcyModalOpen} 
            onRequestClose={() => setIsPrivacyModalOpen(false)}
            contentLabel="Termo de Uso"
            className="fixed inset-0 flex flex-col items-center justify-center mb-40 p-4"
            overlayClassName="fixed inset-0 bg-white bg-opacity-70"
          >
            <div className='flex flex-col justify-center self-center bg-azul mt-[15vh] rounded-lg shadow-xl'>
              <div className='cursor-pointer flex place-content-end rounded-lg'>
                  <Image onClick={() => setIsPrivacyModalOpen(false)} src={close} width={40} height={40} alt='close Icon' className='bg-red-500 hover:bg-red-600 rounded-tr-lg'/>
                </div>
              <h2 className='text-white text1 text-4xl flex justify-center'>Termos de uso</h2>

              <div className='flex flex-col justify-center self-center bg-white m-10 p-10 py-5 mt-[2vh] rounded-lg max-h-[45vh] overflow-y-auto'>
                <div className='mt-[255vh]'>
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
    </main>
  )
}
