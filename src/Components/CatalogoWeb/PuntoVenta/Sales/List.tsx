import React, { useContext, useEffect, useState } from "react";
import { Item } from "../Model/Item";
import { AppContext } from "../../Context/AppContext";
import { CartPos } from "../Model/CarPos";

interface ListProps {
  Products: Item[];
}

export const List: React.FC<ListProps> = ({ Products }: ListProps) => {
  const [products, setProducts] = useState<Item[]>([]);
  const context = useContext(AppContext);

  const truncate = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  const AddItemToCart = (product: Item) => {
    if (product) {
      const cartProduct = context.cartPos?.find(
        (item: CartPos) => item.Id === product.Id
      );
      if (cartProduct) {
        cartProduct.Quantity += Number(context.quantityNextSell);
        cartProduct.SubTotal =
          Number(cartProduct.Quantity) * Number(cartProduct.Price.toFixed(2) || 0);
        context.setStockFlag(!context.stockFlag);
      } else {
        context.setCartPos([
          ...context.cartPos,
          {
            Id: product.Id,
            Name: product.Name,
            Price: product.Price ?? 0,
            Barcode: product.Barcode ?? undefined,
            Quantity: Number(context.quantityNextSell),
            SubTotal: product.Price ?? 0,
            Image: product.Image,
            Cost: product.CostPerItem ?? 0,
          },
        ]);
      }
      navigator.vibrate(100);
      context.setStockFlag(!context.stockFlag);
    } else {
      console.log("Producto no encontrado");
    }
  };

  useEffect(() => {
    setProducts(Products);
  }, [Products]);

  const renderProduct = (product: Item) => {
    return (
      <div
        className="flex items-center p-2  bg-gray-100 rounded-lg border border-gray-300 hover:bg-gray-200 cursor-pointer transition-all"
        onClick={() => AddItemToCart(product)}
        key={product.Id}
      >
        {/* Imagen del producto */}
        {product.Image ? (
          <div className="w-16 h-16 flex-shrink-0">
            <img
              src={product.Image}
              alt={product.Name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        ) : (
          <div
            className="w-16 h-16 flex items-center justify-center bg-gray-300 rounded-lg text-white font-bold"
            style={{ backgroundColor: product.Color }}
          >
            <p className="text-xs text-center">{product.Name}</p>
          </div>
        )}
  
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
    </div>
  );
  
  
  
};
