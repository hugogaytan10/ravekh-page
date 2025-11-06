import React, { useState, createContext, useMemo } from "react";
import { Producto } from "../Modelo/Producto";
import { AppContextState } from "./EstadoContexto";
import { User } from "../PuntoVenta/Model/User";
import { Store } from "../PuntoVenta/Model/Store";
import { Tax } from "../PuntoVenta/Model/Tax";
import { Category } from "../PuntoVenta/Model/Category";
import { TicketDetail } from "../PuntoVenta/Model/TicketDetail";
import { Customer } from "../PuntoVenta/Model/Customer";
import { FilterProduct } from "../PuntoVenta/Model/FilterProduct";
import { Table } from "../PuntoVenta/Model/Table";
import { CartPos } from "../PuntoVenta/Model/CarPos";
import { ProductFormState } from "../PuntoVenta/Model/ProductFormState";

type AppContextProps = {
  children: React.ReactNode;
};
export const AppContext = createContext({} as AppContextState);

const AppProvider: React.FC<AppContextProps> = ({ children }) => {
  const [cart, setCart] = useState<Producto[]>([]);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [idBussiness, setIdBussiness] = useState<string>("0");
  const [color, setColor] = useState<string>("");
  const [nombre, setNombre] = useState<string>("");
  //comienzan los metodos para ravekh pos web
  const [user, setUser] = useState<User>({} as User);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [showNavBar, setShowNavBar] = useState<boolean>(false); // Control de navegación
  const [cartPos, setCartPos] = useState<CartPos[]>([]); // Añadir este estado para manejar el carrito
  const [stockFlag, setStockFlag] = useState<boolean>(false); // Añadir este estado para manejar el stock
  const [filterProduct, setFilterProduct] = useState<FilterProduct>({} as FilterProduct);
  const [quantityNextSell, setQuantityNextSell] = useState<string>('1');
  const [captureUri, setCaptureUri] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer>({
    Id: 0,
    Business_Id: 0,
    Name: '',
  });
  const [printerConnection, setPrinterConnection] = useState<boolean>(false);
  const [ticketDetail, setTicketDetail] = useState<TicketDetail>({
    discount: 0,
    total: 0,
    totalWithTaxes: 0,
    paymentMethod: '',
    payment: 0,
  }); // Añadir este estado para manejar el detalle del ticket
  const [note, setNote] = useState<string>(''); // Añadir este estado para manejar la nota
  const [categorySelected, setCategorySelected] = useState<Category>({
    Business_Id: 0,
    Color: '',
    Id: 0,
    Name: '',
    Parent_Id: 0,
  });


  const [isShowSplash, setIsShowSplash] = useState<boolean>(false);
  const [store, setStore] = useState<Store>({} as Store);
  const [tax, setTax] = useState<Tax>({} as Tax);
  const [checkout, setCheckout] = useState<boolean>(false);
  const [showNavBarBottom, setShowNavBarBottom] = useState<boolean>(false);
  const [productFormState, setProductFormState] = useState<ProductFormState | null>(null);

    // Función para actualizar una mesa
    const updateTable = (tableId: string, updates: Partial<Table>) => {
      setTables((prevTables) =>
        prevTables.map((table) => (table.Id === tableId ? { ...table, ...updates } : table))
      );
    };
  
    // Función para resetear una mesa cuando el pedido termina
    const resetTable = (tableId: string) => {
      setTables((prevTables) =>
        prevTables.map((table: Table) =>
          table.Id === tableId ? { ...table, Total: '', OrderItems: [], isAvailable: true } : table
        )
      );
    };
  
    // Función para agregar una nueva mesa (si es necesario)
    const addTable = (table: Table) => {
      setTables((prevTables) => [...prevTables, table]);
    };

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
      setNombre,
      user,
      setUser,
      tables,
      setTables,
      selectedTable,
      setSelectedTable,
      showNavBar,
      setShowNavBar,
      cartPos,
      setCartPos,
      stockFlag,
      setStockFlag,
      filterProduct,
      setFilterProduct,
      quantityNextSell,
      setQuantityNextSell,
      captureUri,
      setCaptureUri,
      customer,
      setCustomer,
      printerConnection,
      setPrinterConnection,
      ticketDetail,
      setTicketDetail,
      note,
      setNote,
      categorySelected,
      setCategorySelected,
      isShowSplash,
      setIsShowSplash,
      store,
      setStore,
      tax,
      setTax,
      checkout,
      setCheckout,
      updateTable,
      resetTable,
      addTable,
      showNavBarBottom,
      setShowNavBarBottom,
      productFormState,
      setProductFormState,
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
    setNombre,
    user,
    setUser,
    tables,
    setTables,
    selectedTable,
    setSelectedTable,
    showNavBar,
    setShowNavBar,
    cartPos,
    setCartPos,
    stockFlag,
    setStockFlag,
    filterProduct,
    setFilterProduct,
    quantityNextSell,
    setQuantityNextSell,
    captureUri,
    setCaptureUri,
    customer,
    setCustomer,
    printerConnection,
    setPrinterConnection,
    ticketDetail,
    setTicketDetail,
    note,
    setNote,
    categorySelected,
    setCategorySelected,
    isShowSplash,
    setIsShowSplash,
    store,
    setStore,
    tax,
    setTax,
    checkout,
    setCheckout,
    updateTable,
    resetTable,
    addTable,
    showNavBarBottom,
    setShowNavBarBottom,
    productFormState,
    setProductFormState
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
