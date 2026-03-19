import { CreateOrderDto, Order, TaxRule } from "../model/Order";

export interface IOrderRepository {
  create(payload: CreateOrderDto, token: string): Promise<Order>;
  getTaxesByBusiness(businessId: number, token: string): Promise<TaxRule[]>;
}
