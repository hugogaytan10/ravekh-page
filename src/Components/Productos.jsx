import React from 'react'

export const Productos = () => {
    const productos = [
        {
            titulo: 'Tienda Online',
            descripcion: 'Vende y administra tu negocio de forma totalmente digital',
            img: 'src/assets/ecommer.png'
        },
        {
            titulo: 'Aplicaciones Moviles',
            descripcion: 'Aplicaciones a la medida de tus necesidades para android & IOS',
            img: 'src/assets/PR1.png'
        }
    ]
    return (
        <div className='mt-32'>
            <h3 className='text-center text-2xl font-bold md:text-3xl'>Lo más solicitado</h3>
            <div className='flex justify-around flex-wrap'>
                {
                    productos.map((item, idx) => {
                        return (
                            <div className='mt-4 h-72 w-72  border-4 rounded-md border-gray-50 bg-white '  key={idx}>
                                <img
                                    src={item.img}
                                    alt='producto'
                                    className='m-auto object-contain w-full h-1/2 md:h-full hover:scale-105 transition-all'
                                />
                                <div className='border-1 border-gray-50 shadow-lg bg-white'>
                                    <h4 className='font-bold underline p-2'>{item.titulo}</h4>
                                    <p className='p-2'>{item.descripcion}</p>

                                    <div className='flex relative p-2 '>
                                        <span className='block w-0.5 h-8 bg-cyan-400'></span>
                                        <span className='block w-0.5 h-2 bg-cyan-400 absolute rotate-90 top-1 left-3'></span>
                                        <span className='block w-0.5 h-2 bg-cyan-400 absolute rotate-90 bottom-1 left-3'></span>
                                        <a href="#" className='p-1 cursor-pointer hover:bg-black hover:text-gray-50 transition-all'>Ver como</a>
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
