import React from 'react'
import { CardsProjects } from './CardsProjects'
import mascotitas from '../../assets/MASCOTITAS.png'
import filter from '../../assets/filter-cards.png'
import itsur from '../../assets/ITSUR.png'
import short from '../../assets/short-link.png'
import webComida from '../../assets/webComida.png'
export const Muestra = () => {
    return (
        <div className='flex flex-wrap w-3/4 m-auto justify-around mt-32   rounded-lg  lg:gap-1'>
            <h3 className='text-center text-2xl font-bold md:text-3xl block w-full'>Algunos Demos</h3>
            <CardsProjects
                title={'Mascotitas'}
                description={'Demo de una tienda para mascotas'}
                imageUrl={mascotitas}
                link='https://hugogaytan10.github.io/Mascotitas'
            />
             <CardsProjects
                title={'Filtro de tarjetas'}
                description={'Demo de un filtro de tarjetas'}
                imageUrl={filter}
                link='https://teal-jalebi-6ba797.netlify.app/'
            />
            <CardsProjects
                title={'Página escolar'}
                description={'Demo de página'}
                imageUrl={itsur}
                link='https://main--melodic-sundae-a09a6c.netlify.app/'
            />
            <CardsProjects
                title={'Acortador de URL'}
                description={'Demo de consumo de apis'}
                imageUrl={short}
                link='https://cute-boba-d3d365.netlify.app/'
            />
            <CardsProjects
                    title={'Portal de comida'}
                    description={'Portal de comida (responsive)'}
                    imageUrl={webComida}
                    link='https://main--stalwart-narwhal-93eefb.netlify.app/'
                />
        </div>
    )
}
