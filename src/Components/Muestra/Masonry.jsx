import React from "react";
import filter from "../../assets/filter-cards.png";
import itsur from "../../assets/ITSUR.png";
import interior from "../../assets/Interior.png"
import short from "../../assets/short-link.png";
import medicos from "../../assets/Medicos.png";
import digital from "../../assets/digital.png";
import pantalones from "../../assets/Pantalones.jpg";
import zapatos from "../../assets/zapatos.jpg";
import TipTip from "../../assets/tiptip.png";
import lentes from "../../assets/lentes.png";
import abogados from "../../assets/abogados.png";
import cafe from "../../assets/cafe.png";
import mascotas from "../../assets/mascotas.png";
import joyeria from "../../assets/joyeria.png";
import Viajes from "../../assets/Viajes.png";
import restaurante from "../../assets/restaurante.png";
const images = [
  {
    src: TipTip,
    alt: "TipTip",
    description: "TipTip proyecto de propinas",
    height: 350,
    link: "https://plazasleongroupllc.com/",
  },
  {
    src: filter,
    alt: "Demo de un filtro de tarjetas",
    description: "Demo de un filtro de tarjetas",
    height: 250,
    link: "https://teal-jalebi-6ba797.netlify.app/",
  },
  {
    src: itsur,
    alt: "Página universitaria",
    description: "Página universitaria",
    height: 300,
    link: "https://main--melodic-sundae-a09a6c.netlify.app/",
  },
  {
    src: short,
    alt: "Acortador de URL",
    description: "Acortador de URL",
    height: 250,
    link: "https://cute-boba-d3d365.netlify.app/",
  },
  {
    src: interior,
    alt: "Página de diseño de interiores",
    description: "Página de diseño de interiores",
    height: 300,
    link: "https://hilarious-pithivier-63fa02.netlify.app/",
  },
  {
    src: zapatos,
    alt: "Tienda de zapatos",
    description: "Tienda de zapatos",
    height: 350,
    link: "https://www.calzadodiaz.com",
  },
  {
    src: digital,
    alt: "Invitaciones digitales",
    description: "Invitacion digital para boda",
    height: 300,
    link: "https://startling-lolly-70cc76.netlify.app/",
  },
  {
    src: pantalones,
    alt: "Landing Page Altertions For The Future",
    description: "Landing Page Altertions For The Future",
    height: 400,
    link: "https://www.alteracioneselfuturo.com",
  },
  {
    src: medicos,
    alt: "Página de medicos",
    description: "Página de medicos",
    height: 300,
    link: "https://spectacular-raindrop-cdfdda.netlify.app/",
  },
  {
    src: lentes,
    alt: "Página de productos",
    description: "Página de lentes",
    height: 350,
    link: "https://merry-hummingbird-bb5feb.netlify.app/",
  },
  {
    src: abogados,
    alt: "Página de abogados",
    description: "Página de abogados",
    height: 250,
    link: "https://bespoke-baklava-423557.netlify.app/",
  },
  {
    src: Viajes,
    alt: "Agencia de viajes",
    description: "Agencia de viajes",
    height: 300,
    link: "https://spectacular-raindrop-cdfdda.netlify.app/",
  },
  {
    src: cafe,
    alt: "Página de cafe",
    description: "Página de cafe",
    height: 200,
    link: "https://bright-rabanadas-3db90e.netlify.app/",
  },
  {
    src: mascotas,
    alt: "Página de mascotas",
    description: "Página de mascotas",
    height: 300,
    link: "https://enchanting-macaron-673fae.netlify.app/",
  },
  {
    src: joyeria,
    alt: "Página de joyeria",
    description: "Página de joyeria",
    height: 400,
    link: "https://wondrous-bublanina-a14932.netlify.app/",
  },
  {
    src: restaurante,
    alt: "Página para restaurante",
    description: "Página para restaurante",
    height: 300,
    link: "https://66d10704c5941bc4825d47e9--loquacious-wisp-42eadd.netlify.app/",
  },
  // Agrega más imágenes según sea necesario
];

export const MasonryComponent = () => {
  return (
    <div className="w-full flex justify-center items-center p-1 bg-gray-200">
      <div className=" columns-2 sm:columns-2 md:columns-3 lg:columns-5 gap-2">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative mb-4 overflow-hidden rounded-lg break-inside"
          >
            <img
              src={image.src}
              alt={image.alt}
              style={{ height: `${image.height}px` }}
              className="rounded-lg w-full h-auto object-cover shadow-md transition-transform transform hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 flex  items-center justify-center text-white text-lg transition-opacity duration-300">
              <a href={image.link} className="" target="_blank">
                {image.description}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
