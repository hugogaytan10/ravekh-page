import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Producto } from "./Modelo/Producto";
import { getBaseVariantKey } from "./VariantSelectionModal";
import cartIcon from "../../assets/cart-outline.svg";
import trashIcon from "../../assets/trash.svg";

interface ProductGridProps {
  products: Producto[];
  telefono: string | null;
  onAdd: (product: Producto) => void | Promise<void>;
  formatPrice: (value: number) => string;
  existingQuantities?: Record<number, number>;
  onQuickView?: (product: Producto) => void | Promise<void>;
  onRemove?: (product: Producto) => void | Promise<void>;
}

const EyeIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ProductCard = memo(
  ({
    product,
    telefono,
    onAdd,
    formatPrice,
    existingQuantities,
    onQuickView,
    onRemove,
    delay,
  }: {
    product: Producto;
    telefono: string | null;
    onAdd: (product: Producto) => void;
    formatPrice: (value: number) => string;
    existingQuantities?: Record<number, number>;
    onQuickView?: (product: Producto) => void | Promise<void>;
    onRemove?: (product: Producto) => void | Promise<void>;
    delay: number;
  }) => {
    const [added, setAdded] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const inlineVariants = useMemo(
      () => (Array.isArray(product.Variants) ? product.Variants.filter(Boolean) : []),
      [product.Variants]
    );
    const variantCountValue = Number(product.VariantsCount ?? inlineVariants.length) || 0;
    const hasVariants = variantCountValue > 0;

    const stockByVariant = useMemo(() => existingQuantities || {}, [existingQuantities]);
    const baseKey = useMemo(() => getBaseVariantKey(product.Id), [product.Id]);
    const quantityInCart = stockByVariant[baseKey] ?? 0;
    const hasInCart = quantityInCart > 0;

    const remainingStock = useMemo(() => {
      if (hasVariants) {
        if (inlineVariants.length === 0) return null;

        return inlineVariants.reduce<number | null>((acc, variant) => {
          if (variant.Stock == null) return null;

          const taken = variant.Id != null ? stockByVariant[variant.Id] ?? 0 : 0;
          const available = Math.max(variant.Stock - taken, 0);

          if (acc === null) return available;
          return acc + available;
        }, 0);
      }

      if (product.Stock == null) return null;

      const taken = stockByVariant[baseKey] ?? 0;
      return Math.max(product.Stock - taken, 0);
    }, [hasVariants, inlineVariants, product.Id, product.Stock, stockByVariant]);

    const isOutOfStock = remainingStock !== null && remainingStock <= 0;

    const handleAddToCart = useCallback(() => {
      if (isOutOfStock) return;

      onAdd(product);
      if (!hasVariants) {
        setAdded(true);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setAdded(false), 1800);
    }, [hasVariants, isOutOfStock, onAdd, product]);

    const hasPromotion = Boolean(product.PromotionPrice);
    const formattedPrice = useMemo(
      () => formatPrice(product.Price),
      [formatPrice, product.Price]
    );
    const formattedPromotionPrice = useMemo(
      () =>
        hasPromotion && product.PromotionPrice
          ? formatPrice(product.PromotionPrice)
          : null,
      [formatPrice, hasPromotion, product.PromotionPrice]
    );

    const overlayActive = !hasVariants && (hasInCart || added);

    const handleQuickView = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!onQuickView) return;
        onQuickView(product);
      },
      [onQuickView, product]
    );

    const handleRemove = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!onRemove) return;
        onRemove(product);
      },
      [onRemove, product]
    );

    const handlePlus = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        handleAddToCart();
      },
      [handleAddToCart]
    );

    return (
      <motion.div
        className="group flex flex-col h-full transition-transform"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
      >
        <div className="relative group">
          <NavLink
            to={`/catalogo/producto/${product.Id}/${telefono ?? ""}`}
            className="block"
          >
            <img
              src={product.Image || (product.Images && product.Images[0]) || ""}
              alt={product.Name}
              className="h-48 w-full object-cover rounded-[var(--radius-md)]"
              loading="lazy"
              decoding="async"
            />
            <div
              className={`pointer-events-none absolute inset-0 rounded-[var(--radius-md)] transition-colors ${
                overlayActive ? "bg-black/0" : "bg-black/0 group-hover:bg-black/25"
              }`}
            />
          </NavLink>
          {!hasVariants && (
            <>
              <div
                className={`absolute bottom-0 left-0 right-0 px-3 pb-3 transition-all duration-200 ${
                  overlayActive
                    ? "opacity-0 translate-y-2 pointer-events-none"
                    : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto"
                }`}
              >
                <div className="flex items-end justify-between text-white">
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold leading-snug">
                      {product.Name}
                    </p>
                    <div className="mt-1 text-sm font-medium">
                      {formattedPromotionPrice ? (
                        <div className="flex items-center gap-2">
                          <span>{formattedPromotionPrice}</span>
                          <span className="text-white/70 line-through text-xs">
                            {formattedPrice}
                          </span>
                        </div>
                      ) : (
                        <span>{formattedPrice}</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
                    aria-label={`Añadir ${product.Name} al carrito`}
                  >
                    <img
                      src={cartIcon}
                      alt=""
                      className="w-6 h-6 brightness-0 invert"
                    />
                  </button>
                </div>
              </div>
            </>
          )}
          {hasVariants && (
            <button
              type="button"
              onClick={handleQuickView}
              className="absolute top-2 left-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-white shadow-sm"
              aria-label={`Vista rápida de ${product.Name}`}
            >
              <EyeIcon />
            </button>
          )}
        </div>
        <div className="relative flex flex-col flex-grow pt-3">
          <div
            className={
              overlayActive
                ? "opacity-0 pointer-events-none"
                : !hasVariants
                  ? "transition-opacity group-hover:opacity-0"
                  : "transition-opacity"
            }
          >
            <h2 className="text-sm font-semibold text-[var(--text-primary)] leading-snug min-h-[2.5rem] max-h-[2.5rem] overflow-hidden">
              {product.Name}
            </h2>
            <div className="mt-2 flex items-end justify-between">
              <div className="flex items-center gap-2 text-sm">
                {formattedPromotionPrice ? (
                  <>
                    <p className="text-[var(--text-primary)] font-semibold">
                      {formattedPromotionPrice}
                    </p>
                    <p className="text-[var(--text-muted)] line-through font-light">
                      {formattedPrice}
                    </p>
                  </>
                ) : (
                  <p className="text-[var(--text-secondary)] font-medium">
                    {formattedPrice}
                  </p>
                )}
              </div>
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center text-[var(--text-primary)] disabled:opacity-50"
                type="button"
                disabled={isOutOfStock}
                aria-live="polite"
                aria-label={
                  isOutOfStock
                    ? `${product.Name} sin existencias disponibles`
                    : hasVariants
                      ? `Seleccionar variante de ${product.Name}`
                      : added
                        ? `${product.Name} agregado al carrito`
                        : `Añadir ${product.Name} al carrito`
                }
              >
                <img src={cartIcon} alt="" className="w-8 h-8 rounded-full p-1 theme-icon" />
              </button>
            </div>
          </div>
          {!hasVariants && (
            <div
              className={`absolute inset-0 flex items-end transition-all duration-200 ease-out ${
                overlayActive
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 translate-y-2 pointer-events-none"
              }`}
            >
              <div className="w-full flex items-center justify-between rounded-full bg-white/90 px-4 py-2 text-black shadow-sm">
                <button
                  type="button"
                  onClick={handleRemove}
                  className="h-7 w-7 rounded-full bg-black/5 flex items-center justify-center transition-transform duration-150 ease-out active:scale-95"
                  aria-label={`Eliminar ${product.Name} del carrito`}
                >
                  <img src={trashIcon} alt="" className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold">
                  {quantityInCart || 1}
                </span>
                <button
                  type="button"
                  onClick={handlePlus}
                  className="h-7 w-7 rounded-full bg-black text-white flex items-center justify-center text-lg leading-none transition-transform duration-150 ease-out active:scale-95"
                  aria-label={`Agregar otra unidad de ${product.Name}`}
                >
                  +
                </button>
              </div>
            </div>
          )}
          {isOutOfStock && (
            <span className="mt-2 text-[11px] text-[var(--state-error)] font-semibold">
              Sin existencias
            </span>
          )}
        </div>
      </motion.div>
    );
  }
);

