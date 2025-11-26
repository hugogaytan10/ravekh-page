import React, { useEffect, useMemo, useState } from "react";
import { Producto } from "./Modelo/Producto";
import { Variant } from "./PuntoVenta/Model/Variant";

interface VariantSelectionModalProps {
  product: Producto | null;
  variants: Variant[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selections: { variant: Variant; quantity: number }[]) => void;
  existingVariantQuantities?: Record<number, number>;
}

const formatPrice = (variant: Variant, fallbackPrice?: number) => {
  const price = variant.PromotionPrice ?? variant.Price ?? fallbackPrice ?? 0;
  return price.toFixed(2);
};

export const VariantSelectionModal: React.FC<VariantSelectionModalProps> = ({
  product,
  variants,
  isOpen,
  onClose,
  onConfirm,
  existingVariantQuantities,
}) => {
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const remainingStock = useMemo(() => {
    const currentCartQuantities = existingVariantQuantities ?? {};

    return variants.reduce<Record<number, number | null>>((acc, variant) => {
      const variantId = variant.Id ?? -1;
      const variantStock = variant.Stock;

      if (variantStock == null) {
        acc[variantId] = null;
        return acc;
      }

      const inCart = currentCartQuantities[variantId] ?? 0;
      acc[variantId] = Math.max(variantStock - inCart, 0);
      return acc;
    }, {});
  }, [existingVariantQuantities, variants]);

  useEffect(() => {
    if (isOpen) {
      setQuantities(() => {
        if (!variants.length) return {};

        const [firstVariant, ...rest] = variants;
        const initial: Record<number, number> = {};

        const firstId = firstVariant.Id;
        if (firstId != null) {
          const firstLimit = remainingStock[firstId] ?? Infinity;
          initial[firstId] = firstLimit > 0 ? 1 : 0;
        }

        rest.forEach((variant) => {
          if (variant.Id != null) {
            initial[variant.Id] = 0;
          }
        });

        return initial;
      });
    }
  }, [isOpen, variants, remainingStock]);

  const hasSelection = useMemo(
    () => variants.some((variant) => (quantities[variant.Id ?? -1] ?? 0) > 0),
    [quantities, variants]
  );

  const handleQuantityChange = (variant: Variant, delta: number) => {
    if (variant.Id == null) return;

    const limit = remainingStock[variant.Id] ?? Infinity;

    setQuantities((prev) => {
      const current = prev[variant.Id ?? -1] ?? 0;
      const next = Math.min(Math.max(0, current + delta), limit);

      return {
        ...prev,
        [variant.Id ?? -1]: next,
      };
    });
  };

  const handleConfirm = () => {
    const selections = variants
      .map((variant) => ({ variant, quantity: quantities[variant.Id ?? -1] ?? 0 }))
      .filter(({ quantity }) => quantity > 0);

    if (selections.length > 0) {
      onConfirm(selections);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl max-h-[90vh] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Selecciona una variante</h2>
          <button onClick={onClose} className="text-xl" aria-label="Cerrar selector de variantes">
            ✕
          </button>
        </header>

        <div className="px-5 py-3">
          <p className="text-base font-semibold text-gray-800">{product.Name}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {variants.map((variant) => {
            const priceLabel = formatPrice(variant, product.Price);
            const quantity = quantities[variant.Id ?? -1] ?? 0;
            const available = remainingStock[variant.Id ?? -1];
            const isOutOfStock = available !== undefined && available !== null && available <= 0;

            return (
              <div
                key={variant.Id}
                className={`border rounded-lg p-4 mb-3 transition ${
                  quantity > 0 ? "border-purple-600 bg-purple-50" : "border-gray-200"
                } ${isOutOfStock ? "opacity-60" : ""}`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-base font-semibold text-gray-900">{variant.Description}</p>
                    {available !== undefined && available !== null && (
                      <p className="text-sm text-gray-600">Stock restante: {available}</p>
                    )}
                    <p className="text-sm text-gray-900 mt-1">${priceLabel}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(variant, -1)}
                      className="w-9 h-9 flex items-center justify-center bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50"
                      disabled={quantity <= 0}
                      aria-label={`Reducir cantidad de ${variant.Description}`}
                    >
                      −
                    </button>
                    <span className="min-w-[1.5rem] text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(variant, 1)}
                      className="w-9 h-9 flex items-center justify-center bg-purple-600 text-white rounded-lg disabled:opacity-50"
                      disabled={isOutOfStock || (available != null && quantity >= available)}
                      aria-label={`Aumentar cantidad de ${variant.Description}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-200 p-5">
          <button
            onClick={handleConfirm}
            disabled={!hasSelection}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-full disabled:opacity-40"
          >
            Agregar seleccionados
          </button>
        </div>
      </div>
    </div>
  );
};
