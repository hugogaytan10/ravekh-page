import React, { useRef, useEffect, useState } from "react";
import flecha from "../../assets/arrow-forward-white.svg";
import "./BannerSecundario.css";
import lupa from "../../assets/lupa-analisis.webp";
import { TextoAnimado } from "../Utilidades/TextoAnimado";
import { Helmet, HelmetProvider } from "react-helmet-async";
export const BannerSecundario = () => {
  const secundario = useRef(null); // Referencia al div
  const followerRef = useRef(null); // Referencia al seguidor del cursor
  const [shouldAnimate, setShouldAnimate] = useState(true);
  /*
  useEffect(() => {
    const div = carruRef.current;
    const follower = followerRef.current;

    if (div && follower) {
      follower.style.display = "none";

      const handleMouseMove = (e) => {
        // Asegúrate de que el cálculo se basa en la posición relativa al div
        const rect = div.getBoundingClientRect();
        follower.style.left = e.clientX - rect.left + "px";
        follower.style.top = e.clientY - rect.top + "px";
      };

      const handleMouseEnter = () => {
        follower.style.display = "block";
      };

      const handleMouseLeave = () => {
        follower.style.display = "none";
      };

      if (div) {
        div.addEventListener("mousemove", handleMouseMove);
        div.addEventListener("mouseenter", handleMouseEnter);
        div.addEventListener("mouseleave", handleMouseLeave);

        // Limpieza de eventos
        return () => {
          div.removeEventListener("mousemove", handleMouseMove);
          div.removeEventListener("mouseenter", handleMouseEnter);
          div.removeEventListener("mouseleave", handleMouseLeave);
        };
      }
    }
  }, []);
  */
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
          Proceso 1
        </span>
        <h2 className=" text-gray-50 font-bold text-4xl  w-full md:w-1/4 text-center mb-10">
          {shouldAnimate && <TextoAnimado text="Análisis" />}
        </h2>
        <div className="relative w-full md:w-1/4 flex items-center justify-center">
          <img
            src={lupa}
            alt=""
            className="img-circle relative z-10 h-52 md:h-96 md:w-96 object-contain"
          />
          <div className="circle-of-dots"></div>
        </div>
        <p className="font-thin text-gray-50 mt-5 w-full md:w-1/4  p-1 ml-8 text-left text-base md:text-xl">
          Comenzamos con la determinación de comprender su marca y los
          intrincados detalles de cada proyecto único.
        </p>
      </div>
  );
};
