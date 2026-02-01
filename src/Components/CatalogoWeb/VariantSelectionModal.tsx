import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Producto } from "./Modelo/Producto";
import { Variant } from "./PuntoVenta/Model/Variant";
import trash from "../../assets/trash.svg";

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

const formatAmount = (value?: number) => (value ?? 0).toFixed(2);

export const VariantSelectionModal: React.FC<VariantSelectionModalProps> = ({
  product,
  variants,
  isOpen,
  onClose,
  onConfirm,
  existingVariantQuantities,
}) => {
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [stockWarnings, setStockWarnings] = useState<Record<number, string | null>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [variantsOpen, setVariantsOpen] = useState(true);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const scrollRestoreRef = useRef(0);
  const navigate = useNavigate();

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

        const initial: Record<number, number> = {};
        variantEntries.forEach((entry) => {
          initial[entry.key] = 0;
        });

        if (variants.length === 0) {
          const [firstVariant] = variantEntries;
          if (firstVariant) {
            const firstKey = firstVariant.key;
            const firstLimit = remainingStock[firstKey] ?? Infinity;
            initial[firstKey] = firstLimit > 0 ? 1 : 0;
          }
        }

        return initial;
      });
      setStockWarnings({});
      setVariantsOpen(true);
      setActiveIndex(0);
      if (sliderRef.current) {
        sliderRef.current.scrollTo({ left: 0 });
      }
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
      .filter((entry) => (variants.length > 0 ? !entry.isBase : true))
      .map((entry) => ({ variant: entry.variant, quantity: quantities[entry.key] ?? 0 }))
      .filter(({ quantity }) => quantity > 0);

    if (selections.length > 0) {
      onConfirm(selections);
      return;
    }

    if (baseVariant) {
      onConfirm([{ variant: baseVariant.variant, quantity: 1 }]);
    }
  };

  const handleBuyNow = () => {
    handleConfirm();
    navigate("/catalogo/pedido");
  };

  const displayEntries = variants.length > 0
    ? variantEntries.filter((entry) => !entry.isBase)
    : variantEntries;
  const canConfirm = hasSelection || Boolean(baseVariant);

  const images = useMemo(() => {
    if (!product) return [];
    const list = product.Images?.filter(Boolean) ?? [];
    if (product.Image && !list.includes(product.Image)) {
      return [product.Image, ...list];
    }
    return list;
  }, [product?.Image, product?.Images]);
  const primaryImage = product?.Image || images[0] || "";
  const showDots = images.length > 1;

  const handleSliderScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, clientWidth } = sliderRef.current;
    const index = Math.round(scrollLeft / clientWidth);
    setActiveIndex(index);
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 md:items-center md:p-6">
      <div className="w-full max-w-xl md:max-w-5xl">
        <div className="flex justify-center pt-6 md:hidden">
          <button
            onClick={onClose}
            className="h-12 w-12 rounded-full bg-[var(--bg-surface)] text-[var(--text-primary)] flex items-center justify-center shadow-sm"
            aria-label="Cerrar vista rápida"
          >
            <span className="text-2xl leading-none">⌄</span>
          </button>
        </div>

        <div
          ref={sheetRef}
          className="mt-4 max-h-[88vh] overflow-y-auto bg-[var(--bg-surface)] rounded-t-[32px] pb-10 shadow-xl md:mt-0 md:rounded-2xl md:pb-12"
        >
          <button
            type="button"
            onClick={onClose}
            className="hidden md:flex absolute right-6 top-6 h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)]"
            aria-label="Cerrar vista rápida"
          >
            ×
          </button>

          <div className="px-6 pt-6 pb-4 md:px-8 md:pt-8 md:pb-8">
            <div className="md:grid md:grid-cols-[1.1fr,1fr] md:gap-10 md:items-start">
              <div>
                <div className="w-full overflow-hidden rounded-2xl bg-[var(--bg-subtle)]">
                  {primaryImage ? (
                    <div className="aspect-[4/5] w-full">
                      <div
                        ref={sliderRef}
                        onScroll={handleSliderScroll}
                        className="h-full flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
                      >
                        {images.map((src, index) => (
                          <div key={src + index} className="min-w-full h-full snap-center">
                            <img
                              src={src}
                              alt={`${product.Name} ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[4/5] w-full" />
                  )}
                </div>

                {showDots && (
                  <div className="flex items-center gap-2 pt-4">
                    {images.map((_, index) => (
                      <span
                        key={index}
                        className={`h-3 w-3 rounded-full ${
                          index === activeIndex
                            ? "bg-[var(--text-primary)]"
                            : "bg-[var(--border-default)]"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 md:pt-0">
                <h2 className="text-2xl font-semibold text-[var(--text-primary)] md:text-left">
                  {product.Name}
                </h2>

                <div className="pt-3">
                  {product.PromotionPrice ? (
                    <div className="flex items-end gap-3">
                      <span className="text-base text-[var(--text-muted)] line-through">
                        ${formatAmount(product.Price)}
                      </span>
                      <span className="text-2xl font-semibold text-[var(--text-primary)]">
                        ${formatAmount(product.PromotionPrice)}
                      </span>
                    </div>
                  ) : (
                    <div className="text-2xl font-semibold text-[var(--text-primary)]">
                      ${formatAmount(product.Price)}
                    </div>
                  )}
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      scrollRestoreRef.current = sheetRef.current?.scrollTop ?? 0;
                      setVariantsOpen((prev) => !prev);
                      requestAnimationFrame(() => {
                        if (sheetRef.current) {
                          sheetRef.current.scrollTop = scrollRestoreRef.current;
                        }
                      });
                    }}
                    className="w-full flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-left"
                    aria-expanded={variantsOpen}
                  >
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Variantes</p>
                      <p className="text-xs text-[var(--text-muted)]">Selecciona una opción</p>
                    </div>
                    <span
                      className={`text-[var(--text-secondary)] transition-transform ${
                        variantsOpen ? "rotate-180" : ""
                      }`}
                    >
                      ▾
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-200 ease-out ${
                      variantsOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="pt-4">
                      <div className="flex flex-wrap gap-2">
                        {displayEntries.length === 0 && (
                          <span className="text-sm text-[var(--text-muted)]">
                            No hay variantes disponibles.
                          </span>
                        )}
                        {displayEntries.map((entry) => {
                          const quantity = quantities[entry.key] ?? 0;
                          const selected = quantity > 0;
                          const available = remainingStock[entry.key];
                          const isOutOfStock =
                            available !== undefined && available !== null && available <= 0;

                          return (
                            <button
                              key={entry.key}
                              type="button"
                              onClick={() =>
                                handleQuantityChange(entry.key, selected ? -quantity : 1)
                              }
                              disabled={isOutOfStock}
                              className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                                selected
                                  ? "bg-[var(--action-primary)] text-white border-[var(--action-primary)]"
                                  : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)]"
                              } ${isOutOfStock ? "opacity-50" : ""}`}
                            >
                              {entry.variant.Description}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-6">
                        <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                          Cantidad
                        </p>
                        {displayEntries.filter((entry) => (quantities[entry.key] ?? 0) > 0)
                          .length === 0 ? (
                          <p className="text-sm text-[var(--text-muted)]">
                            Selecciona una variante para definir cantidad.
                          </p>
                        ) : (
                          displayEntries
                            .filter((entry) => (quantities[entry.key] ?? 0) > 0)
                            .map((entry) => (
                              <div key={entry.key} className="py-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-[var(--text-primary)]">
                                    {entry.variant.Description}
                                  </span>
                                  <div className="flex items-center gap-3">
                                    {(quantities[entry.key] ?? 0) > 1 ? (
                                      <button
                                        onClick={() => handleQuantityChange(entry.key, -1)}
                                        className="w-9 h-9 rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)] text-lg disabled:opacity-40"
                                        aria-label={`Reducir cantidad de ${entry.variant.Description}`}
                                      >
                                        −
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleQuantityChange(entry.key, -1)}
                                        className="w-9 h-9 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center"
                                        aria-label={`Eliminar ${entry.variant.Description}`}
                                      >
                                        <img src={trash} alt="Eliminar" className="w-4 h-4" />
                                      </button>
                                    )}
                                    <input
                                      type="number"
                                      min={0}
                                      max={remainingStock[entry.key] ?? undefined}
                                      inputMode="numeric"
                                      value={quantities[entry.key] ?? 0}
                                      onChange={(e) =>
                                        handleQuantityInput(entry.key, e.target.value)
                                      }
                                      className="w-14 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-2 py-1 text-center text-sm font-semibold text-[var(--text-primary)]"
                                      aria-label={`Cantidad de ${entry.variant.Description}`}
                                    />
                                    <button
                                      onClick={() => handleQuantityChange(entry.key, 1)}
                                      className="w-9 h-9 rounded-full bg-[var(--action-primary)] text-white text-lg disabled:opacity-40"
                                      disabled={
                                        remainingStock[entry.key] != null &&
                                        (quantities[entry.key] ?? 0) >=
                                          (remainingStock[entry.key] ?? 0)
                                      }
                                      aria-label={`Aumentar cantidad de ${entry.variant.Description}`}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                                {stockWarnings[entry.key] && (
                                  <p className="text-xs text-[var(--state-warning)] mt-1">
                                    {stockWarnings[entry.key]}
                                  </p>
                                )}
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex flex-col gap-3 md:flex-row">
                    <button
                      onClick={handleBuyNow}
                      className="w-full rounded-full py-3 text-sm font-semibold text-[var(--text-inverse)] bg-[var(--action-primary)] disabled:opacity-40"
                      disabled={!canConfirm}
                    >
                      Comprar ahora
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="w-full rounded-full py-3 text-sm font-semibold bg-[var(--action-disabled)] text-[var(--text-primary)] disabled:opacity-40"
                      disabled={!canConfirm}
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
