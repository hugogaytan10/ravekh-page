import React from "react";
import { Header } from "../../Utilities/Header";
import Search from "../../../../../assets/POS/Search"; // Ruta adaptada
import { ThemeLight } from "../../Theme/Theme";

export type Language = {
  id: number;
  image: string;
  name: string;
};

const languages: Language[] = [
  { id: 1, image: "/assets/Img/Mx.jpg", name: "Español MX" },
  { id: 2, image: "/assets/Img/Br.jpg", name: "Portugués" },
  { id: 3, image: "/assets/Img/India.jpg", name: "Indio" },
  { id: 4, image: "/assets/Img/Rusa.webp", name: "Ruso" },
  { id: 5, image: "/assets/Img/Alemani.webp", name: "Alemán" },
];

export const LanguageSelection: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <Header navigation={navigation} screenName="Selecciona tu idioma" />

      {/* Barra de búsqueda */}
      <div className="flex items-center px-4 py-3 bg-white border-b border-gray-300">
        <Search width={20} height={20} />
        <input
          type="text"
          placeholder="Buscar Lenguaje."
          className="ml-3 flex-1 text-sm text-gray-700 outline-none"
        />
      </div>

      {/* Lista de idiomas */}
      <div className="flex-1 overflow-y-auto px-5">
        {languages.map((language) => (
          <div
            key={language.id}
            className="flex items-center p-4 bg-white rounded-lg mb-3 shadow-sm"
          >
            <img
              src={language.image}
              alt={language.name}
              className="w-10 h-10 rounded-md object-cover"
            />
            <span className="ml-4 text-base font-semibold text-gray-800">
              {language.name}
            </span>
          </div>
        ))}
      </div>

      {/* Botón Guardar */}
      <div className="p-4 bg-gray-100">
        <button
          className="w-full py-3 bg-purple-600 text-white text-base font-semibold rounded-lg"
          onClick={() => console.log("Guardar idioma seleccionado")}
        >
          Guardar
        </button>
      </div>
    </div>
  );
};
