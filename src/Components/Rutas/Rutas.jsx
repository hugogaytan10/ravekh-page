import React, { useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LandingPage } from "../LandingPage/LandingPage";
import { BlogMain } from "../Blog/BlogMain";
import { MainArticulosIA } from "../Blog/ArticulosIA/MainArticulosIA";
import { ArticuloWhisper } from "../Blog/ArticulosIA/ArticuloWhisper/ArticuloWhisper";
import { MainArticulosReactNative } from "../Blog/ArticulosReactNative/MainArticulosReactNative";
import menu from "../../assets/menu.svg";
import "./Rutas.css";
import { gsap, TimelineMax } from "gsap";
import { ArticuloValeLaPenaReact } from "../Blog/ArticulosReactNative/ArticuloValeLaPenaReact/ArticuloValeLaPenaReact";
import { Productos } from "../Producto/Productos";
import { Muestra } from "../Muestra/Muestra";
import { MainCatalogo } from "../CatalogoWeb/MainCatalogo";
import { DetalleProducto } from "../CatalogoWeb/DetalleProducto";
import { Pedido } from "../CatalogoWeb/Pedido";

export const Rutas = () => {
  const menuIconRef = useRef(null);
  const slideDownRef = useRef(null);
  const listItemsRef = useRef(null);
  const menuToggle = useRef(null);

  useEffect(() => {
    gsap.set(slideDownRef.current, { y: '-100%', display: 'block' });

    menuToggle.current = new TimelineMax({ paused: true, reversed: true })
      .to(menuIconRef.current, 0.5, { x: '-30', ease: "back.out(1.7)" })
      .to(slideDownRef.current, 1, { y: '0%', ease: "back.out(1.7)" })
      .staggerFrom(listItemsRef.current.children, 0.25, {
        y: '-30',
        ease: "power1.out"
      }, 0.1);
  }, []);

  const handleMenuClick = () => {
    menuToggle.current.reversed() ? menuToggle.current.restart() : menuToggle.current.reverse();
  };

  return (
    <BrowserRouter>
      <div className="drawer " >
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

        <div className="  drawer-content flex flex-col h-full min-w-full relative">
          <div ref={menuIconRef} className="z-40 nav-menu bg-white w-10 h-10 rounded-full flex items-center justify-center fixed top-2 right-1 z-10" onClick={handleMenuClick}>
            <img src={menu} alt="menu" className="h-10 w-10" />
          </div>

          <nav ref={slideDownRef} className=" menu-container fixed top-0 left-0 w-full h-full bg-morado-oscuro z-30" style={{display: 'none'}}>
            <ul ref={listItemsRef} className="list-items flex flex-col items-center justify-center h-full">
              <li><NavLink to="/" onClick={handleMenuClick}>Inicio</NavLink></li>
              <li><NavLink to="/proyectos" onClick={handleMenuClick}>Proyectos</NavLink></li>
              <li><NavLink to="/blog" onClick={handleMenuClick}>Blog</NavLink></li>
              <li><p className="text-white text-base">ravekh.team@gmail.com</p></li>

            </ul>
          </nav>

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/proyectos" element={<Muestra />} />
            <Route path="/blog" element={<BlogMain />} />
            <Route path="/blog/articulosIA" element={<MainArticulosIA />} />
            <Route path="/blog/articulosIA/whisper" element={<ArticuloWhisper />} />
            <Route path="/blog/articulosReactNative" element={<MainArticulosReactNative />} />
            <Route path="/blog/articulosReactNative/valeLaPena" element={<ArticuloValeLaPenaReact />} />
            {/*RUTAS PARA EL CATALOGO WEB */}
            <Route path="/catalogo/:idBusiness" element={<MainCatalogo />} />
            <Route path="/catalogo/producto/:idProducto/:telefono" element={<DetalleProducto />} />
            <Route path="/catalogo/pedido" element={<Pedido />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};
