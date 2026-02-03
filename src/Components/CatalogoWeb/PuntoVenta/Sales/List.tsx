import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Item } from "../Model/Item";
import { AppContext } from "../../Context/AppContext";
import { Variant } from "../Model/Variant";
import { useVariantSelection } from "./Hook/useVariantSelection";
import { VariantModal } from "./VariantModal";

interface ListProps {
  Products: Item[];
}

export const List: React.FC<ListProps> = ({ Products }: ListProps) => {
  const context = useContext(AppContext);

  const truncate = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

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
            PromotionPrice: variant?.PromotionPrice ?? product.PromotionPrice ?? undefined,
            Variant_Id: variantId,
          },
        ];
      });
    },
    [context.quantityNextSell]
  );

  const {
    handleProductSelection,
    modalState,
    isFetchingVariants
  } = useVariantSelection({
    onCartUpdated: () => navigator.vibrate?.(50),
  });

  const handleAddItem = useCallback(
    (product: Item) => handleProductSelection(product),
    [handleProductSelection]
  );


  const products = Products;

  const renderProduct = (product: Item) => {
    return (
      <div
        className="flex items-center p-2  bg-gray-100 rounded-lg border border-gray-300 hover:bg-gray-200 cursor-pointer transition-all"
        onClick={() => handleAddItem(product)}
        key={product.Id}
      >
        {/* Imagen del producto */}
        <ProductRowImage
          image={product.Image || product.Images?.[0] || ""}
          name={product.Name}
          color={product.Color}
          storeColor={context.store.Color}
        />
  
        {/* Nombre del producto */}
        <div className="flex-1 ml-4">
          <p className="text-sm font-medium text-gray-800 truncate">
            {truncate(product.Name, 25)}
          </p>
        </div>
  
        {/* Precios del producto */}
        <div className="flex flex-col items-end">
          <span className="text-xs line-through text-gray-500">
            ${Number(product.PromotionPrice)?.toFixed(2)}
          </span>
          <span className="text-base font-bold text-gray-800">
            ${Number(product.Price)?.toFixed(2)}
          </span>
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-4 mt-4 pb-40">
      {(context.store.Plan === "GRATUITO"
        ? products.slice(0, 10)
        : products
      ).map((product) => renderProduct(product))}

      <VariantModal modalState={modalState} isLoading={isFetchingVariants} />

    </div>
  );
  
  
  
};

type ProductRowImageProps = {
  image: string;
  name: string;
  color?: string | null;
  storeColor?: string | null;
};

const ProductRowImage: React.FC<ProductRowImageProps> = ({
  image,
  name,
  color,
  storeColor,
}) => {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [image]);

  if (image && !hasImageError) {
    return (
      <div className="w-16 h-16 flex-shrink-0">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover rounded-lg"
          loading="lazy"
          onError={() => setHasImageError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className="w-16 h-16 flex items-center justify-center rounded-lg text-white font-bold"
      style={{ backgroundColor: storeColor || color || "#ccc" }}
    >
      <p className="text-xs text-center">{name}</p>
    </div>
  );
};
