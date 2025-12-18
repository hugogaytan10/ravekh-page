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
  storeColor?: string | null;
}

export const getBaseVariantKey = (productId?: number) =>
  productId != null ? -(productId + 1000000) : -1000000;

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
  storeColor,
}) => {
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [stockWarnings, setStockWarnings] = useState<Record<number, string | null>>({});

  const accentColor = product?.Color || storeColor || "#6d28d9";

  const baseVariant = useMemo<
    | {
        key: number;
        variant: Variant;
        isBase: true;
      }
    | null
  >(() => {
    if (!product) return null;

    const key = getBaseVariantKey(product.Id);

    return {
      key,
      variant: {
        Id: undefined,
        Description: product.Name,
        Price: product.Price,
        PromotionPrice: product.PromotionPrice,
        Stock: product.Stock,
        Barcode: product.Barcode,
        Color: product.Color,
      },
      isBase: true,
    };
  }, [product]);

  const variantEntries = useMemo(
    () => [
      ...(baseVariant ? [baseVariant] : []),
      ...variants.map((variant, index) => ({
        key: variant.Id ?? -(index + 1),
        variant,
        isBase: false as const,
      })),
    ],
    [baseVariant, variants]
  );

  const remainingStock = useMemo(() => {
    const currentCartQuantities = existingVariantQuantities ?? {};

    return variantEntries.reduce<Record<number, number | null>>((acc, entry) => {
      const variantId = entry.key;
      const variantStock = entry.isBase ? product?.Stock : entry.variant.Stock;

      if (variantStock == null) {
        acc[variantId] = null;
        return acc;
      }

      const inCart = entry.isBase
        ? currentCartQuantities[variantId] ?? 0
        : currentCartQuantities[entry.variant.Id ?? -1] ?? 0;
      acc[variantId] = Math.max(variantStock - inCart, 0);
      return acc;
    }, {});
  }, [existingVariantQuantities, product, variantEntries]);

  useEffect(() => {
    if (isOpen) {
      setQuantities(() => {
        if (!variantEntries.length) return {};

        const [firstVariant, ...rest] = variantEntries;
        const initial: Record<number, number> = {};

        const firstKey = firstVariant.key;
        const firstLimit = remainingStock[firstKey] ?? Infinity;
        initial[firstKey] = firstLimit > 0 ? 1 : 0;

        rest.forEach((entry) => {
          initial[entry.key] = 0;
        });

        return initial;
      });
      setStockWarnings({});
    }
  }, [isOpen, variantEntries, remainingStock]);

  const hasSelection = useMemo(
    () =>
      variantEntries.some((entry) => {
        const selectedQty = quantities[entry.key] ?? 0;
        return selectedQty > 0;
      }),
    [quantities, variantEntries]
  );

  const handleQuantityChange = (variantKey: number, delta: number) => {
    const limit = remainingStock[variantKey] ?? Infinity;

    setQuantities((prev) => {
      const current = prev[variantKey] ?? 0;
      const next = Math.min(Math.max(0, current + delta), limit);

      return {
        ...prev,
        [variantKey]: next,
      };
    });
    setStockWarnings((prev) => ({ ...prev, [variantKey]: null }));
  };

  const handleQuantityInput = (variantKey: number, value: string) => {
    const limit = remainingStock[variantKey];
    let parsed = Math.floor(Number(value));
    if (Number.isNaN(parsed)) parsed = 0;
    parsed = Math.max(parsed, 0);

    let warning: string | null = null;
    let next = parsed;

    if (limit != null && parsed > limit) {
      next = limit;
      warning = "Has alcanzado el límite de stock disponible.";
    }

    setQuantities((prev) => ({ ...prev, [variantKey]: next }));
    setStockWarnings((prev) => ({ ...prev, [variantKey]: warning }));
  };

  const handleConfirm = () => {
    const selections = variantEntries
      .map((entry) => ({ variant: entry.variant, quantity: quantities[entry.key] ?? 0 }))
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
          {variantEntries.map((entry) => {
            const priceLabel = formatPrice(entry.variant, product.Price);
            const quantity = quantities[entry.key] ?? 0;
            const available = remainingStock[entry.key];
            const isOutOfStock = available !== undefined && available !== null && available <= 0;
            const selectionBackground = accentColor.startsWith("#")
              ? `${accentColor}20`
              : "rgba(0, 0, 0, 0.04)";
            const selectedStyles = quantity > 0
              ? {
                  borderColor: accentColor,
                  backgroundColor: selectionBackground,
                }
              : undefined;

            return (
              <div
                key={entry.key}
                className={`border rounded-lg p-4 mb-3 transition ${
                  isOutOfStock ? "opacity-60" : ""
                }`}
                style={selectedStyles}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-base font-semibold text-gray-900">{entry.variant.Description}</p>
                    {entry.isBase && (
                      <p className="text-xs text-gray-600">Producto base</p>
                    )}
                    {available !== undefined && available !== null && (
                      <p className="text-sm text-gray-600">Stock restante: {available}</p>
                    )}
                    <p className="text-sm text-gray-900 mt-1">${priceLabel}</p>
                  </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(entry.key, -1)}
                    className="w-9 h-9 flex items-center justify-center bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50"
                    disabled={quantity <= 0}
                    aria-label={`Reducir cantidad de ${entry.variant.Description}`}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={available ?? undefined}
                    value={quantity}
                    onChange={(e) => handleQuantityInput(entry.key, e.target.value)}
                    className="w-16 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label={`Cantidad para ${entry.variant.Description}`}
                  />
                  <button
                    onClick={() => handleQuantityChange(entry.key, 1)}
                    className="w-9 h-9 flex items-center justify-center text-white rounded-lg disabled:opacity-50"
                    style={{ backgroundColor: accentColor }}
                    disabled={isOutOfStock || (available != null && quantity >= available)}
                    aria-label={`Aumentar cantidad de ${entry.variant.Description}`}
                  >
                    +
                  </button>
                </div>
                {stockWarnings[entry.key] && (
                  <p className="text-xs text-red-600 mt-1 text-right">{stockWarnings[entry.key]}</p>
                )}
              </div>
            </div>
          );
        })}
        </div>

        <div className="border-t border-gray-200 p-5">
          <button
            onClick={handleConfirm}
            disabled={!hasSelection}
            className="w-full text-white font-bold py-3 rounded-full disabled:opacity-40"
            style={{ backgroundColor: accentColor }}
          >
            Agregar seleccionados
          </button>
        </div>
      </div>
    </div>
  );
};
