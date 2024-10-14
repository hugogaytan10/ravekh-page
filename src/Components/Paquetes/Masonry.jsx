import React from "react";
import "./Precios.css";
import logoWhasa from "../../assets/logo-whatsapp.svg";

const paquetes = [
  {
    paquete: "Landing Page",
    description: [
      "Sitio web informativo",
      "1 año de registro de dominio",
      "1 año de servicio de hosting",
      "6 secciones de contenido",
      "Galería de 10 a 15 imágenes",
      "Animación sencilla de transición en textos",
      "Formulario de contacto",
      "Iconografía personalizada",
      "Integración de Redes Sociales",
      "Certificado de seguridad SSL",
      "Optimización del sitio web para mayor velocidad de carga",
      "1 revision para cambios",
      "Mantenimiento cada 6 meses (10% del valor del paquete)"
    ],
    price: "$3,200MXN"
  },
  {
    paquete: "Pagina en expanción",
    description: [
      "Sitio web informativo",
      "1 año de registro de dominio",
      "1 año de servicio de hosting",
      "6 secciones de contenido",
      "Galería de 15 a 30 imágenes",
      "Animación sencilla de transición en textos",
      "Formulario de contacto",
      "Iconografía personalizada",
      "Integración de Redes Sociales",
      "Botón de Whatsapp",
      "Certificado de seguridad SSL",
      "Optimización del sitio web para mayor velocidad de carga",
      "3 revisiones para cambios",
      "Mantenimiento cada 6 meses (10% del valor del paquete)"
    ],
    price: "$4,390MXN",
    link: "https://66d10704c5941bc4825d47e9--loquacious-wisp-42eadd.netlify.app/",
  },
  {
    paquete: "Tienda en linea",
    description: [
      "Sitio web informativo",
      "1 año de registro de dominio",
      "1 año de servicio de hosting",
      "6 secciones de contenido",
      "Galería de 15 a 30 imágenes",
      "Animación sencilla de transición en textos",
      "Formulario de contacto",
      "Iconografía personalizada",
      "Integración de Redes Sociales",
      "Botón de Whatsapp",
      "Integración de Google Maps",
      "Tienda en linea con productos ilimitados",
      "Integración con pasarelas de pago",
      "Pagina de Favoritos",
      "Panel administrativo",
      "Sugerencia de productos",
      "Certificado de seguridad SSL",
      "Optimización del sitio web para mayor velocidad de carga",
      "3 revisiones para cambios",
      "Mantenimiento cada 6 meses (10% del valor del paquete)",
      "Capacitación completa"
    ],
    price: "$5,590MXN",
    link: "https://66d10704c5941bc4825d47e9--loquacious-wisp-42eadd.netlify.app/",
  },
  /*{
    paquete: "Custom",
    description: [
      "Sitio web informativo",
      "1 año de registro de dominio",
      "1 año de servicio de hosting",
      "Desarrollo a medida acorde a los requerimietos",
      "Certificado de seguridad SSL",
      "3 revisiones para cambios",
      "Mantenimiento cada 6 meses (10% del valor del paquete)",
      "Capacitación completa"
    ],
    price: "Agendar cotización",
    link: "https://66d10704c5941bc4825d47e9--loquacious-wisp-42eadd.netlify.app/",
  }*/
];

export const PaquetesCards = () => {
  return (
    <div className="container ">
      <div className="flex gap-6 flex flex-wrap">
        {paquetes.map((image, index) => (
          <div key={index} className="card w-full md:w-4/12">
            <div className="card-header">{image.paquete}</div>
            <div className="card-price">
              {image.price}
              <span> IVA INCLUIDO</span>
            </div>
            <div className="card-description">
              {image.description.map((item, i) => (
                <>
                  <p key={i}>{item}</p>
                </>
              ))}
            </div>
            {/*<a href={image.link} target="_blank" rel="noopener noreferrer" className="card-link">
              Contacto
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>*/}
          </div>
        ))}
      </div>
      <div className="bg-color-whats rounded-full p-1 fixed right-2 bottom-4">
        <a href="https://api.whatsapp.com/send?phone=524451113370">
          <img src={logoWhasa} alt="WS" />
        </a>
      </div>
    </div>
  );
};
