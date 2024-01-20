import React from "react";
import { NavLink } from "react-router-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LandingPage } from "../LandingPage/LandingPage";
import { BlogMain } from "../Blog/BlogMain";
import { MainArticulosIA } from "../Blog/ArticulosIA/MainArticulosIA";
import { ArticuloWhisper } from "../Blog/ArticulosIA/ArticuloWhisper/ArticuloWhisper";
export const Rutas = () => {
  return (
    <BrowserRouter>
      <header>
        <div className="navbar bg-white">
          <div className="navbar-center">
            <ul className="menu menu-horizontal px-1">
              <li><NavLink to={'/'}>INICIO</NavLink></li>
              <li><NavLink to={'/blog'}>BLOG</NavLink></li>
            </ul>
          </div>
        </div>
      </header>
      <main >
        <section>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/blog" element={<BlogMain />} />
            <Route path="/blog/articulosIA" element={<MainArticulosIA />} />
            <Route path="/blog/articulosIA/whisper" element={<ArticuloWhisper />} />
          </Routes>
        </section>
      </main>
    </BrowserRouter>
  );
};
