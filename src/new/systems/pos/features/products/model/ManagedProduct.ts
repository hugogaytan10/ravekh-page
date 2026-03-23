export interface ProductVariant {
  id?: number;
  productId?: number;
  description: string;
  barcode?: string | null;
  color?: string | null;
  size?: string | null;
  price?: number | null;
  promotionPrice?: number | null;
  costPerItem?: number | null;
  stock?: number | null;
  expDate?: string | null;
  minStock?: number | null;
  optStock?: number | null;
}

export interface SaveManagedProductDto {
  id?: number;
  businessId: number;
  categoryId?: number | null;
  name: string;
  description: string;
  color?: string | null;
  forSale: boolean;
  showInStore: boolean;
  available: boolean;
  volume?: boolean;
  image?: string;
  images?: string[];
  barcode?: string | null;
  price?: number | null;
  promotionPrice?: number | null;
  costPerItem?: number | null;
  stock?: number | null;
  expDate?: string | null;
  minStock?: number | null;
  optStock?: number | null;
  quantity?: number | null;
  variants?: ProductVariant[];
}

export class ManagedProduct {
  constructor(
    public readonly id: number,
    public readonly businessId: number,
    public readonly name: string,
    public readonly description: string,
    public readonly color: string | null,
    public readonly forSale: boolean,
    public readonly showInStore: boolean,
    public readonly available: boolean,
    public readonly volume: boolean,
    public readonly categoryId: number | null,
    public readonly price: number | null,
    public readonly promotionPrice: number | null,
    public readonly costPerItem: number | null,
    public readonly stock: number | null,
    public readonly expDate: string | null,
    public readonly minStock: number | null,
    public readonly optStock: number | null,
    public readonly quantity: number | null,
    public readonly image: string | null,
    public readonly images: string[],
    public readonly barcode: string | null,
    public readonly variants: ProductVariant[],
  ) {}

  toSaveDto(): SaveManagedProductDto {
    return {
      id: this.id,
      businessId: this.businessId,
      categoryId: this.categoryId,
      name: this.name,
      description: this.description,
      color: this.color,
      forSale: this.forSale,
      showInStore: this.showInStore,
      available: this.available,
      volume: this.volume,
      image: this.image ?? undefined,
      images: this.images,
      barcode: this.barcode,
      price: this.price,
      promotionPrice: this.promotionPrice,
      costPerItem: this.costPerItem,
      stock: this.stock,
      expDate: this.expDate,
      minStock: this.minStock,
      optStock: this.optStock,
      quantity: this.quantity,
      variants: this.variants,
    };
  }
}
