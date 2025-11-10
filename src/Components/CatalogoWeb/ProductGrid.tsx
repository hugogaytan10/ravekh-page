import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Producto } from "./Modelo/Producto";

interface ProductGridProps {
  products: Producto[];
  telefono: string | null;
  color: string | null;
  adjustColor: (hex: string) => string;
  onAdd: (product: Producto) => void;
  formatPrice: (value: number) => string;
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
    delay,
  }: {
    product: Producto;
    telefono: string | null;
    color: string | null;
    adjustColor: (hex: string) => string;
    onAdd: (product: Producto) => void;
    formatPrice: (value: number) => string;
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

    const handleAddToCart = useCallback(() => {
      onAdd(product);
      setAdded(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setAdded(false), 1800);
    }, [onAdd, product]);

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

    return (
      <motion.div
        className="border rounded-lg shadow-md bg-white flex flex-col h-full transform transition-transform hover:scale-105 hover:shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
      >
        <NavLink to={`/catalogo/producto/${product.Id}/${telefono ?? ""}`}>
          <img
            src={product.Image || (product.Images && product.Images[0]) || ""}
            alt={product.Name}
            className="h-48 w-full object-cover rounded-t-lg"
            loading="lazy"
            decoding="async"
          />
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
          {added && (
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
            className="text-white w-full py-2 px-4 rounded-full shadow-md transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white"
            type="button"
            aria-live="polite"
            aria-label={
              added
                ? `${product.Name} agregado al carrito`
                : `Añadir ${product.Name} al carrito`
            }
          >
            {added ? "¡Agregado!" : "Añadir al carrito"}
          </button>
        </div>
      </motion.div>
    );
  }
);

ProductCard.displayName = "ProductCard";

export const ProductGrid: React.FC<ProductGridProps> = memo(
  ({ products, telefono, color, adjustColor, onAdd, formatPrice }) => {
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
            delay={index * 0.08}
          />
        ))}
      </div>
    );
  }
);

ProductGrid.displayName = "ProductGrid";

export default ProductGrid;
