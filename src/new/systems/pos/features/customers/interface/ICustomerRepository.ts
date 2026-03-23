import { Customer, CustomerSale, CustomerSalesPeriod, UpsertCustomerDto } from "../model/Customer";

export interface ICustomerRepository {
  listByBusiness(businessId: number, token: string): Promise<Customer[]>;
  getById(customerId: number, token: string): Promise<Customer>;
  create(payload: UpsertCustomerDto, token: string): Promise<Customer>;
  update(customerId: number, payload: UpsertCustomerDto, token: string): Promise<Customer>;
  delete(customerId: number, token: string): Promise<void>;
  listSalesByPeriod(customerId: number, period: CustomerSalesPeriod, token: string): Promise<CustomerSale[]>;
}
