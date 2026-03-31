import { StorefrontVariant } from "../api/CatalogStorefrontApi";

type Props = {
  open: boolean;
  productName: string;
  variants: StorefrontVariant[];
  onClose: () => void;
  onConfirm: (variant: StorefrontVariant) => void;
};

export const VariantSelectionModalV2 = ({ open, productName, variants, onClose, onConfirm }: Props) => {
  if (!open) return null;

  return (
    <div className="catalog-v2-variant-modal__backdrop" role="dialog" aria-modal="true">
      <div className="catalog-v2-variant-modal">
        <h3>{productName}</h3>
        <p>Selecciona una variante</p>
        <div className="catalog-v2-variant-modal__list">
          {variants.map((variant) => (
            <button key={variant.id} type="button" onClick={() => onConfirm(variant)}>
              <span>{variant.description}</span>
              <strong>{variant.promotionPrice && variant.promotionPrice > 0 ? variant.promotionPrice : variant.price}</strong>
            </button>
          ))}
        </div>
        <button type="button" className="catalog-v2-variant-modal__close" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};
