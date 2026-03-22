import React, { useContext, useEffect } from "react";
import "./FinishScreen.css";
import { useLocation, useNavigate } from "react-router-dom";
import { insertComand, InsertOrder } from "./Petitions";
import { AppContext } from "../../../Context/AppContext";
import { PrintTicket } from "../../Printer/PrintTicket";
import {Order} from "../../Model/Order";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
export const FinishScreen: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const saleToken = (location.state as { saleToken?: string } | null)?.saleToken;

  const PrintTicketAgain = async () => {
      PrintTicket(
        context.store.Name || "Tienda",
        context.cartPos,
        context.ticketDetail.payment,
        context.ticketDetail.discount || 0
      );
    
  };

  const NavigateToMainSales = () => {
    // Limpiar el carrito
    context.setCartPos([]);

    // Limpiar el ticket
    context.setTicketDetail({
      total: 0,
      payment: 0,
      discount: 0,
      paymentMethod: "",
    });

    // Limpiar el cliente del contexto
    context.setCustomer({
      Id: 0,
      Business_Id: 0,
      Name: "",
    });

    // Navegar a la pantalla principal de ventas
    navigate("/Mainsales");
    context.setShowNavBarBottom(true); // Mostrar la barra de navegación inferior
  };

  useEffect(() => {
    if (!saleToken) {
      return;
    }

    const processedSalesRaw = sessionStorage.getItem("processedSalesTokens");
    const processedSales = new Set<string>(processedSalesRaw ? JSON.parse(processedSalesRaw) : []);

    if (processedSales.has(saleToken)) {
      return;
    }

    processedSales.add(saleToken);
    sessionStorage.setItem("processedSalesTokens", JSON.stringify(Array.from(processedSales)));

    if (context.selectedTable) {
      const command = {
        Employee_Id: context.user.Id,
        PaymentMethod: context.ticketDetail.paymentMethod,
        Total: context.ticketDetail.total,
        Table_Id: context.selectedTable,
        Tax: context.tax.QuitInSale,
      };

      const commandHasProduct = context.cartPos.map((item) => ({
        Product_Id: item.Id || 0,
        Quantity: item.Quantity || 0,
        Price: item.Price || 0,
        Cost: item.Cost || 0,
      }));

      insertComand(command, commandHasProduct, context.user.Token);

      PrintTicket(
        context.store.Name || "Tienda",
        context.cartPos,
        context.ticketDetail.payment,
        context.ticketDetail.discount || 0
      );
    } else {
      const order: Order = {
        Employee_Id: context.user.Id,
        Note: context.note,
        Discount: context.ticketDetail.discount || 0,
        PaymentMethod: context.ticketDetail.paymentMethod,
        Total: context.ticketDetail.total,
        Tax: context.tax.QuitInSale,
      };

      if (context.customer.Id && context.customer.Id !== 0) {
        order.Customer_Id = context.customer.Id;
      }

      const orderDetails = context.cartPos.map((item) => ({
        Product_Id: item.Id || 0,
        Quantity: item.Quantity || 0,
        Variant_Id: item.Variant_Id ?? undefined,
        Color_Id: item.Color_Id ?? undefined,
        Size_Id: item.Size_Id ?? undefined,
        Price: item.Price || 0,
        Cost: item.Cost || 0,
      }));

      InsertOrder(order, orderDetails, context.user.Token);
      PrintTicket(
        context.store.Name || "Tienda",
        context.cartPos,
        context.ticketDetail.payment,
        context.ticketDetail.discount || 0
      );
    }
  }, [
    context.cartPos,
    context.customer.Id,
    context.note,
    context.selectedTable,
    context.store.Name,
    context.tax.QuitInSale,
    context.ticketDetail.discount,
    context.ticketDetail.payment,
    context.ticketDetail.paymentMethod,
    context.ticketDetail.total,
    context.user.Id,
    context.user.Token,
    saleToken,
  ]);

  return (
    <div className="finish-screen-container">
      <header
        className="finish-screen-header"
        style={{ backgroundColor: context.store.Color || "#6200EE" }}
      >
        <button className="flex items-center" onClick={()=>{navigate("/payment")}}>
        <ChevronBack  />
        <h1 className="finish-screen-title">Finalizar</h1>
        </button>
      </header>

      <div className="finish-screen-info">
        <div className="finish-screen-icon-container">
          ✔️
        </div>

        <p className="finish-screen-success-text">Listo</p>
        <p className="finish-screen-amount-text">
          ${(context.ticketDetail.totalWithTaxes ?? 0).toFixed(2)}
        </p>

        <button
          className="finish-screen-ticket-button"
          onClick={PrintTicketAgain}
        >
          Imprimir ticket de venta
        </button>

        <button
          className="finish-screen-new-sale-button"
          style={{ backgroundColor: context.store.Color || "#6200EE" }}
          onClick={NavigateToMainSales}
        >
          Empezar nueva venta
        </button>
      </div>
    </div>
  );
};
