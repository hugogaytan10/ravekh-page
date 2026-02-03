import React, { useState, useEffect, useCallback } from "react";
import { FixedSizeGrid } from "react-window";
import { Item } from "../Model/Item";
import "./Css/ProductList.css";
import { VariantModal } from "../Sales/VariantModal";
import { useVariantSelection } from "./Hook/useVariantSelection";
interface CardProps {
  product: Item;
  handleAddItem: (product: Item) => void;
  storeColor?: string;
}

const Card: React.FC<CardProps> = React.memo(({ product, handleAddItem, storeColor }) => {
  const { Name, Image, Price, PromotionPrice, Color, ForSale } = product;
  const [isImageLoading, setIsImageLoading] = useState(!!Image); // Solo inicia en true si hay imagen
  const [hasImageError, setHasImageError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsImageLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsImageLoading(false);
    setHasImageError(true);
  }, []);

  useEffect(() => {
    setHasImageError(false);
    setIsImageLoading(!!Image);
  }, [Image]);

  if (!ForSale) return null;

  return (
    <div
      className="card-container"
      style={{ backgroundColor: "transparent" }}
      onClick={() => handleAddItem(product)}
    >
      {Image && !hasImageError ? (
        <div className="image-container">
          {isImageLoading && (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          )}
          <img
            key={Image} // Esto previene que React re-cargue la imagen si no ha cambiado
            src={Image}
            alt={Name}
            className="product-image"
            loading="lazy"
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      ) : (
        <div
          className="no-image-container"
          style={{ backgroundColor: storeColor || Color || "#ccc" }}
        >
          <p className="no-image-text">{Name}</p>
        </div>
      )}
      <div className="footer-card">
        <p className="title-card">{Name}</p>
        <p className="price">
          {PromotionPrice && PromotionPrice > 0
            ? `$${PromotionPrice.toFixed(2)}`
            : `$${Price?.toFixed(2) ?? "N/A"}`}
        </p>
      </div>
    </div>
  );
});

type AddCardProps = {
  onAdd: () => void;
};

const AddCard: React.FC<AddCardProps> = React.memo(({ onAdd }) => {
  return (
    <div
      className="card-container add-card-same" // <- usa la misma base + un extra
      onClick={onAdd}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onAdd();
      }}
    >
      <div className="image-container add-image">
        <div className="plus-icon"></div>
      </div>

      <div className="footer-card">
        <p className="title-card">Agregar producto</p>
        <p className="price"> </p>
      </div>
    </div>
  );
});

interface ProductListProps {
  products: Item[];
  onAddProduct?: () => void;
  storeColor?: string;
}

export const ProductList: React.FC<ProductListProps> = ({ products, onAddProduct, storeColor  }) => {
  const [columns, setColumns] = useState(3);
  const [gridWidth, setGridWidth] = useState(window.innerWidth);
  const rowHeight = 250;
  const maxRowsVisible = 3;
  const { handleProductSelection, modalState, isFetchingVariants } =
    useVariantSelection({
      onCartUpdated: () => navigator.vibrate?.(50),
    });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 600) {
        setColumns(2);
      } else if (width < 1024) {
        setColumns(3);
      } else if (width < 1440) {
        setColumns(4);
      } else {
        setColumns(5);
      }
      setGridWidth(width);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAddItem = useCallback(
    async (product: Item) => {
      await handleProductSelection(product);
    },
    [handleProductSelection]
  );

  const totalItems = products.length + 1;
  const rowCount = Math.ceil(totalItems / columns);
  const gridHeight = rowHeight * maxRowsVisible;

  return (
    <div className="product-list-main-sales">
      <FixedSizeGrid
        columnCount={columns}
        rowCount={rowCount}
        columnWidth={gridWidth / columns - 10}
        rowHeight={rowHeight + 15}
        width={gridWidth}
        height={gridHeight}
        overscanRowCount={3} // Precarga más filas para evitar eliminar imágenes
        className="grid-container"
        itemKey={({ rowIndex, columnIndex }) => {
          const index = rowIndex * columns + columnIndex;

          // Add card siempre estable
          if (index === 0) return "add-card";

          const productIndex = index - 1;
          return products[productIndex]?.Id || `p-${productIndex}`;
        }}
      >
        {({ columnIndex, rowIndex, style }) => {
          const index = rowIndex * columns + columnIndex;
          if (index >= totalItems) return null;

          // ✅ primer item del grid: AddCard
          if (index === 0) {
            return (
              <div style={{ ...style, padding: "5px", marginBottom: "10px" }} className="grid-item">
                <AddCard onAdd={() => onAddProduct?.()} />
              </div>
            );
          }

          const productIndex = index - 1;
          const product = products[productIndex];
          if (!product) return null;

          return (
            <div style={{ ...style, padding: "5px", marginBottom: "10px" }} className="grid-item">
              <Card product={product} handleAddItem={handleAddItem} storeColor={storeColor} />
            </div>
          );
        }}
      </FixedSizeGrid>

      <VariantModal modalState={modalState} isLoading={isFetchingVariants} />
    </div>
  );
};
