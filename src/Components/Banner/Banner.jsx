
import React, { useEffect, useState, useRef } from "react";
import "./Banner.css";
import { TextoAnimado } from "../Utilidades/TextoAnimado";

export const Banner = () => {
  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  return (
    <div
      ref={sectionRef}
      className="contenedor-banner"
      style={{ backgroundColor: "#6D01D1" }}
    >
      <span className=" block w-full text-white text-sm text-center absolute top-1/4 rombo">Objetivo</span>
      <h1 className="titulo-pagina">
        {shouldAnimate && <TextoAnimado text="Creativo" />}
        {shouldAnimate && <TextoAnimado text="Directo" />}
        {shouldAnimate && <TextoAnimado text="y personal" />}
      </h1>
      <div className="mouse">
        <div className="wheel"></div>
      </div>
    </div>
  );
};
