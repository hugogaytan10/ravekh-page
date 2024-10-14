import { Dispatch } from "react";
import { Producto } from "../Modelo/Producto";
export type AppContextState = {
    cart: Producto[];
    setCart: Dispatch<Producto[]>;
    phoneNumber: string | null;
    setPhoneNumber: Dispatch<string | null>;
    addProductToCart: (product: Producto) => void;
    removeProductFromCart: (id: string) => void;
    clearCart: () => void;
    idBussiness: string;
    setIdBussiness: Dispatch<string>;
}