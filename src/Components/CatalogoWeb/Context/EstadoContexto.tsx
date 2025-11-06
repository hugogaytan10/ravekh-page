import { Dispatch, SetStateAction } from "react";
import { Producto } from "../Modelo/Producto";
//apartir de aqui son las variables para el contexto de ravekh pos web
import { User } from "../PuntoVenta/Model/User";
import { Customer } from "../PuntoVenta/Model/Customer";
import { FilterProduct } from "../PuntoVenta/Model/FilterProduct";
import { CartPos } from "../PuntoVenta/Model/CarPos";
import { TicketDetail } from "../PuntoVenta/Model/TicketDetail";
import { Category } from "../PuntoVenta/Model/Category";
import { Store } from "../PuntoVenta/Model/Store";
import { Table } from "../PuntoVenta/Model/Table";
import { Tax } from "../PuntoVenta/Model/Tax";
import { ProductFormState } from "../PuntoVenta/Model/ProductFormState";
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
    customer: Customer;
    setCustomer: Dispatch<SetStateAction<Customer>>;
    showNavBar: boolean;
    setShowNavBar: Dispatch<SetStateAction<boolean>>;
    filterProduct: FilterProduct;
    setFilterProduct: Dispatch<SetStateAction<FilterProduct>>;
    stockFlag: boolean;
    setStockFlag: Dispatch<SetStateAction<boolean>>;
    quantityNextSell: string;
    setQuantityNextSell: Dispatch<SetStateAction<string>>;
    cartPos: CartPos[];
    setCartPos: Dispatch<SetStateAction<CartPos[]>>;
    printerConnection: boolean;
    setPrinterConnection: Dispatch<SetStateAction<boolean>>;
    note: string;
    setNote: Dispatch<SetStateAction<string>>;
    ticketDetail: TicketDetail;
    setTicketDetail: Dispatch<SetStateAction<TicketDetail>>;
    categorySelected: Category;
    setCategorySelected: Dispatch<SetStateAction<Category>>;
    isShowSplash: boolean;
    setIsShowSplash: Dispatch<SetStateAction<boolean>>;
    store: Store;
    setStore: Dispatch<SetStateAction<Store>>;
    // Los demás estados que ya tienes
    tables: Table[]; // Estado de las mesas
    setTables: Dispatch<SetStateAction<Table[]>>; // Método para actualizar las mesas
    updateTable: (tableId: string, updates: Partial<Table>) => void; // Actualizar mesa
    resetTable: (tableId: string) => void; // Resetear una mesa al finalizar pedido
    addTable: (table: Table) => void; // Agregar mesa si es necesario
    selectedTable: string; // Seleccionar una mesa
    setSelectedTable: Dispatch<SetStateAction<string>>; // Método para seleccionar una mesa
    tax: Tax;
    setTax: Dispatch<SetStateAction<Tax>>;
    checkout: boolean;
    setCheckout: Dispatch<SetStateAction<boolean>>;
    captureUri: string | null;
    setCaptureUri: Dispatch<SetStateAction<string | null>>;
    showNavBarBottom: boolean;
    setShowNavBarBottom: Dispatch<SetStateAction<boolean>>;
    productFormState: ProductFormState | null;
    setProductFormState: Dispatch<SetStateAction<ProductFormState | null>>;
}