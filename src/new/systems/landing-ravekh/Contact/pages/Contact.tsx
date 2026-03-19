import React from "react";
import { useFormik } from "formik";
import "../styles/contact.css";
import { FormInput } from "../../utilities/FormInput";
import validationSchema from "../validation/validationSchema";
import { ContactApi } from "../api/Contact";

const contactApi = new ContactApi();

export const Contact = () => {
  const formik = useFormik({
    initialValues: {
      email: "",
      nombre: "",
      mensaje: "",
      telefono: "",
    },
    validationSchema,
    onSubmit: async (values, helpers) => {
      try {
        const response = await contactApi.senInfo(values);

        if (response.isValid()) {
          const modal = document.getElementById("my_modal_5");
          if (modal) {
            (modal as HTMLDialogElement).showModal();
          }
          helpers.resetForm();
        }
      } catch (error) {
        console.error("Error al enviar el formulario", error);
      }
    },
  });

  return (
    <div className="contact-wrapper">
      <form onSubmit={formik.handleSubmit} className="contact-form">
        <h3 className="contact-title">Contáctanos</h3>
        <div className="mb-4 w-full md:w-1/2 md:pl-2">
          <FormInput type="text" placeholder="Nombre" name="nombre" value={formik.values.nombre} onChange={formik.handleChange} onBlur={formik.handleBlur} />
          {formik.touched.nombre && formik.errors.nombre ? <div className="text-red-500 ml-8 text-sm">{formik.errors.nombre}</div> : null}
        </div>
        <div className="mb-4 w-full md:w-1/2 md:pl-2">
          <FormInput type="tel" placeholder="Teléfono" name="telefono" value={formik.values.telefono} onChange={formik.handleChange} onBlur={formik.handleBlur} />
          {formik.touched.telefono && formik.errors.telefono ? <div className="text-red-500 ml-8 text-sm">{formik.errors.telefono}</div> : null}
        </div>
        <div className="mb-4 w-full">
          <FormInput type="textarea" placeholder="Mensaje" name="mensaje" value={formik.values.mensaje} onChange={formik.handleChange} onBlur={formik.handleBlur} />
          {formik.touched.mensaje && formik.errors.mensaje ? <div className="text-red-500 ml-8 text-sm">{formik.errors.mensaje}</div> : null}
        </div>
        <div className="mb-4 w-full">
          <FormInput type="email" placeholder="Correo electrónico" name="email" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} />
          {formik.touched.email && formik.errors.email ? <div className="text-red-500 ml-8 text-sm">{formik.errors.email}</div> : null}
        </div>
        <h5 className="contact-caption">Envíanos un correo personal con tus necesidades y nos pondremos en contacto</h5>
        <button type="submit" className="btn">
          Enviar
        </button>
      </form>
      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg blanco">Muchas gracias por contactarnos</h3>
          <p className="py-4 blanco">Nuestro equipo se comunicará con usted a la brevedad</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn blanco">Cerrar</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};
