export type PaymentMethod = "CASH" | "CARD" | "TRANSFER";

export interface OrderLineDto {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderDto {
  businessId: number;
  customerId?: number;
  employeeId?: number;
  paymentMethod: PaymentMethod;
  lines: OrderLineDto[];
  notes?: string;
}

export class OrderLine {
  constructor(
    public readonly productId: number,
    public readonly productName: string,
    public readonly quantity: number,
    public readonly unitPrice: number,
  ) {}

  subtotal(): number {
    return this.quantity * this.unitPrice;
  }
}

export class Order {
  constructor(
    public readonly id: number,
    public readonly businessId: number,
    public readonly paymentMethod: PaymentMethod,
    public readonly lines: OrderLine[],
    public readonly total: number,
    public readonly createdAt: Date,
  ) {}

  isPaidInCash(): boolean {
    return this.paymentMethod === "CASH";
  }

  itemCount(): number {
    return this.lines.reduce((count, line) => count + line.quantity, 0);
  }
}

export class TaxRule {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly percentage: number,
  ) {}

  calculate(baseAmount: number): number {
    return (baseAmount * this.percentage) / 100;
  }
}
