import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { FixedSizeGrid } from "react-window";
import { Item } from "../Model/Item";
import "./Css/ProductList.css";
import { VariantModal } from "../Sales/VariantModal";
import { useVariantSelection } from "./Hook/useVariantSelection";

interface CardProps {
  product: Item;
  handleAddItem: (product: Item) => void;
}

const Card: React.FC<CardProps> = React.memo(({ product, handleAddItem }) => {
  const { Name, Image, Price, PromotionPrice, Color, ForSale } = product;
  const [isImageLoading, setIsImageLoading] = useState(!!Image); // Solo inicia en true si hay imagen

  const handleLoad = useCallback(() => {
    setIsImageLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsImageLoading(false);
  }, []);

  if (!ForSale) return null;

  return (
    <div
      className="card-container"
      style={{ backgroundColor: "transparent" }}
      onClick={() => handleAddItem(product)}
    >
      {Image ? (
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
        <div className="no-image-container">
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

  interface ProductListProps {
    products: Item[];
  }

  export const ProductList: React.FC<ProductListProps> = ({ products }) => {
    const [columns, setColumns] = useState(3);
    const [gridWidth, setGridWidth] = useState(window.innerWidth);
    const rowHeight = 250;
    const maxRowsVisible = 3;
    const { handleProductSelection, modalState, isFetchingVariants } = useVariantSelection({
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

  const memoizedProducts = useMemo(
    () =>
      products.map((product) => ({
        ...product,
        Image: product.Image || product.Images?.[0] || "",
      })),
    [products]
  );

    const handleAddItem = useCallback(
      async (product: Item) => {
        await handleProductSelection(product);
      },
      [handleProductSelection]
    );

  const rowCount = Math.ceil(memoizedProducts.length / columns);
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
          return memoizedProducts[index]?.Id || index;
        }}
      >
        {({ columnIndex, rowIndex, style }) => {
          const index = rowIndex * columns + columnIndex;
          if (index >= memoizedProducts.length) return null;

          const product = memoizedProducts[index];

          return (
            <div
              style={{ ...style, padding: "5px", marginBottom: "10px" }}
              className="grid-item"
            >
                <Card product={product} handleAddItem={handleAddItem} />
              </div>
            );
          }}
        </FixedSizeGrid>

        <VariantModal modalState={modalState} isLoading={isFetchingVariants} />
      </div>
    );
  };
