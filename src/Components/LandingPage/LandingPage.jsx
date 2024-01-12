import React from "react";
import { Banner } from "../Banner/Banner";
import { BannerSecundario } from "../BannerSecundario/BannerSecundario";
import { Caracteristicas } from "../Caracteristicas/Caracteristicas";
import { Productos } from "../Producto/Productos";
import { Muestra } from "../Muestra/Muestra";
import { Contacto } from "../Contacto/Contacto";
import { Footer } from "../Footer/Footer";
import logoWhasa from "../../assets/logo-whatsapp.svg";

export const LandingPage = () => {
  return (
    <div className="flex overflow-hidden flex-wrap">
      <Banner />
      <BannerSecundario />
      <Caracteristicas />
      <Productos />
      <Muestra />
      <Contacto />
      <Footer />
      <div className="bg-color-whats rounded-full p-1 fixed right-2 bottom-4">
        <a href="https://api.whatsapp.com/send?phone=524451113370">
          <img src={logoWhasa} alt="WS" />
        </a>
      </div>
    </div>
  );
};
