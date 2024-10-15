import React, { useRef, useEffect } from "react";
import webComida from "../../assets/webComida.png";
import "./Muestra.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { PaquetesCards } from "./Masonry";

export const Paquetes = () => {

  const carruRef = useRef(null); // Referencia al div
  const followerRef = useRef(null); // Referencia al seguidor del cursor

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

  return (
    <div className="w-full  min-h-screen ">
      <h3 className="text-center text-2xl font-bold md:text-3xl block w-full mt-10 mb-10">
        Desarrollo WEB
      </h3>
      <PaquetesCards/>
    </div>
  );
};