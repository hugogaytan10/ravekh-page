import { CustomerSalesPeriod, CustomerSex, UpsertCustomerDto } from "../model/Customer";
import { CustomerService } from "../services/CustomerService";

type CustomerCardVm = {
  id: number;
  name: string;
  contact: string;
  canPayLater: boolean;
};

export type CustomerSalesViewModel = {
  orderId: number;
  date: string;
  total: number;
  status: string;
};

export type CustomerDetailViewModel = {
  id: number;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  notes: string;
  sex: CustomerSex;
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

  async getCustomerDetail(customerId: number, token: string): Promise<CustomerDetailViewModel> {
    const customer = await this.service.getCustomerDetail(customerId, token);

    return {
      id: customer.id,
      name: customer.name,
      phoneNumber: customer.phoneNumber ?? "",
      email: customer.email ?? "",
      address: customer.address ?? "",
      notes: customer.notes ?? "",
      sex: customer.sex,
      canPayLater: customer.canPayLater,
    };
  }

  async getCustomerSales(customerId: number, period: CustomerSalesPeriod, token: string): Promise<CustomerSalesViewModel[]> {
    const sales = await this.service.listSalesByPeriod(customerId, period, token);

    return sales.map((sale) => ({
      orderId: sale.orderId,
      date: sale.date,
      total: sale.total,
      status: sale.status,
    }));
  }

  async upsertCustomer(token: string, payload: UpsertCustomerDto, customerId?: number): Promise<void> {
    await this.service.saveCustomer(token, payload, customerId);
  }

  async deleteCustomer(customerId: number, token: string): Promise<void> {
    await this.service.removeCustomer(customerId, token);
  }
}
