import React from "react";
import { NavLink } from "react-router-dom";
import whisperBanner from './imgs/whisperBanner.jpg';

export const CategoriasBlog = () => {
  return (
    <div className="w-full flex flex-wrap justify-around items-center">
      
      <div className="card w-full md:w-1/4 bg-white border-2 shadow-xl">
        <figure>
          <img
            src={whisperBanner}
            alt="Shoes"
          />
        </figure>
        <div className="card-body">
          <h2 className="card-title">IA</h2>
          <p>Encuentra grandes artículos en esta categoría</p>
          <div className="card-actions justify-end">
            <NavLink 
            to={'/blog/articulosIA'}
            className="border-2 w-full bg-white rounded-md p-1 border-indigo-200 text-center">Ver más</NavLink>
          </div>
        </div>
      </div>

      <div className="card w-full md:w-1/4 bg-white border-2 shadow-xl">
        <figure>
          <img
            src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
            alt="Shoes"
          />
        </figure>
        <div className="card-body">
          <h2 className="card-title">React Native</h2>
          <p>Encuentra grandes artículos en esta categoría</p>
          <div className="card-actions justify-end">
            <button className="border-2 w-full bg-white rounded-md p-1 border-indigo-200">Ver más</button>
          </div>
        </div>
      </div>

    </div>
  );
};
