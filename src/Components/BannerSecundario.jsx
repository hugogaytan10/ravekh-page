import React from 'react';

export const BannerSecundario = () => {
    return (
        <div className='bg-negro banner-secundario'>
            <h2 className='text-gray-50 font-bold text-4xl text-left p-1 ml-8'>
                Incrementa tus ventas
            </h2>
            <p className='font-thin text-gray-50 mt-5 w-3/4 p-1 ml-8'>
                Con nuestro equipo de trabajo tus productos tendrán un alcance que no
                imaginabas, creando conexiones personalizadas con tus clientes
            </p>
            <div className='text-left mt-10 ml-10 w-1/4  md:w-1/12'>
                <a className='text-xl rounded-md p-1 text-gray-50 underline font-bold flex justify-around items-start gap-2'>
                    Empezar
                    <img src='../assets/arrow-forward-white.svg' alt='flecha' />
                </a>
            </div>
        </div>
    );
};
