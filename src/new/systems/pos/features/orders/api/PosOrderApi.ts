import { HttpClient } from "../../../../core/api/HttpClient";
import { IOrderRepository } from "../interface/IOrderRepository";
import { CreateOrderDto, Order, OrderLine, TaxRule } from "../model/Order";

type OrderLineResponse = {
  Product_Id: number;
  Product_Name: string;
  Quantity: number;
  Unit_Price: number;
};

type OrderResponse = {
  Id: number;
  Business_Id: number;
  Payment_Method: "CASH" | "CARD" | "TRANSFER";
  Total: number;
  Created_At: string;
  Lines: OrderLineResponse[];
};

type TaxResponse = {
  Id: number;
  Name: string;
  Percentage: number;
};

export class PosOrderApi implements IOrderRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async create(payload: CreateOrderDto, token: string): Promise<Order> {
    const order = await this.httpClient.request<OrderResponse>({
      method: "POST",
      path: "orders",
      token,
      body: {
        Order: {
          Business_Id: payload.businessId,
          Customer_Id: payload.customerId,
          Employee_Id: payload.employeeId,
          Payment_Method: payload.paymentMethod,
          Notes: payload.notes,
        },
        OrderDetails: payload.lines.map((line) => ({
          Product_Id: line.productId,
          Name: line.productName,
          Quantity: line.quantity,
          Sale_Price: line.unitPrice,
        })),
      },
    });

    return this.toDomainOrder(order);
  }

  async getTaxesByBusiness(businessId: number, token: string): Promise<TaxRule[]> {
    const taxes = await this.httpClient.request<TaxResponse[]>({
      method: "GET",
      path: `taxes/business/${businessId}`,
      token,
    });

    return taxes.map((tax) => new TaxRule(tax.Id, tax.Name, tax.Percentage));
  }

  private toDomainOrder(order: OrderResponse): Order {
    return new Order(
      order.Id,
      order.Business_Id,
      order.Payment_Method,
      order.Lines.map(
        (line) => new OrderLine(line.Product_Id, line.Product_Name, line.Quantity, line.Unit_Price),
      ),
      order.Total,
      new Date(order.Created_At),
    );
  }
}
