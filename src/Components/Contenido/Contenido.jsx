import React, { useRef, useEffect, useState } from "react";
import contenido from "../../assets/contenido.webp";
import "../BannerSecundario/BannerSecundario.css";
import { TextoAnimado } from "../Utilidades/TextoAnimado";
export const Contenido = () => {
  const secundario = useRef(null); // Referencia al div
  const followerRef = useRef(null); // Referencia al seguidor del cursor
  const [shouldAnimate, setShouldAnimate] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldAnimate(false); // Reset animation
          setTimeout(() => {
            setShouldAnimate(true); // Trigger animation
          }, 50); // Delay slightly to allow DOM update
          setIsInView(true);
        } else {
          setIsInView(false);
        }
      },
      { threshold: 1 } // Ajusta el threshold según necesites
    );

    if (secundario.current) {
      observer.observe(secundario.current);
    }

    return () => {
      if (secundario.current) {
        observer.unobserve(secundario.current);
      }
    };
  }, []);
  return (
    <div
      id="secundario"
      ref={secundario}
      className="w-full relative flex flex-wrap items-center justify-between min-h-screen "
    >
      <span className=" block w-full text-white text-sm text-center absolute top-4 rombo">
        Proceso 2
      </span>
      <h2 className=" text-gray-50 font-bold text-4xl p-1 ml-8 w-full md:w-1/4 text-center ">
        {shouldAnimate && <TextoAnimado text="Contenido" />}
      </h2>
      <div className="relative w-full md:w-1/4 flex items-center justify-center">
        <img src={contenido} alt="" className="img-circle relative z-10 h-52 md:h-96 md:w-96 object-contain"  />
        <div className="circle-of-dots"></div>
      </div>
      <p className="font-thin text-gray-50 mt-5 w-full md:w-1/4  p-1 ml-8 text-left text-base md:text-xl">
      A través de la comunicación, compartimos ideas y damos forma a su contenido, presentando una visión clara.

      </p>
    </div>
  );
};
