import { Client } from "../../../../legacy/pos/customers";
import { OrdersByCustomer } from "../../../../legacy/pos/customers";
import { EditClient } from "../../../../legacy/pos/customers";
import { ClientSelect } from "../../../../legacy/pos/customers";

export const PosCustomersPage = () => <Client />;
export const PosOrdersByCustomerPage = () => <OrdersByCustomer />;
export const PosEditCustomerPage = () => <EditClient />;
export const PosClientSelectPage = () => <ClientSelect />;
