import React from 'react'
import flecha from '../assets/arrow-forward.svg';
export const Banner = () => {
  
    return (
        <div className='banner flex flex-wrap flex-col items-center justify-center gap-4'>
            <h1 className='w-3/4 text-gray-50 font-bold  text-4xl text-left md:text-center'>Aumenta tus ganancias</h1>
            <p className='inline-block text-left text-gray-50 font-thin md:text-center leyenda'>Lleva tu negocio al siguiente nivel con nosotros</p>
            <a 
            href='https://api.whatsapp.com/send?phone=524451113370'
            className=' rounded-md   font-bold  w-3/4 p-6  md:w-4/12 btn-banner'>
                Incrementar mis ganancias
            </a>
        </div>
    )
}
