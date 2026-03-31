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
  onConfirm: (variant: StorefrontVariant, quantity: number, buyNow: boolean) => void;
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
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
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

  const selectedPrice = selectedVariant
    ? selectedVariant.promotionPrice && selectedVariant.promotionPrice > 0
      ? selectedVariant.promotionPrice
      : selectedVariant.price
    : productBasePrice ?? 0;

  const canSubmit = Boolean(selectedVariant);

  if (!open) return null;

  return (
    <div className="catalog-v2-variant-modal__backdrop" role="dialog" aria-modal="true">
      <div className="catalog-v2-variant-modal">
        <button type="button" className="catalog-v2-variant-modal__icon-close" onClick={onClose} aria-label="Cerrar modal">
          <FiX />
        </button>

        <div className="catalog-v2-variant-modal__layout">
          <div className="catalog-v2-variant-modal__media">
            {productImage ? <img src={productImage} alt={productName} /> : <div>Sin imagen</div>}
          </div>

          <div className="catalog-v2-variant-modal__content">
            <h3>{productName}</h3>
            <p className="catalog-v2-variant-modal__price">{formatPrice(selectedPrice)}</p>

            <button type="button" className="catalog-v2-variant-modal__dropdown" aria-label="Seleccionar variante">
              <span>
                <strong>Variantes</strong>
                <small>{selectedVariant ? selectedVariant.description : "Selecciona una opción"}</small>
              </span>
              <FiChevronDown />
            </button>

            <div className="catalog-v2-variant-modal__chips">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  className={variant.id === selectedVariantId ? "is-selected" : ""}
                  onClick={() => setSelectedVariantId(variant.id)}
                >
                  {variant.description}
                </button>
              ))}
            </div>

            <div className="catalog-v2-variant-modal__quantity">
              <h4>Cantidad</h4>
              {!selectedVariant ? (
                <p>Selecciona una variante para definir cantidad.</p>
              ) : (
                <div>
                  <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label="Disminuir cantidad">
                    <FiMinus />
                  </button>
                  <span>{quantity}</span>
                  <button type="button" onClick={() => setQuantity((current) => current + 1)} aria-label="Aumentar cantidad">
                    <FiPlus />
                  </button>
                </div>
              )}
            </div>

            <div className="catalog-v2-variant-modal__actions">
              <button type="button" className="primary" disabled={!canSubmit} onClick={() => selectedVariant && onConfirm(selectedVariant, quantity, true)}>
                Comprar ahora
              </button>
              <button type="button" className="secondary" disabled={!canSubmit} onClick={() => selectedVariant && onConfirm(selectedVariant, quantity, false)}>
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
