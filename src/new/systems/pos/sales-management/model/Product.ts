export class Product {
  constructor(
    public readonly id: number,
    public readonly businessId: number,
    public readonly name: string,
    public readonly price: number,
    public readonly stock: number,
  ) {}

  hasStock(): boolean {
    return this.stock > 0;
  }
}

export interface CreateProductDto {
  businessId: number;
  name: string;
  price: number;
  stock: number;
}
