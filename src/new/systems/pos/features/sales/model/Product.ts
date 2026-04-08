export interface SalesProductVariant {
  id: number | null;
  description: string;
  color: string | null;
  size: string | null;
  price: number | null;
  promotionPrice: number | null;
  stock: number | null;
}

export class Product {
  constructor(
    public readonly id: number,
    public readonly businessId: number,
    public readonly name: string,
    public readonly price: number,
    public readonly stock: number | null,
    public readonly categoryId: number | null,
    public readonly categoryName: string,
    public readonly color: string | null,
    public readonly image: string | null,
    public readonly images: string[],
    public readonly forSale: boolean,
    public readonly available: boolean,
    public readonly variants: SalesProductVariant[] = [],
  ) {}

  hasStock(): boolean {
    return this.stock === null || this.stock > 0;
  }

  canBeSold(): boolean {
    return this.forSale && this.available;
  }

  hasVariants(): boolean {
    return this.variants.length > 0;
  }

  getPrimaryImage(): string | null {
    if (this.image) {
      return this.image;
    }

    return this.images.find((candidate) => Boolean(candidate)) ?? null;
  }
}

export interface CreateProductDto {
  businessId: number;
  name: string;
  price: number;
  stock: number;
}
