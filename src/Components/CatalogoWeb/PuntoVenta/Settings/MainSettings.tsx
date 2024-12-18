import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import Tv from "../../../../assets/POS/Tv";
import Repeat from "../../../../assets/POS/Repeat";
import StoreIcon from "../../../../assets/POS/Store";
import { Settings } from "../../../../assets/POS/Settings";
import People from "../../../../assets/POS/People";
import Help from "../../../../assets/POS/Help";
import Client from "../../../../assets/POS/Client";
import { Basket } from "../../../../assets/POS/Basket";
import { CashRegister } from "../../../../assets/POS/CashRegister";
import { AnimatedSlider } from "./Pricing/pricing";
import { ModalBoxCutting } from "./BoxCutting/ModalBoxCutting";

export const MainSettings: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const iconColor = context.store?.Color || "#3B82F6";
  const userRole = context.user?.Role || "AYUDANTE";
  const businessId = context?.user?.Business_Id;
  const catalogLink = `https://ravekh.com/catalogo/${businessId}`;
  const [modalVisible, setModalVisible] = useState(false);

  const hasAccess = (rolesAllowed: string[]) => rolesAllowed.includes(userRole);

  const openBrowserWithLink = () => {
    window.open(catalogLink, "_blank");
  };

  const handleLogout = () => {
    context.setStore({} as any);
    context.setUser({} as any);
    context.setShowNavBar(false);
    setModalVisible(false);
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header
        className="h-16 flex items-center justify-center text-white"
        style={{ backgroundColor: iconColor }}
      >
        <h1 className="text-lg font-semibold">Ajustes</h1>
      </header>

      <main className="flex-grow overflow-y-auto px-4 pb-4 mt-2">
        {/* Opciones principales */}
        <section className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="grid grid-cols-3 gap-4">
            <button
              className="flex flex-col items-center"
              onClick={() => {
                context.setShowNavBarBottom(false);
                navigate("/main-store-online");
              }}
            >
              <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center shadow">
                <Basket width={30} height={30} fill={iconColor} />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-700">
                Tienda en línea
              </span>
            </button>

            {hasAccess(["ADMINISTRADOR", "GERENTE"]) && (
              <button
                className="flex flex-col items-center"
                onClick={() => {
                  context.setShowNavBarBottom(false);// Hide the bottom navbar
                  navigate("/clients")}} // Redirect to the clients screen
              >
                <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center shadow">
                  <Client width={30} height={30} fill={iconColor} />
                </div>
                <span className="mt-2 text-sm font-medium text-gray-700">
                  Clientes
                </span>
              </button>
            )}

            {hasAccess(["ADMINISTRADOR"]) && (
              <button
                className="flex flex-col items-center"
                onClick={() => navigate("/employees")}
              >
                <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center shadow">
                  <People width={30} height={30} fill={iconColor} />
                </div>
                <span className="mt-2 text-sm font-medium text-gray-700">
                  Empleados
                </span>
              </button>
            )}

            <button
              className="flex flex-col items-center"
              onClick={() => navigate("/settings-p")}
            >
              <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center shadow">
                <Settings width={30} height={30} fill={iconColor} />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-700">
                Ajustes
              </span>
            </button>

            <button className="flex flex-col items-center">
              <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center shadow">
                <Help width={30} height={30} fill={iconColor} />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-700">
                Ayuda
              </span>
            </button>

            {hasAccess(["ADMINISTRADOR"]) && (
              <button
                className="flex flex-col items-center"
                onClick={() => {
                  context.setShowNavBarBottom(false);
                  navigate("/box-cutting");
                }}
              >
                <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center shadow">
                  <CashRegister width={30} height={30} fill={iconColor} />
                </div>
                <span className="mt-2 text-sm font-medium text-gray-700">
                  Corte de caja
                </span>
              </button>
            )}
          </div>
        </section>

        {/* Otras opciones */}
        <section className="bg-white p-4 rounded-lg shadow mb-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Otras Opciones
          </h2>
          <div className="flex flex-col space-y-4">
            <button
              className="flex items-center space-x-4"
              onClick={openBrowserWithLink}
            >
              <Tv width={30} height={30} strokeColor={iconColor} />
              <span className="text-sm font-medium text-gray-700">
                Versión en computadora
              </span>
            </button>
            <button
              className="flex items-center space-x-4"
              onClick={() => setModalVisible(true)}
            >
              <StoreIcon width={30} height={30} fill={iconColor} />
              <span className="text-sm font-medium text-gray-700">
                Cambiar usuario / vendedor
              </span>
            </button>
          </div>
        </section>

        {/* Modal de confirmación */}
        {modalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Confirmar Cambio de Negocio
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                ¿Estás seguro que deseas cambiar de negocio?
              </p>
              <div className="flex space-x-4">
                <button
                  className="flex-1 py-2 bg-red-500 text-white rounded-md"
                  onClick={() => setModalVisible(false)}
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 py-2 bg-blue-600 text-white rounded-md"
                  onClick={handleLogout}
                >
                  Cambiar Negocio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Slider animado */}
        <section className="bg-white p-4 rounded-lg shadow">
          <AnimatedSlider />
        </section>
      </main>
    </div>
  );
};
