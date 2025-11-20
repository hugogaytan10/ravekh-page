import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { FixedSizeGrid } from "react-window";
import { Item } from "../Model/Item";
import "./Css/ProductList.css";
import { AppContext } from "../../Context/AppContext";
import { Variant } from "../Model/Variant";
import VariantModal from "./VariantModal";
import { getVariantsByProductId } from "../Products/Petitions";

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
  const context = useContext(AppContext);
  const [columns, setColumns] = useState(3);
  const [gridWidth, setGridWidth] = useState(window.innerWidth);
  const rowHeight = 250;
  const maxRowsVisible = 3;
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);

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

  const addItemToCart = useCallback(
    (product: Item, variant?: Variant) => {
      const quantityToAdd = Number(context.quantityNextSell);
      const variantId = variant?.Id ?? null;
      const selectedPrice =
        variant?.PromotionPrice && variant?.PromotionPrice > 0
          ? variant.PromotionPrice
          : variant?.Price ?? product.PromotionPrice ?? product.Price ?? 0;

      context.setCartPos((prevCart) => {
        const existingIndex = prevCart.findIndex(
          (item) => item.Id === product.Id && (item.Variant_Id ?? null) === variantId
        );

        if (existingIndex !== -1) {
          const updatedCart = [...prevCart];
          const existingItem = updatedCart[existingIndex];
          const newQuantity = existingItem.Quantity + quantityToAdd;

          updatedCart[existingIndex] = {
            ...existingItem,
            Quantity: newQuantity,
            SubTotal: selectedPrice * newQuantity,
          };

          return updatedCart;
        }

        return [
          ...prevCart,
          {
            Image: product.Image || product.Images?.[0] || "",
            Id: product.Id,
            Name: variant ? `${product.Name} - ${variant.Description}` : product.Name,
            Price: selectedPrice,
            Barcode: variant?.Barcode ?? product.Barcode ?? undefined,
            Quantity: quantityToAdd,
            SubTotal: selectedPrice * quantityToAdd,
            Cost: variant?.CostPerItem ?? product.CostPerItem ?? 0,
            Category_Id: product.Category_Id ?? undefined,
            Stock: variant?.Stock ?? product.Stock ?? undefined,
            IsLabeled: product.IsLabeled ?? undefined,
            Volume: product.Volume ?? undefined,
            PromotionPrice:
              variant?.PromotionPrice ?? product.PromotionPrice ?? undefined,
            Variant_Id: variantId,
          },
        ];
      });
    },
    [context.quantityNextSell]
  );

  const fetchProductVariants = useCallback(
    async (product: Item) => {
      if (!product.Id) return product;

      try {
        const variants = await getVariantsByProductId(product.Id, context.user.Token);
        return { ...product, Variants: variants } as Item;
      } catch (error) {
        return product;
      }
    },
    [context.user.Token]
  );

  const handleAddItem = useCallback(
    async (product: Item) => {
      if (product.Variants && product.Variants.length > 0) {
        setSelectedProduct(product);
        return;
      }

      const productWithVariants = await fetchProductVariants(product);
      if (productWithVariants.Variants && productWithVariants.Variants.length > 0) {
        setSelectedProduct(productWithVariants);
        return;
      }

      addItemToCart(product);
      navigator.vibrate?.(50);
    },
    [addItemToCart, fetchProductVariants]
  );

  const handleConfirmVariants = useCallback(
    (variantsSelected: Variant[]) => {
      if (!selectedProduct) return;
      variantsSelected.forEach((variant) => addItemToCart(selectedProduct, variant));
      navigator.vibrate?.(50);
      setSelectedProduct(null);
    },
    [addItemToCart, selectedProduct]
  );

  const handleCloseModal = useCallback(() => setSelectedProduct(null), []);

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

      <VariantModal
        isOpen={Boolean(selectedProduct)}
        product={selectedProduct}
        onClose={handleCloseModal}
        onConfirm={handleConfirmVariants}
      />
    </div>
  );
};
