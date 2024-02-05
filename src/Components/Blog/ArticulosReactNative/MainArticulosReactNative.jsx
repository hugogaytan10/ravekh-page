import React from "react";
import { NavLink } from "react-router-dom";
import reactLogo from "../imgs/react.png";
export const MainArticulosReactNative = () => {
  return (
    <div className="min-h-svh">
      <div className="card w-full md:w-1/4 bg-white border-2 shadow-xl">
        <figure>
          <img src={reactLogo} alt="Shoes" />
        </figure>
        <div className="card-body">
          <h2 className="card-title">Vale la pena aprender react native en 2024?</h2>
          <div className="card-actions justify-end">
          <p>Descrubre más en el artículo</p>
            <NavLink
              to={"/blog/articulosReactNative/valeLaPena"}
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
