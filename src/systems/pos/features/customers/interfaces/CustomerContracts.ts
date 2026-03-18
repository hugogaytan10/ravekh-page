import type { Result } from "../../../../shared/models/Result";
import type { Customer, CustomerOrder, OrderItem, SalesPeriod } from "../models/Customer";

export interface CustomerGateway {
  getByBusinessId(token: string, businessId: string): Promise<Customer[]>;
  getById(token: string, customerId: number): Promise<Customer | null>;
  create(token: string, customer: Customer): Promise<Result<Customer>>;
  update(token: string, customer: Customer): Promise<Result<Customer>>;
  delete(token: string, customerId: number): Promise<Result<null>>;
  getOrders(token: string, customerId: number, period: SalesPeriod): Promise<CustomerOrder[]>;
  getOrderItems(token: string, orderId: number): Promise<OrderItem[]>;
}

export interface CustomerUseCases {
  listCustomers(token: string, businessId: string, search?: string): Promise<Result<Customer[]>>;
  getCustomer(token: string, customerId: number): Promise<Result<Customer | null>>;
  saveCustomer(token: string, customer: Customer): Promise<Result<Customer>>;
  removeCustomer(token: string, customerId: number): Promise<Result<null>>;
  listOrders(token: string, customerId: number, period: SalesPeriod): Promise<Result<CustomerOrder[]>>;
  listOrderItems(token: string, orderId: number): Promise<Result<OrderItem[]>>;
}
