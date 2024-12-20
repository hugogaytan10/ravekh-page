import React from 'react';
import { useFormik } from 'formik';
import './contacto.css';
import GoogleInput from '../Utilidades/GoogleInput';
import ravekh from '../../assets/ravekh.png';
import validationSchema from './validationSchema';
import { URL } from '../CatalogoWeb/Const/Const';

export const Contacto = ({ catalogo }) => {
    const formik = useFormik({
        initialValues: {
            email: '',
            nombre: '',
            apellido: '',
            mensaje: '',
            lada: '',
            telefono: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {

                const res = await fetch(`${URL}contacto/sendinfo`, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nombre: values.nombre,
                        apellido: values.apellido,
                        email: values.email,
                        mensaje: values.mensaje,
                        lada: values.lada,
                        telefono: values.telefono,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log('Formulario enviado exitosamente', data);
                    document.getElementById('my_modal_5').showModal();
                    formik.resetForm();  // <-- Utiliza formik para resetear el formulario
                } else {
                    console.error('Error al enviar el formulario', res.statusText);
                }
            } catch (error) {
                console.error('Error al enviar el formulario', error);
            }
        },
    });

    return (
        <div className='flex justify-around flex-wrap min-h-screen w-full items-center'>
            <form
                onSubmit={formik.handleSubmit}
                className='mt-10 mb-10 md:w-2/4 flex flex-wrap justify-center items-center '>
                <h3 className={`text-3xl ${catalogo ? 'text-black' : 'text-gray-100'} text-center block w-full mb-5`}>Contáctanos</h3>
                <div className='mb-4 w-full md:w-1/2 md:pl-2'>
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
                <div className='mb-4 w-full md:w-1/2 md:pl-2'>
                    <GoogleInput
                        type='tel'
                        placeholder='Lada'
                        name='lada'
                        value={formik.values.lada}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.touched.lada && formik.errors.lada && (
                        <div className='text-red-500'>{formik.errors.lada}</div>
                    )}
                </div>
                <div className='mb-4 w-full md:w-1/2 md:pl-2'>
                    <GoogleInput
                        type='tel'
                        placeholder='Teléfono'
                        name='telefono'
                        value={formik.values.telefono}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.touched.telefono && formik.errors.telefono && (
                        <div className='text-red-500'>{formik.errors.telefono}</div>
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
                <h5 className={`w-full font-medium text-left px-4 mb-4 ${catalogo ? 'text-black' : 'text-gray-100'}`} >
                    Envíanos un correo personal con tus necesidades y nos pondremos en contacto
                </h5>
                <button type='submit' className=' btn'>
                    Enviar
                </button>
            </form>
            <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="font-bold text-lg blanco">Muchas gracias por contactarnos</h3>
                    <p className="py-4 blanco">Nuestro equipo se comunicará con usted a la brevedad</p>
                    <div className="modal-action">
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <button className="btn blanco">Cerrar</button>
                        </form>
                    </div>
                </div>
            </dialog>
            {/* <img alt='foto' src={ravekh} className='md:w-1/4 object-contain md:h-72' />*/}
        </div>
    );
};
