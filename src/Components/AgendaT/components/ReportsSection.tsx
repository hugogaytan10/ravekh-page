import React from 'react';
import reportImage from '../reportImage.png'; // Asegúrate de cambiar la ruta de la imagen.

const ReportsSection: React.FC = () => {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between px-4">
        
        {/* Imagen */}
        <div className="lg:w-1/2 flex justify-center lg:justify-start">
          <img
            src={reportImage}
            alt="Reportes del negocio"
            className="w-full max-w-md object-contain h-96 rounded-lg shadow-lg"
          />
        </div>

        {/* Texto */}
        <div className="lg:w-1/2 lg:ml-8 mt-8 lg:mt-0">
          <h3 className="text-[#6D01D1] text-lg font-bold mb-2">RAVEKH Agenda te ofrece...</h3>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Revision de horarios y validacion de tareas para empleados</h2>
          <p className="text-gray-600 mb-6">
            Visualiza las citas de tu negocio y organiza mejor tu tiempo.
          </p>
          <p className="font-semibold mb-4">Con RAVEKH Agenda, obtienes reportes de...</p>
          <ul className="list-none space-y-3">
            <li className="text-gray-700 flex items-start">
              <span className="text-[#6D01D1] font-bold mr-2">📊</span>
              Citas diarias: Mantén el control diario de quien y cuando atendiste a tus clientes.
            </li>
            <li className="text-gray-700 flex items-start">
              <span className="text-[#6D01D1] font-bold mr-2">📅</span>
              Reportes mensuales: Analiza el rendimiento mensual de tu negocio.
            </li>
           
            <li className="text-gray-700 flex items-start">
              <span className="text-[#6D01D1] font-bold mr-2">📑</span>
              Mensajes por whatsapp para confirmar cita.
            </li>
            <li className="text-gray-700 flex items-start">
              <span className="text-[#6D01D1] font-bold mr-2">📋</span>
              Gestión de personal, horarios, clientes y más.
            </li>
          </ul>
          <p className="text-[#6D01D1] text-3xl font-bold mt-6">Datos precisos</p>
          <p className="text-gray-500">¡Toma decisiones informadas con reportes detallados!</p>
          <div className="mt-6">
            <a
              href="#"
              className="bg-[#6D01D1] text-white px-8 py-3 rounded-full shadow-md hover:bg-[#5500B4] transition"
            >
              Quiero Probarlo Ahora!
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsSection;
