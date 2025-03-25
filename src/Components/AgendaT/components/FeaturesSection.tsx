import React from 'react';

const FeaturesSection: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-b from-[#E0BBFF] to-[#F8E8FF] py-8">
      <div className="text-center mb-8">
        <p className="text-gray-600 text-sm mb-1">Desde 300 mxn/mes</p>
        <h2 className="text-2xl font-bold text-[#4A148C]">El secreto para un negocio organizado</h2>
      </div>

      {/* Card */}
      <div className="flex justify-center lg:w-1/3 m-auto">
        <div className="bg-[#F0E4FF] shadow-lg rounded-lg p-6 w-full max-w-lg">
          <div className="text-gray-800 text-left text-sm leading-6">
            <p><span className="text-[#9C27B0] font-semibold">+4 hrs </span>Atendiendo clientes para citas</p>
            <p><span className="text-[#9C27B0] font-semibold">+3 hrs </span>verificando horarios</p>
            <p><span className="text-[#9C27B0] font-semibold">+8 hrs </span>creando tu tienda en línea</p>
            <p><span className="text-[#9C27B0] font-semibold">+3 hrs </span>Asignando tus trabajadores a los clientes</p>
            <p><span className="text-[#9C27B0] font-semibold">+8 hrs </span>Tratando de recordar quien Atendio a los clientes</p>
            <p><span className="text-[#9C27B0] font-semibold">∞ hrs </span>pensando dónde invertir las ganancias...</p>
            <p className="text-[#9C27B0] font-semibold mt-3">= +30 horas</p> 
            <p className="text-sm">de pesadillas</p>
          </div>

          {/* Updated design for the white card */}
          <div className="bg-white border-2 border-[#9C27B0] rounded-lg p-4 mt-4 shadow-xl transform hover:scale-105 transition-transform">
            <div className="text-center">
              <p className="text-sm text-gray-700">Con <span className="font-bold text-[#6D01D1]">RAVEKH POS</span></p>
              <p className="text-base font-semibold text-[#6D01D1] mt-1">= +30 horas</p>
              <p className="text-sm text-gray-500 mt-1">para ti y tu familia</p>
            </div>
          </div>

          {/* Button */}
          <div className="text-center mt-6">
            <button className="px-6 py-2 bg-gradient-to-r from-[#9C27B0] to-[#6D01D1] text-white text-sm rounded-full hover:bg-[#7B1FA2] transition-shadow hover:shadow-lg">
              Empezar Prueba Gratis
            </button>
          </div>
        </div>
      </div>

      {/* Subtítulo */}
      <div className="text-center mt-8">
        <p className="text-gray-500 text-sm italic">Pero no somos solo un punto de venta</p>
        <h3 className="text-xl font-bold text-[#4A148C] mt-1">RAVEKH POS te da todo en un solo lugar</h3>
      </div>
    </div>
  );
};

export default FeaturesSection;
