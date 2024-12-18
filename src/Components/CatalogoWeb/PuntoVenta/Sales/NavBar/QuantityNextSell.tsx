import React, { useContext, useState, useCallback } from "react";
import { AppContext } from "../../../Context/AppContext";
import { useNavigate } from "react-router-dom";
import PlusIcon from "../../../../../assets/POS/PlusIcon"; // Icono de suma
import { KeyBoard } from "../../Utilities/Keyboard"; // Componente de teclado numérico
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";

export const QuantityNextSell: React.FC = () => {
  const { quantityNextSell, setQuantityNextSell, store } =
    useContext(AppContext); // Obtener el estado de cantidad desde el contexto
  const [isLoading, setIsLoading] = useState(false); // Estado de carga
  const navigate = useNavigate(); // Navegación de React Router
  const context = useContext(AppContext);

  // Manejo de las teclas del teclado
  const handlePress = useCallback(
    (value: string) => {
      setQuantityNextSell((prev: string) => {
        if (value === "BackSpace") {
          return prev.length > 1 ? prev.slice(0, -1) : "0"; // Elimina el último carácter
        }
        if (value === "." && prev === "0") {
          return "0."; // Asegura que si es ".", comience con "0."
        }
        if (prev === "0" && value !== ".") {
          return value; // Reemplaza el "0" inicial con el nuevo valor
        }
        const newValue = prev + value;
        return newValue !== "" ? newValue : "0"; // Concatenar y prevenir valores vacíos
      });
    },
    [setQuantityNextSell]
  );

  // Cambio de cantidad personalizada
  const handleChange = () => {
    setIsLoading(true); // Inicia la carga
    setTimeout(() => {
      context.setShowNavBarBottom(true); // Muestra la barra de navegación inferior
      setIsLoading(false); // Finaliza la carga
      navigate(-1); // Navega hacia atrás
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header
        className="h-16 bg-blue-600 text-white flex items-center justify-between px-4"
        style={{ backgroundColor: store.Color || "#3B82F6" }}
      >
        <button
          onClick={() => {
            context.setShowNavBarBottom(true); // Muestra la barra de navegación inferior
            navigate(-1);
          }} // Navega hacia atrás
        >
          <ChevronBack />
        </button>
        <h1 className="text-lg font-semibold mx-auto">
          Cantidad Personalizada
        </h1>
        <div style={{ width: "24px" }}></div>{" "}
        {/* Placeholder to balance the space */}
      </header>

      <main className="flex-grow flex flex-col items-center justify-between bg-white py-10 px-4">
        {/* Digits Display */}
        <div className="flex flex-col items-center ">
          <p className="text-gray-800 text-6xl font-semibold mb-4">
            {quantityNextSell}
          </p>
          <PlusIcon />
        </div>

        {/* Teclado Numérico */}
        <KeyBoard handlePress={handlePress} />

        {/* Botón de Confirmar */}
        <button
          onClick={handleChange}
          disabled={isLoading}
          className={`w-full max-w-md py-3 text-white rounded-lg mt-2 ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500"
          }`}
        >
          {isLoading ? "Guardando..." : "Nueva Cantidad"}
        </button>
      </main>
    </div>
  );
};
