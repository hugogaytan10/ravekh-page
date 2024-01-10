import React from 'react'
import code from '../../assets/code-slash-outline.svg';
import analisis from '../../assets/analytics-outline.svg';
import chat from '../../assets/chatbubbles-outline.svg';
import rocket from '../../assets/rocket-outline.svg';
export const Productos = () => {
    const productos = [
        {
            titulo: 'DESARROLLAMOS',
            descripcion: 'Diseñamos y desarrollamos apliaciones web, móviles, e-commers y más.',
            img: code
        },
        {
            titulo: 'ANALIZAMOS',
            descripcion: 'Siempre con un trato muy cercano con el cliente para lograr la mejor solución posible.',
            img: analisis
        },
        {
            titulo: 'CONVERTIMOS',
            descripcion: 'Generamos tráfico a tu web para un mayor alcance.',
            img: rocket
        },
        {
            titulo: 'ASESORAMOS',
            descripcion: 'Te asesoramos en los temas de marketing, programación y uso de los productos.',
            img: chat
        }
    ]
    return (
        <div className='mt-32 w-full'>
            <h3 className='text-center text-2xl font-bold md:text-3xl'>Nuestros servicios</h3>
            <div className='flex justify-around flex-wrap'>
                {
                    productos.map((item, idx) => {
                        return (
                            <div className='mt-4 h-60 w-72 border-2 shadow-md rounded-md border-gray-100 bg-white scroll-content fadeLeft' key={idx}>
                                <img
                                    src={item.img}
                                    alt='producto'
                                    className='inline-block left-0 object-contain w-10 h-10 md:h-14 md:w-14 hover:scale-105 transition-all'
                                />
                                <div className='border-1 border-gray-50 bg-white'>
                                    <h4 className='font-bold underline p-2 text-xl'>{item.titulo}</h4>
                                    <p className='p-2'>{item.descripcion}</p>

                                    <div className='flex relative p-2 '>
                                        <span className='block w-0.5 h-8 bg-cyan-400'></span>
                                        <span className='block w-0.5 h-2 bg-cyan-400 absolute rotate-90 top-1 left-3'></span>
                                        <span className='block w-0.5 h-2 bg-cyan-400 absolute rotate-90 bottom-1 left-3'></span>
                                        <a
                                            href='https://api.whatsapp.com/send?phone=524451113370'
                                            className='p-1 cursor-pointer hover:bg-black hover:text-gray-50 transition-all'>Ver como</a>
                                        <div className='relative'>
                                            <span className='block w-0.5 h-8 bg-red-400 '></span>
                                            <span className='block w-0.5 h-2 bg-red-400 absolute rotate-90 -top-1 -left-1'></span>
                                            <span className='block w-0.5 h-2 bg-red-400 absolute rotate-90 -bottom-1 -left-1'></span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}
