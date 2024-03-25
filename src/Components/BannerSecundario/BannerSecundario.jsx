import React, { useRef, useEffect } from "react";
import flecha from "../../assets/arrow-forward-white.svg";
import "./BannerSecundario.css";
export const BannerSecundario = () => {
  const carruRef = useRef(null); // Referencia al div
  const followerRef = useRef(null); // Referencia al seguidor del cursor
  const handleMouseDown = () => {
    const carru = document.getElementById("secundario");
  };

  const handleMouseUp = () => {
    const carru = document.getElementById("secundario");
  };
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
    <div
    id="secundario"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      ref={carruRef}
      className="bg-negro banner-secundario w-full relative"

    >
      <h2 className="text-gray-50 font-bold text-3xl text-left p-1 ml-8">
        La tecnología que respalda su éxito
      </h2>
      <div className="flex flex-wrap w-full">
        <div className="w-full md:w-1/2 h-96">
          <p className="font-thin text-gray-50 mt-5 w-9/12 p-1 ml-8">
            Nuestros clientes y sus colaboradores logran sus objetivos
            estratégicos y profesionales
          </p>
          <div className="text-left mt-10  ml-14 w-1/4  md:w-4/12 md:ml-5">
            <a
              href="https://api.whatsapp.com/send?phone=524451113370"
              className="rounded-md p-1 text-gray-50 underline font-bold flex justify-around items-center gap-2 md:text-sm md:justify-start md:ml-2"
            >
              Contáctar
              <img src={flecha} alt="flecha" />
            </a>
          </div>
        </div>
      </div>
      <div ref={followerRef} className="cursor-follower-secundario"></div>
    </div>
  );
};
