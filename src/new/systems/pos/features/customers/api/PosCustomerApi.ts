import { HttpClient } from "../../../../core/api/HttpClient";
import { ICustomerRepository } from "../interface/ICustomerRepository";
import { Customer, UpsertCustomerDto } from "../model/Customer";

type CustomerResponse = {
  Id: number;
  Business_Id: number;
  Name: string;
  PhoneNumber: string | null;
  Email: string | null;
  Address: string | null;
  Notes: string | null;
  CanPayLater: number | boolean | null;
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

  private toApiPayload(payload: UpsertCustomerDto): Record<string, unknown> {
    return {
      Business_Id: payload.businessId,
      Name: payload.name,
      PhoneNumber: payload.phoneNumber ?? null,
      Email: payload.email ?? null,
      Address: payload.address ?? null,
      Notes: payload.notes ?? null,
      CanPayLater: payload.canPayLater ? 1 : 0,
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
    );
  }
}
