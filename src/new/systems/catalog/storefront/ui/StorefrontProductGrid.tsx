import { memo, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { FiEye, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { StorefrontProduct } from "../model/CatalogStorefrontModels";
import {
  formatCatalogPrice,
  getApplicableWholesaleTier,
  getEffectiveCatalogPrice,
  getEffectiveCatalogPriceForQuantity,
  getNextWholesaleTier,
  normalizeWholesalePriceTiers,
} from "./catalogPrice";

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
  page: number;
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
  page,
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
  page: number;
}) => {
  const qty = existingQuantities[product.id] ?? 0;
  const hasInCart = qty > 0;
  const priceQuantity = Math.max(1, qty);

  const handleQuantityChange = (value: string) => {
    let parsed = Math.floor(Number(value));
    if (Number.isNaN(parsed)) parsed = 1;
    parsed = Math.max(1, Math.min(999, parsed));
    onSetQuantity(product, parsed);
  };

  const wholesaleTiers = useMemo(
    () => normalizeWholesalePriceTiers(product.wholesalePrices, product.wholesalePrice, product.wholesaleMinQuantity),
    [product.wholesaleMinQuantity, product.wholesalePrice, product.wholesalePrices],
  );
  const activeWholesaleTier = useMemo(
    () => getApplicableWholesaleTier(wholesaleTiers, priceQuantity),
    [priceQuantity, wholesaleTiers],
  );
  const nextWholesaleTier = useMemo(
    () => getNextWholesaleTier(wholesaleTiers, priceQuantity),
    [priceQuantity, wholesaleTiers],
  );
  const regularEffectivePrice = useMemo(
    () => getEffectiveCatalogPrice(product.price, product.promotionPrice),
    [product.price, product.promotionPrice],
  );
  const effectivePrice = useMemo(
    () => getEffectiveCatalogPriceForQuantity(
      product.price,
      product.promotionPrice,
      wholesaleTiers,
      priceQuantity,
    ),
    [priceQuantity, product.price, product.promotionPrice, wholesaleTiers],
  );

  const shouldShowPrice = product.showPrice !== false;
  const hasWholesaleRule = wholesaleTiers.length > 0;
  const isWholesaleActive = Boolean(activeWholesaleTier);
  const priceLabel = isWholesaleActive ? "Mayoreo" : product.promotionPrice ? "Promo" : "Precio";

  return (
    <article id={`catalog-product-${product.id}`} className={`catalog-v2-grid__card group${isWholesaleActive ? " is-wholesale-active" : ""}`}>
      <div className="catalog-v2-grid__media">
        <NavLink to={`/catalogo/producto/${product.id}/${phone ?? ""}`} state={{ catalogPage: page, catalogProductId: product.id }} className="catalog-v2-grid__link" aria-label={`Ver detalle de ${product.name}`}>
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
          <NavLink to={`/catalogo/producto/${product.id}/${phone ?? ""}`} state={{ catalogPage: page, catalogProductId: product.id }} className="catalog-v2-grid__name-link">
            {product.name}
          </NavLink>
        </h2>

        <div className="catalog-v2-grid__bottom">
          <div className="catalog-v2-grid__price-slot" aria-hidden={!shouldShowPrice}>
            {shouldShowPrice ? (
              <div className="catalog-v2-grid__price-stack">
                <small className="catalog-v2-grid__price-label">{priceLabel}</small>
                <div className="catalog-v2-grid__prices">
                  <span>{formatCatalogPrice(effectivePrice, formatPrice)}</span>
                  {regularEffectivePrice && effectivePrice !== regularEffectivePrice ? (
                    <small>{formatCatalogPrice(regularEffectivePrice, formatPrice)}</small>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <button type="button" onClick={() => onAdd(product)} aria-label={`Agregar ${product.name}`}>
            <FiShoppingCart />
          </button>
        </div>

        {hasWholesaleRule ? (
          <div className={`catalog-v2-grid__wholesale-note${isWholesaleActive ? " is-active" : ""}`}>
            <div className="catalog-v2-grid__wholesale-note-head">
              <span>{isWholesaleActive ? "Mayoreo activo" : `${wholesaleTiers.length} nivel${wholesaleTiers.length === 1 ? "" : "es"}`}</span>
              {activeWholesaleTier ? <strong>{formatCatalogPrice(activeWholesaleTier.price, formatPrice)} c/u</strong> : null}
            </div>
            <div className="catalog-v2-grid__wholesale-tiers">
              {wholesaleTiers.map((tier) => (
                <div key={tier.id ?? `${product.id}-${tier.minQuantity}`} className={activeWholesaleTier?.minQuantity === tier.minQuantity ? "is-current" : ""}>
                  <span>Desde {tier.minQuantity} pzas.</span>
                  <strong>{formatCatalogPrice(tier.price, formatPrice)}</strong>
                </div>
              ))}
            </div>
            {nextWholesaleTier ? (
              <p>
                {hasInCart
                  ? `Agrega ${Math.max(nextWholesaleTier.minQuantity - qty, 0)} más para ${formatCatalogPrice(nextWholesaleTier.price, formatPrice)} c/u.`
                  : `Mayoreo desde ${wholesaleTiers[0].minQuantity} piezas.`}
              </p>
            ) : isWholesaleActive ? <p>Ya tienes el mejor precio disponible.</p> : null}
          </div>
        ) : null}
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
          <button type="button" onClick={() => onAdd(product)} aria-label={`Agregar otra unidad de ${product.name}`}>+</button>
        </div>
      ) : null}
    </article>
  );
});

ProductCard.displayName = "ProductCard";

export const StorefrontProductGrid = ({ products, onAdd, onRemove, onDecrement, onSetQuantity, onQuickView, existingQuantities, formatPrice, phone, page }: ProductGridProps) => (
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
        page={page}
      />
    ))}
  </div>
);
