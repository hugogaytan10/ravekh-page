import React, { createContext, useMemo, useState } from "react";

export type CartPos = {
  Id: number;
  Business_Id: number;
  Name: string;
  Price: number;
  Quantity: number;
  SubTotal: number;
  Image?: string;
  Images?: string[];
  Barcode?: string;
  PromotionPrice?: number;
  Category_Id?: number;
  Stock?: number | null;
  Variant_Id?: number | null;
  VariantDescription?: string;
};

type Producto = {
  Id: number;
  Business_Id: number;
  Name: string;
  Price: number;
  Quantity?: number;
  Image?: string;
  Images?: string[];
  Barcode?: string;
  PromotionPrice?: number;
  Category_Id?: number;
  Stock?: number | null;
  Variant_Id?: number | null;
  VariantDescription?: string;
};

type User = Record<string, unknown>;
type Store = Record<string, unknown>;
type Tax = Record<string, unknown>;
type ProductFormState = Record<string, unknown>;

type Category = {
  Business_Id: number;
  Color: string;
  Id: number;
  Name: string;
  Parent_Id: number;
};

type TicketDetail = {
  discount: number;
  total: number;
  totalWithTaxes: number;
  paymentMethod: string;
  payment: number;
};

type Customer = {
  Id: number;
  Business_Id: number;
  Name: string;
};

type FilterProduct = {
  noStock: boolean;
  MinStock: boolean;
  OptStock: boolean;
  ExpDate: boolean;
  NoMaganeStock: boolean;
  orderAsc: boolean;
  orderDesc: boolean;
};

type Table = {
  Id: string;
  Total?: string;
  OrderItems?: unknown[];
  isAvailable?: boolean;
  [key: string]: unknown;
};

export type AppContextState = {
  cart: CartPos[];
  setCart: React.Dispatch<React.SetStateAction<CartPos[]>>;
  phoneNumber: string | null;
  setPhoneNumber: React.Dispatch<React.SetStateAction<string | null>>;
  addProductToCart: (product: Producto) => void;
  removeProductFromCart: (id: string, variantId?: number | null) => void;
  clearCart: () => void;
  idBussiness: string;
  setIdBussiness: React.Dispatch<React.SetStateAction<string>>;
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
  nombre: string;
  setNombre: React.Dispatch<React.SetStateAction<string>>;
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  customer: Customer;
  setCustomer: React.Dispatch<React.SetStateAction<Customer>>;
  showNavBar: boolean;
  setShowNavBar: React.Dispatch<React.SetStateAction<boolean>>;
  filterProduct: FilterProduct;
  setFilterProduct: React.Dispatch<React.SetStateAction<FilterProduct>>;
  catalogPriceMin: number | null;
  setCatalogPriceMin: React.Dispatch<React.SetStateAction<number | null>>;
  catalogPriceMax: number | null;
  setCatalogPriceMax: React.Dispatch<React.SetStateAction<number | null>>;
  stockFlag: boolean;
  setStockFlag: React.Dispatch<React.SetStateAction<boolean>>;
  quantityNextSell: string;
  setQuantityNextSell: React.Dispatch<React.SetStateAction<string>>;
  cartPos: CartPos[];
  setCartPos: React.Dispatch<React.SetStateAction<CartPos[]>>;
  printerConnection: boolean;
  setPrinterConnection: React.Dispatch<React.SetStateAction<boolean>>;
  note: string;
  setNote: React.Dispatch<React.SetStateAction<string>>;
  ticketDetail: TicketDetail;
  setTicketDetail: React.Dispatch<React.SetStateAction<TicketDetail>>;
  categorySelected: Category;
  setCategorySelected: React.Dispatch<React.SetStateAction<Category>>;
  isShowSplash: boolean;
  setIsShowSplash: React.Dispatch<React.SetStateAction<boolean>>;
  store: Store;
  setStore: React.Dispatch<React.SetStateAction<Store>>;
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  updateTable: (tableId: string, updates: Partial<Table>) => void;
  resetTable: (tableId: string) => void;
  addTable: (table: Table) => void;
  selectedTable: string;
  setSelectedTable: React.Dispatch<React.SetStateAction<string>>;
  tax: Tax;
  setTax: React.Dispatch<React.SetStateAction<Tax>>;
  checkout: boolean;
  setCheckout: React.Dispatch<React.SetStateAction<boolean>>;
  captureUri: string | null;
  setCaptureUri: React.Dispatch<React.SetStateAction<string | null>>;
  showNavBarBottom: boolean;
  setShowNavBarBottom: React.Dispatch<React.SetStateAction<boolean>>;
  productFormState: ProductFormState | null;
  setProductFormState: React.Dispatch<React.SetStateAction<ProductFormState | null>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
};

export const AppContext = createContext({} as AppContextState);

