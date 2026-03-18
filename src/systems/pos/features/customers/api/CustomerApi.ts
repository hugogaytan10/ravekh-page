import { HttpClient } from "../../../../shared/api/HttpClient";
import { fail, ok, type Result } from "../../../../shared/models/Result";
import type { CustomerGateway } from "../interfaces/CustomerContracts";
import type { Customer, CustomerOrder, OrderItem, SalesPeriod } from "../models/Customer";
import { CustomerMapper } from "./CustomerMapper";

export class CustomerApi implements CustomerGateway {
  constructor(private readonly httpClient: HttpClient) {}

  async getByBusinessId(token: string, businessId: string): Promise<Customer[]> {
    const data = await this.httpClient.request<unknown[]>(`customers/business/${businessId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return (Array.isArray(data) ? data : []).map((item) => CustomerMapper.fromLegacy(item as Record<string, unknown>));
  }

  async getById(token: string, customerId: number): Promise<Customer | null> {
    const data = await this.httpClient.request<unknown>(`customers/${customerId}`, { token });

    if (!data || typeof data !== "object") {
      return null;
    }

    return CustomerMapper.fromLegacy(data as Record<string, unknown>);
  }

  async create(token: string, customer: Customer): Promise<Result<Customer>> {
    try {
      await this.httpClient.request("customers", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: CustomerMapper.toLegacy(customer),
      });

      return ok(customer, "Customer created successfully.");
    } catch (error) {
      return fail("Failed to create customer.", error instanceof Error ? error.message : "Unknown error");
    }
  }

  async update(token: string, customer: Customer): Promise<Result<Customer>> {
    if (!customer.id) {
      return fail("Failed to update customer.", "Missing customer id.");
    }

    try {
      await this.httpClient.request(`customers/${customer.id}`, {
        method: "PUT",
        token,
        body: CustomerMapper.toLegacy(customer),
      });

      return ok(customer, "Customer updated successfully.");
    } catch (error) {
      return fail("Failed to update customer.", error instanceof Error ? error.message : "Unknown error");
    }
  }

  async delete(token: string, customerId: number): Promise<Result<null>> {
    try {
      await this.httpClient.request(`customers/${customerId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      return ok(null, "Customer removed successfully.");
    } catch (error) {
      return fail("Failed to remove customer.", error instanceof Error ? error.message : "Unknown error");
    }
  }

  async getOrders(token: string, customerId: number, period: SalesPeriod): Promise<CustomerOrder[]> {
    const data = await this.httpClient.request<unknown[]>(`customers/order/${customerId}/${period}`, { token });

    return (Array.isArray(data) ? data : []).map((item) => CustomerMapper.orderFromLegacy(item as Record<string, unknown>));
  }

  async getOrderItems(token: string, orderId: number): Promise<OrderItem[]> {
    const data = await this.httpClient.request<unknown[]>(`products/order/${orderId}`, { token });

    return (Array.isArray(data) ? data : []).map((item) =>
      CustomerMapper.orderItemFromLegacy(item as Record<string, unknown>),
    );
  }
}
