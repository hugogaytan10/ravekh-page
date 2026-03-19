export class SalesTax {
  constructor(
    public readonly id: number | null,
    public readonly businessId: number,
    public readonly description: string,
    public readonly value: number,
    public readonly isPercent: boolean,
    public readonly canBeRemovedAtSale: boolean,
  ) {}

  withBusiness(taxBusinessId: number): SalesTax {
    return new SalesTax(this.id, taxBusinessId, this.description, this.value, this.isPercent, this.canBeRemovedAtSale);
  }

  update(payload: UpsertSalesTaxDto): SalesTax {
    return new SalesTax(
      this.id,
      payload.businessId,
      payload.description,
      payload.value,
      payload.isPercent,
      payload.canBeRemovedAtSale,
    );
  }

  isValid(): boolean {
    return this.description.trim().length > 0 && Number.isFinite(this.value) && this.value >= 0;
  }
}

export interface UpsertSalesTaxDto {
  businessId: number;
  description: string;
  value: number;
  isPercent: boolean;
  canBeRemovedAtSale: boolean;
}
