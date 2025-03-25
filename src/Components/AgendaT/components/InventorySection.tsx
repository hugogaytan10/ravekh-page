import React from 'react';
import inventario from './inventario.png';

const InventorySection: React.FC = () => {
  return (
    <div className="bg-[#F8F4FF] py-16">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between px-4 bg-transparent">
        
        {/* Texto */}
        <div className=" p-8 rounded-3xl shadow-xl lg:w-1/2 lg:mr-8 mb-8 lg:mb-0">
          <h3 className="text-[#6D01D1] text-lg font-bold mb-2">RAVEKH es...</h3>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Tu Agenda</h2>
          <p className="text-gray-600 mb-6">
            Verifica tus reservaciones, atiende a tus clientes en un solo lugar.
          </p>
          <p className="font-semibold mb-4">Con RAVEKH Agenda, tú puedes...</p>
          <ul className="list-none space-y-3">
            <li className="text-gray-700 flex items-start">
              <span className="text-[#6D01D1] font-bold mr-2">⭐</span>
              Variantes (Colores, tallas, etc.)
            </li>
            <li className="text-gray-700 flex items-start">
              <span className="text-[#6D01D1] font-bold mr-2">✓</span>
              Seguimiento de citas y servicios
            </li>
            <li className="text-gray-700 flex items-start">
              <span className="text-[#6D01D1] font-bold mr-2">✓</span>
              Notificaciones por WhatsApp y desde la Aplicación
            </li>
            <li className="text-gray-700 flex items-start">
              <span className="text-[#6D01D1] font-bold mr-2">✓</span>
              Manejo de empleados
            </li>
            <li className="text-gray-700 flex items-start">
              <span className="text-[#6D01D1] font-bold mr-2">✓</span>
              Control desde Cualquier lugar
            </li>
          </ul>
          <p className="text-[#6D01D1] text-3xl font-bold mt-6">68% menos</p>
          <p className="text-gray-500">Olvido sobre las citas y confuciones con el horario</p>
        </div>

        {/* Imagen y botón */}
        <div className="lg:w-1/2 flex flex-col items-center rounded-lg">
          <img
            src={inventario}
            alt="Inventario App"
            className="w-full max-w-sm mb-8 object-contain rounded-lg shadow-l h-96 "
          />
          <a
            href="#"
            className="bg-[#6D01D1] text-white px-8 py-3 rounded-full shadow-md hover:bg-[#5500B4] transition"
          >
            Quiero Probarlo Ahora!
          </a>
         
        </div>
      </div>
    </div>
  );
};

export default InventorySection;
