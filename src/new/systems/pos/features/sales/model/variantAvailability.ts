export const isVariantAvailableForSale = (variant: {Available?: boolean | number | null}): boolean =>
  variant.Available !== false && Number(variant.Available ?? 1) !== 0;
