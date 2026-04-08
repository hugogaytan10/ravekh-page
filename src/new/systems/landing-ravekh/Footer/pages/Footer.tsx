import React from "react";
import { Link } from "react-router-dom";
import fb from "../../assets/logo-facebook.svg";
import ig from "../../assets/logo-instagram.svg";
export const Footer = () => {
  return (
    <div className="bg-fondo-oscuro min-h-screen w-full  flex justify-center items-center">
      <div>
        <h3 className="text-white text-center text-2xl font-bold">RAVEKH</h3>
        <h4 className="text-white w-3/4 text-center m-auto mt-2">
          Lleva tu negocio al siguiente nivel, convierte las visitas en ventas
          con nuestra ayuda.
        </h4>
        <div className="flex justify-center gap-2 mt-5">
          <a
            target="_blank"
            href="https://www.facebook.com/profile.php?id=61572797407020"
          >
            <img src={fb} alt="fb" />
          </a>
          <a target="_blank" href="https://www.instagram.com/rave_kh/">
            <img src={ig} alt="ig" />
          </a>
        </div>

        <div className="mt-8 grid gap-2 text-center">
          <p className="text-white font-semibold">Políticas de privacidad</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <Link to="/politicas/ravekh-pos" className="text-white underline">
              Ravekh POS
            </Link>
            <Link to="/politicas/ravekh" className="text-white underline">
              Ravekh
            </Link>
            <Link to="/politicas/lealtad" className="text-white underline">
              Lealtad
            </Link>
            <Link to="/politicas/catalogo" className="text-white underline">
              Catálogo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
