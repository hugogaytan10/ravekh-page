import { memo, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { StorefrontProduct } from "../model/CatalogStorefrontModels";

type ProductGridProps = {
  products: StorefrontProduct[];
  onAdd: (product: StorefrontProduct) => void;
  onRemove: (product: StorefrontProduct) => void;
  onDecrement: (product: StorefrontProduct) => void;
  existingQuantities: Record<number, number>;
  formatPrice: (value: number) => string;
  phone: string | null;
};

const CartIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="9" cy="20" r="1.6" />
    <circle cx="18" cy="20" r="1.6" />
    <path d="M3 4h2l2.2 10.3a2 2 0 0 0 2 1.7h7.8a2 2 0 0 0 2-1.6L21 7H7.2" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M4 7h16" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M7 7l1 12a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17 7" />
  </svg>
);

const ProductCard = memo(({
  product,
  onAdd,
  onRemove,
  onDecrement,
  existingQuantities,
  formatPrice,
  phone,
}: {
  product: StorefrontProduct;
  onAdd: (product: StorefrontProduct) => void;
  onRemove: (product: StorefrontProduct) => void;
  onDecrement: (product: StorefrontProduct) => void;
  existingQuantities: Record<number, number>;
  formatPrice: (value: number) => string;
  phone: string | null;
}) => {
  const [added, setAdded] = useState(false);
  const qty = existingQuantities[product.id] ?? 0;
  const hasInCart = qty > 0;

  const handleAdd = () => {
    onAdd(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  const overlayActive = hasInCart || added;
  const formattedBase = useMemo(() => formatPrice(product.price), [formatPrice, product.price]);
  const formattedPromo = useMemo(
    () => (product.promotionPrice && product.promotionPrice > 0 ? formatPrice(product.promotionPrice) : null),
    [formatPrice, product.promotionPrice],
  );

  return (
    <article className="catalog-v2-grid__card group">
      <div className="catalog-v2-grid__media">
        <NavLink to={`/catalogo/producto/${product.id}/${phone ?? ""}`} className="catalog-v2-grid__link">
          {product.image ? <img src={product.image} alt={product.name} loading="lazy" decoding="async" /> : <div className="catalog-v2-grid__placeholder">Sin imagen</div>}
        </NavLink>

        <div className={`catalog-v2-grid__overlay ${overlayActive ? "is-static" : ""}`}>
          <div>
            <p>{product.name}</p>
            {formattedPromo ? (
              <div className="catalog-v2-grid__prices">
                <span>{formattedPromo}</span>
                <small>{formattedBase}</small>
              </div>
            ) : (
              <span>{formattedBase}</span>
            )}
          </div>
          <button type="button" onClick={handleAdd} aria-label={`Agregar ${product.name}`}><CartIcon /></button>
        </div>
      </div>

      <div className="catalog-v2-grid__meta">
        <h2>{product.name}</h2>
        <div className="catalog-v2-grid__bottom">
          {formattedPromo ? (
            <div className="catalog-v2-grid__prices">
              <span>{formattedPromo}</span>
              <small>{formattedBase}</small>
            </div>
          ) : (
            <p>{formattedBase}</p>
          )}
          <button type="button" onClick={handleAdd} aria-label={`Agregar ${product.name}`}><CartIcon /></button>
        </div>
      </div>

      {overlayActive ? (
        <div className="catalog-v2-grid__qty">
          {qty > 1 ? (
            <button type="button" onClick={() => onDecrement(product)} aria-label={`Quitar una unidad de ${product.name}`}>−</button>
          ) : (
            <button type="button" onClick={() => onRemove(product)} aria-label={`Eliminar ${product.name}`}><TrashIcon /></button>
          )}
          <span>{qty || 1}</span>
          <button type="button" onClick={handleAdd} aria-label={`Agregar otra unidad de ${product.name}`}>+</button>
        </div>
      ) : null}
    </article>
  );
});

ProductCard.displayName = "ProductCard";

export const StorefrontProductGrid = ({ products, onAdd, onRemove, onDecrement, existingQuantities, formatPrice, phone }: ProductGridProps) => {
  return (
    <div className="catalog-v2-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAdd={onAdd}
          onRemove={onRemove}
          onDecrement={onDecrement}
          existingQuantities={existingQuantities}
          formatPrice={formatPrice}
          phone={phone}
        />
      ))}
    </div>
  );
};
