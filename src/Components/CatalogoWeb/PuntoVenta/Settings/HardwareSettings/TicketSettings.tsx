import React, { useContext } from 'react';
//import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
// Import SVG icons
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
import { ChevronGo } from "../../../../../assets/POS/ChevronGo";
import { ThemeLight } from '../../Theme/Theme'; 
import { Header } from '../../../../CatalogoWeb/PuntoVenta/Dashboard/Header'; 
import { AppContext } from '../../../Context/AppContext';

const TicketSettings: React.FC<{ navigation: any }> = ({ navigation }) => {
  const context = useContext(AppContext);

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <div
        className="h-10"
        style={{
          backgroundColor: context.store.Color || "#6200EE",
        }}
      />
      {/*<Header screenName={"Configura tu ticket"} navigation={navigation}/>*/}

      {/* Opción 1 */}
      <button className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <span className="text-base font-semibold text-gray-700">
          Mostrar Información del negocio
        </span>
        <ChevronGo width={24} height={24} />
      </button>

      {/* Sección de información del cliente */}
      <div className="p-6 bg-white border-b border-gray-200 mb-2">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Mostrar información del cliente
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Nombre, domicilio y número telefónico
        </p>
        <input
          className="w-full h-10 border border-gray-300 rounded px-3 mb-4 bg-white text-sm text-gray-800"
          placeholder="Encabezado (opcional)"
          type="text"
        />
        <input
          className="w-full h-10 border border-gray-300 rounded px-3 bg-white text-sm text-gray-800"
          placeholder="Pie de ticket (opcional)"
          type="text"
        />
      </div>

      {/* Opción 2 */}
      <button
        className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200"
        onClick={() => navigation.navigate("HardwareSettings")}
      >
        <span className="text-base font-semibold text-gray-700">Hardware</span>
        <ChevronGo width={24} height={24} />
      </button>
    </div>
  );
};

export default TicketSettings;
