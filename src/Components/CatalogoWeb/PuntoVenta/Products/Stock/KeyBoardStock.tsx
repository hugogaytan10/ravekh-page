import React, { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../../Context/AppContext";
import { updateStock } from "../Petitions";
import { BackSpace } from "../../../../../assets/POS/BackSpace";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
import { ThemeLight } from "../../Theme/Theme";
export const KeyboardStock: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const { productId, currentStock } = useParams<{
    productId: string;
    currentStock: string;
  }>();
  const [newStock, setNewStock] = useState<string>(currentStock || "0");

  const handlePress = (value: string) => {
    setNewStock((prev) => {
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
  };

  const handleSave = () => {
    if (!productId) return;
    updateStock(Number(productId), newStock, context.user.Token).then((res) => {
      if (res) {
        context.setShowNavBarBottom(true); // Muestra la barra de navegación inferior
        context.setStockFlag((prev) => !prev); // Actualiza el estado de stock
        navigate(-1); // Navega hacia atrás
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header
        className="flex items-center px-4 py-3 text-white"
        style={{
          backgroundColor: context.store.Color || ThemeLight.btnBackground,
        }}
      >
        <button
          onClick={() => {
            navigate("/main-products/items");
            context.setShowNavBarBottom(true);
          }}
          className="mr-auto"
        >
          <ChevronBack />
        </button>
        <h1 className="text-lg font-bold text-center">Ajustar Stock</h1>
        <span className="ml-auto"></span>
      </header>

      {/* Stock Display */}
      <div className="flex flex-1 justify-center items-center">
        <p className="text-5xl font-bold text-gray-600">{newStock || "0"}</p>
      </div>

      {/* Keyboard */}
    <div className="flex flex-col items-center justify-center flex-1 ">
      <div className="grid grid-cols-3 gap-4 p-6 bg-white justify-center items-center rounded-md">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map(
        (item, index) => ( 
          <button
            key={index}
            className="w-20 h-20 bg-purple-700 text-white text-3xl font-bold rounded-full flex items-center justify-center"
            onClick={() => handlePress(item)}
          >
            {item}
          </button>
        )
        )}
        <button
        className="w-20 h-20 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center"
        onClick={() => handlePress("BackSpace")}
        >
        <BackSpace />
        </button>
      </div>
    </div>

      {/* Save Button */}
      <div className="p-6">
        <button
          onClick={handleSave}
          className="w-full py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold"
          style={{ backgroundColor: context.store.Color || "#3B82F6" }}
        >
          Guardar cantidad
        </button>
      </div>
    </div>
  );
};
