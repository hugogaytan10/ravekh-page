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
  const [cartPos, setCartPos] = useState<CartPos[]>(() => {
    const storedCart = localStorage.getItem("cart");
    if (!storedCart) return [];
    try {
      const parsed = JSON.parse(storedCart);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const cart = cartPos;
  const setCart = setCartPos;
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [idBussiness, setIdBussiness] = useState<string>("0");
  const [color, setColor] = useState<string>("");
  const [nombre, setNombre] = useState<string>("");
  //comienzan los metodos para ravekh pos web
  const [user, setUser] = useState<User>({} as User);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [showNavBar, setShowNavBar] = useState<boolean>(false); // Control de navegación
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
  const [searchQuery, setSearchQuery] = useState<string>("");

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
    const quantity = product.Quantity ?? 1;
    const unitPrice = product.Price ?? 0;
    const mappedProduct: CartPos = {
      Id: product.Id,
      Business_Id: product.Business_Id,
      Name: product.Name,
      Price: product.Price,
      Quantity: quantity,
      SubTotal: Number((unitPrice * quantity).toFixed(2)),
      Image: product.Image || product.Images?.[0] || "",
      Images: product.Images,
      Barcode: product.Barcode,
      PromotionPrice: product.PromotionPrice,
      Category_Id: product.Category_Id,
      Stock: product.Stock,
      Variant_Id: product.Variant_Id ?? null,
      VariantDescription: product.VariantDescription,
    };

    const storedCart = localStorage.getItem("cart");
    const currentCart: CartPos[] = storedCart ? JSON.parse(storedCart) : cart;

    const exist = currentCart.find(
      (item: CartPos) =>
        item.Id === mappedProduct.Id && (item.Variant_Id ?? null) === (mappedProduct.Variant_Id ?? null),
    );

    const stockLimit = mappedProduct.Stock;
    const existingQuantity = exist?.Quantity ?? 0;
    const remainingStock = stockLimit != null ? Math.max(stockLimit - existingQuantity, 0) : null;
    const allowedQuantity =
      remainingStock != null ? Math.min(quantity, remainingStock) : quantity;

    if (allowedQuantity <= 0) {
      return;
    }

    const newCart = exist
      ? currentCart.map((item: CartPos) =>
          item.Id === mappedProduct.Id && (item.Variant_Id ?? null) === (mappedProduct.Variant_Id ?? null)
            ? {
                ...exist,
                Quantity: (exist.Quantity || 0) + allowedQuantity,
                SubTotal: Number(
                  ((exist.SubTotal || 0) + allowedQuantity * unitPrice).toFixed(2),
                ),
              }
            : item,
        )
      : [
          ...currentCart,
          {
            ...mappedProduct,
            Quantity: allowedQuantity,
            SubTotal: Number((allowedQuantity * unitPrice).toFixed(2)),
          },
        ];

    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    if (product.Business_Id != null) {
      localStorage.setItem("cartBusinessId", String(product.Business_Id));
    }
  };

  //funcion para eliminar un producto del carrito
  const removeProductFromCart = (id: string, variantId: number | null = null) => {
    const storedCart = localStorage.getItem("cart");
    const currentCart: CartPos[] = storedCart ? JSON.parse(storedCart) : cart;

    const targetId = parseInt(id);
    const targetVariant = variantId ?? null;

    const newCart = currentCart.filter(
      (product: CartPos) =>
        !(product.Id === targetId && (product.Variant_Id ?? null) === targetVariant),
    );

    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  //funcion para limpiar el carrito
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
    localStorage.removeItem("cartBusinessId");
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
      searchQuery,
      setSearchQuery,
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
    setProductFormState,
    searchQuery,
    setSearchQuery
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
