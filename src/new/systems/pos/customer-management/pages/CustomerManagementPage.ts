import { CustomerService } from "../services/CustomerService";
import { UpsertCustomerDto } from "../model/Customer";

type CustomerCardVm = {
  id: number;
  name: string;
  contact: string;
  canPayLater: boolean;
};

export class CustomerManagementPage {
  constructor(private readonly service: CustomerService) {}

  async getCustomerCards(businessId: number, token: string, searchTerm = ""): Promise<CustomerCardVm[]> {
    const customers = await this.service.listCustomers(businessId, token, searchTerm);

    return customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      contact: customer.phoneNumber ?? customer.email ?? "No contact",
      canPayLater: customer.canPayLater,
    }));
  }

  async upsertCustomer(token: string, payload: UpsertCustomerDto, customerId?: number): Promise<void> {
    await this.service.saveCustomer(token, payload, customerId);
  }

  async deleteCustomer(customerId: number, token: string): Promise<void> {
    await this.service.removeCustomer(customerId, token);
  }
}