ProductCard.displayName = "ProductCard";

export const ProductGrid: React.FC<ProductGridProps> = memo(
  ({
    products,
    telefono,
    onAdd,
    formatPrice,
    existingQuantities,
    onQuickView,
    onRemove,
  }) => {
    if (products.length === 0) {
      return null;
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((producto, index) => (
          <ProductCard
            key={producto.Id}
            product={producto}
            telefono={telefono}
            onAdd={onAdd}
            formatPrice={formatPrice}
            existingQuantities={existingQuantities}
            onQuickView={onQuickView}
            onRemove={onRemove}
            delay={index * 0.08}
          />
        ))}
      </div>
    );
  }
);

ProductGrid.displayName = "ProductGrid";

export default ProductGrid;

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--bg-surface)] border border-[var(--border-default)] flex flex-col h-full animate-pulse">
      <div className="h-48 w-full bg-[var(--bg-subtle)]" />
      <div className="flex-1 px-3 py-3 space-y-3">
        <div className="h-4 bg-[var(--bg-subtle)] rounded w-4/5" />
        <div className="flex gap-2 mt-2">
          <div className="h-4 w-16 bg-[var(--bg-subtle)] rounded" />
          <div className="h-4 w-12 bg-[var(--bg-subtle)] rounded" />
        </div>
      </div>
      <div className="px-3 pb-3 mt-auto flex justify-end">
        <div className="h-10 w-10 bg-[var(--bg-subtle)] rounded-full" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ items?: number }> = ({ items = 10 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: items }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};
