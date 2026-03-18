export type OrderStatus = "PENDING" | "IN_PROGRESS" | "DELIVERED" | "CANCELLED";

export interface Order {
  id: number;
  businessId: number;
  customerName: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  status: OrderStatus;
}

export interface LegacyOrderDto {
  Id?: number;
  Business_Id?: number;
  CustomerName?: string;
  Name?: string;
  Total?: number;
  PaymentMethod?: string;
  Date?: string;
  Status?: string;
}

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toStringValue = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const normalizeStatus = (value: unknown): OrderStatus => {
  const status = toStringValue(value).toUpperCase();

  switch (status) {
    case "ENTREGADO":
    case "DELIVERED":
      return "DELIVERED";
    case "EN PROCESO":
    case "IN_PROGRESS":
      return "IN_PROGRESS";
    case "CANCELADO":
    case "CANCELLED":
      return "CANCELLED";
    default:
      return "PENDING";
  }
};

export class OrderMapper {
  static fromLegacy(dto: LegacyOrderDto): Order {
    return {
      id: toNumber(dto.Id),
      businessId: toNumber(dto.Business_Id),
      customerName: toStringValue(dto.CustomerName || dto.Name, "Walk-in customer"),
      total: toNumber(dto.Total),
      paymentMethod: toStringValue(dto.PaymentMethod, "UNSPECIFIED"),
      createdAt: toStringValue(dto.Date, new Date(0).toISOString()),
      status: normalizeStatus(dto.Status),
    };
  }
}
