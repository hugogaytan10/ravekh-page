import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../../../Context/AppContext";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
import Store from "../../../../../assets/POS/Store";
import { ThemeLight } from "../../Theme/Theme";

export const ReferenceStore: React.FC<{ navigation: any }> = ({ navigation }) => {
  const context = useContext(AppContext);
  const [reference, setReference] = useState(context.store.References || "");
  const [referenceFocus, setReferenceFocus] = useState(false);

  // Animaciones
  const [containerVisible, setContainerVisible] = useState(false);

  useEffect(() => {
    // Simula una animación de entrada
    setTimeout(() => setContainerVisible(true), 300);
  }, []);

  const isValidReference = (ref: string) => ref.length > 10; // Validación mínima

  const handleNext = () => {
    if (isValidReference(reference)) {
      context.setStore({ ...context.store, References: reference });
      navigation.navigate("MainStoreOnline"); // Cambia esta ruta según corresponda
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-20 px-4 relative">
      {/* Header */}
      <header
        className="absolute top-0 left-0 w-full py-4 px-6 flex items-center"
        style={{
          backgroundColor: context.store.Color || ThemeLight.btnBackground,
        }}
      >
        <button
          className="p-2 rounded-full"
          style={{ backgroundColor: ThemeLight.secondaryColor }}
          onClick={() => navigation.goBack()}
        >
          <ChevronBack /*strokeColor="#fff" *//>
        </button>
        <h1 className="ml-4 text-lg font-bold text-white">
          Referencias del negocio
        </h1>
      </header>

      {/* Logo */}
      <div
        className={`mt-20 mb-8 transition-transform duration-700 ${
          containerVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <Store width={150} height={150} /*fillColor={ThemeLight.secondaryColor} *//>
      </div>

      {/* Input Container */}
      <div
        className={`transition-transform duration-700 ${
          containerVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        } w-full max-w-md`}
      >
        <label
          htmlFor="referenceInput"
          className={`block mb-1 text-sm font-semibold ${
            referenceFocus ? "text-primary" : "text-gray-500"
          }`}
          style={{
            color: referenceFocus
              ? ThemeLight.secondaryColor
              : ThemeLight.borderColor,
          }}
        >
          Referencias del negocio
        </label>
        <textarea
          id="referenceInput"
          className="w-full border-2 rounded-lg p-3 text-gray-800 text-sm"
          style={{
            borderColor: referenceFocus
              ? ThemeLight.secondaryColor
              : ThemeLight.borderColor,
          }}
          placeholder="Ej: Cerca de la estación del metro"
          value={reference}
          onFocus={() => setReferenceFocus(true)}
          onBlur={() => setReferenceFocus(false)}
          onChange={(e) => setReference(e.target.value)}
          rows={4}
        />
      </div>

      {/* Botón Siguiente */}
      <div
        className={`mt-8 w-full max-w-md transition-transform duration-700 ${
          containerVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <button
          className="w-full py-3 rounded-lg font-bold text-white"
          style={{
            backgroundColor: isValidReference(reference)
              ? ThemeLight.secondaryColor
              : ThemeLight.boxShadow,
            cursor: isValidReference(reference) ? "pointer" : "not-allowed",
          }}
          onClick={handleNext}
          disabled={!isValidReference(reference)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};
