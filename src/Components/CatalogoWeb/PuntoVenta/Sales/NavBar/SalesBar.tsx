import React, { useContext } from "react";
import { Item } from "../../Model/Item";
import "./SalesBar.css";
import Search from "../../../../../assets/POS/Search";
import ScanIcon from "../../../../../assets/POS/ScanCircleIcon";
import ListSharpIcon from "../../../../../assets/POS/ListSharpIcon";
import MoreIcon from "../../../../../assets/POS/MoreIcon";
import { AppContext } from "../../../Context/AppContext";
import { useNavigate } from "react-router-dom";

interface SalesBarProps {
  view: boolean;
  setView: (value: boolean) => void;
  products: Item[];
  setFilteredProducts: (products: Item[]) => void;
}

export const SalesBar: React.FC<SalesBarProps> = ({
  products,
  setFilteredProducts,
  setView,
  view,
}) => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div
      className="sales-bar"
      style={{
        backgroundColor: context.store.Color || "#6D01D1",
      }}
    >
      {/* Icono de búsqueda */}
      <div className="icon-container search-icon">
        <button
          onClick={() =>{
            context.setShowNavBarBottom(false);
            navigate("/search-product")}}
        >
          <Search height={35} width={35} fill={context.store.Color || "#fff"} />
        </button>
      </div>

      {/* Contenedor de íconos a la derecha */}
      <div className="icons-right">
        {/* Escáner */}
        <div className="icon-container">
            <button
            onClick={() =>{ 
              context.setShowNavBarBottom(false);
              navigate("/scanner-sales"); }}
            >
            <ScanIcon
              width={40}
              height={40}
              stroke={context.store.Color || "#fff"}
              fill={context.store.Color || "#fff"}
            />
            </button>
        </div>

        {/* Vista de lista o más opciones */}
        <div className="icon-container">
          <button onClick={() => setView(!view)}>
            {view ? (
              <ListSharpIcon
                width={30}
                height={30}
                stroke={context.store.Color || "#fff"}
              />
            ) : (
              <MoreIcon
                height={25}
                width={25}
                strokeColor={context.store.Color || "#fff"}
              />
            )}
          </button>
        </div>

        {/* Cantidad de ventas */}
        <div className="icon-container">
          <button
            onClick={() => {
              context.setShowNavBarBottom(false); // ocultar la barra inferior
              navigate("/next-quantity-sell")}} // navegar a la pantalla de cantidad a vender por producto
          >
            <span
              className="header-text"
              style={{
                fontSize: context.quantityNextSell.length >= 3 ? "10px" : "18px",
                color: context.store.Color || "#fff",
              }}
            >
              {context.quantityNextSell}x
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
