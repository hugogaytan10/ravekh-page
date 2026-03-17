import { CreateOrderDto } from "../model/Order";
import { OrderService } from "../services/OrderService";

export class OrderProcessingPage {
  constructor(private readonly service: OrderService) {}

  async buildTaxPreview(payload: CreateOrderDto, token: string): Promise<{ estimatedTaxes: number; productLines: number }> {
    const estimatedTaxes = await this.service.estimateTaxes(payload, token);

    return {
      estimatedTaxes,
      productLines: payload.lines.length,
    };
  }
}
