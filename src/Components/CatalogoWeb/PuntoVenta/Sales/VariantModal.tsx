import React, { useEffect, useMemo, useState } from "react";
import { Item } from "../Model/Item";
import { Variant } from "../Model/Variant";

interface VariantModalProps {
  isOpen: boolean;
  product: Item | null;
  onClose: () => void;
  onConfirm: (variants: Variant[]) => void;
  selectedVariants?: Variant[];
  onToggleVariant?: (variant: Variant) => void;
}

const formatCurrency = (value?: number | null) => {
  if (value === undefined || value === null) return "$0.00";
  return `$${value.toFixed(2)}`;
};

export const VariantModal: React.FC<VariantModalProps> = ({
  isOpen,
  product,
  onClose,
  onConfirm,
  selectedVariants,
  onToggleVariant,
}) => {
  const [selectedVariantKeys, setSelectedVariantKeys] = useState<Set<string>>(new Set());

  const selectedVariantIds = useMemo(() => {
    if (selectedVariants && selectedVariants.length > 0) {
      return new Set(
        selectedVariants.map((variant) => (variant.Id ?? variant.Description).toString())
      );
    }

    return selectedVariantKeys;
  }, [selectedVariants, selectedVariantKeys]);

  useEffect(() => {
    if (isOpen) {
      if (selectedVariants && selectedVariants.length > 0) {
        setSelectedVariantKeys(
          new Set(selectedVariants.map((variant) => (variant.Id ?? variant.Description).toString()))
        );
      } else {
        setSelectedVariantKeys(new Set());
      }
    }
  }, [isOpen, product?.Id, selectedVariants]);

  const productImages = useMemo(() => {
    if (!product) return [] as string[];
    const images = new Set<string>();
    product.Images?.forEach((image) => image && images.add(image));
    if (product.Image) {
      images.add(product.Image);
    }
    return Array.from(images);
  }, [product]);

  const variants = useMemo(() => product?.Variants ?? [], [product?.Variants]);

  const toggleVariant = (variant: Variant) => {
    if (onToggleVariant) {
      onToggleVariant(variant);
      return;
    }

    const key = (variant.Id ?? variant.Description).toString();
    setSelectedVariantKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    const selectedList =
      selectedVariants && selectedVariants.length > 0
        ? selectedVariants
        : variants.filter((variant) =>
            selectedVariantKeys.has((variant.Id ?? variant.Description).toString())
          );

    onConfirm(selectedList);
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-[680px] flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900">Seleccionar variantes</h2>
          <button
            className="h-8 w-8 rounded-full border border-gray-200 bg-gray-50 text-sm transition hover:bg-gray-100 hover:shadow"
            onClick={onClose}
            aria-label="Cerrar"
            type="button"
          >
            ✕
          </button>
        </header>

        {productImages.length > 0 && (
          <div className="grid grid-cols-2 gap-3 px-5 pb-3 pt-4 sm:grid-cols-3">
            {productImages.map((image) => (
              <img
                key={image}
                src={image}
                alt={product.Name}
                className="h-36 w-full rounded-lg border border-gray-200 bg-gray-50 object-cover sm:h-32"
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-hidden px-5 pb-2 pt-3">
          {variants.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No hay variantes disponibles.
            </p>
          ) : (
            <ul className="flex flex-col gap-3 overflow-y-auto">
              {variants.map((variant) => {
                const isSelected = selectedVariantIds.has(
                  (variant.Id ?? variant.Description).toString()
                );
                const priceToShow =
                  variant.PromotionPrice && variant.PromotionPrice > 0
                    ? variant.PromotionPrice
                    : variant.Price;

                return (
                  <li
                    key={variant.Id ?? variant.Description}
                    className={`rounded-xl border transition ${
                      isSelected
                        ? "border-purple-600 shadow-[0_6px_18px_rgba(109,1,209,0.12)]"
                        : "border-gray-200"
                    }`}
                  >
                    <button
                      className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left"
                      onClick={() => toggleVariant(variant)}
                      type="button"
                    >
                      <div>
                        <p className="text-base font-semibold text-gray-900">{variant.Description}</p>
                        <p className="text-sm text-gray-600">{formatCurrency(priceToShow)}</p>
                      </div>
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border-2 text-sm font-bold ${
                          isSelected
                            ? "border-purple-600 bg-purple-50 text-purple-700"
                            : "border-gray-200 text-purple-700"
                        }`}
                        aria-checked={isSelected}
                      >
                        {isSelected ? "✓" : ""}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="border-t border-gray-200 px-5 pb-5 pt-4">
          <button
            className={`w-full rounded-full bg-gradient-to-r from-purple-700 to-purple-500 px-5 py-3 font-bold text-white transition ${
              selectedVariantIds.size === 0
                ? "cursor-not-allowed opacity-50"
                : "hover:-translate-y-0.5"
            }`}
            disabled={selectedVariantIds.size === 0}
            onClick={handleConfirm}
            type="button"
          >
            Agregar al carrito
          </button>
        </footer>
      </div>
    </div>
  );
};

export default VariantModal;
