import { useEffect } from "react";
import { AnimatedText } from "../components/AnimatedText";
import "../styles/landingVisuals.css";

export const BannerSection = () => {
  useEffect(() => {
    document.getElementById("menuIcono")?.classList.remove("hidden");
    document.getElementById("menuIconoCatalogo")?.classList.add("hidden");
  }, []);

  return (
    <div className="contenedor-banner" style={{ backgroundColor: "#6D01D1" }}>
      <span className="w-full text-white text-sm text-center absolute top-1/4 rombo">Objetivo</span>
      <h1 className="titulo-pagina">
        <AnimatedText text="Creativo" />
        <AnimatedText text="Directo" />
        <AnimatedText text="y personal" />
      </h1>
      <div className="mouse">
        <div className="wheel" />
      </div>
    </div>
  );
};
