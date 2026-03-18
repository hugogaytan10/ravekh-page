import { fail, ok, type Result } from "../../../../shared/models/Result";
import type { CustomerGateway, CustomerUseCases } from "../interfaces/CustomerContracts";
import type { Customer, CustomerOrder, OrderItem, SalesPeriod } from "../models/Customer";

export class CustomerService implements CustomerUseCases {
  constructor(private readonly customerGateway: CustomerGateway) {}

  async listCustomers(token: string, businessId: string, search?: string): Promise<Result<Customer[]>> {
    try {
      const customers = await this.customerGateway.getByBusinessId(token, businessId);
      const normalizedSearch = search?.trim().toLowerCase();

      if (!normalizedSearch) {
        return ok(customers, "Customers loaded.");
      }

      const filtered = customers.filter((customer) => {
        const phone = customer.phoneNumber?.toLowerCase() ?? "";
        return customer.name.toLowerCase().includes(normalizedSearch) || phone.includes(normalizedSearch);
      });

      return ok(filtered, "Customers loaded.");
    } catch (error) {
      return fail("Failed to load customers.", error instanceof Error ? error.message : "Unknown error");
    }
  }

  async getCustomer(token: string, customerId: number): Promise<Result<Customer | null>> {
    try {
      const customer = await this.customerGateway.getById(token, customerId);
      return ok(customer, "Customer loaded.");
    } catch (error) {
      return fail("Failed to load customer.", error instanceof Error ? error.message : "Unknown error");
    }
  }

  async saveCustomer(token: string, customer: Customer): Promise<Result<Customer>> {
    return customer.id ? this.customerGateway.update(token, customer) : this.customerGateway.create(token, customer);
  }

  async removeCustomer(token: string, customerId: number): Promise<Result<null>> {
    return this.customerGateway.delete(token, customerId);
  }

  async listOrders(token: string, customerId: number, period: SalesPeriod): Promise<Result<CustomerOrder[]>> {
    try {
      const orders = await this.customerGateway.getOrders(token, customerId, period);
      return ok(orders, "Customer orders loaded.");
    } catch (error) {
      return fail("Failed to load customer orders.", error instanceof Error ? error.message : "Unknown error");
    }
  }

  async listOrderItems(token: string, orderId: number): Promise<Result<OrderItem[]>> {
    try {
      const items = await this.customerGateway.getOrderItems(token, orderId);
      return ok(items, "Order items loaded.");
    } catch (error) {
      return fail("Failed to load order items.", error instanceof Error ? error.message : "Unknown error");
    }
  }
}
