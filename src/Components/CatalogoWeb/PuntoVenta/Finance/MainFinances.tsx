import React, { useContext, useState } from "react";
import MonthNavigator from "./Header/MonthNavigator";
import TransactionsList from "./RegisterList/TransactionList";
import { AppContext } from "../../Context/AppContext";

export const MainFinances: React.FC<{ navigation: any }> = ({ navigation }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [showToday, setShowToday] = useState(false);
  const context = useContext(AppContext);

  const isAssistant = context.user?.Role === "AYUDANTE";

  const toggleToday = () => {
    setShowToday(!showToday);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Encabezado */}
      <header
        className="p-4 flex items-center justify-between text-white"
        style={{ backgroundColor: context.store.Color || "#6200EE" }}
      >
        <h1 className="text-lg font-semibold">Finanzas</h1>
        <button
          onClick={() => navigation.navigate("AddRegister")}
          className="flex items-center bg-white text-blue-600 rounded-full px-4 py-2 shadow hover:bg-gray-200 transition mr-8"
        >
          <span className="ml-2 font-semibold">Nuevo</span>
        </button>
      </header>

      {isAssistant ? (
        <div className="flex flex-col items-center justify-center flex-grow">
          <p className="text-gray-600 text-center text-lg font-semibold">
            No tienes acceso a esta sección. Por favor, contacta al administrador.
          </p>
        </div>
      ) : (
        <>
          {/* Navegador de meses */}
          <MonthNavigator
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            showToday={showToday}
            toggleToday={toggleToday}
          />

          {/* Lista de transacciones */}
          <TransactionsList
            selectedMonth={currentMonth}
            todayOnly={showToday}
          />
        </>
      )}
    </div>
  );
};

export default MainFinances;
