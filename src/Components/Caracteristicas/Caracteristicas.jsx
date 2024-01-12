import React from 'react'
import laptop from '../../assets/latop.png';
export const Caracteristicas = () => {
    const caracteristicas = [
        {
            titulo: 'Destaca entre los demás',
            descripcion: 'Una pagina web es el primer paso para una nueva venta'
        },
        {
            titulo: 'Un sitio a tu medida',
            descripcion: 'Una solución adaptada y personalizada solo para ti'
        },
        {
            titulo: 'Lleva tus redes al siguiente nivel',
            descripcion: 'Incrementa tus ventas con campañas personalizadas para tu empresa'
        }
    ]
    return (
        <div className='mt-4 md:flex md:justify-between w-full'>
            <div>
                {
                    caracteristicas.map((item, idx) => {
                        return (
                            <div className='p-4 scroll-content fadeRight' key={idx}>
                                <h3 className='font-bold text-lg'>{item.titulo}</h3>
                                <p className='text-base mt-2'>
                                    {item.descripcion}
                                </p>
                                <span className='block h-0.5 w-100 bg-gray-800 mt-2'></span>
                            </div>
                        )
                    })
                }
            </div>
            <div className='h-80 overflow-hidden md:h-96 md:w-2/4'>
                <img
                    className='object-contain w-full h-full scroll-content fadeTop'
                    alt='desarrollo'
                    src={laptop} />
            </div>
        </div>
    )
}
