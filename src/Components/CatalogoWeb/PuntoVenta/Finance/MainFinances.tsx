import React, { useContext, useState } from "react";
import { AppContext } from "../../Context/AppContext";
import { MonthNavigator } from "./Header/MonthNavigator";
import { TransactionsList } from "./RegisterList/TransactionList";
import PlusIcon from "../../../../assets/POS/PlusIcon";
import { Register } from "../Finance/Register/Register"; // Componente Register

export const MainFinances = ({ navigation }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [showToday, setShowToday] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false); // Control del modal
  const context = useContext(AppContext);

  const isAssistant = context.user?.Role === "AYUDANTE";

  const toggleToday = () => setShowToday(!showToday);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col relative">
      {/* Header */}
      <header
        className="py-4 px-6 text-white flex items-center justify-center rounded-b-md"
        style={{ backgroundColor: context.store.Color || "#6B46C1" }}
      >
        <h1 className="text-lg font-semibold">Finanzas</h1>
      </header>

      {isAssistant ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-center text-gray-600 text-lg font-semibold">
            No tienes acceso a esta sección. Por favor, contacta al administrador.
          </p>
        </div>
      ) : (
        <>
          {/* Month Navigator */}
          <MonthNavigator
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            showToday={showToday}
            toggleToday={toggleToday}
          />

          {/* Transactions List */}
          <TransactionsList selectedMonth={currentMonth} todayOnly={showToday} />

          {/* Botón fijo */}
          <div className="fixed bottom-4 right-4 flex items-center space-x-2 z-50">
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 flex items-center rounded-full shadow-md"
              style={{ backgroundColor: context.store.Color || "#6B46C1" }}
              onClick={() => setShowRegisterModal(true)} // Mostrar modal
            >
              <PlusIcon width={30} height={30} color="#fff" />
              <span className="ml-2 font-semibold">Nuevo</span>
            </button>
          </div>
        </>
      )}

      {/* Modal nativo */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* Contenedor del modal */}
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
            {/* Botón para cerrar */}
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl"
            >
              &#x2715; {/* Ícono de X visible y grande */}
            </button>

            {/* Título del modal */}
            <h2 className="text-lg font-semibold mb-4 text-gray-700 text-center">
              Agregar Registro
            </h2>

            {/* Contenido del modal */}
            <div className="max-h-[60vh] overflow-y-auto">
              <Register />
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowRegisterModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md mr-2"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
