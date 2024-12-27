import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../Context/AppContext";
import { Store } from "../../Model/Store";
import { updateBusinessInformation } from "./Petitions";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";

export const UpdateStoreInfo: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  // Estados para almacenar los datos que el usuario puede modificar
  const [storeName, setStoreName] = useState(context.store?.Name || "");
  const [phoneNumber, setPhoneNumber] = useState(context.store?.PhoneNumber || "");
  const [address, setAddress] = useState(context.store?.Address || "");
  const [references, setReferences] = useState(context.store?.References || "");

  const handleSaveChanges = () => {
    // Lógica para guardar los cambios
    const updatedStore: Store = {
      ...context.store,
      Name: storeName,
      PhoneNumber: phoneNumber,
      Address: address,
      References: references,
    };

    context.setStore(updatedStore); // Actualizar el contexto con los nuevos valores

    updateBusinessInformation(
      context.user?.Business_Id + "" || "",
      context.user.Token,
      updatedStore
    );

    navigate(-1); // Volver a la pantalla anterior
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header
        className="h-16 flex items-center justify-between px-4 text-white"
        style={{ backgroundColor: context.store.Color || "#3B82F6" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full text-black"
        >
          <ChevronBack />
        </button>
        <h1 className="text-lg font-semibold">Actualizar Tienda</h1>
        <div />
      </header>

      {/* Formulario de actualización */}
      <main className="flex-grow p-4">
        {/* Sección de Información básica */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Información básica</h2>

          <label className="block text-sm font-medium mb-2">Nombre de la tienda</label>
          <input
            type="text"
            className=" bg-white w-full p-3 border rounded-md mb-4"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="Nombre de la tienda"
          />

          <label className="block text-sm font-medium mb-2">Teléfono</label>
          <input
            type="tel"
            className="bg-white w-full p-3 border rounded-md mb-4"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Teléfono"
          />

          <label className="block text-sm font-medium mb-2">Dirección</label>
          <input
            type="text"
            className="bg-white w-full p-3 border rounded-md mb-4"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Dirección"
          />

          <label className="block text-sm font-medium mb-2">Referencias</label>
          <textarea
            className="bg-white w-full p-3 border rounded-md mb-4"
            value={references}
            onChange={(e) => setReferences(e.target.value)}
            rows={4}
            placeholder="Escribe las referencias del negocio aquí"
          ></textarea>
        </section>

        {/* Botón Guardar Cambios */}
        <button
          onClick={handleSaveChanges}
          className="w-full bg-blue-600 text-white py-3 rounded-md text-lg font-medium"
          style={{ backgroundColor: context.store.Color || "#3B82F6" }}
        >
          Guardar Cambios
        </button>
      </main>
    </div>
  );
};
