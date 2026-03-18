export interface Customer {
  id?: number;
  businessId: number;
  name: string;
  phoneNumber?: string;
  email?: string;
  canPayLater: boolean;
}

export type SalesPeriod = "DAY" | "MONTH" | "YEAR";

export interface CustomerOrder {
  id: number;
  customerId: number;
  createdAt: string;
  total: number;
  status?: string;
}

export interface OrderItem {
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}
