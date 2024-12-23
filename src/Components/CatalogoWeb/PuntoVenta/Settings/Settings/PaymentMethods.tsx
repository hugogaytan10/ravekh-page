import React, { useState } from "react";
import { Header } from "../../Utilities/Header";

export const PaymentMethods: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header navigation={navigation} screenName="Métodos de pago" />

      {/* Toggle Container */}
      <div className="flex justify-between items-center px-5 py-4 bg-white border-b border-gray-300">
        <span className="text-lg font-semibold text-gray-800">Habilitar</span>
        <input
          type="checkbox"
          className="toggle-switch"
          checked={isEnabled}
          onChange={toggleSwitch}
          style={{ accentColor: "#6200EE" }}
        />
      </div>

      {/* Opciones */}
      <button
        className={`flex justify-between items-center w-full px-5 py-4 bg-white border-b border-gray-300 ${
          !isEnabled && "opacity-50 cursor-not-allowed"
        }`}
        disabled={!isEnabled}
      >
        <span className="text-lg font-semibold text-gray-800">
          Pagos en línea
        </span>
      </button>

      <button
        className={`flex justify-between items-center w-full px-5 py-4 bg-white border-b border-gray-300 ${
          !isEnabled && "opacity-50 cursor-not-allowed"
        }`}
        disabled={!isEnabled}
      >
        <span className="text-lg font-semibold text-gray-800">
          Pagos con tarjeta
        </span>
        <span className="text-sm font-normal text-purple-600">Activo</span>
      </button>
    </div>
  );
};
