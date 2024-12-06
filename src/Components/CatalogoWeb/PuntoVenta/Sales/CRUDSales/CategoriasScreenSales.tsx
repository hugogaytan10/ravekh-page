import React, { useContext, useEffect, useState } from "react";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
import PlusIcon from "../../../../../assets/POS/PlusIcon";
import {ChevronGo} from "../../../../../assets/POS/ChevronGo";
import { getCategoriesByBusiness } from "../Petitions";
import { ThemeLight } from "../../Theme/Theme";
import { Category } from "../../Model/Category";
import { AppContext } from "../../../Context/AppContext";
import { useNavigate } from "react-router-dom";

export const CategoriasScreenSales: React.FC = () => {
  const context = useContext(AppContext);
  const [categories, setCategories] = useState<Category[]>([]);
    const navigate = useNavigate();
  const chooseCategory = (category: Category) => {
    // Actualizar el contexto con la categoría seleccionada
    context.setCategorySelected(category);
    navigate(-1);
  };

  useEffect(() => {
    getCategoriesByBusiness(
      context.user.Business_Id.toString(),
      context.user.Token
    ).then((data) => {
      setCategories(data);
    });
  }, [context.stockFlag]);

  return (
    <div className="flex flex-col h-screen bg-white container-categorias-screen">
      {/* Header */}
      <header
        className="flex items-center px-4 py-3 text-white"
        style={{
          backgroundColor: context.store.Color || ThemeLight.btnBackground,
        }}
      >
        <button onClick={() => navigate(-1)} className="mr-2">
          <ChevronBack />
        </button>
        <h1 className="text-lg font-bold">
          Categorías ({categories ? categories.length : 0})
        </h1>
      </header>

      {/* Lista de Categorías */}
      <div className="flex-1 p-5 list-container-categorias-screen overflow-y-auto">
        {/* Opción: Sin Categoría */}
        <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded shadow-sm mb-4 list-item-categorias-screen">
          <span className="text-gray-700">Sin categoría</span>
        </div>

        {/* Opción: Crear Nueva Categoría */}
        <button
          className="flex items-center py-3 px-4 bg-gray-50 rounded shadow-sm mb-4 list-item-categorias-screen"
          onClick={() => navigate("AddCategoriesSales")}
        >
          <PlusIcon color={ThemeLight.btnBackground} width={20} height={20} />
          <span className="ml-2 text-gray-700">Crear nueva categoría</span>
        </button>

        {/* Lista de Categorías */}
        {categories.length > 0 ? (
          <ul className="space-y-2">
            {categories.map((category) => (
              <li
                key={category.Id}
                className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded shadow-sm cursor-pointer list-item-categorias-screen"
                onClick={() => chooseCategory(category)}
              >
                <span className="text-gray-700">{category.Name}</span>
                <ChevronGo stroke={ThemeLight.borderColor} width={20} height={20} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-400 mt-5">
            No hay categorías disponibles
          </p>
        )}
      </div>
    </div>
  );
};
