import React from 'react';
import shopImage from '../shopImage.jpg'; // Cambia por la imagen correcta de la tienda

const OnlineShopSection: React.FC = () => {
  return (
    <div className="bg-[#F8F4FF] py-16">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between px-4 lg:px-8 xl:px-16">
        
        {/* Texto */}
        <div className="lg:w-1/2 lg:mr-8 mb-8 lg:mb-0 text-left">
          <h3 className="text-[#6D01D1] text-lg font-bold mb-3">RAVEKH es...</h3>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Tu Tienda en Línea</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Si vendes comida, ropa de segunda mano, o cualquier otro producto y quieres un flujo de compra simple y ágil, ¡RAVEKH Shop es la solución perfecta para ti!
          </p>
          <p className="font-semibold mb-4 text-lg">Con RAVEKH Shop, tú puedes...</p>
          <ul className="list-none space-y-3">
            <li className="text-gray-700 flex items-start">
              <span className="text-[#6D01D1] font-bold mr-2">⭐</span>
              Pagos digitales
            </li>
            <li className="text-gray-700 flex items-start">
              <span className="text-[#6D01D1] font-bold mr-2">✓</span>
              Personalizar con tu marca
            </li>
            <li className="text-gray-700 flex items-start">
              <span className="text-[#6D01D1] font-bold mr-2">✓</span>
              Dominio personalizado
            </li>
            <li className="text-gray-700 flex items-start">
              <span className="text-[#6D01D1] font-bold mr-2">✓</span>
              Conectar tus redes sociales
            </li>
            <li className="text-gray-700 flex items-start">
              <span className="text-[#6D01D1] font-bold mr-2">✓</span>
              Envío rápido de tickets
            </li>
          </ul>
          <div className="text-2xl font-bold text-[#6D01D1] mt-6">
            <p>Usar RAVEKH redujo:</p>
            <p className="text-3xl text-[#E53935] line-through">18 min</p>
            <p className="text-3xl">3 min</p>
            <p className="text-gray-500">El tiempo de espera</p>
          </div>
        </div>

        {/* Imagen y botón */}
        <div className="lg:w-1/2 flex flex-col items-center">
          <img
            src={shopImage}
            alt="Tienda en línea"
            className="w-full max-w-sm mb-8 object-contain rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 h-96"
          />
          <a
            href="#"
            className="bg-gradient-to-r from-[#6D01D1] to-[#9C27B0] text-white px-8 py-3 rounded-full shadow-md hover:scale-105 transform transition-transform duration-300 hover:bg-[#5500B4]"
          >
            ¡Quiero Usarlo Ahora!
          </a>
          <a href="#" className="text-[#6D01D1] mt-4 underline hover:text-[#5500B4] transition-colors duration-300">
            Conocer más acerca de Tienda en línea
          </a>
        </div>
      </div>
    </div>
  );
};

export default OnlineShopSection;
