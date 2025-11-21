import React, { useEffect, useMemo, useState } from "react";
import { Item } from "../Model/Item";
import { Variant } from "../Model/Variant";

export type VariantOption = Variant & { __internalId: number };

interface VariantModalProps {
  isOpen: boolean;
  product: Item | null;
  onClose: () => void;
  onConfirm: (
    selected: Array<{
      variant: VariantOption;
      quantity: number;
    }>
  ) => void;
}

export const VariantModal: React.FC<VariantModalProps> = ({
  isOpen,
  product,
  onClose,
  onConfirm,
}) => {
  const [variants, setVariants] = useState<VariantOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [quantities, setQuantities] = useState<Map<number, number>>(new Map());

  // Convertir variantes a VariantOption con __internalId
  useEffect(() => {
    if (product?.Variants) {
      const prepared = product.Variants.map((v, i) => ({
        ...v,
        __internalId: i,
      }));
      setVariants(prepared);
    }
  }, [product]);

  // Reset cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set());
      setQuantities(new Map());
    }
  }, [isOpen]);

  const toggleVariant = (internalId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(internalId) ? next.delete(internalId) : next.add(internalId);
      return next;
    });

    setQuantities((prev) => {
      const next = new Map(prev);
      if (!next.has(internalId)) next.set(internalId, 1);
      return next;
    });
  };

  const adjustQuantity = (internalId: number, delta: number) => {
    setQuantities((prev) => {
      const next = new Map(prev);
      const current = next.get(internalId) ?? 1;
      const updated = Math.max(1, current + delta);
      next.set(internalId, updated);
      return next;
    });
  };

  const handleConfirm = () => {
    const result = variants
      .filter((v) => selectedIds.has(v.__internalId))
      .map((v) => ({
        variant: v,
        quantity: quantities.get(v.__internalId) || 1,
      }));

    onConfirm(result);
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl max-h-[90vh] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">
        
        <header className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Selecciona variantes</h2>
          <button onClick={onClose} className="text-xl">✕</button>
        </header>

        <div className="px-5 py-3">
          <p className="text-base font-semibold text-gray-800">{product.Name}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {variants.map((variant) => {
            const selected = selectedIds.has(variant.__internalId);
            const qty = quantities.get(variant.__internalId) ?? 1;

            const price =
              variant.PromotionPrice && variant.PromotionPrice > 0
                ? variant.PromotionPrice
                : variant.Price ?? product.Price ?? 0;

            return (
              <div
                key={variant.__internalId}
                className={`border rounded-lg p-4 mb-3 transition ${
                  selected ? "border-purple-600 bg-purple-50" : "border-gray-200"
                }`}
              >
                <button
                  onClick={() => toggleVariant(variant.__internalId)}
                  className="w-full flex justify-between items-center"
                >
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      {variant.Description}
                    </p>
                    {variant.Stock != null && (
                      <p className="text-sm text-gray-600">Stock: {variant.Stock}</p>
                    )}
                    {variant.Barcode && (
                      <p className="text-sm text-gray-600">Código: {variant.Barcode}</p>
                    )}
                    <p className="text-sm text-gray-900 mt-1">
                      ${price.toFixed(2)}
                    </p>
                  </div>

                  <div
                    className={`h-7 w-7 flex items-center justify-center rounded-lg border-2 ${
                      selected
                        ? "border-purple-600 bg-purple-200"
                        : "border-gray-300"
                    }`}
                  >
                    {selected ? "✓" : ""}
                  </div>
                </button>

                {selected && (
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => adjustQuantity(variant.__internalId, -1)}
                      className="w-8 h-8 flex items-center justify-center bg-purple-600 text-white rounded-lg disabled:bg-gray-300"
                      disabled={qty <= 1}
                    >
                      −
                    </button>

                    <span className="text-lg font-bold">{qty}</span>

                    <button
                      onClick={() => adjustQuantity(variant.__internalId, +1)}
                      className="w-8 h-8 flex items-center justify-center bg-purple-600 text-white rounded-lg"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <footer className="border-t border-gray-200 p-5">
          <button
            onClick={handleConfirm}
            disabled={selectedIds.size === 0}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-full disabled:opacity-40"
          >
            Agregar al carrito
          </button>
        </footer>
      </div>
    </div>
  );
};
