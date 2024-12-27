import React from 'react';
import { Tooltip } from './Tooltip';

interface HeaderProps {
  onSearch: (term: string) => void; // Prop para manejar el término de búsqueda
  role: string; // Prop para el rol del usuario
  storeName: string; // Prop para el nombre de la tienda
}

export const Header: React.FC<HeaderProps> = ({ onSearch, role, storeName }) => {
  return (
    <div className="flex items-center justify-between bg-white shadow-md p-4">
      {/* Search Bar */}
      <div className="relative w-3/4">
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-white rounded-lg border border-gray-300 p-2 pl-10 text-gray-800 focus:outline-none focus:ring focus:ring-green-200"
          onChange={(e) => onSearch(e.target.value)} // Llama a la función al escribir
        />
        <svg
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11 19a8 8 0 100-16 8 8 0 000 16zm0 0l4.5 4.5"
          />
        </svg>
      </div>

      {/* Profile Section */}
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800">{storeName}</p>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
        
      </div>
    </div>
  );
};
