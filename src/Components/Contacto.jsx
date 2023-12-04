import React, { useState } from 'react'
import './contacto.css'
import GoogleInput from './GoogleInput'
import ravekh from '../assets/ravekh.png';
export const Contacto = () => {
    const [email, setEmail] = useState("");
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    return (
        <div className='bg-bg-contacto mt-64 mb-20 md:flex md:justify-around md:flex-wrap'>
            <h3 className='text-3xl text-white text-center block w-full'>Contáctanos</h3>
            <form className='mt-10  h-96 md:w-2/4'>
                <GoogleInput
                    type="text"
                    placeholder="Nombre"
                    value={email}
                    onChange={handleEmailChange}
                />
                <GoogleInput
                    type="text"
                    placeholder="Apellido"
                    value={email}
                    onChange={handleEmailChange}
                />
                <GoogleInput
                    type="textarea"
                    placeholder="Mensaje"
                    value={email}
                    onChange={handleEmailChange}
                />
                <GoogleInput
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={handleEmailChange}
                />
                <button className="btn">Enviar</button>
            </form>
            <img
            alt='foto'
            src={ravekh}
            className='md:w-1/4 object-contain md:h-72'/>
        </div>
    )
}
