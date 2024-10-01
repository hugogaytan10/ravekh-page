import React from "react";

const PricingSection: React.FC = () => {
  return (
    <div className="py-16 bg-white relative">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Deja el papel y las tareas repetitivas
        </h2>
        <div className="flex justify-center mt-4">
          <div className="flex space-x-2 border p-2 rounded-full bg-gray-100">
            <button className="px-4 py-2 text-sm font-semibold bg-white rounded-full">
              Mensual
            </button>
            <button className="px-4 py-2 text-sm font-semibold text-gray-700">
              Anual <span className="text-yellow-500">Hasta -31%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fondo sutil detrás de las tarjetas */}
      <div
        className="absolute inset-0 z-0 bg-no-repeat bg-cover opacity-10"
        style={{ backgroundImage: `url('path/to/your/background-image.png')` }}
      ></div>

      {/* Cards container */}
      <div className="container relative z-10 mx-auto px-4 md:px-8 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Plan Plus */}
        <div className="p-6 rounded-lg shadow-lg border border-gray-200 flex flex-col justify-between hover:shadow-2xl transition-shadow duration-300">
          <div className="text-center">
            <h3 className="text-xl font-bold text-purple-700">⚡ Plus</h3>
            <p className="text-3xl font-bold text-gray-900 mt-4">
              USD $15 <span className="text-sm text-gray-500">/mes</span>
            </p>
            <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
              Elegir Plus
            </button>
          </div>
          <ul className="mt-8 space-y-2 text-left text-gray-700">
            <li>👥 3 Usuarios</li>
            <li>✔️ Productos y ventas ilimitados</li>
            <li>✔️ Ventas a crédito</li>
            <li>✔️ Cortes de caja</li>
            <li>✔️ Proveedores</li>
            <li className="mt-4 font-semibold">Todo en Gratis, más...</li>
            <li>✔️ Tickets y comandas</li>
            <li>✔️ Banner en catálogo</li>
            <li>✔️ 1 foto por producto</li>
            <li>✔️ Reportes y estadísticas</li>
          </ul>
        </div>

        {/* Plan Premium (Recomendado) */}
        <div className="p-6 rounded-lg shadow-lg border-2 border-blue-600 relative flex flex-col justify-between hover:shadow-2xl transition-shadow duration-300">
          <span className="absolute top-0 -mt-4 px-4 py-1 bg-blue-600 text-white text-sm rounded-full left-1/2 transform -translate-x-1/2">
            Recomendado para ti
          </span>
          <div className="text-center">
            <h3 className="text-xl font-bold text-purple-700">✨ Premium</h3>
            <p className="text-3xl font-bold text-gray-900 mt-4">
              USD $33 <span className="text-sm text-gray-500">/mes</span>
            </p>
            <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
              Elegir Premium
            </button>
          </div>
          <ul className="mt-8 space-y-2 text-left text-gray-700">
            <li>👥 9 Usuarios</li>
            <li>✔️ Compras</li>
            <li>✔️ Reporte de Finanzas</li>
            <li>✔️ Programa de Lealtad</li>
            <li>✔️ Agenda pedidos futuros</li>
            <li className="mt-4 font-semibold">Todo en Plus, más...</li>
            <li>✔️ Soporte Premium</li>
            <li>✔️ Importación en Excel</li>
            <li>✔️ Cuentas por cobrar y pagar</li>
            <li>✔️ Edición masiva</li>
          </ul>
        </div>

        {/* Plan VIP */}
        <div className="p-6 rounded-lg shadow-lg border border-gray-200 flex flex-col justify-between hover:shadow-2xl transition-shadow duration-300">
          <div className="text-center">
            <h3 className="text-xl font-bold text-purple-700">⭐ VIP</h3>
            <p className="text-3xl font-bold text-gray-900 mt-4">
              USD $125 <span className="text-sm text-gray-500">/mes</span>
            </p>
            <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
              Elegir VIP
            </button>
          </div>
          <ul className="mt-8 space-y-2 text-left text-gray-700">
            <li>👥 Usuarios ilimitados</li>
            <li>✔️ Facturación (México)</li>
            <li>✔️ Cuentas por comensal</li>
            <li>✔️ Reporte de Sucursales</li>
            <li>✔️ Proveedores</li>
            <li className="mt-4 font-semibold">Todo en Premium, más...</li>
            <li>✔️ Kioscos de autoservicio Yimi</li>
            <li>✔️ Configuración total</li>
            <li>✔️ Pedidos a la mesa QR</li>
          </ul>
        </div>
      </div>

      {/* Plan Gratis */}
      <div className="bg-white w-full md:w-3/4 lg:w-2/3 mx-auto p-6 rounded-lg shadow-lg border border-gray-200 flex flex-col md:flex-row justify-between items-center mt-8">
        <div className="text-left">
          <h3 className="text-xl font-bold text-gray-800">Gratis</h3>
          <p className="text-gray-500">Para los que empiezan a emprender</p>
          <button className="mt-4 px-6 py-2 bg-gray-300 text-gray-600 rounded-full hover:bg-gray-400 transition">
            Obtener
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 text-sm mt-6 md:mt-0">
          <ul>
            <li className="flex items-center">
              <span className="text-blue-600 mr-2">✔️</span>Punto de Venta
            </li>
            <li className="flex items-center">
              <span className="text-blue-600 mr-2">✔️</span>50 ventas al mes
            </li>
            <li className="flex items-center">
              <span className="text-blue-600 mr-2">✔️</span>Clientes
            </li>
            <li className="flex items-center">
              <span className="text-blue-600 mr-2">✔️</span>Cotizaciones
            </li>
            <li className="flex items-center">
              <span className="text-blue-600 mr-2">✔️</span>1 usuario / vendedor
            </li>
          </ul>
          <ul>
            <li className="flex items-center">
              <span className="text-blue-600 mr-2">✔️</span>Gastos
            </li>
            <li className="flex items-center">
              <span className="text-blue-600 mr-2">✔️</span>Catálogo en línea
            </li>
            <li className="flex items-center">
              <span className="text-blue-600 mr-2">✔️</span>Tickets digitales
            </li>
            <li className="flex items-center">
              <span className="text-blue-600 mr-2">✔️</span>Ayuda y tutoriales
            </li>
            <li className="flex items-center">
              <span className="text-blue-600 mr-2">✔️</span>50 productos
            </li>
          </ul>
        </div>
      </div>

      {/* Comparar otras funcionalidades */}
      <div className="text-center mt-12">
        <button className="px-6 py-2 bg-white text-blue-600 border border-blue-600 rounded-full hover:bg-blue-100 transition">
          Comparar otras funcionalidades <span className="ml-2">⬇️</span>
        </button>
      </div>
    </div>
  );
};

export default PricingSection;
