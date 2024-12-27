import React, { useCallback, useContext, useState } from "react";
import "./PaymentScreen.css"; // Archivo CSS para los estilos
import { useNavigate } from "react-router-dom";
import { KeyBoard } from "../../Utilities/Keyboard";
import { AppContext } from "../../../Context/AppContext";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
export const PaymentScreen: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const initialPayment = (
    context.ticketDetail.totalWithTaxes ?? context.ticketDetail.total
  ).toString();

  const [payment, setPayment] = useState(initialPayment);

  const handlePress = useCallback(
    (value: string) => {
      setPayment((prev) => {
        if (prev === initialPayment && value !== "BackSpace") {
          return value;
        }
        if (value === "BackSpace") {
          return prev.length > 1 ? prev.slice(0, -1) : "0";
        }
        if (prev === "0" && value !== ".") {
          return value;
        }
        return prev + value;
      });
    },
    [setPayment, initialPayment]
  );

  const total =
    context.ticketDetail.totalWithTaxes ?? context.ticketDetail.total;
  const paymentAmount = parseFloat(payment);
  const change =
    paymentAmount > total ? (paymentAmount - total).toFixed(2) : "0.00";

  const handlerNavigate = () => {
    if (paymentAmount >= total) {
      context.setTicketDetail({
        ...context.ticketDetail,
        payment: paymentAmount,
      });
      navigate("/finish");
    }
  };

  return (
    <div className="payment-screen-container">
      <header
        className="payment-screen-header"
        style={{ backgroundColor: context.store.Color || "#6200EE" }}
      >
        <button
          className="flex items-center"
          onClick={() => navigate("/payment-type")}
        >
          <ChevronBack />
          <h1 className="payment-screen-title">Pago</h1>
        </button>
      </header>

      <div className="payment-screen-amount-container">
        <p className="payment-screen-label">Monto recibido</p>
        <p className="payment-screen-amount">${Number(payment).toFixed(2)}</p>

        <div className="payment-screen-change">Cambio: ${change}</div>
      </div>

      <KeyBoard handlePress={handlePress} />

      <button
        className={`payment-screen-confirm-button ${
          paymentAmount < total ? "disabled" : ""
        }`}
        onClick={handlerNavigate}
        disabled={paymentAmount < total}
        style={{ backgroundColor: context.store.Color || "#6200EE" }}
      >
        Pagar ${Number(payment).toFixed(2)}
      </button>
    </div>
  );
};
