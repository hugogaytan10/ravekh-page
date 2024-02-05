import React from "react";
import { NavLink } from "react-router-dom";
import whisperBanner from "./imgs/whisperBanner.jpg";
import reactLogo from "./imgs/react.png";

export const CategoriasBlog = () => {
  return (
    <div className="w-full flex flex-wrap justify-around items-center">
      <div className="card w-full md:w-1/4 bg-white border-2 shadow-xl">
        <figure>
          <img src={whisperBanner} alt="Shoes" />
        </figure>
        <div className="card-body">
          <h2 className="card-title">IA</h2>
          <p>Encuentra grandes artículos en esta categoría</p>
          <div className="card-actions justify-end">
            <NavLink
              to={"/blog/articulosIA"}
              className="border-2 w-full bg-white rounded-md p-1 border-indigo-200 text-center"
            >
              Ver más
            </NavLink>
          </div>
        </div>
      </div>

      <div className="card w-full md:w-1/4 bg-white border-2 shadow-xl">
        <figure>
          <img src={reactLogo} alt="Shoes" />
        </figure>
        <div className="card-body">
          <h2 className="card-title">React Native</h2>
          <p>Encuentra grandes artículos en esta categoría</p>
          <div className="card-actions justify-end">
            <NavLink
              to={"/blog/articulosReactNative"}
              className="text-center border-2 w-full bg-white rounded-md p-1 border-indigo-200"
            >
              Ver más
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
