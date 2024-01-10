import React from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import './contacto.css';
import GoogleInput from '../Utilidades/GoogleInput';
import ravekh from '../../assets/ravekh.png';
import validationSchema from './validationSchema';

export const Contacto = () => {
    const formik = useFormik({
        initialValues: {
            email: '',
            nombre: '',
            apellido: '',
            mensaje: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                await axios.post('https://api.resend.io/v1/email/send', {
                    apiKey: 'TU_API_KEY', 
                    to: 'destinatario@example.com', 
                    subject: 'Nuevo mensaje de contacto',
                    html: `
            <p><strong>Nombre:</strong> ${values.nombre}</p>
            <p><strong>Apellido:</strong> ${values.apellido}</p>
            <p><strong>Correo electrónico:</strong> ${values.email}</p>
            <p><strong>Mensaje:</strong> ${values.mensaje}</p>
          `,
                });
                console.log('Formulario enviado exitosamente');
            } catch (error) {
                console.error('Error al enviar el formulario', error);
            }
        },
    });

    return (
        <div className='bg-bg-contacto mt-64 md:flex md:justify-around md:flex-wrap scroll-content fadeLeft w-full'>
            <h3 className='text-3xl text-white text-center block w-full'>Contáctanos</h3>
            <form
                onSubmit={formik.handleSubmit}
                className='mt-10 mb-10 md:w-2/4 flex flex-wrap justify-center items-center '>
                <div className='mb-4 w-full md:w-1/2 md:pr-2'>
                    <GoogleInput
                        type='text'
                        placeholder='Nombre'
                        name='nombre'
                        value={formik.values.nombre}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.touched.nombre && formik.errors.nombre && (
                        <div className='text-red-500'>{formik.errors.nombre}</div>
                    )}
                </div>
                <div className='mb-4 w-full md:w-1/2 md:pl-2'>
                    <GoogleInput
                        type='text'
                        placeholder='Apellido'
                        name='apellido'
                        value={formik.values.apellido}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.touched.apellido && formik.errors.apellido && (
                        <div className='text-red-500'>{formik.errors.apellido}</div>
                    )}
                </div>
                <div className='mb-4 w-full'>
                    <GoogleInput
                        type='textarea'
                        placeholder='Mensaje'
                        name='mensaje'
                        value={formik.values.mensaje}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.touched.mensaje && formik.errors.mensaje && (
                        <div className='text-red-500'>{formik.errors.mensaje}</div>
                    )}
                </div>
                <div className='mb-4 w-full'>
                    <GoogleInput
                        type='email'
                        placeholder='Correo electrónico'
                        name='email'
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.touched.email && formik.errors.email && (
                        <div className='text-red-500'>{formik.errors.email}</div>
                    )}
                </div>
                <h5 className='w-full text-gray-100 font-medium text-left px-4'>
                    Envíanos un correo personal con tus necesidades y nos pondremos en contacto
                </h5>
                <button type='submit' className='btn'>
                    Enviar
                </button>
            </form>
            <img alt='foto' src={ravekh} className='md:w-1/4 object-contain md:h-72' />
        </div>
    );
};
