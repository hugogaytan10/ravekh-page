import { ISalesTaxRepository } from "../interface/ISalesTaxRepository";
import { SalesTax, UpsertSalesTaxDto } from "../model/SalesTax";

export class SalesTaxService {
  constructor(private readonly repository: ISalesTaxRepository) {}

  async getSalesTax(businessId: number, token: string): Promise<SalesTax | null> {
    return this.repository.getByBusinessId(businessId, token);
  }

  async saveSalesTax(token: string, payload: UpsertSalesTaxDto): Promise<SalesTax> {
    const normalizedPayload = this.normalizePayload(payload);
    if (!new SalesTax(null, normalizedPayload.businessId, normalizedPayload.description, normalizedPayload.value, normalizedPayload.isPercent, normalizedPayload.canBeRemovedAtSale).isValid()) {
      throw new Error("Sales tax payload is invalid.");
    }

    const existingTax = await this.repository.getByBusinessId(payload.businessId, token);
    if (!existingTax) {
      const created = await this.repository.create(normalizedPayload, token);
      if (created.id) {
        await this.repository.linkTaxToBusiness(payload.businessId, created.id, token);
      }

      return created;
    }

    return this.repository.update(existingTax.id ?? 0, normalizedPayload, token);
  }

  async disableSalesTax(businessId: number, token: string): Promise<void> {
    const existingTax = await this.repository.getByBusinessId(businessId, token);
    if (!existingTax?.id) {
      return;
    }

    await this.repository.delete(existingTax.id, token);
  }

  private normalizePayload(payload: UpsertSalesTaxDto): UpsertSalesTaxDto {
    return {
      ...payload,
      description: payload.description.trim(),
      value: Number(payload.value),
    };
  }
}
