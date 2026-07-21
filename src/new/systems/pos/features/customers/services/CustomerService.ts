import { ICustomerRepository } from "../interface/ICustomerRepository";
import { Customer, CustomerSale, CustomerSalesPeriod, UpsertCustomerDto2, toApiInactivePayload } from "../model/Customer";

export class CustomerService {
  constructor(private readonly repository: ICustomerRepository) {}

  async listCustomers(businessId: number, token: string, searchTerm?: string): Promise<Customer[]> {
    const customers = await this.repository.listByBusiness(businessId, token);
    if (!searchTerm) {
      return customers;
    }

    return customers.filter((customer) => customer.matches(searchTerm));
  }

  async getCustomer(customerId: number, token: string): Promise<Customer> {
    return this.repository.getById(customerId, token);
  }

  async getCustomerDetail(customerId: number, token: string): Promise<Customer> {
    return this.repository.getById(customerId, token);
  }

  async listSalesByPeriod(customerId: number, period: CustomerSalesPeriod, token: string): Promise<CustomerSale[]> {
    return this.repository.listSalesByPeriod(customerId, period, token);
  }

  async saveCustomer(token: string, payload: UpsertCustomerDto2, customerId?: number): Promise<Customer> {
    console.log("Payload for saveCustomer:", payload);
    if (customerId) {
      return this.repository.update(customerId, payload, token);
    }

    return this.repository.create(payload, token);
  }

  async removeCustomer(customerId: number, payload: toApiInactivePayload, token: string): Promise<void> {
    await this.repository.delete(customerId, payload, token);
  }
}
