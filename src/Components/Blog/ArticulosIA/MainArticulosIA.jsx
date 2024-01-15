import React from 'react'
import { NavLink } from 'react-router-dom'
import whisper from '../imgs/whisper.jpg';

export const MainArticulosIA = () => {
  return (
    <div className='min-h-svh'>
        <div className="card w-full md:w-1/4 bg-white border-2 shadow-xl">
        <figure>
          <img
            src={whisper}
            alt="Shoes"
          />
        </figure>
        <div className="card-body">
          <h2 className="card-title">WHISPER</h2>
          <p>Integra Whisper a tu aplicación móvil</p>
          <div className="card-actions justify-end">
            <NavLink
            to='/blog/articulosIA/whisper'
            className="text-center border-2 w-full bg-white rounded-md p-1 border-indigo-200">Ver más</NavLink>
          </div>
        </div>
      </div>
    </div>
  )
}
