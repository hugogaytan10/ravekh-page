import { HttpClient } from "../../../../core/api/HttpClient";
import { ICustomerRepository } from "../interface/ICustomerRepository";
import { Customer, CustomerSale, CustomerSalesPeriod, CustomerSex, UpsertCustomerDto } from "../model/Customer";



type CustomerSaleResponse = {
  Id?: number;
  Order_Id?: number;
  OrderId?: number;
  Date?: string;
  Create_Date?: string;
  Created_At?: string;
  Status?: string | null;
  Total?: number | string | null;
  Price?: number | string | null;
  Amount?: number | string | null;
};

type CustomerResponse = {
  Id: number;
  Business_Id: number;
  Name: string;
  PhoneNumber: string | null;
  Email: string | null;
  Address: string | null;
  Notes: string | null;
  CanPayLater: number | boolean | null;
  Sex: string | null;
};

export class PosCustomerApi implements ICustomerRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async listByBusiness(businessId: number, token: string): Promise<Customer[]> {
    const response = await this.httpClient.request<CustomerResponse[]>({
      method: "GET",
      path: `customers/business/${businessId}`,
      token,
    });

    return response.map((item) => this.toDomain(item));
  }

  async getById(customerId: number, token: string): Promise<Customer> {
    const response = await this.httpClient.request<CustomerResponse>({
      method: "GET",
      path: `customers/${customerId}`,
      token,
    });

    return this.toDomain(response);
  }

  async create(payload: UpsertCustomerDto, token: string): Promise<Customer> {
    const response = await this.httpClient.request<CustomerResponse>({
      method: "POST",
      path: "customers",
      token,
      body: this.toApiPayload(payload),
    });

    return this.toDomain(response);
  }

  async update(customerId: number, payload: UpsertCustomerDto, token: string): Promise<Customer> {
    const response = await this.httpClient.request<CustomerResponse>({
      method: "PUT",
      path: `customers/${customerId}`,
      token,
      body: this.toApiPayload(payload),
    });

    return this.toDomain(response);
  }

  async delete(customerId: number, token: string): Promise<void> {
    await this.httpClient.request<void>({
      method: "DELETE",
      path: `customers/${customerId}`,
      token,
    });
  }

  async listSalesByPeriod(customerId: number, period: CustomerSalesPeriod, token: string): Promise<CustomerSale[]> {
    const response = await this.httpClient.request<CustomerSaleResponse[]>({
      method: "GET",
      path: `customers/order/${customerId}/${period}`,
      token,
    });

    return response.map((row) => this.toSale(row));
  }

  private toApiPayload(payload: UpsertCustomerDto): Record<string, unknown> {
    return {
      Business_Id: payload.businessId,
      Name: payload.name,
      PhoneNumber: payload.phoneNumber ?? null,
      Email: payload.email ?? null,
      Address: payload.address ?? null,
      Notes: payload.notes ?? null,
      CanPayLater: payload.canPayLater ? 1 : 0,
      Sex: payload.sex ?? "M",
    };
  }

  private toDomain(item: CustomerResponse): Customer {
    return new Customer(
      item.Id,
      item.Business_Id,
      item.Name,
      item.PhoneNumber,
      item.Email,
      item.Address,
      item.Notes,
      item.CanPayLater === true || item.CanPayLater === 1,
      this.toSex(item.Sex),
    );
  }

  private toSale(row: CustomerSaleResponse): CustomerSale {
    const orderId = Number(row.Order_Id ?? row.OrderId ?? row.Id ?? 0);
    const rawTotal = row.Total ?? row.Price ?? row.Amount ?? 0;
    const total = Number(rawTotal) || 0;

    return new CustomerSale(
      orderId,
      row.Date ?? row.Create_Date ?? row.Created_At ?? "",
      total,
      row.Status ?? "Sin estado",
    );
  }

  private toSex(value: string | null): CustomerSex {
    const normalized = (value ?? "M").toUpperCase();
    if (normalized === "F" || normalized === "O") {
      return normalized;
    }

    return "M";
  }
}
