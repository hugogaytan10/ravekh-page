import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Producto } from "./Modelo/Producto";
import { getBaseVariantKey } from "./VariantSelectionModal";

interface ProductGridProps {
  products: Producto[];
  telefono: string | null;
  color: string | null;
  adjustColor: (hex: string) => string;
  onAdd: (product: Producto) => void | Promise<void>;
  formatPrice: (value: number) => string;
  existingQuantities?: Record<number, number>;
}

const FALLBACK_COLOR = "#6D01D1";

const ProductCard = memo(
  ({
    product,
    telefono,
    color,
    adjustColor,
    onAdd,
    formatPrice,
    existingQuantities,
    delay,
  }: {
    product: Producto;
    telefono: string | null;
    color: string | null;
    adjustColor: (hex: string) => string;
    onAdd: (product: Producto) => void;
    formatPrice: (value: number) => string;
    existingQuantities?: Record<number, number>;
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
    const variantCount = product.VariantsCount ?? inlineVariants.length;
    const hasVariants = Boolean(variantCount && Number(variantCount) > 0);

    const stockByVariant = useMemo(() => existingQuantities || {}, [existingQuantities]);

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

      const baseKey = getBaseVariantKey(product.Id);
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

    const accentColor = color || FALLBACK_COLOR;
    const hoverColor = useMemo(() => adjustColor(accentColor), [accentColor, adjustColor]);
    const buttonColor = added ? "#16a34a" : accentColor;

    console.log("Rendering variant number:", product.VariantsCount, "Added:", added);
    return (
      <motion.div
        className="border rounded-lg shadow-md bg-white flex flex-col h-full transform transition-transform hover:scale-105 hover:shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
      >
        <NavLink
          to={`/catalogo/producto/${product.Id}/${telefono ?? ""}`}
          className="relative block"
        >
          <img
            src={product.Image || (product.Images && product.Images[0]) || ""}
            alt={product.Name}
            className="h-48 w-full object-cover rounded-t-lg"
            loading="lazy"
            decoding="async"
          />
          {(() => {
            if (!variantCount || variantCount == 0) return null;

            const variantLabel = `${variantCount} ${
              variantCount === "1" ? "Variante" : "Variantes"
            }`;

            return (
              <div className="absolute top-2 left-2 group select-none">
                <span className="bg-gray-800/90 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm group-hover:hidden">
                  {variantCount}
                </span>
                <span className="bg-gray-800/90 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm hidden group-hover:inline-flex whitespace-nowrap">
                  {variantLabel}
                </span>
              </div>
            );
          })()}
        </NavLink>
        <div className="relative flex flex-col flex-grow px-4 py-2">
          <h2 className="text-lg font-semibold text-gray-800 text-center">
            {product.Name}
          </h2>
          <div className="flex justify-center gap-2 items-baseline mt-2">
            {formattedPromotionPrice ? (
              <>
                <p className="text-gray-800 text-xl font-semibold">
                  {formattedPromotionPrice}
                </p>
                <p className="text-gray-300 line-through font-light text-base">
                  {formattedPrice}
                </p>
              </>
            ) : (
              <p className="text-gray-800 text-xl font-semibold">
                {formattedPrice}
              </p>
            )}
          </div>
          {added && !hasVariants && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
              Agregado
            </div>
          )}
        </div>
        <div className="p-4 mt-auto">
          <button
            onClick={handleAddToCart}
            style={{ backgroundColor: buttonColor }}
            onMouseEnter={(e) => {
              if (!added) {
                e.currentTarget.style.backgroundColor = hoverColor;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = buttonColor;
            }}
            className="text-white w-full py-2 px-4 rounded-full shadow-md transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed"
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
            {isOutOfStock
              ? "Sin existencias"
              : hasVariants
                ? "Seleccionar variante"
                : added
                  ? "¡Agregado!"
                  : "Añadir al carrito"}
          </button>
        </div>
      </motion.div>
    );
  }
);

ProductCard.displayName = "ProductCard";

export const ProductGrid: React.FC<ProductGridProps> = memo(
  ({ products, telefono, color, adjustColor, onAdd, formatPrice, existingQuantities }) => {
    if (products.length === 0) {
      return null;
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {products.map((producto, index) => (
          <ProductCard
            key={producto.Id}
            product={producto}
            telefono={telefono}
            color={color}
            adjustColor={adjustColor}
            onAdd={onAdd}
            formatPrice={formatPrice}
            existingQuantities={existingQuantities}
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
    <div className="border rounded-lg shadow-md bg-white flex flex-col h-full animate-pulse">
      <div className="h-48 w-full bg-gray-200 rounded-t-lg" />
      <div className="flex-1 px-4 py-2 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
        <div className="flex justify-center gap-2 mt-2">
          <div className="h-5 w-16 bg-gray-200 rounded" />
          <div className="h-5 w-12 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="p-4 mt-auto">
        <div className="h-9 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ items?: number }> = ({ items = 10 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {Array.from({ length: items }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};
