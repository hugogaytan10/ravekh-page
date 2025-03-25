import React from "react";
import heroImage1 from "./banner.png"; // Imagen del primer móvil

const HeroSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-[#E0BBFF] to-[#F8E8FF] w-full">
      <div className="bg-white mx-auto px-4 text-center flex flex-col items-center py-16">
        {/* Texto */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#6A1B9A]">
            Ventas e Inventario
          </h1>
          <p className="text-lg md:text-xl text-[#7B1FA2] mt-4">
            Control Simple A Un Buen Precio
          </p>
        </div>

        {/* Botones */}
        <div className="mb-8 flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
          <a
            href="#"
            className="bg-[#6D01D1] text-white px-8 py-4 rounded-full shadow-lg hover:bg-[#5500B4] transition"
          >
            Comenzar Hoy - Es Gratis
          </a>
          <a
            href="#"
            className="bg-white text-[#6D01D1] border-2 border-[#6D01D1] px-8 py-4 rounded-full shadow-lg hover:bg-[#F0E4FF] transition"
          >
            Obtener Demo
          </a>
        </div>

        {/* Elementos destacados */}
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 mb-12 text-gray-600">
          <div className="flex items-center">
            <span className="text-[#6D01D1]">✓</span>
            <p className="ml-2 text-[#4A148C]">Cualquier negocio</p>
          </div>
          <div className="flex items-center">
            <span className="text-[#6D01D1]">✓</span>
            <p className="ml-2 text-[#4A148C]">Celular</p>
          </div>
          <div className="flex items-center">
            <span className="text-[#6D01D1]">✓</span>
            <p className="ml-2 text-[#4A148C]">Inicia en segundos</p>
          </div>
        </div>

        {/* Imagenes de los dispositivos */}
        <div className="flex justify-center space-x-8">
          <img
            src={heroImage1}
            alt="Aplicación móvil 1"
            className="w-72 md:w-96 h-auto"
          />
        </div>

        {/* Reseñas */}
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-8 mt-12">
          <div className="text-center">
            <p className="text-yellow-500 text-xl md:text-2xl">★★★★★</p>
            <p className="text-[#4A148C] font-semibold mt-2">
              "Ahorro 20 hrs semana"
            </p>
            <p className="text-[#6A1B9A] text-sm">Alfredo Inostroza - App Store</p>
          </div>
          <div className="text-center">
            <p className="text-yellow-500 text-xl md:text-2xl">★★★★★</p>
            <p className="text-[#4A148C] font-semibold mt-2">
              "Recomiendo al 100%"
            </p>
            <p className="text-[#6A1B9A] text-sm">Gerardo López - Google Play</p>
          </div>
          <div className="text-center">
            <p className="text-yellow-500 text-xl md:text-2xl">★★★★★</p>
            <p className="text-[#4A148C] font-semibold mt-2">
              "Soporte Increíble"
            </p>
            <p className="text-[#6A1B9A] text-sm">Jordi Cortés - Google Play</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
