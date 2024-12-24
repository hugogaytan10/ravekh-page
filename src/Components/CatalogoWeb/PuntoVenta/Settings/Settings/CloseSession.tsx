import React, { useContext, useState } from 'react';
import { ThemeLight } from "../../Theme/Theme";
import { AppContext } from '../../../Context/AppContext';
import { Tablet } from '../../../../../assets/POS/Tablet'; // Asume que tienes un ícono de tablet
//import {Header} from '../Utilities/Header';
import { Store } from '../../../PuntoVenta/Model/Store';
import { User } from '../../../PuntoVenta/Model/User';
import { ChevronBack } from '../../../../../assets/POS/ChevronBack';
import { useNavigate } from "react-router-dom";


export const CloseSession: React.FC<{ navigation: any }> = ({ navigation }) => {
  const context = useContext(AppContext);
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();
  // Función para cerrar sesión
  const handleLogout = async () => {
    // Simula la eliminación de datos del almacenamiento local
    localStorage.removeItem("user");
    context.setStore({} as any); // Limpiar la información de la tienda
    context.setUser({} as any); // Limpiar la información del usuario
    context.setShowNavBar(false); // Ocultar la barra de navegación
    setModalVisible(false); // Cerrar modal
  };

  return (
    <div>
      <div
        className="flex items-center px-4 py-2 rounded-b-2xl"
        style={{ backgroundColor: context.store.Color || ThemeLight.btnBackground }}
        onClick={() => navigate(-1)}
      >
        <button className="mr-2">
          <ChevronBack width={30} height={30} />
        </button>
        <h1 className="text-lg font-bold text-white">Cerrar sesion</h1>
      </div>
      <div className="min-h-screen bg-white flex flex-col">

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            ¿Listo para salir?
          </h1>
          <p className="text-base text-center text-gray-600 mb-6">
            Esperamos verte de nuevo pronto. Puedes cerrar sesión si lo deseas.
          </p>

          <button
            className="flex items-center justify-center w-3/4 bg-primary text-white py-3 rounded-lg shadow-md hover:bg-primary-dark"
            onClick={() => setModalVisible(true)}
          >
            <Tablet width={24} height={24} />
            <span className="ml-2 text-lg font-bold">Cerrar Sesión</span>
          </button>
        </div>

        {/* Modal de Confirmación */}
        {modalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white w-4/5 max-w-md rounded-lg p-6 shadow-lg text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Confirmar Cierre de Sesión
              </h2>
              <p className="text-base text-gray-600 mb-6">
                ¿Estás seguro que deseas cerrar sesión?
              </p>
              <div className="flex space-x-4">
                <button
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700"
                  onClick={() => setModalVisible(false)}
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 bg-gray-100 text-red-600 py-2 rounded-lg font-bold hover:bg-gray-200"
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

//export default CloseSession;
