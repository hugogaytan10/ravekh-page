import { SalesTax, UpsertSalesTaxDto } from "../model/SalesTax";

export interface ISalesTaxRepository {
  getByBusinessId(businessId: number, token: string): Promise<SalesTax | null>;
  create(payload: UpsertSalesTaxDto, token: string): Promise<SalesTax>;
  update(taxId: number, payload: UpsertSalesTaxDto, token: string): Promise<SalesTax>;
  delete(taxId: number, token: string): Promise<void>;
  linkTaxToBusiness(businessId: number, taxId: number, token: string): Promise<void>;
}
