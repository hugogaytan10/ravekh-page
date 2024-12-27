import React, { useContext, useState } from "react";
import { AppContext } from "../../../Context/AppContext";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
import { useNavigate } from "react-router-dom";

export const MainStoreOnline: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const businessId = context?.user?.Business_Id;
  const catalogLink = `https://ravekh.com/catalogo/${businessId}`;

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleOptionPress = (option: string) => {
    navigate(option);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(catalogLink);
    setModalMessage("Enlace copiado al portapapeles");
    setModalVisible(true);
  };

  const shareCatalogLink = () => {
    setModalMessage(`¡Mira nuestro catálogo en línea! ${catalogLink}`);
    setModalVisible(true);
  };

  const userRole = context.user?.Role || "";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div
        className="flex items-center px-4 py-3"
        style={{ backgroundColor: context.store.Color || "#3B82F6" }}
      >
        <button
          className="mr-3"
          onClick={() => {
            context.setShowNavBarBottom(true);
            navigate("/more")}}
        >
          <ChevronBack />
        </button>
        <h1 className="text-lg font-semibold text-white">Configuración de la Tienda</h1>
      </div>

      {/* Banner */}
      <div
        className="p-5 text-center text-white rounded-md m-4"
        style={{ backgroundColor: context.store.Color || "#3B82F6" }}
      >
        <p className="text-sm font-medium mb-4">
          Comparte tu catálogo en línea: {catalogLink}
        </p>
        <div className="flex justify-center gap-4">
          <button
            className="bg-white text-blue-600 font-medium px-4 py-2 rounded"
            onClick={copyToClipboard}
          >
            Copiar Enlace
          </button>
          <button
            className="bg-green-500 text-white font-medium px-4 py-2 rounded"
            onClick={shareCatalogLink}
          >
            Compartir
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-4 px-4">
        {userRole !== "AYUDANTE" && (
          <>
            <button
              className="flex items-center gap-3 bg-gray-100 p-4 rounded-md shadow-sm"
              onClick={() => handleOptionPress("/orders")}
            >
              <span className="text-2xl">📦</span>
              <div>
                <h2 className="text-lg font-semibold text-left">Ver órdenes</h2>
                <p className="text-sm text-gray-600 text-left">Gestionar y ver todas las órdenes</p>
              </div>
            </button>
            <button
              className="flex items-center gap-3 bg-gray-100 p-4 rounded-md shadow-sm"
              onClick={() => handleOptionPress("/update-store-info")}
            >
              <span className="text-2xl">🛠️</span>
              <div>
                <h2 className="text-lg font-semibold text-left">Modificar información de la tienda</h2>
                <p className="text-sm text-left text-gray-600">Nombre, dirección, teléfono</p>
              </div>
            </button>
            <button
              className="flex items-center gap-3 bg-gray-100 p-4 rounded-md shadow-sm"
              onClick={() =>{
                context.setShowNavBarBottom(false);
                handleOptionPress("/main-products/items")}}
            >
              <span className="text-2xl">🛍️</span>
              <div>
                <h2 className="text-lg font-semibold text-left">Productos en tienda</h2>
                <p className="text-sm text-gray-600 text-left">Agregar o eliminar productos</p>
              </div>
            </button>
          </>
        )}
      </div>

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md w-11/12 max-w-md">
            <p className="text-center text-gray-800 mb-4">{modalMessage}</p>
            <button
              className="bg-blue-600 text-white w-full py-2 rounded"
              onClick={() => setModalVisible(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
