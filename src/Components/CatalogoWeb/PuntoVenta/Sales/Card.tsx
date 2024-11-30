import React, { useContext, useState } from "react";
import { Item } from "../Model/Item";
import "./Css/ProductList.css";
import { AppContext } from "../../Context/AppContext";

interface CardProps {
  product: Item;
  handleAddItem: (product: Item) => void;
}

const Card: React.FC<CardProps> = ({ product, handleAddItem }) => {
  const { Name, Image, Price, PromotionPrice, Color, ForSale } = product;
  const [isImageLoading, setIsImageLoading] = useState(true);
  const truncatedName = Name.length > 12 ? Name.substring(0, 12) + "..." : Name;

  if (!ForSale) return null;

  return (
    <div
      className="card-container"
      style={{ backgroundColor: Color }}
      onClick={() => handleAddItem(product)}
    >
      {Image ? (
        <div className="image-container">
          {isImageLoading && (
            <div className="loading-container">
              <div className="spinner" />
            </div>
          )}
          <img
            src={Image}
            alt={Name}
            className="product-image"
            onLoad={() => setIsImageLoading(false)}
            onError={() => setIsImageLoading(false)}
          />
        </div>
      ) : (
        <div className="no-image-container">
          <p className="no-image-text">{truncatedName}</p>
          {Price != null && Price > 0 && (
            <p className="no-image-price">${Price.toFixed(2)}</p>
          )}
        </div>
      )}
      <div className="footer-card">
        <p className="title-card">{truncatedName}</p>
        <p className="price">
          {PromotionPrice != null && PromotionPrice > 0
            ? `$${PromotionPrice.toFixed(2)}`
            : Price != null
            ? `$${Price.toFixed(2)}`
            : "N/A"}
        </p>
      </div>
    </div>
  );
};

interface ProductListProps {
  products: Item[];
}

export const ProductList: React.FC<ProductListProps> = ({ products }) => {
  const context = useContext(AppContext);
  const [refreshing, setRefreshing] = useState(false);
  const [showModalPremium, setShowModalPremium] = useState(false);

  const handleAddItem = (product: Item) => {
    const cartProduct = context.cartPos?.find((item) => item.Id === product.Id);
    if (cartProduct) {
      cartProduct.Quantity += Number(context.quantityNextSell);
      cartProduct.SubTotal = cartProduct.Quantity * (product.Price ?? 0);
      context.setStockFlag(!context.stockFlag);
    } else {
      context.setCartPos([
        ...context.cartPos,
        {
          Image: product.Image,
            Id: product.Id,
            Name: product.Name,
            Price: product.Price ?? 0,
            Barcode: product.Barcode ?? undefined,
            Quantity: Number(context.quantityNextSell),
            SubTotal: (product.Price ?? 0) * Number(context.quantityNextSell),
            Cost: product.CostPerItem ?? 0,
            Category_Id: product.Category_Id ?? undefined,
            Stock: product.Stock ?? undefined,
            IsLabeled: product.IsLabeled ?? undefined,
            Volume: product.Volume ?? undefined,
            PromotionPrice: product.PromotionPrice ?? undefined,
        },
      ]);
    }
    navigator.vibrate?.(100); // Vibración para navegadores compatibles
    context.setStockFlag(!context.stockFlag);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      context.setStockFlag(!context.stockFlag);
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateItem = () => {
    if (
      (context.store.Plan === "GRATUITO" && products.length >= 10) ||
      (context.store.Plan === "EMPRENDEDOR" && products.length >= 200)
    ) {
      setShowModalPremium(true);
    } else {
      console.log("Navigate to Add Product Page");
    }
  };

  const groupedProducts = products.reduce(
    (acc: (Item | "addButton")[][], product, index) => {
      if (index % 3 === 0) acc.push([]);
      acc[acc.length - 1].push(product);
      return acc;
    },
    []
  );

  if (groupedProducts[0]) {
    // Solo agregar el botón en el primer grupo
    groupedProducts[0] = ["addButton", ...groupedProducts[0].slice(0, 2)];
  }


  return (
    <div className="product-list">
      {groupedProducts.map((group, groupIndex) => (
        <div key={groupIndex} className="row-container">
          {group.map((product, index) =>
            product === "addButton" ? (
              <div
                key="addButton"
                className="add-card"
                onClick={handleCreateItem}
              >
                <div className="plus-icon" />
                <p>Agregar Producto</p>
              </div>
            ) : (
              <Card
                key={product.Id || index}
                product={product}
                handleAddItem={handleAddItem}
              />
            )
          )}
        </div>
      ))}
      {refreshing && <div className="spinner-overlay">Actualizando...</div>}
      {showModalPremium && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Actualiza tu plan para agregar más productos.</p>
            <button onClick={() => setShowModalPremium(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};
