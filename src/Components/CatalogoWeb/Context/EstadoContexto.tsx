import { Dispatch } from "react";
import { Producto } from "../Modelo/Producto";
//apartir de aqui son las variables para el contexto de ravekh pos web
import { User } from "../PuntoVenta/Model/User";
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
    color: string;
    setColor: Dispatch<string>;
    nombre: string;
    setNombre: Dispatch<string>;
    //aparti de aqui son las variables para el contexto de ravekh pos web
    user: User;
    setUser: Dispatch<User>;
}