import { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiPlus, FiMinus, FiX } from "react-icons/fi";
import { StorefrontVariant } from "../api/CatalogStorefrontApi";

type Props = {
  open: boolean;
  productName: string;
  productImage?: string;
  productBasePrice?: number;
  variants: StorefrontVariant[];
  formatPrice: (value: number) => string;
  onClose: () => void;
  onConfirm: (selection: { variant: StorefrontVariant | null; quantity: number; buyNow: boolean }) => void;
};

export const VariantSelectionModalV2 = ({
  open,
  productName,
  productImage,
  productBasePrice,
  variants,
  formatPrice,
  onClose,
  onConfirm,
}: Props) => {
  const [selectedVariantId, setSelectedVariantId] = useState<number | "base" | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!open) return;
    setSelectedVariantId(null);
    setQuantity(1);
  }, [open]);

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId) || null,
    [selectedVariantId, variants],
  );

  const isBaseSelected = selectedVariantId === "base";
  const selectedPrice = selectedVariant
    ? selectedVariant.promotionPrice && selectedVariant.promotionPrice > 0
      ? selectedVariant.promotionPrice
      : selectedVariant.price
    : productBasePrice ?? 0;

  const canSubmit = isBaseSelected || Boolean(selectedVariant);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-3" role="dialog" aria-modal="true">
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-auto rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-2xl">
        <button type="button" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)]" onClick={onClose} aria-label="Cerrar modal">
          <FiX />
        </button>

        <div className="grid items-start gap-4 md:grid-cols-2">
          <div className="min-w-0">
            {productImage ? (
              <img className="min-h-[260px] w-full rounded-xl bg-[var(--bg-subtle)] object-cover md:min-h-[380px]" src={productImage} alt={productName} />
            ) : (
              <div className="grid min-h-[260px] w-full place-items-center rounded-xl bg-[var(--bg-subtle)] text-[var(--text-muted)] md:min-h-[380px]">Sin imagen</div>
            )}
          </div>

          <div className="grid gap-4 pt-1">
            <h3 className="text-2xl font-bold leading-tight text-[var(--text-primary)] md:text-3xl">{productName}</h3>
            <p className="text-3xl font-extrabold leading-none text-[var(--text-primary)] md:text-4xl">{formatPrice(selectedPrice)}</p>

            <button type="button" className="flex min-h-14 w-full items-center justify-between rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-2 text-left" aria-label="Seleccionar variante">
              <span>
                <strong className="text-xl font-bold leading-tight text-[var(--text-primary)]">Variantes</strong>
                <small className="block text-sm text-[var(--text-muted)]">
                  {isBaseSelected ? productName : selectedVariant ? selectedVariant.description : "Selecciona una opción"}
                </small>
              </span>
              <FiChevronDown />
            </button>

            <div className="flex flex-wrap gap-2">
              <button
                key="base"
                type="button"
                className={`min-h-10 rounded-full border px-4 text-sm font-semibold ${isBaseSelected
                  ? "border-[var(--text-primary)] bg-[var(--bg-subtle)] text-[var(--text-primary)]"
                  : "border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)]"
                  }`}
                onClick={() => setSelectedVariantId("base")}
              >
                {productName}
              </button>
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  className={`min-h-10 rounded-full border px-4 text-sm font-semibold ${variant.id === selectedVariantId
                    ? "border-[var(--text-primary)] bg-[var(--bg-subtle)] text-[var(--text-primary)]"
                    : "border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)]"
                    }`}
                  onClick={() => setSelectedVariantId(variant.id)}
                >
                  {variant.description}
                </button>
              ))}
            </div>

            <div className="grid gap-2">
              <h4 className="text-2xl font-bold leading-tight text-[var(--text-primary)]">Cantidad</h4>
              {!canSubmit ? (
                <p className="text-sm text-[var(--text-muted)]">Selecciona una opción para definir cantidad.</p>
              ) : (
                <div className="flex items-center gap-3">
                  <button className="grid h-10 w-10 place-items-center rounded-full bg-[var(--text-primary)] text-[var(--text-inverse)]" type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label="Disminuir cantidad">
                    <FiMinus />
                  </button>
                  <span className="min-w-7 text-center text-xl font-bold text-[var(--text-primary)]">{quantity}</span>
                  <button className="grid h-10 w-10 place-items-center rounded-full bg-[var(--text-primary)] text-[var(--text-inverse)]" type="button" onClick={() => setQuantity((current) => current + 1)} aria-label="Aumentar cantidad">
                    <FiPlus />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                className="min-h-12 rounded-full bg-[var(--text-primary)] px-4 text-sm font-extrabold text-[var(--text-inverse)] disabled:opacity-55"
                disabled={!canSubmit}
                onClick={() => onConfirm({ variant: selectedVariant, quantity, buyNow: true })}
              >
                Comprar ahora
              </button>
              <button
                type="button"
                className="min-h-12 rounded-full border border-[var(--border-default)] bg-[var(--bg-subtle)] px-4 text-sm font-extrabold text-[var(--text-primary)] disabled:opacity-55"
                disabled={!canSubmit}
                onClick={() => onConfirm({ variant: selectedVariant, quantity, buyNow: false })}
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
