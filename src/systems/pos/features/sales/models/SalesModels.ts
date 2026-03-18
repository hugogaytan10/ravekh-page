export interface SalesProduct {
  id: number;
  businessId: number;
  categoryId: number | null;
  name: string;
  description: string;
  price: number;
  stock: number | null;
  barcode: string | null;
  image: string;
  available: boolean;
}

export interface SalesCategory {
  id: number;
  businessId: number;
  name: string;
  color: string;
  available: boolean;
}

export interface BusinessProfile {
  id: number;
  name: string;
  color: string;
  plan: string;
}

export interface BusinessTax {
  id: number;
  businessId: number;
  name: string;
  percentage: number;
  available: boolean;
}

export interface SalesBootstrapData {
  products: SalesProduct[];
  categories: SalesCategory[];
  business: BusinessProfile | null;
  taxes: BusinessTax[];
}
