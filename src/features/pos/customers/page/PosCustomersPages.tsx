import { Client } from "../../../../Components/CatalogoWeb/PuntoVenta/Customers/Client";
import { OrdersByCustomer } from "../../../../Components/CatalogoWeb/PuntoVenta/Customers/OrdersByCustomer";
import { EditClient } from "../../../../Components/CatalogoWeb/PuntoVenta/Customers/EditClient";
import { ClientSelect } from "../../../../Components/CatalogoWeb/PuntoVenta/Customers/ClientSelect";

export const PosCustomersPage = () => <Client />;
export const PosOrdersByCustomerPage = () => <OrdersByCustomer />;
export const PosEditCustomerPage = () => <EditClient />;
export const PosClientSelectPage = () => <ClientSelect />;
