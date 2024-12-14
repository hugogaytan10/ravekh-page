import React, { useContext, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom"; // Para las rutas y enlaces
import { ThemeLight } from "../Theme/Theme";
import Search from "../../../../assets/POS/Search";
import ScanIcon from "../../../../assets/POS/ScanCircleIcon";
import { Settings } from "../../../../assets/POS/Settings";
import { AppContext } from "../../Context/AppContext";

export const MainProducts: React.FC = () => {
  const [isShow, setIsShow] = useState(false);
  const context = useContext(AppContext);
  const navigation = useNavigate()
  const tabs = [
    { name: "Items", path: "/main-products/items" },
    { name: "Stock", path: "/main-products/stock" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header
        className="py-2 text-white flex items-center justify-center z-100"
        style={{
          backgroundColor: context.store.Color || ThemeLight.btnBackground,
        }}
      >
        <h1 className="text-lg font-semibold">{context.store.Name}</h1>
      </header>

      {/* Icons Section */}
      <div className="flex justify-between items-center px-4 py-2 bg-white shadow">
        {/* Search Icon */}
        <button
          className="bg-gray-100 p-2 rounded-full flex items-center justify-center"
          onClick={() => {
            context.setShowNavBarBottom(false);
            navigation("/search-product-products")}}
        >
          <Search width={25} height={25} />
        </button>

        {/* Scan and Filter Icons */}
        <div className="flex space-x-4">
         
          <button
            className="bg-gray-100 p-2 rounded-full flex items-center justify-center w-12 h-12"
            onClick={() => {
              context.setShowNavBarBottom(false);
              navigation("/products-filter")}}
          >
            <Settings />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="tabs-container bg-white shadow-sm flex justify-center gap-20">
        {tabs.map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.path}
            className={({ isActive }) =>
              `tab-item px-4 py-2 font-semibold ${
                isActive
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-600"
              }`
            }
          >
            {tab.name}
          </NavLink>
        ))}
      </nav>

      {/* Dynamic Content */}
      <div className="flex-grow p-2 ">
        <Outlet />
      </div>
    </div>
  );
};
