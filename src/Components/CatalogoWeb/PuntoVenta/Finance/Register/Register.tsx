import React, { useContext, useState } from "react";
import { AppContext } from "../../../Context/AppContext";
import MoreIcon from "../../../../../assets/POS/MoreIcon";
import People from "../../../../../assets/POS/People";
import HouseIcon from "../../../../../assets/POS/HouseIcon";
import FoodIcon from "../../../../../assets/POS/Food";
import MegaphoneIcon from "../../../../../assets/POS/Megaphone";
import Archive from "../../../../../assets/POS/Archive";
import Repeat from "../../../../../assets/POS/Repeat";
import Car from "../../../../../assets/POS/Car";
import Euro from "../../../../../assets/POS/Euro";
import { insertExpenses, insertIncome } from "../Petitions";
import { useNavigate } from "react-router-dom";

export const Register: React.FC = () => {
  const context = useContext(AppContext);
  const [quantity, setQuantity] = useState<string>("");
  const [category, setCategory] = useState<string>("1"); // Categoría seleccionada
  const [isIncome, setIsIncome] = useState<boolean>(false); // Controla si se están viendo ingresos o egresos
  const [isLoading, setIsLoading] = useState<boolean>(false); // Estado de guardado
  const navigation = useNavigate();

  const categoriesExpenses = [
    { id: "1", name: "General", icon: <MoreIcon width={30} height={30} strokeColor={context.store.Color} /> },
    { id: "2", name: "Nomina", icon: <People width={30} height={30} fill={context.store.Color} /> },
    { id: "3", name: "Renta", icon: <HouseIcon width={30} height={30} fillColor={context.store.Color} /> },
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

  const categories = isIncome ? categoriesIncome : categoriesExpenses;

  const handleSave = async () => {
    if (!quantity) return;

    setIsLoading(true);
    const data = {
      Business_Id: context.user.Business_Id,
      Name: categories.find((cat) => cat.id === category)?.name || "Unknown",
      Amount: parseFloat(quantity),
    };

    try {
      if (isIncome) {
        await insertIncome(data, context.user.Token);
      } else {
        await insertExpenses(data, context.user.Token);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setIsLoading(false);
      navigation(-1);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center p-6 bg-gray-100">
      {/* Botón Atrás */}
      <button
        onClick={() => navigation(-1)}
        className="self-start mb-4 text-purple-600 font-semibold hover:underline"
      >
        Atrás
      </button>

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

      {/* Selector de tipo de transacción */}
      <div className="flex justify-center mb-6">
        <button
          className={`px-4 py-2 mx-2 rounded-lg ${!isIncome ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"}`}
          onClick={() => setIsIncome(false)}
        >
          Egresos
        </button>
        <button
          className={`px-4 py-2 mx-2 rounded-lg ${isIncome ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"}`}
          onClick={() => setIsIncome(true)}
        >
          Ingresos
        </button>
      </div>

      {/* Selección de Categoría */}
      <div className="w-full mt-6 max-w-sm p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-gray-700 font-medium mb-4">Seleccionar Categoría</h3>
        <div className="grid grid-cols-3 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg shadow-md ${category === cat.id ? "bg-purple-100 border border-purple-600" : "bg-gray-100"}`}
            >
              <div>{cat.icon}</div>
              <span className="mt-2 text-sm text-gray-700">{cat.name}</span>
            </button>
          ))}
        </div>
        <p className="text-gray-500 text-sm mt-4">
          Categoría seleccionada: <span className="font-semibold text-purple-600">{categories.find((cat) => cat.id === category)?.name || "Ninguna"}</span>
        </p>
      </div>

      {/* Botón de Guardar */}
      <button
        onClick={handleSave}
        disabled={!quantity || isLoading}
        className={`w-full max-w-sm py-3 text-lg font-semibold text-white rounded-lg mt-6 ${!quantity || isLoading ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"}`}
      >
        {isLoading ? "Guardando..." : "Guardar"}
      </button>
    </div>
  );
};
