import type { Customer, CustomerOrder, OrderItem } from "../models/Customer";

export class CustomerMapper {
  static fromLegacy(payload: Record<string, unknown>): Customer {
    return {
      id: Number(payload.Id ?? payload.id ?? 0) || undefined,
      businessId: Number(payload.Business_Id ?? payload.businessId ?? 0),
      name: String(payload.Name ?? payload.name ?? ""),
      phoneNumber: (payload.PhoneNumber as string | undefined) ?? (payload.phoneNumber as string | undefined),
      email: (payload.Email as string | undefined) ?? (payload.email as string | undefined),
      canPayLater: Boolean(payload.CanPayLater ?? payload.canPayLater),
    };
  }

  static toLegacy(customer: Customer): Record<string, unknown> {
    return {
      Id: customer.id,
      Business_Id: customer.businessId,
      Name: customer.name.trim(),
      PhoneNumber: customer.phoneNumber,
      Email: customer.email,
      CanPayLater: customer.canPayLater,
    };
  }

  static orderFromLegacy(payload: Record<string, unknown>): CustomerOrder {
    return {
      id: Number(payload.Id ?? payload.id ?? 0),
      customerId: Number(payload.Customer_Id ?? payload.customerId ?? 0),
      createdAt: String(payload.CreatedAt ?? payload.createdAt ?? new Date().toISOString()),
      total: Number(payload.Total ?? payload.total ?? 0),
      status: (payload.Status as string | undefined) ?? (payload.status as string | undefined),
    };
  }

  static orderItemFromLegacy(payload: Record<string, unknown>): OrderItem {
    return {
      orderId: Number(payload.Order_Id ?? payload.orderId ?? 0),
      productId: Number(payload.Product_Id ?? payload.productId ?? 0),
      productName: String(payload.ProductName ?? payload.productName ?? "Unknown product"),
      quantity: Number(payload.Quantity ?? payload.quantity ?? 0),
      unitPrice: Number(payload.UnitPrice ?? payload.unitPrice ?? 0),
    };
  }
}
