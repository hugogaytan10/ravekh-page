import { memo, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { FiEye, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { StorefrontProduct } from "../model/CatalogStorefrontModels";

type ProductGridProps = {
  products: StorefrontProduct[];
  onAdd: (product: StorefrontProduct) => void;
  onRemove: (product: StorefrontProduct) => void;
  onDecrement: (product: StorefrontProduct) => void;
  onQuickView: (product: StorefrontProduct) => void;
  existingQuantities: Record<number, number>;
  formatPrice: (value: number) => string;
  phone: string | null;
};

const ProductCard = memo(({
  product,
  onAdd,
  onRemove,
  onDecrement,
  onQuickView,
  existingQuantities,
  formatPrice,
  phone,
}: {
  product: StorefrontProduct;
  onAdd: (product: StorefrontProduct) => void;
  onRemove: (product: StorefrontProduct) => void;
  onDecrement: (product: StorefrontProduct) => void;
  onQuickView: (product: StorefrontProduct) => void;
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
        <NavLink to={`/v2/catalogo/producto/${product.id}/${phone ?? ""}`} className="catalog-v2-grid__link">
          {product.image ? <img src={product.image} alt={product.name} loading="lazy" decoding="async" /> : <div className="catalog-v2-grid__placeholder">Sin imagen</div>}
        </NavLink>

        {product.variantsCount && product.variantsCount > 0 ? (
          <button type="button" className="catalog-v2-grid__quick-view" onClick={() => onQuickView(product)} aria-label={`Opciones de ${product.name}`}>
            <FiEye />
          </button>
        ) : null}

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
          <button type="button" onClick={handleAdd} aria-label={`Agregar ${product.name}`}><FiShoppingCart /></button>
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
          <button type="button" onClick={handleAdd} aria-label={`Agregar ${product.name}`}><FiShoppingCart /></button>
        </div>
      </div>

      {overlayActive ? (
        <div className="catalog-v2-grid__qty">
          {qty > 1 ? (
            <button type="button" onClick={() => onDecrement(product)} aria-label={`Quitar una unidad de ${product.name}`}>−</button>
          ) : (
            <button type="button" onClick={() => onRemove(product)} aria-label={`Eliminar ${product.name}`}><FiTrash2 /></button>
          )}
          <span>{qty || 1}</span>
          <button type="button" onClick={handleAdd} aria-label={`Agregar otra unidad de ${product.name}`}>+</button>
        </div>
      ) : null}
    </article>
  );
});

ProductCard.displayName = "ProductCard";

export const StorefrontProductGrid = ({ products, onAdd, onRemove, onDecrement, onQuickView, existingQuantities, formatPrice, phone }: ProductGridProps) => {
  return (
    <div className="catalog-v2-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAdd={onAdd}
          onRemove={onRemove}
          onDecrement={onDecrement}
          onQuickView={onQuickView}
          existingQuantities={existingQuantities}
          formatPrice={formatPrice}
          phone={phone}
        />
      ))}
    </div>
  );
};
