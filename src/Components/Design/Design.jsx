import React, { useRef, useEffect, useState } from "react";
import design from "../../assets/design.webp";
import "../BannerSecundario/BannerSecundario.css";
import { TextoAnimado } from "../Utilidades/TextoAnimado";
export const Design = () => {
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
      className="w-full relative flex flex-wrap  justify-between min-h-screen md:items-center"
    >
      <span className=" block w-full text-white text-sm text-center absolute top-4 rombo">
      Diseño 4
      </span>
      <h2 className=" text-gray-50 font-bold text-4xl  w-full md:w-1/4 text-center ">
        {shouldAnimate && <TextoAnimado text="Diseño" />}
      </h2>
      <div className="relative w-full md:w-1/4 flex items-center justify-center">
        <img src={design} alt="" className="img-circle relative z-10 h-52 md:h-96 md:w-96 object-contain"  />
        <div className="circle-of-dots"></div>
      </div>
      <p className="font-thin text-gray-50 mt-5 w-full md:w-1/4  p-1 ml-8 text-left text-base md:text-xl">
      El diseño de Ravekh reflejará su identidad de marca única al tiempo que logrará el máximo impacto estético.
      </p>
    </div>
  );
};
