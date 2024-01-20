import React, { useEffect, useState } from 'react'
import './Banner.css'
import banner from '../../assets/BannerClaro.jpg'
export const Banner = () => {
    const [text, setTex] = useState('Lleva tu negocio al siguiente nivel con nosotros');
    useEffect(() => {
        let widthScreen = window.innerWidth;
        widthScreen < 540 ? setTex("Lleva tu negocio al siguiente nivel") : setTex("Lleva tu negocio al siguiente nivel con nosotros");
    }, []);
    useEffect(() => {
        // Función para crear dinámicamente las etiquetas span con animación
        const createAnimatedStars = () => {
            const container = document.querySelector('.hero');
            const numStars = 4;

            for (let i = 0; i < numStars; i++) {
                const star = document.createElement('span');
                star.className = 'figuras';
                star.style.animationDelay = `${i * 0.5}s`; // Ajusta el retraso de animación

                container.appendChild(star);
            }
        };

        // createAnimatedStars();
    }, []);
    return (
        //     <div className='banner flex flex-wrap flex-col items-center justify-center gap-4 relative '>
        //         <h1 className='w-3/4 text-gray-50 font-bold  text-4xl text-left md:text-center'>Aumenta tus ganancias</h1>
        //         <p className='inline-block text-left text-gray-50 font-thin md:text-center leyenda'>{text}</p>
        //         <a
        //             href='https://api.whatsapp.com/send?phone=524451113370'
        //             className=' rounded-md   font-bold  w-3/4 p-6  md:w-4/12 btn-banner'>
        //             Incrementar mis ganancias
        //         </a>

        //     </div>
        <div className="hero min-h-screen" style={{ backgroundImage: `url(${banner})` }}>
            <div className="hero-overlay bg-opacity-60"></div>
            <div className="hero-content text-center text-neutral-content">
                <div className="max-w-md">
                    <h1 className="mb-5 text-5xl font-bold claro">LLEVA TU NEGOCIO AL SIGUIENTE NIVEL</h1>
                    <button className="bg-indigo-950 p-3 rounded-lg shadow-sky-500 text-gray-100">
                        <a href='https://api.whatsapp.com/send?phone=524451113370'>
                            Incrementar mis ganancias
                        </a>
                        </button>
                </div>
            </div>
        </div>

    )
}
