import { Item } from "../Model/Item";
import { Variant } from "../Model/Variant";

export type VariantOption = Variant & { __internalId: number };

export type ProductExtraOption = {
  Id: number;
  Product_Id: number;
  Description: string;
  Type: "COLOR" | "TALLA" | string;
};

export type ProductExtrasByType = {
  COLOR: ProductExtraOption[];
  TALLA: ProductExtraOption[];
};

export type VariantModalState = {
  visible: boolean;
  product: Item | null;
  variants: VariantOption[];
  selectedVariantIds: Set<number>;
  selectedVariantQuantities: Map<number, number>;
  extras: ProductExtrasByType | null;
  selectedColorId: number | null;
  selectedSizeId: number | null;
  selectColor: (colorId: number) => void;
  selectSize: (sizeId: number) => void;
  canConfirm: boolean;
  toggleVariantSelection: (variantInternalId: number) => void;
  adjustVariantQuantity: (variantInternalId: number, delta: number) => void;
  confirmSelection: () => void;
  closeModal: () => void;
};
