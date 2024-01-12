import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LandingPage } from "../LandingPage/LandingPage";
import { BlogMain } from "../Blog/BlogMain";
import { MainArticulosIA } from "../Blog/ArticulosIA/MainArticulosIA";
import { ArticuloWhisper } from "../Blog/ArticulosIA/ArticuloWhisper/ArticuloWhisper";
export const Rutas = () => {
  return (
    <BrowserRouter>
      <header>{/* AQUI IRA EL MENU */}</header>
      <main >
        <section>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/blog" element={<BlogMain />} />
            <Route path="/articulosIA" element={<MainArticulosIA/>} />
            <Route path="//articulosIA/whisper" element={<ArticuloWhisper/>} />
          </Routes>
        </section>
      </main>
    </BrowserRouter>
  );
};
