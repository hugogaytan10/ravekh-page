import React, { useState, useRef, useContext } from "react";
import {
  BrowserRouter as Router,
  useNavigate,
} from "react-router-dom";
import { uploadImage } from "../../Cloudinary/Cloudinary";
import { AppContext } from "../../../Context/AppContext";
import { Category } from "../../Model/Category";
import "./AddProductSales.css";

export const AddProductSales: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [cost, setCost] = useState<string>("");
  const [barcode, setBarcode] = useState("");
  const [stock, setStock] = useState<string>("");
  const [minStock, setMinStock] = useState<number | undefined>(undefined);
  const [optStock, setOptStock] = useState<number | undefined>(undefined);
  const [promoPrice, setPromoPrice] = useState<number | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [isAvailableForSale, setIsAvailableForSale] = useState(true);
  const [isDisplayedInStore, setIsDisplayedInStore] = useState(true);
  const [expirationDate, setExpirationDate] = useState(null);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [colorSelected, setColorSelected] = useState(
    context.store.Color || "#6200EE"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const unitOptions = ["Unidad", "Kilos", "Litros"];
  const [unitType, setUnitType] = useState(unitOptions[0]);

  const handleUnitChange = () => {
    const currentIndex = unitOptions.indexOf(unitType);
    const nextIndex = (currentIndex + 1) % unitOptions.length;
    setUnitType(unitOptions[nextIndex]);
  };

  const handlePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      context.setIsShowSplash(true);
      if (!productName || !price || !context.categorySelected.Id) {
        setErrorMessage("Todos los campos obligatorios deben ser llenados.");
        return;
      }
      const uriImage = await uploadImage(image!);
      const product = {
        Business_Id: context.user?.Business_Id,
        Name: productName,
        Price: parseFloat(price),
        CostPerItem: cost ? parseFloat(cost) : null,
        Image: uriImage,
        Stock: stock ? parseFloat(stock) : null,
        Barcode: barcode || undefined,
        PromotionPrice: promoPrice,
        Description: description,
        Color: colorSelected,
        ForSale: isAvailableForSale,
        ShowInStore: isDisplayedInStore,
        Category_Id: context.categorySelected.Id
        ? context.categorySelected.Id.toString()
        : null,
        MinStock: minStock === null ? null : minStock,
        OptStock: optStock === null ? null : optStock,
        ExpDate: expirationDate,
      };

      // Guardar producto (simulación de API)
      context.setStockFlag(!context.stockFlag);
      context.setCategorySelected({ Id: 0, Name: "", Color: "" } as Category);
      navigate("/MainSales");
    } catch (error) {
      console.error("Error al guardar el producto:", error);
    } finally {
      context.setIsShowSplash(false);
    }
  };

  return (
    <div className="add-product-container">
      <div className="header" style={{ backgroundColor: colorSelected }}>
        <button onClick={() => navigate(-1)}>Atrás</button>
        <h2>{productName || "Nuevo Producto"}</h2>
      </div>

      <div className="image-section">
        <div
          className="color-indicator"
          style={{ backgroundColor: colorSelected }}
        />
        <div className="image-preview">
          {image ? (
            <img src={image} alt="Producto" className="product-image" />
          ) : (
            <p>No hay imagen seleccionada</p>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhoto}
          className="file-input"
        />
      </div>

      <div className="form-section">
        <input
          type="text"
          placeholder="Nombre del producto"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Precio"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Costo"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />
        <input
          type="text"
          placeholder="Código de barras"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
        />
        <input
          type="number"
          placeholder="Stock mínimo"
          value={minStock?.toString() || ""}
          onChange={(e) => setMinStock(parseFloat(e.target.value) || undefined)}
        />
        <input
          type="number"
          placeholder="Stock óptimo"
          value={optStock?.toString() || ""}
          onChange={(e) => setOptStock(parseFloat(e.target.value) || undefined)}
        />
        <textarea
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={handleUnitChange}>Unidad: {unitType}</button>
        <label>
          Disponible para venta:
          <input
            type="checkbox"
            checked={isAvailableForSale}
            onChange={(e) => setIsAvailableForSale(e.target.checked)}
          />
        </label>
        <label>
          Mostrar en tienda:
          <input
            type="checkbox"
            checked={isDisplayedInStore}
            onChange={(e) => setIsDisplayedInStore(e.target.checked)}
          />
        </label>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="footer">
        <button onClick={handleSave} className="save-button">
          Guardar
        </button>
      </div>
    </div>
  );
};
