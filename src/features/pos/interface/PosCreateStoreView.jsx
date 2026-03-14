import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPosSalesRoute } from "../sales";

export const PosCreateStoreView = () => {
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanName = storeName.trim();
    if (!cleanName) {
      return;
    }

    localStorage.setItem("pos_store_name", cleanName);
    navigate(getPosSalesRoute("main"));
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-10">
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-[#5E2E98]">Configura tu tienda</h1>
        <p className="mt-2 text-sm text-gray-600">
          Primer paso del nuevo flujo POS: define el nombre comercial para comenzar a vender.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-gray-700" htmlFor="store-name">
            Nombre de la tienda
          </label>
          <input
            id="store-name"
            type="text"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#6D01D1] focus:outline-none"
            placeholder="Ej. Ravekh Centro"
            value={storeName}
            onChange={(event) => setStoreName(event.target.value)}
          />

          <button
            type="submit"
            className="w-full rounded-xl bg-[#6D01D1] px-4 py-3 font-semibold text-white transition hover:bg-[#5500B4]"
          >
            Continuar al POS
          </button>
        </form>
      </section>
    </main>
  );
};
