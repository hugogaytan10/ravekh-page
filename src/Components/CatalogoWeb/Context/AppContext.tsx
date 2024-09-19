import React, { useState, createContext, useMemo } from "react";
import { Producto } from "../Modelo/Producto";
import { AppContextState } from "./EstadoContexto";

type AppContextProps = {
  children: React.ReactNode;
};
export const AppContext = createContext({} as AppContextState);

const AppProvider: React.FC<AppContextProps> = ({ children }) => {
  const [cart, setCart] = useState<Producto[]>([]);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [idBussiness, setIdBussiness] = useState<string>("1");

  //funcion para agregar un producto al carrito
  const addProductToCart = (product: Producto) => {
    //verificar si el producto ya esta en el carrito
    const exist = cart.find((item) => item.Id === product.Id);
    if (exist) {
      setCart(
        cart.map((item) =>
          item.Id === product.Id
            ? { ...exist, Quantity: exist.Quantity! + product.Quantity! }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product}]);
    }
  };
  //funcion para eliminar un producto del carrito
  const removeProductFromCart = (id: string) => {
    setCart(cart.filter((product) => product.Id !== parseInt(id)));
  };

  //funcion para limpiar el carrito
  const clearCart = () => {
    setCart([]);
  };

  const value = useMemo(() => {
    return { cart, setCart, phoneNumber, setPhoneNumber, addProductToCart, removeProductFromCart, clearCart,  idBussiness, setIdBussiness };
  }, [cart, phoneNumber, setCart, setPhoneNumber, addProductToCart, removeProductFromCart, clearCart, idBussiness, setIdBussiness]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
