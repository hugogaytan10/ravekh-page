import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">TuLogo</div>
        <ul className="hidden md:flex space-x-8 text-gray-600">
          <li><a href="#features">Lo que ofrecemos</a></li>
          <li><a href="#business-types">Tipos de negocio</a></li>
          <li><a href="#support">Ayuda</a></li>
          <li><a href="#pricing">Precios</a></li>
        </ul>
        <div>
          <a href="#" className="bg-blue-600 text-white px-6 py-2 rounded-md">Entrar</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
