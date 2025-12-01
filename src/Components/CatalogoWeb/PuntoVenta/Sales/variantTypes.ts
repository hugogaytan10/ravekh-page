import { Item } from "../Model/Item";
import { Variant } from "../Model/Variant";

export type VariantOption = Variant & { __internalId: number };

export type VariantModalState = {
  visible: boolean;
  product: Item | null;
  variants: VariantOption[];
  selectedVariantIds: Set<number>;
  selectedVariantQuantities: Map<number, number>;
  toggleVariantSelection: (variantInternalId: number) => void;
  adjustVariantQuantity: (variantInternalId: number, delta: number) => void;
  confirmSelection: () => void;
  closeModal: () => void;
};
