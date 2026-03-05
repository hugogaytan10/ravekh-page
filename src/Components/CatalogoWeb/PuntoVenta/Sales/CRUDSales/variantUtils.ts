import { Variant } from '../../Model/Variant';
import { VariantDraft, createEmptyVariantDraft } from './variantTypes';

const parseNumberOrNull = (value: string): number | null => {
  const trimmed = value.trim();
  if (trimmed === '') {
    return null;
  }
  const parsed = Number(trimmed.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeString = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const resolveColor = (color?: string, fallback?: string) => {
  const normalized = color ? normalizeString(color) : undefined;
  if (normalized) {
    return normalized;
  }

  if (fallback) {
    const fallbackNormalized = normalizeString(fallback);
    if (fallbackNormalized) {
      return fallbackNormalized;
    }
  }

  return undefined;
};

export const draftsToVariants = (
  drafts: VariantDraft[],
  defaultColor?: string,
): Variant[] =>
  drafts
    .map((draft): Variant | null => {
      const description = draft.description.trim();
      if (!description) {
        return null;
      }

      const variant: Variant = {
        Description: description,
      };

      if (typeof draft.id === 'number') {
        variant.Id = draft.id;
      }

      const barcode = normalizeString(draft.barcode);
      if (barcode) {
        variant.Barcode = barcode;
      }

      const color = resolveColor(draft.color, defaultColor);
      if (color) {
        variant.Color = color;
      }

      const price = parseNumberOrNull(draft.price);
      if (price !== null) {
        variant.Price = price;
      }

      const promotionPrice = parseNumberOrNull(draft.promotionPrice);
      if (promotionPrice !== null) {
        variant.PromotionPrice = promotionPrice;
      }

      const costPerItem = parseNumberOrNull(draft.costPerItem);
      if (costPerItem !== null) {
        variant.CostPerItem = costPerItem;
      }

      const stock = parseNumberOrNull(draft.stock);
      if (stock !== null) {
        variant.Stock = stock;
      }

      const minStock = parseNumberOrNull(draft.minStock);
      if (minStock !== null) {
        variant.MinStock = minStock;
      }

      const optStock = parseNumberOrNull(draft.optStock);
      if (optStock !== null) {
        variant.OptStock = optStock;
      }

      const expDate = normalizeString(draft.expDate);
      if (expDate) {
        variant.ExpDate = expDate;
      }

      return variant;
    })
    .filter((variant): variant is Variant => variant !== null);

const valueToString = (value?: string | number | null): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? `${value}` : '';
  }

  return value ?? '';
};

export const variantsToDrafts = (
  variants: Variant[],
  defaultColor?: string,
): VariantDraft[] =>
  variants.map(variant => {
    const draft = createEmptyVariantDraft(defaultColor ?? valueToString(variant.Color));
    draft.key = `${variant.Id ?? variant.Barcode ?? draft.key}`;
    draft.id = variant.Id;
    draft.description = valueToString(variant.Description);
    draft.barcode = valueToString(variant.Barcode);
    draft.price = valueToString(variant.Price);
    draft.promotionPrice = valueToString(variant.PromotionPrice);
    draft.costPerItem = valueToString(variant.CostPerItem);
    draft.stock = valueToString(variant.Stock);
    draft.minStock = valueToString(variant.MinStock);
    draft.optStock = valueToString(variant.OptStock);
    draft.expDate = valueToString(variant.ExpDate);
    return draft;
  });

export const syncDraftColors = (
  drafts: VariantDraft[],
  color?: string,
): VariantDraft[] => {
  if (!color) {
    return drafts;
  }

  let changed = false;
  const nextDrafts = drafts.map(draft => {
    if (draft.color === color) {
      return draft;
    }

    changed = true;
    return { ...draft, color };
  });

  return changed ? nextDrafts : drafts;
};

const comparableFields: (keyof Variant)[] = [
  'Description',
  'Barcode',
  'Color',
  'Price',
  'PromotionPrice',
  'CostPerItem',
  'Stock',
  'ExpDate',
  'MinStock',
  'OptStock',
];

const normalizeComparableValue = (value: string | number | null | undefined) => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return value;
};

const hasVariantChanged = (current: Variant, next: Variant) =>
  comparableFields.some(field =>
    normalizeComparableValue(current[field]) !== normalizeComparableValue(next[field])
  );

export type VariantChangeSet = {
  toCreate: Variant[];
  toUpdate: Variant[];
  toDelete: number[];
};

export const calculateVariantChanges = (
  drafts: VariantDraft[],
  originals: Variant[],
  defaultColor?: string,
): VariantChangeSet => {
  const normalizedDrafts = draftsToVariants(drafts, defaultColor);
  const originalsById = new Map<number, Variant>();

  originals.forEach(variant => {
    if (typeof variant.Id === 'number') {
      originalsById.set(variant.Id, variant);
    }
  });

  const seenIds = new Set<number>();
  const toCreate: Variant[] = [];
  const toUpdate: Variant[] = [];

  normalizedDrafts.forEach(variant => {
    if (typeof variant.Id === 'number') {
      seenIds.add(variant.Id);
      const original = originalsById.get(variant.Id);
      if (!original || hasVariantChanged(original, variant)) {
        toUpdate.push(variant);
      }
    } else {
      toCreate.push(variant);
    }
  });

  const toDelete = originals
    .filter(variant => typeof variant.Id === 'number' && !seenIds.has(variant.Id))
    .map(variant => variant.Id as number);

  return { toCreate, toUpdate, toDelete };
};
