import React, { useContext, useState } from "react";
import { AppContext } from "../../../Context/AppContext";
import PlusIcon from "../../../../../assets/POS/PlusIcon";
import { useNavigate } from "react-router-dom";

export const Filter: React.FC = () => {
  const context = useContext(AppContext);
  const [filters, setFilters] = useState(context.filterProduct);
  const navigate = useNavigate();

  // Alternar estado del filtro
  const toggleSwitch = (filterName: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  // Aplicar filtros y actualizar el estado global
  const applyFilters = () => {
    context.setFilterProduct(filters); // Actualizar filtros en el contexto
    context.setShowNavBarBottom(true); // Mostrar barra de navegación inferior
    context.setStockFlag(!context.stockFlag); // Desencadenar actualización
    navigate(-1); // Volver a la pantalla anterior
  };

  // Resetear filtros
  const resetFilters = () => {
    const defaultFilters = {
      ExpDate: false,
      MinStock: false,
      noStock: false,
      OptStock: false,
      NoMaganeStock: false,
      orderAsc: false,
      orderDesc: false,
    };
    setFilters(defaultFilters);
    context.setFilterProduct(defaultFilters); // Actualizar filtros en el contexto
    context.setStockFlag(!context.stockFlag); // Desencadenar actualización
  };

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      {/* Header */}
      <header
        className="h-16 flex items-center justify-between px-4 bg-blue-600 text-white"
        style={{ backgroundColor: context.store.Color || "#3B82F6" }}
      >
        <button
          onClick={() => {
            context.setShowNavBarBottom(true);
            navigate(-1);
          }}
          className="rotate-45"
        >
          <PlusIcon width={30} height={30} color="#FFFFFF" />
        </button>
        <h1 className="text-lg font-semibold">Filtros</h1>
        <button onClick={resetFilters} className="text-sm text-white underline">
          Limpiar
        </button>
      </header>

      {/* Filtros de Stock */}
      <section className="bg-white p-4 rounded-md mt-4 mx-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Stock</h2>
        <div className="space-y-4">
          {[
            { label: "No maneja stock", filter: "NoMaganeStock" },
            { label: "Sin stock", filter: "noStock" },
            { label: "Stock bajo", filter: "MinStock" },
            { label: "Expirado", filter: "ExpDate" },
          ].map(({ label, filter }) => (
            <div key={filter} className="flex items-center justify-between">
              <span className="text-gray-700">{label}</span>
              <input
                type="checkbox"
                checked={filters[filter]}
                onChange={() => toggleSwitch(filter)}
                className="toggle-checkbox"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Filtros de Orden */}
      <section className="bg-white p-4 rounded-md mt-4 mx-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Ordenar por</h2>
        <div className="space-y-4">
          {[
            { label: "Ascendente (A-Z)", filter: "orderAsc" },
            { label: "Descendente (Z-A)", filter: "orderDesc" },
          ].map(({ label, filter }) => (
            <div key={filter} className="flex items-center justify-between">
              <span className="text-gray-700">{label}</span>
              <input
                type="checkbox"
                checked={filters[filter]}
                onChange={() => toggleSwitch(filter)}
                className="toggle-checkbox"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-md">
        <button
          onClick={applyFilters}
          className="w-full bg-blue-600 text-white py-3 rounded-md text-lg font-medium"
          style={{ backgroundColor: context.store.Color || "#3B82F6" }}
        >
          Aplicar Filtros
        </button>
      </footer>
    </div>
  );
};
