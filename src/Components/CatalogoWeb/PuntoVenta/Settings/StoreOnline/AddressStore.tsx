import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../../../Context/AppContext';
import { useNavigate } from 'react-router-dom';

export const AddressStore: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState(context.store.Address || '');

  // Animaciones (simulación de animaciones básicas)
  const fadeAnim = useRef(0); // Opcional para estilos animados
  const slideAnim = useRef(50); // Opcional para estilos animados

  useEffect(() => {
    fadeAnim.current = 1;
    slideAnim.current = 0;
  }, []);

  const isValidAddress = (addr: string) => addr.length > 5;

  const handleContinue = () => {
    if (isValidAddress(address)) {
      context.setStore({ ...context.store, Address: address });
      navigate('/reference-store');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white px-4 pt-10">
      {/* Header */}
      <div className="flex items-center w-full mb-8">
        <button
          className="mr-4"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-700">Dirección</h1>
      </div>

      {/* Progress */}
      <div className="mb-8 text-center">
        <p className="text-gray-600 mb-4">Dirección de tu negocio 3/4</p>
        <div className="flex justify-center items-center gap-2">
          <div className="h-1 w-10 bg-gray-300 rounded" />
          <div className="h-1 w-10 bg-gray-300 rounded" />
          <div className="h-1 w-10 bg-blue-600 rounded" />
          <div className="h-1 w-10 bg-gray-300 rounded" />
        </div>
      </div>

      {/* Input */}
      <div className="w-full max-w-md mb-8">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
          Dirección
        </label>
        <textarea
          id="address"
          className="w-full border border-gray-300 rounded-md p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Calle Principal #88, Colonia Buenavista, Guadalajara"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={4}
        />
      </div>

      {/* Continue Button */}
      <button
        className={`w-full max-w-md py-3 rounded-md text-white font-medium ${
          isValidAddress(address) ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
        }`}
        disabled={!isValidAddress(address)}
        onClick={handleContinue}
      >
        Continuar
      </button>
    </div>
  );
};