const defaultFilterProduct: FilterProduct = {
  noStock: false,
  MinStock: false,
  OptStock: false,
  ExpDate: false,
  NoMaganeStock: false,
  orderAsc: false,
  orderDesc: false,
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
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
  const [idBussiness, setIdBussiness] = useState("0");
  const [color, setColor] = useState("");
  const [nombre, setNombre] = useState("");
  const [user, setUser] = useState<User>({});
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [showNavBar, setShowNavBar] = useState(false);
  const [stockFlag, setStockFlag] = useState(false);
  const [filterProduct, setFilterProduct] = useState<FilterProduct>(() => {
    const stored = localStorage.getItem("catalogFilters");
    if (!stored) return defaultFilterProduct;
    try {
      const parsed = JSON.parse(stored);
      return {
        ...defaultFilterProduct,
        orderAsc: Boolean(parsed?.orderAsc),
        orderDesc: Boolean(parsed?.orderDesc),
      };
    } catch {
      return defaultFilterProduct;
    }
  });

  const [catalogPriceMin, setCatalogPriceMin] = useState<number | null>(() => {
    const stored = localStorage.getItem("catalogFilters");
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      return typeof parsed?.priceMin === "number" ? parsed.priceMin : null;
    } catch {
      return null;
    }
  });

  const [catalogPriceMax, setCatalogPriceMax] = useState<number | null>(() => {
    const stored = localStorage.getItem("catalogFilters");
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      return typeof parsed?.priceMax === "number" ? parsed.priceMax : null;
    } catch {
      return null;
    }
  });

  const [quantityNextSell, setQuantityNextSell] = useState("1");
  const [captureUri, setCaptureUri] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer>({ Id: 0, Business_Id: 0, Name: "" });
  const [printerConnection, setPrinterConnection] = useState(false);
  const [ticketDetail, setTicketDetail] = useState<TicketDetail>({
    discount: 0,
    total: 0,
    totalWithTaxes: 0,
    paymentMethod: "",
    payment: 0,
  });
  const [note, setNote] = useState("");
  const [categorySelected, setCategorySelected] = useState<Category>({
    Business_Id: 0,
    Color: "",
    Id: 0,
    Name: "",
    Parent_Id: 0,
  });
  const [isShowSplash, setIsShowSplash] = useState(false);
  const [store, setStore] = useState<Store>({});
  const [tax, setTax] = useState<Tax>({});
  const [checkout, setCheckout] = useState(false);
  const [showNavBarBottom, setShowNavBarBottom] = useState(false);
  const [productFormState, setProductFormState] = useState<ProductFormState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const updateTable = (tableId: string, updates: Partial<Table>) => {
    setTables((prevTables) =>
      prevTables.map((table) => (table.Id === tableId ? { ...table, ...updates } : table)),
    );
  };

  const resetTable = (tableId: string) => {
    setTables((prevTables) =>
      prevTables.map((table) =>
        table.Id === tableId ? { ...table, Total: "", OrderItems: [], isAvailable: true } : table,
      ),
    );
  };

  const addTable = (table: Table) => {
    setTables((prevTables) => [...prevTables, table]);
  };

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
      (item) =>
        item.Id === mappedProduct.Id && (item.Variant_Id ?? null) === (mappedProduct.Variant_Id ?? null),
    );

    const stockLimit = mappedProduct.Stock;
    const existingQuantity = exist?.Quantity ?? 0;
    const remainingStock = stockLimit != null ? Math.max(stockLimit - existingQuantity, 0) : null;
    const allowedQuantity = remainingStock != null ? Math.min(quantity, remainingStock) : quantity;

    if (allowedQuantity <= 0) return;

    const newCart = exist
      ? currentCart.map((item) =>
          item.Id === mappedProduct.Id && (item.Variant_Id ?? null) === (mappedProduct.Variant_Id ?? null)
            ? {
                ...exist,
                Quantity: (exist.Quantity || 0) + allowedQuantity,
                SubTotal: Number(((exist.SubTotal || 0) + allowedQuantity * unitPrice).toFixed(2)),
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

  const removeProductFromCart = (id: string, variantId: number | null = null) => {
    const storedCart = localStorage.getItem("cart");
    const currentCart: CartPos[] = storedCart ? JSON.parse(storedCart) : cart;

    const targetId = parseInt(id, 10);
    const targetVariant = variantId ?? null;

    const newCart = currentCart.filter(
      (product) => !(product.Id === targetId && (product.Variant_Id ?? null) === targetVariant),
    );

    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    if (newCart.length === 0) {
      localStorage.removeItem("cartBusinessId");
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
    localStorage.removeItem("cartBusinessId");
  };

  const value = useMemo(
    () => ({
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
      catalogPriceMin,
      setCatalogPriceMin,
      catalogPriceMax,
      setCatalogPriceMax,
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
    }),
    [
      cart,
      phoneNumber,
      idBussiness,
      color,
      nombre,
      user,
      tables,
      selectedTable,
      showNavBar,
      cartPos,
      stockFlag,
      filterProduct,
      catalogPriceMin,
      catalogPriceMax,
      quantityNextSell,
      captureUri,
      customer,
      printerConnection,
      ticketDetail,
      note,
      categorySelected,
      isShowSplash,
      store,
      tax,
      checkout,
      showNavBarBottom,
      productFormState,
      searchQuery,
    ],
  );

  return React.createElement(AppContext.Provider, { value }, children);
};
