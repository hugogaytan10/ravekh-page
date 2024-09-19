import React from "react";
import "./Carga.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
export const Carga = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <meta name="theme-color" content="#1F023F" />
      </Helmet>
      <div style={{ backgroundColor: "#6D01D1" }}>
        <div className="container-carga">
          <span className="title">R</span>
          <span className="title">A</span>
          <span className="title">V</span>
          <span className="title">E</span>
          <span className="title">K</span>
          <span className="title">H</span>
        </div>
      </div>
    </HelmetProvider>
  );
};
