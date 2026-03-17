export interface ProductVariant {
  id?: number;
  barcode?: string | null;
  productId?: number;
  description: string;
  color?: string | null;
  price?: number | null;
  promotionPrice?: number | null;
  costPerItem?: number | null;
  stock?: number | null;
}

export interface Product {
  id?: number;
  businessId: number;
  categoryId?: number | null;
  name: string;
  description: string;
  forSale: boolean;
  showInStore: boolean;
  available: boolean;
  image?: string;
  images?: string[];
  barcode?: string | null;
  price?: number | null;
  costPerItem?: number | null;
  stock?: number | null;
  variants?: ProductVariant[];
}
