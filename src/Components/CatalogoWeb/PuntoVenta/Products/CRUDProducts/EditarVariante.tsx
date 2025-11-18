import React, { useState } from "react";
import { ChevronGo } from "../../../../../assets/POS/ChevronGo";

type EditarVarianteProps = {
  onBack?: () => void;
  onSave?: (payload: {
    description: string;
    salePrice: string;
    promotionPrice: string;
    costPerItem: string;
    stock: number;
  }) => void;
};

const EditarVariante: React.FC<EditarVarianteProps> = ({ onBack, onSave }) => {
  const [description, setDescription] = useState("Color morado metálico");
  const [salePrice, setSalePrice] = useState("$ 123.00");
  const [promotionPrice, setPromotionPrice] = useState("$ 123.00");
  const [costPerItem, setCostPerItem] = useState("$ 123.00");
  const [stock, setStock] = useState(0);

  const handleBack = () => {
    if (onBack) return onBack();
    window.history.back();
  };

  const handleSave = () => {
    const payload = {
      description,
      salePrice,
      promotionPrice,
      costPerItem,
      stock,
    };
    if (onSave) {
      onSave(payload);
    } else {
      console.log("Guardar variante:", payload);
    }
  };

  return (
    <div className="min-h-screen bg-violet-50 flex flex-col px-4 pb-6">
      {/* Header */}
      <header className="bg-white flex items-center w-full py-3 mb-4 shadow-sm">
        <button
          type="button"
          onClick={handleBack}
          className="ml-2 mr-3 p-1 rounded-full hover:bg-slate-100 transition"
        >
          <ChevronGo />
        </button>
        <h1 className="text-lg font-semibold text-slate-800">
          Asignar Variante
        </h1>
      </header>

      {/* Contenido principal */}
      <main className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        {/* Descripción */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Descripción
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Margen / Ganancia */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
            <p className="text-sm text-slate-600 mb-1">Margen</p>
            <p className="text-2xl font-bold text-slate-800">33.7%</p>
          </div>
          <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
            <p className="text-sm text-slate-600 mb-1">Ganancia</p>
            <p className="text-2xl font-bold text-slate-800">$45.20</p>
          </div>
        </div>

        {/* Precio de venta */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Precio de venta
          </label>
          <input
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            placeholder="Precio de venta"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <p className="text-xs text-slate-500">
            Reemplazarás el precio de las variantes.
          </p>
        </div>

        {/* Precio de promoción */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Precio de promoción
          </label>
          <input
            value={promotionPrice}
            onChange={(e) => setPromotionPrice(e.target.value)}
            placeholder="Precio de promoción"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <p className="text-xs text-slate-500">
            El precio de venta será tachado ej: de $10.00 a $5.00.
          </p>
        </div>

        {/* Costo por ítem */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Costo por ítem
          </label>
          <input
            value={costPerItem}
            onChange={(e) => setCostPerItem(e.target.value)}
            placeholder="Costo por ítem"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </main>

      {/* Stock + botón Guardar */}
      <section className="mt-5 space-y-4">
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm px-4 py-3">
          <div>
            <p className="text-base font-semibold text-slate-800">Stock</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-1 rounded-lg bg-white shadow-sm border border-slate-200 text-sm font-semibold text-violet-600 hover:bg-violet-50 transition"
              // aquí podrías abrir un modal para editar el stock
              onClick={() => {
                const next = window.prompt("Nuevo stock:", stock.toString());
                if (next === null) return;
                const parsed = Number(next);
                if (!Number.isNaN(parsed)) setStock(parsed);
              }}
            >
              Editar
            </button>
            <div className="px-3 py-1 rounded-lg bg-pink-500 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{stock}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm md:text-base py-3 rounded-full shadow-md transition"
        >
          Guardar
        </button>
      </section>
    </div>
  );
};

export default EditarVariante;
