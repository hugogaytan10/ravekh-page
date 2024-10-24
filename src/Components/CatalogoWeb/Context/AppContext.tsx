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
  const [color, setColor] = useState<string>("");
  const [nombre, setNombre] = useState<string>("");

  //funcion para agregar un producto al carrito
  const addProductToCart = (product: Producto) => {
    if (!product.Quantity) {
      product.Quantity = 1;
    }
    //verificar si hay algo en local storage
    const storedCart = localStorage.getItem("cart");
    let currentCart = storedCart ? JSON.parse(storedCart) : cart;

    //verificar si el producto ya esta en el carrito
    const exist = currentCart.find((item: Producto) => item.Id === product.Id);
    let newCart;
    if (exist) {
      newCart = currentCart.map((item: Producto) =>
        item.Id === product.Id
          ? { ...exist, Quantity: exist.Quantity! + product.Quantity! }
          : item
      );
    } else {
      newCart = [...currentCart, { ...product }];
    }

    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  //funcion para eliminar un producto del carrito
  const removeProductFromCart = (id: string) => {
    //verificar si hay algo en local storage
    const storedCart = localStorage.getItem("cart");
    let currentCart = storedCart ? JSON.parse(storedCart) : cart;

    //filtrar el producto a eliminar
    const newCart = currentCart.filter((product: Producto) => product.Id !== parseInt(id));

    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  //funcion para limpiar el carrito
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const value = useMemo(() => {
    return {
      cart,
      setCart,
      phoneNumber,
      setPhoneNumber,
      addProductToCart,
      removeProductFromCart,
      clearCart,
      idBussiness,
      setIdBussiness,
      color,
      setColor,
      nombre,
      setNombre
    };
  }, [
    cart,
    phoneNumber,
    setCart,
    setPhoneNumber,
    addProductToCart,
    removeProductFromCart,
    clearCart,
    idBussiness,
    setIdBussiness,
    color,
    setColor,
    nombre,
    setNombre
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
