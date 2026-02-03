import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../Context/AppContext";
import { Category } from "../../Model/Category";
import { getCategoriesByBusiness } from "../Petitions";
import {ChevronBack} from "../../../../../assets/POS/ChevronBack";
import PlusIcon from "../../../../../assets/POS/PlusIcon";
import {ChevronGo} from "../../../../../assets/POS/ChevronGo";

export const SelectCategory: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const chooseCategory = (category: Category) => {
    context.setCategorySelected(category); // Establece la categoría seleccionada
    context.setShowNavBarBottom(false); // Oculta la barra de navegación
    navigate("/edit-category");  // Navega a la edición de la categoría
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getCategoriesByBusiness(
      context.user.Business_Id.toString(),
      context.user.Token
    )
      .then((data) => {
        if (isMounted) {
          setCategories(data);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [context.stockFlag, context.user.Business_Id, context.user.Token]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header
        className="flex items-center px-4 py-3"
        style={{
          backgroundColor: context.store.Color || "#6200EE",
        }}
      >
        <button
          onClick={() => {navigate(-1); context.setShowNavBarBottom(true);} }
          className="mr-2 text-white text-lg flex items-center"
        >
          <ChevronBack />
        </button>
        <h1 className="text-lg font-bold text-white">
          Categorías ({categories ? categories.length : 0})
        </h1>
      </header>

      <div className="flex flex-col flex-grow p-4 space-y-4 w-1/2 self-center">
       

        {/* Crear Nueva Categoría */}
        <button
          onClick={() => navigate("/add-category-product")}
          className="flex items-center justify-start space-x-3 p-4 bg-gray-100 rounded"
        >
          <PlusIcon width={20} height={20} color={context.store.Color} />
          <span className="text-sm font-medium text-gray-700">
            Crear nueva categoría
          </span>
        </button>

        {/* Lista de Categorías */}
        {isLoading ? (
          <ul className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <li
                key={`category-skeleton-${index}`}
                className="h-10 bg-gray-200 animate-pulse rounded"
              ></li>
            ))}
          </ul>
        ) : categories.length > 0 ? (
          <ul className="space-y-4">
            {categories.map((category) => (
              <li
                key={category.Id}
                className="flex items-center justify-between p-4 bg-white border-b-2  cursor-pointer hover:bg-gray-200"
                onClick={() => chooseCategory(category)}
              >
                <span className="text-sm font-medium text-gray-700">
                  {category.Name}
                </span>
                <ChevronGo
                  width={20}
                  height={20}
                  stroke={context.store.Color || "#CCCCCC"}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-sm text-gray-400">
            No hay categorías disponibles
          </div>
        )}
      </div>
    </div>
  );
};
