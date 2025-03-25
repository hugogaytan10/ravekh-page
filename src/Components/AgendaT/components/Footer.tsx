import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaTiktok } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 py-16">
      <div className=" mx-auto px-4">
        <div className="flex flex-wrap justify-between items-start">
          {/* Logo y descripción */}
          <div className="w-full md:w-1/4 mb-8 md:mb-0">
            <h3 className="text-3xl font-bold text-blue-600 mb-4">RAVEKH Agenda</h3>
            <p className="text-gray-600 leading-relaxed">
              La herramienta POS que simplifica la gestión de tu negocio. Controla todo desde un solo lugar y mejora tus procesos de manera eficiente.
            </p>
          </div>

          {/* Secciones */}
          <div className="w-full md:w-1/5 mb-8 md:mb-0">
            <h4 className="font-semibold text-blue-600 mb-4">Más ventas</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline text-gray-600">Sistema de Agenda</a></li>
              <li><a href="#" className="hover:underline text-gray-600">Pedidos en línea</a></li>
              <li><a href="#" className="hover:underline text-gray-600">Tickets y Cotizaciones</a></li>
            </ul>
          </div>

          <div className="w-full md:w-1/5 mb-8 md:mb-0">
            <h4 className="font-semibold text-blue-600 mb-4">Mayor control</h4>
            <ul className="space-y-2">
              <li><p className=" text-gray-600">Control de horarios</p></li>
              <li><p className=" text-gray-600">Atencion a clientes</p></li>
            </ul>
          </div>

          <div className="w-full md:w-1/5 mb-8 md:mb-0">
            <h4 className="font-semibold text-blue-600 mb-4">Segmentos</h4>
            <ul className="space-y-2">
              <li><p className="text-gray-600">Servicios de Reservas</p></li>
              <li><p className="text-gray-600">Estilistas</p></li>
              <li><p className="text-gray-600">Veterinarios</p></li>
            </ul>
          </div>

          {/* CTA y redes sociales */}
          <div className="w-full  md:w-1/5 text-center md:text-right mt-10 md:flex md:justify-center md:flex-col md:items-center m-auto">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition mb-6 ">
              Empezar Prueba Gratis
            </button>
            <div className="flex justify-center md:justify-end space-x-4">
              <a href="#" className="text-gray-600 hover:text-blue-600"><FaFacebook size={24} /></a>
              <a href="#" className="text-gray-600 hover:text-blue-600"><FaTwitter size={24} /></a>
              <a href="#" className="text-gray-600 hover:text-blue-600"><FaInstagram size={24} /></a>
              <a href="#" className="text-gray-600 hover:text-blue-600"><FaTiktok size={24} /></a>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-300 mt-8 pt-4 text-center">
          <p className="text-gray-500">
            © 2024 RAVEKH Agenda. No vendemos o compartimos tu información.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
