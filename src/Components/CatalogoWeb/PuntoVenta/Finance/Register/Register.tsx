import React, { useContext, useState } from "react";
import { AppContext } from "../../../Context/AppContext";
import { CategoryModal } from "./CategoryModal";
import { insertExpenses, insertIncome } from "../Petitions";
import MoreIcon from "../../../../../assets/POS/MoreIcon";
import People from "../../../../../assets/POS/People";
import HouseIcon from "../../../../../assets/POS/HouseIcon";
import FoodIcon from "../../../../../assets/POS/Food";
import MegaphoneIcon from "../../../../../assets/POS/Megaphone";
import Archive from "../../../../../assets/POS/Archive";
import Repeat from "../../../../../assets/POS/Repeat";
import Car from "../../../../../assets/POS/Car";
import Euro from "../../../../../assets/POS/Euro";

export const Register: React.FC = () => {
  const context = useContext(AppContext);
  const [quantity, setQuantity] = useState<string>(""); // Input numérico
  const [isVisible, setIsVisible] = useState<boolean>(false); // Modal para categoría
  const [category, setCategory] = useState<string>("1"); // Categoría seleccionada
  const [isLoading, setIsLoading] = useState<boolean>(false); // Estado de guardado

  const categoriesExpenses = [
    { id: "1", name: "General", icon: <MoreIcon width={30} height={30} strokeColor={context.store.Color} /> },
    { id: "2", name: "Nomina", icon: <People width={30} height={30} fill={context.store.Color} /> },
    { id: "3", name: "Renta", icon: <HouseIcon width={30} height={30} fillColor={context.store.Color} /> },
    { id: "4", name: "Administración", icon: <MoreIcon width={30} height={30} strokeColor={context.store.Color} /> },
    { id: "7", name: "Comida", icon: <FoodIcon width={30} height={30} fillColor={context.store.Color} /> },
    { id: "8", name: "Marketing", icon: <MegaphoneIcon width={30} height={30} fillColor={context.store.Color} /> },
    { id: "9", name: "Papelería", icon: <Archive width={30} height={30} fillColor={context.store.Color} /> },
    { id: "10", name: "Préstamos", icon: <Repeat width={30} height={30} strokeColor={context.store.Color} /> },
    { id: "12", name: "Transporte", icon: <Car width={30} height={30} fillColor={context.store.Color} /> },
  ];

  const categoriesIncome = [
    { id: "30", name: "Venta", icon: <Euro width={30} height={30} fillColor={context.store.Color} /> },
    { id: "31", name: "Nomina", icon: <People width={30} height={30} fill={context.store.Color} /> },
    { id: "32", name: "Préstamos", icon: <Repeat width={30} height={30} strokeColor={context.store.Color} /> },
    { id: "33", name: "General", icon: <MoreIcon width={30} height={30} strokeColor={context.store.Color} /> },
  ];

  const handlePress = (value: string) => {
    setQuantity((prev) => {
      if (value === "BackSpace") {
        return prev.slice(0, -1); // Borra el último dígito
      }
      if (value === "." && (prev === "" || prev.includes("."))) {
        return prev; // Evita agregar múltiples puntos o iniciar con "."
      }
      return prev + value; // Agrega cualquier otro valor
    });
  };

  const handleSave = async () => {
    if (!quantity) return;

    setIsLoading(true);

    try {
      const expense = {
        Business_Id: context.user.Business_Id,
        Name: "Categoría", // Aquí debes reemplazar con la categoría seleccionada
        Amount: parseFloat(quantity),
      };
      const result = await insertExpenses(expense, context.user.Token);
      if (result) {
        console.log("Guardado correctamente:", result);
      }
    } catch (error) {
      console.error("Error en handleSave:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 bg-gray-100">
      {/* Monto */}
      <div className="w-full mb-6 max-w-sm">
        <label className="block text-gray-700 font-medium mb-2">Monto</label>
        <input
          type="text"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 bg-white text-gray-700 placeholder-gray-400"
          placeholder="Ingrese el monto (Ej: 100.00)"
        />
      </div>

      {/* Teclado numérico */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-6 mx-auto">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map((value) => (
          <button
            key={value}
            className="bg-purple-600 text-white text-lg font-semibold py-3 rounded-lg shadow-md"
            onClick={() => handlePress(value)}
          >
            {value}
          </button>
        ))}
        <button
          className="bg-gray-400 text-white text-lg font-semibold py-3 rounded-lg shadow-md"
          onClick={() => handlePress("BackSpace")}
        >
          Borrar
        </button>
      </div>

      {/* Botón de Guardar */}
      <button
        onClick={handleSave}
        disabled={!quantity || isLoading}
        className={`w-full max-w-sm py-3 text-lg font-semibold text-white rounded-lg ${!quantity || isLoading ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"
          }`}
      >
        {isLoading ? "Guardando..." : "Guardar"}
      </button>
    </div>
  );
};