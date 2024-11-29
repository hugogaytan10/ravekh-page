import React, { useContext, useEffect, useState } from "react";
import { Item } from "../Model/Item";
import "./Css/List.css";
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
        className="product-container-list"
        onClick={() => AddItemToCart(product)}
        key={product.Id}
      >
        {product.Image ? (
          <div className="product-image-list">
            <img src={product.Image} alt={product.Name} />
          </div>
        ) : (
          <div
            className="product-placeholder-list"
            style={{ backgroundColor: product.Color }}
          >
            <p>{product.Name}</p>
          </div>
        )}
        <div className="product-info-list">
          <p className="product-name-list">{truncate(product.Name, 14)}</p>
          <div className="price-container-list">
            <span className="product-old-price-list">
              $ {Number(product.PromotionPrice)?.toFixed(2)}
            </span>
            <span className="product-price-list">${Number(product.Price)?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="product-list">
      {(context.store.Plan === "GRATUITO"
        ? products.slice(0, 10)
        : products
      ).map((product) => renderProduct(product))}
    </div>
  );
};
