export class CatalogProduct {
  constructor(
    public readonly id: number,
    public readonly businessId: number,
    public readonly title: string,
    public readonly description: string,
    public readonly isPublished: boolean,
  ) {}

  publish(): CatalogProduct {
    return new CatalogProduct(this.id, this.businessId, this.title, this.description, true);
  }
}

export interface PublishCatalogProductDto {
  businessId: number;
  title: string;
  description: string;
}
