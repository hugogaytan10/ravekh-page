import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../Context/AppContext";

export const NameStore: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const [nameStore, setStoreName] = useState<string>(context.store.Name || "");

  // Animations (simplified for React.js)
  const fadeAnim = useRef<number>(0);
  const slideAnim = useRef<number>(50);
  const [animatedStyle, setAnimatedStyle] = useState({
    opacity: fadeAnim.current,
    transform: `translateY(${slideAnim.current}px)`
  });

  useEffect(() => {
    const fadeIn = setInterval(() => {
      fadeAnim.current = Math.min(fadeAnim.current + 0.1, 1);
      slideAnim.current = Math.max(slideAnim.current - 5, 0);
      setAnimatedStyle({
        opacity: fadeAnim.current,
        transform: `translateY(${slideAnim.current}px)`
      });
      if (fadeAnim.current === 1 && slideAnim.current === 0) {
        clearInterval(fadeIn);
      }
    }, 50);

    return () => clearInterval(fadeIn);
  }, []);

  const isValidName = (name: string) => name.length > 0;

  return (
    <div
      className="min-h-screen flex flex-col bg-white px-4 pt-6"
      style={animatedStyle}
    >
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          className="mr-4"
          onClick={() => navigate(-1)}
        >
          {/* Replace with an actual back icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-800">Nombre del negocio</h1>
      </div>

      {/* Progress */}
      <div className="mb-8 text-center">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Nombre de tu negocio 1/4
        </p>
        <div className="flex justify-center items-center">
          <div className="w-10 h-1 bg-blue-500 rounded-full mx-1"></div>
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-1"></div>
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-1"></div>
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-1"></div>
        </div>
      </div>

      {/* Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre
        </label>
        <input
          type="text"
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Negocio Genial"
          value={nameStore}
          onChange={(e) => setStoreName(e.target.value)}
        />
      </div>

      {/* Continue Button */}
      <button
        className={`w-11/12 mx-auto py-3 rounded-md text-lg font-semibold text-white ${{
          "bg-blue-500": isValidName(nameStore),
          "bg-gray-300 cursor-not-allowed": !isValidName(nameStore)
        }}`}
        onClick={() => {
          if (isValidName(nameStore)) {
            context.setStore({ ...context.store, Name: nameStore });
            navigate("/PhoneStore");
          }
        }}
        disabled={!isValidName(nameStore)}
      >
        Continuar
      </button>
    </div>
  );
};
