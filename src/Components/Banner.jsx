import React from 'react'
import flecha from '../assets/arrow-forward.svg';
export const Banner = () => {
    return (
        <div className='bg-azul-banner banner'>
            <h1 className='text-gray-50 font-bold text-4xl text-center p-8'>Crea tu campaña publicitaria o página web</h1>
            <p className='w-3/4 m-auto text-left text-gray-50 font-thin md:text-center'>Lleva tu negocio al siguiente nivel con nosotros</p>
            <a 
            
            href='https://api.whatsapp.com/send?phone=524451113370'
            className='bg-gray-50 mt-10 rounded-md p-1 text-azul-banner font-bold flex w-2/4 justify-around m-auto items-center md:w-4/12 btn-empezar relative'>
                Incrementar mis ganancias
                <img src={flecha} alt='flecha' className='animacion-flecha'/>
            </a>
        </div>
    )
}
