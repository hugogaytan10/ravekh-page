import React, { useContext, useState, useEffect } from "react";
import { Item } from "../Model/Item";
import "./Css/ProductList.css";
import { AppContext } from "../../Context/AppContext";
import { useNavigate } from "react-router-dom";

interface CardProps {
  product: Item;
  handleAddItem: (product: Item) => void;
}

const Card: React.FC<CardProps> = ({ product, handleAddItem }) => {
  const { Name, Image, Price, PromotionPrice, Color, ForSale } = product;
  const [isImageLoading, setIsImageLoading] = useState(true);
  const truncatedName = Name.length > 18 ? Name.substring(0, 18) + "" : Name;
  const navigate = useNavigate();

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
  const [columns, setColumns] = useState(2); // Número inicial de columnas
  const [refreshing, setRefreshing] = useState(false);
  const [showModalPremium, setShowModalPremium] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 600) {
        setColumns(2); // 2 columnas para pantallas pequeñas
      } else if (window.innerWidth <= 1024) {
        setColumns(3); // 3 columnas para pantallas medianas
      } else if (window.innerWidth <= 1440) {
        setColumns(4); // 4 columnas para pantallas grandes
      } else {
        setColumns(5); // 5 columnas para pantallas extra grandes
      }
    };

    handleResize(); // Configurar columnas iniciales
    window.addEventListener("resize", handleResize); // Ajustar dinámicamente

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const handleCreateItem = () => {
    if (
      (context.store.Plan === "GRATUITO" && products.length >= 10) ||
      (context.store.Plan === "EMPRENDEDOR" && products.length >= 200)
    ) {
      setShowModalPremium(true);
    } else {
      context.setShowNavBarBottom(false);
      navigate("/add-product");
    }
  };

// Inserta el botón "Agregar Producto" en la primera fila y agrupa productos
const groupedProducts: (Item | "addButton")[][] = [];
const productsWithAddButton: (Item | "addButton")[] = ["addButton", ...products]; // Botón como el primer elemento

for (let i = 0; i < productsWithAddButton.length; i += columns) {
  groupedProducts.push(productsWithAddButton.slice(i, i + columns));
}


  return (
    <div className="product-list-main-sales">
      {groupedProducts.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className="row-container"
          style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "10px" }}

        >
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
