import React, { useEffect, useState } from "react";
import "./App.css";
import { Banner } from "./Components/Banner/Banner";
import { BannerSecundario } from "./Components/BannerSecundario/BannerSecundario";
import { Contacto } from "./Components/Contacto/Contacto";
import { Productos } from "./Components/Producto/Productos";
import { Caracteristicas } from "./Components/Caracteristicas/Caracteristicas";
import { Footer } from "./Components/Footer/Footer";
import { Muestra } from "./Components/Muestra/Muestra";
import logoWhasa from "./assets/logo-whatsapp.svg";
import { Rutas } from "./Components/Rutas/Rutas";
import { Carga } from "./Components/PantallaCarga/Carga";
import AppProvider from "./Components/CatalogoWeb/Context/AppContext";
/*
window.addEventListener("scroll", function () {
  
  let elements = document.getElementsByClassName("scroll-content");
  let screenSize = window.innerHeight;

  for (const item of elements) {
    let element = item;

    if (element.getBoundingClientRect().top < screenSize - 200) {
      element.classList.add("visible");
    } else {
      element.classList.remove("visible");
    }
  }

});
*/
function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // El tiempo total de la animación es de 2.4 segundos
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div>
      {loading ? (
        <Carga />
      ) : (
        <AppProvider>
          <Rutas />
        </AppProvider>
      )}
    </div>
  );
}

export default App;
