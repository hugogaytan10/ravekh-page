import React, { useState, useContext } from "react";
import { ChevronGo } from "../../../../../assets/POS/ChevronGo";
import Check from "../../../../../assets/POS/Check";
import { Header } from "../../Utilities/Header";
import { ThemeLight } from "../../Theme/Theme";
import { AppContext } from "../../../Context/AppContext";

export const GeneralSettings: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const context = useContext(AppContext);
  const [isStockEnabled, setIsStockEnabled] = useState(true);
  const [isShiftEnabled, setIsShiftEnabled] = useState(false);
  const [productOrder, setProductOrder] = useState("Fecha de creacion");

  const appColor = context.store?.Color || ThemeLight.btnBackground;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header screenName="General" navigation={navigation} />

      {/* Selección de Moneda */}
      <button
        className="flex justify-between items-center w-full px-5 py-4 bg-white border-b border-gray-300"
        onClick={() => navigation.navigate("SelectMoney")}
      >
        <div>
          <p className="text-base font-semibold text-gray-800">Moneda</p>
          <p className="text-lg font-bold text-gray-800">MXN-$</p>
        </div>
        <ChevronGo width={24} height={24} />
      </button>

      {/* Permitir vender sin stock */}
      <div className="flex justify-between items-center px-5 py-4 bg-white border-b border-gray-300">
        <span className="text-base font-semibold text-gray-800">
          Permitir vender sin stock
        </span>
        <input
          type="checkbox"
          className="toggle-switch"
          checked={isStockEnabled}
          onChange={() => setIsStockEnabled(!isStockEnabled)}
          style={{ accentColor: appColor }}
        />
      </div>

      {/* Turnos de caja */}
      <div className="flex justify-between items-center px-5 py-4 bg-white border-b border-gray-300">
        <span className="text-base font-semibold text-gray-800">
          Turnos de caja
        </span>
        <input
          type="checkbox"
          className="toggle-switch"
          checked={isShiftEnabled}
          onChange={() => setIsShiftEnabled(!isShiftEnabled)}
          style={{ accentColor: appColor }}
        />
      </div>

      {/* Orden de productos */}
      <div className="px-5 py-4 bg-white border-b border-gray-300">
        <p className="text-base font-semibold text-gray-800">Orden de productos</p>
        <div className="flex justify-between items-center mt-3">
          <span className="text-sm text-gray-700">Fecha de creación</span>
          <button
            className="w-5 h-5 border border-gray-400 rounded flex items-center justify-center"
            style={{ borderColor: appColor }}
            onClick={() => setProductOrder("Fecha de creacion")}
          >
            {productOrder === "Fecha de creacion" && (
              <Check width={16} height={16} style={{ fill: appColor }} />
            )}
          </button>
        </div>
        <div className="flex justify-between items-center mt-3">
          <span className="text-sm text-gray-700">A-Z</span>
          <button
            className="w-5 h-5 border border-gray-400 rounded flex items-center justify-center"
            style={{ borderColor: appColor }}
            onClick={() => setProductOrder("A-Z")}
          >
            {productOrder === "A-Z" && (
              <Check width={16} height={16} style={{ fill: appColor }} />
            )}
          </button>
        </div>
      </div>

      {/* Eliminar cuenta */}
      <button
        className="flex justify-between items-center w-full px-5 py-4 bg-white border-t mt-5 border-gray-300"
        onClick={() => navigation.navigate("DeleteAccount")}
      >
        <span className="text-base font-semibold text-black">
          Eliminar cuenta
        </span>
        <ChevronGo width={24} height={24} />
      </button>
    </div>
  );
};
