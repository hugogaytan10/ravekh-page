import { IOrderRepository } from "../interface/IOrderRepository";
import { CreateOrderDto, Order, OrderLine, TaxRule } from "../model/Order";

export class OrderService {
  constructor(private readonly repository: IOrderRepository) {}

  async createOrder(payload: CreateOrderDto, token: string): Promise<Order> {
    this.validateOrderPayload(payload);

    return this.repository.create(payload, token);
  }

  async estimateTaxes(payload: CreateOrderDto, token: string): Promise<number> {
    this.validateOrderPayload(payload);

    const taxRules = await this.repository.getTaxesByBusiness(payload.businessId, token);
    const subtotal = payload.lines
      .map((line) => new OrderLine(line.productId, line.productName, line.quantity, line.unitPrice))
      .reduce((total, line) => total + line.subtotal(), 0);

    return taxRules.reduce((taxTotal, tax) => taxTotal + tax.calculate(subtotal), 0);
  }

  private validateOrderPayload(payload: CreateOrderDto): void {
    if (payload.lines.length === 0) {
      throw new Error("An order must include at least one product line.");
    }

    payload.lines.forEach((line) => {
      if (line.quantity <= 0) {
        throw new Error(`Invalid quantity for product ${line.productId}.`);
      }

      if (line.unitPrice < 0) {
        throw new Error(`Invalid unit price for product ${line.productId}.`);
      }
    });
  }
}
