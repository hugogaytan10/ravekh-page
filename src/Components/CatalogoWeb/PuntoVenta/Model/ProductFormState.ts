export type ProductFormMode = "add" | "edit";

export interface ProductFormState {
  mode: ProductFormMode;
  productId?: number;
  productName: string;
  price: string;
  cost: string;
  barcode: string;
  stock: string;
  minStock: string;
  optStock: string;
  promoPrice: string;
  description: string;
  unitType: string;
  colorSelected: string;
  image: string | null;
  isAvailableForSale: boolean;
  isDisplayedInStore: boolean;
}
