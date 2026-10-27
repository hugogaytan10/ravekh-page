import type { StorefrontProductExtra, StorefrontVariant } from "../api/CatalogStorefrontApi";
const normalize = (value?: string | null) => value?.trim().toLowerCase() ?? "";

export const variantMatchesColor = (variant: StorefrontVariant, color: StorefrontProductExtra | null) =>
  !normalize(variant.color) || Boolean(color && normalize(variant.color) === normalize(color.description));

export const selectVariantForColor = (
  variants: StorefrontVariant[], color: StorefrontProductExtra | null, current: number | "base" | null,
): number | "base" | null => {
  if (color) {
    const matches = variants.filter(variant => normalize(variant.color || variant.description) === normalize(color.description));
    if (matches.length === 1) return matches[0].id;
  }
  if (!current || current === "base") return current;
  const selected = variants.find(variant => variant.id === current);
  return selected && variantMatchesColor(selected, color) ? current : null;
};
