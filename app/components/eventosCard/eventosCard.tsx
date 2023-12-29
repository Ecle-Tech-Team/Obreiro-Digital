import React, { useState, useEffect, FormEvent } from 'react'
import { format } from 'date-fns';
import Image from 'next/image'
import api from '@/app/api/api';
import data from '@/public/icons/data.svg';
import relogio from '@/public/icons/relogio.svg';

interface EventosProps {
  h4?: string;
  h3?: string;
  data_inicio?: string;
  hora_inicio?: string;
  data_fim?: string;
  hora_fim?: string;
  onClick?: (event: FormEvent<Element>) => void;
}

export default function EventosCard({h3, h4, data_inicio, hora_inicio, data_fim, hora_fim, onClick = () => {}}: EventosProps) {
  return (
    <main>
        <div className='flex flex-col bg-white rounded-xl shadow-xl px-5 py-5 h-[35vh] w-[30vh]'>
            <h4 className='text-cinza text3 text-lg text-center'>
                Em <span className='text-azul text3 text-xl text-center'>{h4}</span>
            </h4>
            <h3 className='text-black text1 text-3xl my-4 flex justify-center text-center'>{h3}</h3>
            <div className='flex justify-center'>
                <div className='flex flex-col justify-center'>
                <div className='flex'>
                    <Image src={data} width={20} height={20} alt='' />
                    <p className='text-cinza text3 ml-1'>Início</p>
                </div>
                <p className='text-black text3 text-xl my-2'>{data_inicio}</p>
                <div className='flex mt-1'>
                    <Image src={relogio} width={20} height={20} alt='' />
                    <p className='text-black text3 text-xl ml-1'>{hora_inicio}</p>
                </div>
                </div>

                <div className='flex flex-col ml-4'>
                <div className='flex'>
                    <Image src={data} width={20} height={20} alt='' />
                    <p className='text-cinza text3 ml-1'>Fim</p>
                </div>
                <p className='text-black text3 text-xl my-2'>{data_fim}</p>
                <div className='flex mt-1'>
                    <Image src={relogio} width={20} height={20} alt='' />
                    <p className='text-black text3 text-xl ml-1'>{hora_fim}</p>
                </div>
                </div>
            </div>
            <div className='flex justify-center mt-auto'>
                <button
                className='bg-azul px-20 py-1.5 text-white text2 text-lg rounded-xl cursor-pointer'
                onClick={onClick}
                >
                Veja Mais
                </button>
            </div>
        </div>
    </main>
  )
}
