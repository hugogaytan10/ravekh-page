import { Cart } from "./Cart";

export interface Table {
    Id: string;
    Total?: string;
    OrderItems?: Cart[]; // Aquí puedes poner un modelo más detallado del pedido
    IsAvailable: boolean;
  }