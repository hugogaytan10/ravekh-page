import React, { useState, useContext, useEffect, useRef } from "react";
import { AppContext } from "../../../Context/AppContext";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
import { ThemeLight } from "../../Theme/Theme";

export const PhoneStore: React.FC<{ navigation: any }> = ({ navigation }) => {
  const context = useContext(AppContext);
  const [phoneNumber, setPhoneNumber] = useState(context.store.PhoneNumber || "");
  const [phoneFocus, setPhoneFocus] = useState(false);

  // Animaciones
  const fadeAnim = useRef(0);
  const slideAnim = useRef(0);

  const isValidPhoneNumber = (phone: string) => phone.length >= 10;

  useEffect(() => {
    fadeAnim.current = 1;
    slideAnim.current = 0;
  }, []);

  return (
    <div
      className="flex flex-col min-h-screen bg-white transition-all"
      style={{
        opacity: fadeAnim.current,
        transform: `translateY(${slideAnim.current}px)`,
      }}
    >
      {/* Header */}
      <header className="flex items-center py-4 px-6 bg-white shadow-md">
        <button className="p-2 mr-4" onClick={() => navigation.goBack()}>
          <ChevronBack/>
        </button>
        <h1 className="text-lg font-bold text-gray-800">Número de teléfono</h1>
      </header>

      {/* Progreso */}
      <section className="flex flex-col items-center mt-6">
        <p className="text-gray-700 font-semibold mb-2">Ingresa tu número 2/4</p>
        <div className="flex space-x-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
          <div
            className="w-10 h-1 rounded-full"
            style={{ backgroundColor: ThemeLight.secondaryColor }}
          ></div>
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </section>

      {/* Input */}
      <div className="w-4/5 mx-auto mt-8">
        <label
          htmlFor="phoneInput"
          className={`block text-sm font-semibold mb-1 ${
            phoneFocus ? "text-primary" : "text-gray-500"
          }`}
          style={{
            color: phoneFocus ? ThemeLight.secondaryColor : ThemeLight.borderColor,
          }}
        >
          Teléfono
        </label>
        <input
          id="phoneInput"
          className="w-full h-12 border rounded-lg px-4 text-gray-800 text-sm"
          style={{
            borderColor: phoneFocus ? ThemeLight.secondaryColor : ThemeLight.borderColor,
          }}
          placeholder="Ingresa el número"
          type="tel"
          value={phoneNumber}
          onFocus={() => setPhoneFocus(true)}
          onBlur={() => setPhoneFocus(false)}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </div>

      {/* Botón Continuar */}
      <button
        className={`w-4/5 h-12 rounded-lg mt-6 mx-auto text-lg font-bold text-white ${
          isValidPhoneNumber(phoneNumber)
            ? "bg-primary"
            : "bg-gray-300 cursor-not-allowed"
        }`}
        style={{
          backgroundColor: isValidPhoneNumber(phoneNumber)
            ? ThemeLight.secondaryColor
            : "#eee",
        }}
        disabled={!isValidPhoneNumber(phoneNumber)}
        onClick={() => {
          if (isValidPhoneNumber(phoneNumber)) {
            context.setStore({ ...context.store, PhoneNumber: phoneNumber });
            navigation.navigate("AddressStore");
          }
        }}
      >
        Continuar
      </button>
    </div>
  );
};
