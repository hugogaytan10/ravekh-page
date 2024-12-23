import React, { useState } from "react";
import { Header } from "../../Utilities/Header";
import { ThemeLight } from "../../Theme/Theme";

export type Moneda = {
  Id: number;
  Image: string;
  Name: string;
  Symbol: string;
};

const monedas: Moneda[] = [
  {
    Id: 1,
    Image: "../../../../../assets/POS/Flags/Mx.jpg",
    Name: "Peso Mexicano",
    Symbol: "MX",
  },
  {
    Id: 2,
    Image: "../../../../../assets/POS/Flags/Arg.jpg",
    Name: "Peso Argentino",
    Symbol: "ARG",
  },
  {
    Id: 3,
    Image: "../../../../../assets/POS/Flags/Br.jpg",
    Name: "Real de Brasil",
    Symbol: "BR",
  },
  {
    Id: 4,
    Image: "../../../../../assets/POS/Flags/Us.webp",
    Name: "Dólar Estadounidense",
    Symbol: "USD",
  },
];

export const SelectMoney: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number | null>(
    null
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <Header navigation={navigation} screenName="Selecciona tu Moneda" />

      {/* Lista de monedas */}
      <div className="flex-1 overflow-y-auto p-5">
        {monedas.map((moneda) => (
          <button
            key={moneda.Id}
            className={`flex items-center p-4 mb-2 rounded-lg border ${
              selectedCurrencyId === moneda.Id
                ? `bg-[${ThemeLight.backgroundIcon}]`
                : "bg-white"
            }`}
            onClick={() => setSelectedCurrencyId(moneda.Id)}
          >
            <img
              src={moneda.Image}
              alt={moneda.Name}
              className="w-10 h-10 object-cover rounded-md"
            />
            <div className="ml-4">
              <p className="text-lg font-semibold text-gray-800">
                {moneda.Name}
              </p>
              <p className="text-sm text-gray-500">{moneda.Symbol}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Botón de guardar */}
      <div
        className="w-full py-4 bg-gray-100 flex items-center justify-center"
        style={{ backgroundColor: ThemeLight.backgroundIcon }}
      >
        <button
          className="w-4/5 bg-primary text-white text-base font-semibold py-3 rounded-lg"
          onClick={() => {
            console.log("Moneda seleccionada:", selectedCurrencyId);
          }}
        >
          Guardar
        </button>
      </div>
    </div>
  );
};
