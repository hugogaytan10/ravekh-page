import { Variant } from "../Model/Variant";
import { VariantDraft } from "../Products/CRUDProducts/variantTypes";

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

  galleryImages: string[];
  isAvailableForSale: boolean;
  isDisplayedInStore: boolean;
  available: boolean;
  variantDrafts?: VariantDraft[];
  variantOriginals?: Variant[];
}
