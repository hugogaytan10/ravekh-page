import React, { useContext, useState } from 'react';
import { AppContext } from '../../Context/AppContext';
import { MonthNavigator } from './Header/MonthNavigator';
import { TransactionsList } from './RegisterList/TransactionList';
import PlusIcon from '../../../../assets/POS/PlusIcon';
import { Register } from '../Finance/Register/Register'; // Importar el componente Register
import { Modal } from 'react-responsive-modal'; // Usa una librería de modales como react-responsive-modal
import 'react-responsive-modal/styles.css'; // Estilos necesarios para el modal

export const MainFinances = ({ navigation }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [showToday, setShowToday] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false); // Estado para controlar el modal
  const context = useContext(AppContext);

  const isAssistant = context.user?.Role === 'AYUDANTE';

  const toggleToday = () => {
    setShowToday(!showToday);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col relative">
      {/* Header */}
      <header
        className="py-4 px-6 text-white flex items-center justify-center rounded-b-md"
        style={{ backgroundColor: context.store.Color || '#6B46C1' }}
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
          <TransactionsList
            selectedMonth={currentMonth}
            todayOnly={showToday}
          />

          {/* Botón fijo */}
          <div className="fixed bottom-4 top-[75%] right-4 flex items-center space-x-2 z-50">
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 flex items-center rounded-full shadow-md"
              style={{ backgroundColor: context.store.Color || '#6B46C1' }}
              onClick={() => setShowRegisterModal(true)} // Mostrar el modal
            >
              <PlusIcon width={30} height={30} color="#fff" />
              <span className="ml-2 font-semibold">Nuevo</span>
            </button>
          </div>
        </>
      )}

      {/* Modal para agregar ganancias o pérdidas */}
      <Modal
        open={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        center
      >
        <Register /> {/* Reutilizar el componente Register */}
      </Modal>
    </div>
  );
};
