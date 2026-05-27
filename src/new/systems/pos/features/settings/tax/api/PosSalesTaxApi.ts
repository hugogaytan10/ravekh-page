import { HttpClient } from "../../../../core/api/HttpClient";
import { ISalesTaxRepository } from "../interface/ISalesTaxRepository";
import { SalesTax, UpsertSalesTaxDto } from "../model/SalesTax";

type BusinessResponse = {
  Id: number;
  Taxes_Id: number | null;
};

type TaxResponse = {
  Id: number;
  Description: string;
  Value: number;
  IsPercent: boolean | number;
  QuitInSale: boolean | number;
};

export class PosSalesTaxApi implements ISalesTaxRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getByBusinessId(businessId: number, token: string): Promise<SalesTax | null> {
    const business = await this.httpClient.request<BusinessResponse>({
      method: "GET",
      path: `business/${businessId}`,
      token,
    });

    if (!business.Taxes_Id) {
      return null;
    }

    const tax = await this.httpClient.request<TaxResponse>({
      method: "GET",
      path: `taxes/${business.Taxes_Id}`,
      token,
    });

    return this.toDomain(tax, businessId);
  }

  async create(payload: UpsertSalesTaxDto, token: string): Promise<SalesTax> {
    const createdTaxId = await this.httpClient.request<number>({
      method: "POST",
      path: "taxes",
      token,
      body: this.toApiPayload(payload),
    });

    const tax = await this.httpClient.request<TaxResponse>({
      method: "GET",
      path: `taxes/${createdTaxId}`,
      token,
    });

    return this.toDomain(tax, payload.businessId);
  }

  async update(taxId: number, payload: UpsertSalesTaxDto, token: string): Promise<SalesTax> {
    await this.httpClient.request<void>({
      method: "PUT",
      path: `taxes/${taxId}`,
      token,
      body: this.toApiPayload(payload),
    });

    const tax = await this.httpClient.request<TaxResponse>({
      method: "GET",
      path: `taxes/${taxId}`,
      token,
    });

    return this.toDomain(tax, payload.businessId);
  }

  async delete(taxId: number, token: string): Promise<void> {
    await this.httpClient.request<void>({
      method: "DELETE",
      path: `taxes/${taxId}`,
      token,
    });
  }

  async linkTaxToBusiness(businessId: number, taxId: number, token: string): Promise<void> {
    await this.httpClient.request<void>({
      method: "PUT",
      path: `business/${businessId}`,
      token,
      body: { Taxes_Id: taxId },
    });
  }

  private toApiPayload(payload: UpsertSalesTaxDto): Record<string, unknown> {
    return {
      Description: payload.description,
      Value: payload.value,
      IsPercent: payload.isPercent,
      QuitInSale: payload.canBeRemovedAtSale,
    };
  }

  private toDomain(tax: TaxResponse, businessId: number): SalesTax {
    return new SalesTax(
      tax.Id,
      businessId,
      tax.Description,
      tax.Value,
      tax.IsPercent === true || tax.IsPercent === 1,
      tax.QuitInSale === true || tax.QuitInSale === 1,
    );
  }
}
