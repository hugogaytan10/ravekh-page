import { memo, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { FiEye, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { StorefrontProduct } from "../model/CatalogStorefrontModels";

type ProductGridProps = {
  products: StorefrontProduct[];
  onAdd: (product: StorefrontProduct) => void;
  onRemove: (product: StorefrontProduct) => void;
  onDecrement: (product: StorefrontProduct) => void;
  onSetQuantity: (product: StorefrontProduct, quantity: number) => void;
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
  onSetQuantity,
  onQuickView,
  existingQuantities,
  formatPrice,
  phone,
}: {
  product: StorefrontProduct;
  onAdd: (product: StorefrontProduct) => void;
  onRemove: (product: StorefrontProduct) => void;
  onDecrement: (product: StorefrontProduct) => void;
  onSetQuantity: (product: StorefrontProduct, quantity: number) => void;
  onQuickView: (product: StorefrontProduct) => void;
  existingQuantities: Record<number, number>;
  formatPrice: (value: number) => string;
  phone: string | null;
}) => {
  const qty = existingQuantities[product.id] ?? 0;
  const hasInCart = qty > 0;

  const handleAdd = () => {
    onAdd(product);
  };
  const handleQuantityChange = (value: string) => {
    let parsed = Math.floor(Number(value));
    if (Number.isNaN(parsed)) parsed = 1;
    parsed = Math.max(1, Math.min(999, parsed));
    onSetQuantity(product, parsed);
  };

  const formattedBase = useMemo(() => formatPrice(product.price), [formatPrice, product.price]);
  const formattedPromo = useMemo(
    () => (product.promotionPrice && product.promotionPrice > 0 ? formatPrice(product.promotionPrice) : null),
    [formatPrice, product.promotionPrice],
  );

  return (
    <article className="catalog-v2-grid__card group">
      <div className="catalog-v2-grid__media">
        <NavLink to={`/v2/catalogo/producto/${product.id}/${phone ?? ""}`} className="catalog-v2-grid__link" aria-label={`Ver detalle de ${product.name}`}>
          {product.image ? <img src={product.image} alt={product.name} loading="lazy" decoding="async" /> : <div className="catalog-v2-grid__placeholder">Sin imagen</div>}
        </NavLink>

        {product.variantsCount && product.variantsCount > 0 ? (
          <button type="button" className="catalog-v2-grid__quick-view" onClick={() => onQuickView(product)} aria-label={`Opciones de ${product.name}`}>
            <FiEye />
          </button>
        ) : null}

      </div>

      <div className="catalog-v2-grid__meta">
        <h2>
          <NavLink to={`/v2/catalogo/producto/${product.id}/${phone ?? ""}`} className="catalog-v2-grid__name-link">
            {product.name}
          </NavLink>
        </h2>
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

      {hasInCart ? (
        <div className="catalog-v2-grid__qty">
          {qty > 1 ? (
            <button type="button" onClick={() => onDecrement(product)} aria-label={`Quitar una unidad de ${product.name}`}>−</button>
          ) : (
            <button type="button" onClick={() => onRemove(product)} aria-label={`Eliminar ${product.name}`}><FiTrash2 /></button>
          )}
          <input
            type="number"
            min={1}
            max={999}
            value={qty}
            onChange={(event) => handleQuantityChange(event.target.value)}
            aria-label={`Cantidad de ${product.name}`}
          />
          <button type="button" onClick={handleAdd} aria-label={`Agregar otra unidad de ${product.name}`}>+</button>
        </div>
      ) : null}
    </article>
  );
});

ProductCard.displayName = "ProductCard";

export const StorefrontProductGrid = ({ products, onAdd, onRemove, onDecrement, onSetQuantity, onQuickView, existingQuantities, formatPrice, phone }: ProductGridProps) => {
  return (
    <div className="catalog-v2-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAdd={onAdd}
          onRemove={onRemove}
          onDecrement={onDecrement}
          onSetQuantity={onSetQuantity}
          onQuickView={onQuickView}
          existingQuantities={existingQuantities}
          formatPrice={formatPrice}
          phone={phone}
        />
      ))}
    </div>
  );
};
