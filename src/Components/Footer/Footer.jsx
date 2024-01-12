import React from 'react'
import fb from '../../assets/logo-facebook.svg';
import tw from '../../assets/logo-twitter.svg';
import ig from '../../assets/logo-instagram.svg';
export const Footer = () => {
    return (
        <div className='bg-fondo-oscuro h-52 w-full'>
            <h3 className='text-white text-center text-2xl font-bold'>RAVEKH</h3>
            <h4 className='text-white w-3/4 text-center m-auto mt-2'>Lleva tu negocio al siguiente nivel, convierte las visitas en  ventas con nuestra ayuda.</h4>
            <div className='flex justify-center gap-2 mt-5'>
                <a target='_blank' href="https://web.facebook.com/profile.php?id=61554291776089">
                    <img src={fb} alt="fb" />
                </a>
                <a target='_blank' href="https://www.instagram.com/rave_kh/">
                    <img src={ig} alt="ig" />
                </a>
            </div>
        </div>
    )
}
