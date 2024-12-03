import React, { useState, useCallback, useContext, useEffect } from "react";
import "./DiscountScreen.css"; // Archivo CSS para estilos
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../../CatalogoWeb/Context/AppContext";
import { URL } from "../../Const/Const";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
export const DiscountScreen: React.FC = () => {
  const [discount, setDiscount] = useState("0"); // Porcentaje de descuento
  const [newPriceWithTaxes, setNewPriceWithTaxes] = useState(0.0); // Precio con impuestos después del descuento
  const [tax, setTax] = useState<any>(null); // Estado para almacenar los impuestos desde la API
  const context = useContext(AppContext);
  const navigate = useNavigate();

  // Maneja la entrada del teclado de porcentaje
  const handlePress = useCallback(
    (value: string) => {
      setDiscount((prev) => {
        if (value === "BackSpace") {
          return prev.length > 1 ? prev.slice(0, -1) : "0";
        }

        if (prev === "0" && value !== ".") {
          return value; // Reemplaza "0" si el usuario ingresa un número
        }

        const newValue = prev + value;
        const numericValue = parseFloat(newValue);

        if (numericValue > 100) {
          return "0"; // Limitar el valor a 100
        }

        return newValue !== "" ? newValue : "0";
      });
    },
    [setDiscount]
  );

  // Obtener impuestos desde la API
  const fetchTaxes = async () => {
    try {
      const response = await fetch(
        `${URL}/taxes/business/${context.user.Business_Id}`
      );
      const data = await response.json();
      setTax(data); // Guardar los impuestos en el estado
    } catch (error) {
      console.error("Error al obtener los impuestos:", error);
    }
  };

  // Guardar el valor inicial de `totalWithTaxes`
  useEffect(() => {
    const { total } = context.ticketDetail;
    context.setTicketDetail({
      ...context.ticketDetail,
      totalWithTaxes: total,
    });
    setNewPriceWithTaxes(total);
    fetchTaxes();
  }, []);

  // Calcular el total con el descuento aplicado
  const updatePriceWithDiscount = () => {
    const { total } = context.ticketDetail;
    const discountedTotal = total - (total * parseFloat(discount)) / 100;
    setNewPriceWithTaxes(discountedTotal);
  };

  useEffect(() => {
    updatePriceWithDiscount();
  }, [discount]);

  const handleSave = () => {
    const { totalWithTaxes } = context.ticketDetail;
    let finalPriceWithTaxes = newPriceWithTaxes;

    if (tax) {
      let taxAmount = tax.IsPercent
        ? finalPriceWithTaxes * (tax.Value / 100)
        : tax.Value;
      finalPriceWithTaxes += taxAmount;
    }

    context.setTicketDetail({
      ...context.ticketDetail,
      discount: parseFloat(discount),
      totalWithTaxes: finalPriceWithTaxes,
    });

    navigate("/payment-type");
  };

  const formatNumber = (num: number) =>
    num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");

  return (
    <div className="discount-screen">
      <header className="header-discount"   style={{ backgroundColor: context.store.Color || "#6D01D1" }}>
        <button onClick={()=>{navigate('/MainCart')}} className="flex items-center p-2">
          <ChevronBack />
          <h1 className="text-white">Descuento General</h1>
        </button>
      </header>

      <div className="discount-container">
        <label className="label">Porcentaje</label>
        <div className="input-container">
          <span className="discount-value">{discount}</span>
        </div>
      </div>

      <p className="new-price">Total a cobrar</p>
      <p className="new-price">${formatNumber(newPriceWithTaxes)}</p>

      <div className="keyboard">
        {[
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          ".",
          "0",
          "BackSpace",
        ].map((key) => (
          <button key={key} onClick={() => handlePress(key)} className={key === "BackSpace" ? '' : "btn-keyboard"}>
            {key === "BackSpace" ? "⌫" : key}
          </button>
        ))}
      </div>

      <footer className="bottom-nav-discount">
        <button className="save-button-discount" onClick={handleSave}   style={{ backgroundColor: context.store.Color || "#6D01D1" }}>
          Guardar Cantidad
        </button>
      </footer>
    </div>
  );
};
