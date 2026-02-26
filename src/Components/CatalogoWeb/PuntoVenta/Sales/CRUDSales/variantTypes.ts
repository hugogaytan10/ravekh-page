export type VariantDraft = {
  key: string;
  id?: number;
  description: string;
  barcode: string;
  color: string;
  price: string;
  promotionPrice: string;
  costPerItem: string;
  stock: string;
  minStock: string;
  optStock: string;
  expDate: string;
};

export const createEmptyVariantDraft = (color = ''): VariantDraft => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  id: undefined,
  description: '',
  barcode: '',
  color,
  price: '',
  promotionPrice: '',
  costPerItem: '',
  stock: '',
  minStock: '',
  optStock: '',
  expDate: '',
});

export type VariantDraftEditableField = Exclude<keyof VariantDraft, 'key' | 'id'>;
