import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { SalesIcon } from "../../assets/POS/Sales";
import { ProductIcon } from "../../assets/POS/Products";
import { MoreIcon } from "../../assets/POS/MoreIcon";
import { ReportIcon } from "../../assets/POS/Reports";
import { AppContext } from "../CatalogoWeb/Context/AppContext";

export const NavBottom = () => {
  const context = useContext(AppContext); // Obtiene el contexto
  const location = useLocation(); // Obtiene la ruta actual

  // Define las rutas con íconos y nombres
  const navItems = [
    { path: "/MainSales", label: "Ventas", Icon: SalesIcon },
    { path: "/MainProduct", label: "Productos", Icon: ProductIcon },
    { path: "/MainFinances", label: "Finanzas", Icon: ReportIcon },
    { path: "/reports", label: "Reportes", Icon: ReportIcon },
    { path: "/more", label: "Más", Icon: MoreIcon },
  ];

  return (
    <nav className="fixed bottom-0 w-full flex justify-between bg-white  p-2">
      {navItems.map(({ path, label, Icon }) => {
        const isActive = location.pathname === path; // Verifica si es la pestaña activa
        const color = isActive ? context.store.Color : "#CCCCCC"; // Cambia el color basado en si está activo

        return (
          <Link
            key={path}
            to={path}
            className="flex flex-col items-center justify-center flex-1"
          >
            {/* Ícono con color dinámico */}
            <Icon width={30} height={30} strokeColor={color} strokeWidth={2} />
            {/* Texto con color dinámico */}
            <span
              className={` mt-1 text-sm md:font-bold ${
              isActive ? `text-[${context.store.Color}]` : "text-gray-400"
              }`}
              style={{ color: isActive ? context.store.Color : undefined }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
