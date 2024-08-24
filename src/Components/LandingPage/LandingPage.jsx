import React, { useRef, useEffect } from "react";
import { Banner } from "../Banner/Banner";
import { BannerSecundario } from "../BannerSecundario/BannerSecundario";
import { Caracteristicas } from "../Caracteristicas/Caracteristicas";
import { Productos } from "../Producto/Productos";
import { Muestra } from "../Muestra/Muestra";
import { Contacto } from "../Contacto/Contacto";
import { Footer } from "../Footer/Footer";
import logoWhasa from "../../assets/logo-whatsapp.svg";
import { useScrollBackground } from "../Utilidades/useScrollBackground";
import { Contenido } from "../Contenido/Contenido";
import { Wireframe } from "../Wireframe/Wireframe";
import { Design } from "../Design/Design";
import { Desarrollo } from "../Desarrollo/Desarrollo";

export const LandingPage = () => {
  //useScrollBackground();
  const containerRef = useRef(null);

  useEffect(() => {
    const sections = containerRef.current.querySelectorAll("section");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log("Section in view:", entry.target);
            // Aquí puedes aplicar la lógica para cambiar el fondo
            const section = entry.target;
            section.style.backgroundColor = `rgb(${section.dataset.endcolor})`;
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.5,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);
  return (

    <div
      ref={containerRef}
      className="h-screen flex flex-col overflow-y-scroll snap-y snap-mandatory"
    >
      <section className="h-screen snap-start w-full " data-endcolor="73,5,146">
        <Banner />
      </section>
      <section className="h-screen snap-start w-full" data-endcolor="78,10,148">
        <BannerSecundario />
      </section>
      <section className="h-screen snap-start w-full" data-endcolor="250,171,171">
        <Contenido />
      </section>
      <section className="h-screen snap-start w-full" data-endcolor="124,204,190">
        <Wireframe />
      </section>
      <section className="h-screen snap-start w-full" data-endcolor="151,194,217">
        <Design />
      </section>
      <section className="h-screen snap-start w-full" data-endcolor="177,192,203">
        <Desarrollo />
      </section>
      <section className="h-screen snap-start w-full" data-endcolor="0,0,0">
        <Caracteristicas />
      </section>
   
     
      <section className="h-screen snap-start w-full" data-endcolor="30,30,30">
        <Contacto />
      </section>
      <section className="h-screen snap-start w-full">
        <Footer />
      </section>

      <div className="bg-color-whats rounded-full p-1 fixed right-2 bottom-4">
        <a href="https://api.whatsapp.com/send?phone=524451113370">
          <img src={logoWhasa} alt="WS" />
        </a>
      </div>
    </div>
  );
};
