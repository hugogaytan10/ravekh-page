/* eslint-disable react/prop-types */
import { GoogleInput } from "../../../legacy/contact";
import "./ContactForm.css";

const CONTACT_FIELDS = [
  { name: "nombre", type: "text", placeholder: "Nombre Completo" },
  { name: "telefono", type: "tel", placeholder: "Teléfono con lada" },
  {
    name: "email",
    type: "email",
    placeholder: "Correo electrónico",
    fullWidth: true,
  },
  { name: "mensaje", type: "textarea", placeholder: "Mensaje", fullWidth: true },
];

export const ContactForm = ({ catalogo, compact = false, formik, modalId }) => {
  const titleClass = catalogo ? "text-black" : "text-gray-100";
  const containerClass = compact
    ? "flex justify-around flex-wrap w-full items-start px-4 py-6 md:py-12"
    : "flex justify-around flex-wrap min-h-screen w-full items-center px-4 py-10 md:py-14";

  return (
    <div className={containerClass}>
      <form
        onSubmit={formik.handleSubmit}
        className={`contact-form-shell ${compact ? "contact-form-shell--compact" : ""} w-full max-w-4xl flex flex-wrap justify-center items-center`}
      >
        <h3 className={`text-3xl ${titleClass} text-center block w-full mb-2`}>Contáctanos</h3>
        <p className={`w-full text-center mb-6 md:mb-8 ${titleClass}`}>
          Cuéntanos qué necesitas y te responderemos con una propuesta personalizada.
        </p>

        {CONTACT_FIELDS.map(({ name, type, placeholder, fullWidth }) => {
          const wrapperClasses = fullWidth ? "mb-2 w-full" : "mb-2 w-full md:w-1/2 md:px-2";

          return (
            <div className={wrapperClasses} key={name}>
              <GoogleInput
                type={type}
                placeholder={placeholder}
                name={name}
                value={formik.values[name]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                rows={compact ? 3 : 5}
              />
              {formik.touched[name] && formik.errors[name] ? (
                <div className="text-red-400 px-4 pb-2 text-sm">{formik.errors[name]}</div>
              ) : null}
            </div>
          );
        })}

        <button type="submit" className="contact-submit-button">
          Enviar
        </button>
      </form>

      <dialog id={modalId} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-white">Muchas gracias por contactarnos</h3>
          <p className="py-4 text-white">Nuestro equipo se comunicará con usted a la brevedad</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="contact-close-modal-button">Cerrar</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};
