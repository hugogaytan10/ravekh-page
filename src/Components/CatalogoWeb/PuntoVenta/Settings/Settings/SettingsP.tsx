import React, { useContext } from "react";
import { AppContext } from "../../../Context/AppContext";
import { Header } from '../../Utilities/Header';
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
import {Tablet} from "../../../../../assets/POS/Tablet";
import Cloud from "../../../../../assets/POS/Cloud";
import Printer from "../../../../../assets/POS/Printer";
import { Settings } from "../../../../../assets/POS/Settings";
import Stongs from "../../../../../assets/POS/Stongs";
import Store from "../../../../../assets/POS/Store";
import Ticket from "../../../../../assets/POS/Ticket";
import { ChevronGo } from "../../../../../assets/POS/ChevronGo";
import { Trash } from "../../../../../assets/POS/Trash";
import { ThemeLight } from "../../Theme/Theme";
import { MoreIcon } from "../../../../../assets/POS/MoreIcon";
import People from "../../../../../assets/POS/People";

export const SettingsP: React.FC<{ navigation: any }> = ({ navigation }) => {
  const context = useContext(AppContext);
  const iconColor = context.store?.Color || ThemeLight.btnBackground; // Definir color del icono

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header screenName="Ajustes" navigation={navigation} />

      <div className="mt-4 px-4">
        {/* Información del negocio */}
        {context.user.Role === "ADMINISTRADOR" && (
          <button
            className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-lg mb-2 shadow-sm"
            onClick={() => navigation.navigate("UpdateStoreInfo")}
          >
            <div className="flex items-center">
              <Store width={30} height={30} /*fillColor={iconColor}*/ />
              <span className="ml-4 text-base font-semibold text-gray-800">
                Información del negocio
              </span>
            </div>
            <ChevronGo width={30} height={30} />
          </button>
        )}

        {/* Hardware */}
        <button
          className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-lg mb-2 shadow-sm"
          onClick={() => navigation.navigate("HardwareSettings")}
        >
          <div className="flex items-center">
            <Printer width={30} height={30} fillColor={iconColor} />
            <span className="ml-4 text-base font-semibold text-gray-800">
              Hardware
            </span>
          </div>
          <ChevronGo width={30} height={30} />
        </button>

        {/* Impuesto de venta */}
        {context.user.Role === "ADMINISTRADOR" && (
          <button
            className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-lg mb-2 shadow-sm"
            onClick={() => navigation.navigate("SalesTaxSettings")}
          >
            <div className="flex items-center">
              <Stongs width={30} height={30} strokeColor={iconColor} />
              <span className="ml-4 text-base font-semibold text-gray-800">
                Impuesto de venta
              </span>
            </div>
            <ChevronGo width={30} height={30} />
          </button>
        )}

        {/* Exportar reportes */}
        <button
          className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-lg mb-2 shadow-sm"
          onClick={() => navigation.navigate("ExportReports")}
        >
          <div className="flex items-center">
            <Cloud width={30} height={30} fillColor={iconColor} />
            <span className="ml-4 text-base font-semibold text-gray-800">
              Exportar reportes
            </span>
          </div>
          <ChevronGo width={30} height={30} />
        </button>

        {/* Color de App */}
        {context.user.Role === "ADMINISTRADOR" && (
          <button
            className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-lg mb-2 shadow-sm"
            onClick={() => navigation.navigate("CustomizeApp")}
          >
            <div className="flex items-center">
              <MoreIcon width={30} height={30} strokeColor={iconColor} />
              <span className="ml-4 text-base font-semibold text-gray-800">
                Color de App
              </span>
            </div>
            <ChevronGo width={30} height={30} />
          </button>
        )}

        {/* Mesas */}
        {context.user.Role === "ADMINISTRADOR" && (
          <button
            className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-lg mb-2 shadow-sm"
            onClick={() => navigation.navigate("TableOrders")}
          >
            <div className="flex items-center">
              <Tablet width={30} height={30} fillColor={iconColor} />
              <span className="ml-4 text-base font-semibold text-gray-800">
                Mesas
              </span>
            </div>
            <ChevronGo width={30} height={30} />
          </button>
        )}

        {/* Cerrar sesión */}
        <button
          className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-lg mb-2 shadow-sm"
          onClick={() => navigation.navigate("CloseSession")}
        >
          <div className="flex items-center">
            <People width={30} height={30} />
            <span className="ml-4 text-base font-semibold text-gray-800">
              Cerrar Sesión
            </span>
          </div>
          <ChevronGo width={30} height={30} />
        </button>

        {/* Borrar cuenta */}
        <button
          className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
          onClick={() => navigation.navigate("DeleteAccount")}
        >
          <div className="flex items-center">
            <Trash width={30} height={30} fill={iconColor} />
            <span className="ml-4 text-base font-semibold text-gray-800">
              Borrar Cuenta
            </span>
          </div>
          <ChevronGo width={30} height={30} />
        </button>
      </div>
    </div>
  );
};
