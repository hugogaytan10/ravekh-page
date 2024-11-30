import React, { useContext, useState, useCallback, useRef } from "react";
import "./Cart.css"; // Archivo CSS para los estilos
import { useNavigate } from "react-router-dom";

// Iconos o SVGs
import { ChevronBack } from "../../../../../assets/POS/ChevronBack.tsx";
import PlusIcon from "../../../../../assets/POS/PlusIcon";
import { Settings } from "../../../../../assets/POS/Settings";
import { AppContext } from "../../../Context/AppContext";
import { CartPos } from "../../Model/CarPos";
import { CartList } from "./CartList.tsx";
import { ExpandableModalScanner } from "./ExpandableModalScanner.tsx";

export const MainCart: React.FC = () => {
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalWithTaxes, setTotalWithTaxes] = useState<number>(0.0); // Total con impuestos
  const context = useContext(AppContext);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const viewRef = useRef<HTMLDivElement>(null); // Referencia para capturar la vista
  const navigate = useNavigate(); // React Router para navegación

  const handleNavigate = () => {
    if (context.cart.length > 0) {
      navigate("/payment-type");
    }
  };

  const handleTotalChange = (newTotalWithTaxes: number) => {
    setTotalWithTaxes(newTotalWithTaxes);
  };

  const calculateTotals = useCallback(() => {
    let total = 0;
    let totalP = 0.0;
    let totalWithTax = 0.0;

    context.cartPos.forEach((item: CartPos) => {
      total += item.Quantity;
      totalP += item.Quantity * item.Price;
    });

    setTotalItems(total);

    if (context.tax) {
      let taxAmount = context.tax.IsPercent
        ? totalP * (context.tax.Value / 100)
        : context.tax.Value || 0;

      totalWithTax = totalP + taxAmount;
      setTotalWithTaxes(totalWithTax);
    } else {
      setTotalWithTaxes(totalP);
    }
  }, [context.cart, context.tax]);

  // Simulando useFocusEffect
  React.useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  return (
    <div className="main-cart" ref={viewRef}>
      <div className="header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ChevronBack width={30} height={30} />
          <span className="header-title">Carrito</span>
        </button>
        <button
          className="add-client-button"
          onClick={() => navigate("/client-select")}
        >
          <PlusIcon width={20} height={20} color="#6200EE" />
          <span>Cliente</span>
        </button>
      </div>

      {/* Lista del carrito */}
      <div className="cart-list">
        <CartList onTotalChange={handleTotalChange} />
      </div>

      {/* Barra inferior */}
      <div className="bottom-nav">
        <button
          className="icon-button"
          onClick={() => setIsVisible(!isVisible)}
        >
          <Settings fillColor="#6200EE" />
        </button>
        <button className="order-button" onClick={handleNavigate}>
          {totalItems} Items = ${totalWithTaxes.toFixed(2)}
        </button>
      </div>

      {/* Modal para configuración */}
      {isVisible && (
        <ExpandableModalScanner
          isVisible={isVisible}
          setIsVisible={setIsVisible}
        />
      )}
    </div>
  );
};
