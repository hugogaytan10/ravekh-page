import React, { useState } from 'react'
import './contacto.css'
import GoogleInput from './GoogleInput'
import ravekh from '../assets/ravekh.png';
export const Contacto = () => {
    const [email, setEmail] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [mensaje, setMensaje] = useState("");
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };
    const handleNombreChange = (e) => {
        setNombre(e.target.value);
    };
    const handleApellidoChange = (e) => {
        setApellido(e.target.value);
    };
    const handleMensajeChange = (e) => {
        setMensaje(e.target.value);
    };

    return (
        <div className='bg-bg-contacto  mt-64  md:flex md:justify-around md:flex-wrap scroll-content fadeLeft w-full'>
            <h3 className='text-3xl text-white text-center block w-full'>Contáctanos</h3>
            <form
                action='mailto:ravekh.team@gmail.com'
                className='mt-10 mb-10 md:w-2/4 flex flex-wrap flex-col items-center justify-center '>
                {/*
                <GoogleInput
                    type="text"
                    placeholder="Nombre"
                    value={nombre}
                    onChange={handleNombreChange}
                />
                <GoogleInput
                    type="text"
                    placeholder="Apellido"
                    value={apellido}
                    onChange={handleApellidoChange}
                />
                <GoogleInput
                    type="textarea"
                    placeholder="Mensaje"
                    value={mensaje}
                    onChange={handleMensajeChange}
                />
                <GoogleInput
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={handleEmailChange}
                />
    */}
                <h5 className='p-4 text-gray-100 font-medium text-left'>Envianos un correo personal con tus necesidades y nos pondremos en contácto</h5>
                <button className="btn">Enviar</button>
            </form>
            <img
                alt='foto'
                src={ravekh}
                className='md:w-1/4 object-contain md:h-72' />
        </div>
    )
}
