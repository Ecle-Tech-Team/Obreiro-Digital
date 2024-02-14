'use client'
import React from 'react'
import Image from 'next/image'
import api from '../../api/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '@/public/images/icon-white.png'
import Modal from 'react-modal';
import on from '@/public/icons/on.svg'
import off from '@/public/icons/off.svg'

export default function cadastroIgreja() {
    const [nome, setNome] = useState<string>('');
    const [cnpj, setCnpj] = useState<string>('');    
    const [data_fundacao, setDataFundacao] = useState<string>('');
    const [ministerio, setMinisterio] = useState<string>('');
    const [setor, setSetor] = useState<string>('');
    const [cep, setCep] = useState<string>('');
    const [endereco, setEndereco] = useState<string>('');
    const [cidade, setCidade] = useState<string>('');
    const [bairro, setBairro] = useState<string>('');
    const [aceitoTermos, setAceitoTermos] = useState<boolean>(false);

    const router = useRouter();

    const [modalIsOpen, setModalIsOpen] = useState(false);
    
    const openModal = () => {
        if (nome === "" || nome === null || cnpj === "" || cnpj === null || data_fundacao === "" || data_fundacao === null || ministerio === "" || ministerio === null || setor === "" || setor === null || cep === "" || cep === null || endereco === "" || endereco === null || bairro === "" || bairro === null || cidade === "" || cidade === null) {
            toast.warn('Preencha todos os campos!', {
                position: "top-center",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        } else {
            setModalIsOpen(true);
        }
    };
    
    const closeModal = () => {
        setModalIsOpen(false);
    };

    async function ConsultCep (cep: string) {
        try {
            const response = await api.post(`/cep/${cep}`);

            setEndereco(response.data.street);
            setBairro(response.data.neighborhood);
            setCidade(response.data.city);
        } catch (error) {
            toast.error('CEP invalido!', {
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
    }

    async function handleRegister(event: React.FormEvent){
        event.preventDefault()

        const notifySuccess = () => {
            toast.success('Igreja cadastrada com sucesso!', {
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
            toast.error('Erro no Cadastro, Tente novamente.', {
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

        
        if (!aceitoTermos) { 
            toast.error('Você deve aceitar os termos de uso.', {
                position: "top-center",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            return;
        }
        

        try {
            if (nome === "" || cnpj === "" || data_fundacao === "" || ministerio === "" || setor === "" || cep === "" || endereco === "" || bairro === "" || cidade === ""){
                notifyWarn();
            } else {
                const dataRegister = {
                    nome,
                    cnpj,
                    data_fundacao,
                    ministerio,
                    setor,
                    cep,
                    endereco,
                    bairro,
                    cidade
                }

                const response = await api.post('/igreja', dataRegister);

                notifySuccess();

                setTimeout(() => {
                    router.push('/pages/cadastroPastor', { scroll: false });
                }, 1500);
            }
        } catch {
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
                            <h1 className='text-white text-4xl mt-10 text1 flex justify-center'>Cadastro de Igreja</h1>
                            <p className='text-white text-xl text2 mt-2 flex justify-center mb-6'>Cadastre sua igreja para começar a usar o Obreiro Digital!</p>
                        </div>
                        <div className='flex flex-col justify-center items-center'>
                            <div className='flex flex-col'>
                                <label className='text-white text1 text-xl mt-2 mb-1'>Nome</label>

                                <input 
                                    className='px-4 py-3.5 w-[40vh] mb-1 text2 rounded-lg text-black' 
                                    type="text" 
                                    placeholder='Digite o Nome...'
                                    value={nome}
                                    onChange={e => setNome(e.target.value)}
                                    maxLength={150}
                                    required
                                />
                            </div>
                            
                            <div className='flex'>
                                <div className='flex flex-col'>
                                    <label className='text-white text1 text-xl mt-2 mb-1'>CNPJ</label>

                                    <input 
                                        className='px-4 py-3 mb-1 w-[19vh] text2 rounded-lg text-black' 
                                        type="text" 
                                        placeholder='Digite o CNPJ...'
                                        value={cnpj}
                                        onChange={e => setCnpj(e.target.value)}
                                        maxLength={16}
                                        required
                                    />
                                </div>

                                <div className='flex flex-col ml-3'>
                                    <label className='text-white text1 text-xl mt-2 mb-1'>Data da Fundação</label>

                                    <input 
                                        className='px-4 py-3 mb-1 w-[19vh] text2 rounded-lg text-black' 
                                        type="date" 
                                        value={data_fundacao}
                                        onChange={e => setDataFundacao(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className='flex'>
                                <div className='flex flex-col'>
                                    <label className='text-white text1 text-xl mt-2 mb-1'>Ministério</label>

                                    <input 
                                        className='px-4 py-3 mb-1 w-[19vh] text2 rounded-lg text-black' 
                                        type="text" 
                                        placeholder='Digite o Ministério...'
                                        value={ministerio}
                                        onChange={e => setMinisterio(e.target.value)}
                                        maxLength={150}
                                        required
                                    />
                                </div>

                                <div className='flex flex-col ml-3'>
                                    <label className='text-white text1 text-xl mt-2 mb-1'>Setor</label>

                                    <input 
                                        className='px-4 py-3 mb-1 w-[19vh] text2 rounded-lg text-black' 
                                        type="text" 
                                        placeholder='Digite o Setor' 
                                        value={setor} 
                                        onChange={e => setSetor(e.target.value)}    
                                        maxLength={150}                                  
                                    />
                                </div>
                            </div>

                            <div className='flex'>
                                <div className='flex flex-col'>
                                    <label className='text-white text1 text-xl mt-2 mb-1'>CEP</label>

                                    <input 
                                        className='px-4 py-3 mb-1 w-[19vh] text2 rounded-lg text-black' 
                                        type="text" 
                                        placeholder='Digite o CEP...'
                                        value={cep}
                                        onChange={(e) =>{
                                            const cep = e.target.value;

                                            if (cep.length === 8) {
                                                ConsultCep(cep);
                                            }
                                            setCep(cep);
                                        }}
                                        maxLength={8}
                                        required
                                    />
                                </div>

                                <div className='flex flex-col ml-3'>
                                    <label className='text-white text1 text-xl mt-2 mb-1'>Endereço</label>

                                    <input 
                                        className='px-4 py-3 mb-1 w-[19vh] text2 rounded-lg text-black' 
                                        type="text" 
                                        placeholder='Digite o Endereço'
                                        value={endereco}
                                        onChange={e => setEndereco(e.target.value)}
                                        maxLength={150}
                                        required
                                    />
                                </div>
                            </div>

                            <div className='flex'>
                                <div className='flex flex-col'>
                                    <label className='text-white text1 text-xl mt-2 mb-1'>Bairro</label>

                                    <input 
                                        className='px-4 py-3 mb-1 w-[19vh] text2 rounded-lg text-black' 
                                        type="text" 
                                        placeholder='Digite o Bairro...'
                                        value={bairro}
                                        onChange={e => setBairro(e.target.value)}
                                        maxLength={150}
                                        required
                                    />
                                </div>

                                <div className='flex flex-col ml-3'>
                                    <label className='text-white text1 text-xl mt-2 mb-1'>Cidade</label>

                                    <input 
                                        className='px-4 py-3 mb-1 w-[19vh] text2 rounded-lg text-black' 
                                        type="text" 
                                        placeholder='Digite a Cidade'
                                        value={cidade}
                                        onChange={e => setCidade(e.target.value)}
                                        maxLength={150}
                                        required
                                    />
                                </div>
                            </div>

                            <button type='submit' className='border-2 rounded-lg h-12 w-96 mt-3 border-white text2 text-white active:bg-white active:text-azul' onClick={openModal}>Cadastrar</button>
                            <ToastContainer />
                        </div>
                    </div>
                </div>

                <Modal
                    className="text-white flex flex-col" 
                    isOpen={modalIsOpen} 
                    onRequestClose={closeModal}
                    contentLabel="Termo de Uso"
                >
                    <div className='flex flex-col justify-center self-center bg-azul p-10 mt-[15vh] rounded-lg shadow-xl'>
                        <h2 className='text-white text1 text-4xl flex justify-center'>Termos de uso</h2>

                        <div className='flex flex-col justify-center self-center bg-white p-10 py-5 mt-[2vh] rounded-lg max-h-[45vh] overflow-y-auto'>
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

                        <div className='flex mt-5 mb-2'>
                            <input 
                                type="checkbox" 
                                className='w-8'
                                checked={aceitoTermos}
                                onChange={() => setAceitoTermos(!aceitoTermos)}
                            />
                            <span className='text2 text-white text-lg ml-2'>Li e concordo com os termos de uso.</span>
                        </div>

                        <button type='button' disabled={!aceitoTermos} className={`border-2 rounded-lg h-12 w-[55vh] mt-3 border-white text2 text-white ${!aceitoTermos ? 'opacity-50 cursor-not-allowed' : 'active:bg-white active:text-azul'}`} onClick={handleRegister}>Avançar</button>
                    </div>
                </Modal>
            </div>
        </div>
    </main>
  )
}
