import React, { useState, useRef, useContext } from "react";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
import ImageIcon from "../../../../../assets/POS/ImageIcon";
import { InputBasic } from "../../Utilities/InputBasic";
import { PickerColor } from "../../CustomizeApp/PickerColor";
import { ModalKeyboard } from "./ModalKeyBoard";
import { AppContext } from "../../../Context/AppContext";
import { uploadImage } from "../../Cloudinary/Cloudinary";
import { insertProduct } from "../Petitions";
import { Item } from "../../Model/Item";
import { Category } from "../../Model/Category";
import { ThemeLight } from "../../Theme/Theme";
import { useNavigate } from "react-router-dom";
import { ChevronGo } from "../../../../../assets/POS/ChevronGo";

export const AddProductSales: React.FC = () => {
  const context = useContext(AppContext);
  const navigation = useNavigate();
  const scrollViewRef = useRef<HTMLDivElement>(null);

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
  const [description, setDescription] = useState("");
  const [unitType, setUnitType] = useState("Unidad");
  const [colorSelected, setColorSelected] = useState(
    context.store.Color || ThemeLight.secondaryColor
  );
  const [isVisibleColorPicker, setIsVisibleColorPicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const unitOptions = ["Unidad", "Kilos", "Litros"];

  const handleSave = async () => {
    try {
      context.setIsShowSplash(true);

      const uriImage = image ? await uploadImage(image) : null;

      const product: Item = {
        Business_Id: context.user?.Business_Id,
        Name: productName,
        Price: price ? parseFloat(price) : null,
        CostPerItem: cost ? parseFloat(cost) : null,
        Image: uriImage!,
        Stock: stock ? parseFloat(stock) : null,
        Barcode: barcode || null,
        PromotionPrice: promoPrice,
        Description: description,
        Color: colorSelected,
        ForSale: isAvailableForSale,
        ShowInStore: isDisplayedInStore,
        Category_Id: context.categorySelected.Id
          ? context.categorySelected.Id.toString()
          : null,
        MinStock: minStock || null,
        OptStock: optStock || null,
      };

      await insertProduct(product, context.user?.Token);

      context.setStockFlag(!context.stockFlag);
      context.setCategorySelected({ Id: 0, Name: "", Color: "" } as Category);
      context.setShowNavBarBottom(true); // Mostrar la barra de navegación inferior
      navigation("/MainSales");
    } catch (error) {
      console.error("Error al guardar el producto:", error);
    } finally {
      context.setIsShowSplash(false);
    }
  };

  const handleUnitChange = () => {
    const currentIndex = unitOptions.indexOf(unitType);
    const nextIndex = (currentIndex + 1) % unitOptions.length;
    setUnitType(unitOptions[nextIndex]);
  };

  return (
    <div className="flex flex-col bg-gray-100 container-add-product">
      {/* Header */}
      <header
        className="flex items-center px-4 py-3 text-white"
        style={{
          backgroundColor: context.store.Color || ThemeLight.btnBackground,
        }}
      >
        <button onClick={() =>{ navigation("/MainSales"); context.setShowNavBarBottom(true);}} className="mr-auto">
          <ChevronBack />
        </button>
        <h1 className="text-lg font-bold text-center">
          {productName || "Nuevo Producto"}
        </h1>
        <span className="ml-auto"></span>
      </header>

      {/* Scrollable Content */}
      <div
        ref={scrollViewRef}
        className="overflow-auto flex-grow p-4 scroll-container-add-product"
      >
        {/* Image and Color Picker */}
        <div className="flex items-center justify-center mb-6 image-section-add-product">
          {/* Cuadro de selección de color */}
          <button
            className="w-10 h-10 rounded"
            style={{
              backgroundColor: colorSelected || ThemeLight.secondaryColor,
            }}
            onClick={() => {
              setIsVisibleColorPicker(!isVisibleColorPicker);
            }}
          ></button>

          {/* Contenedor central con imagen y color */}
          <div
            className="flex flex-col items-center  mx-4 main-info-add-product"
            style={{
              backgroundColor: colorSelected || ThemeLight.secondaryColor,
              height: "150px",
              width: "150px",
              borderRadius: "10px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Imagen cargada */}
            {image && (
              <img
                src={image}
                alt="Product"
                className="h-full w-full object-cover"
              />
            )}

            {/* Footer sobre la imagen */}
            <div
              className="absolute bottom-0 left-0 w-full h-16 bg-black bg-opacity-40 text-white flex flex-col items-center justify-center"
              style={{
                borderBottomLeftRadius: "10px",
                borderBottomRightRadius: "10px",
              }}
            >
              <span className="text-sm font-semibold w-full text-center">
                {productName || "Nombre del Producto"}
              </span>
              <span className="text-base font-bold">${price || "0.00"}</span>
            </div>
          </div>

          {/* Botón para cargar una nueva imagen */}
          <label
            className="p-2 rounded-full bg-gray-300 cursor-pointer"
            htmlFor="imageUpload"
          >
            <ImageIcon />
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = () => {
                  setImage(reader.result as string); // Previsualización de la imagen
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-lg p-4 form-section-add-product">
          <InputBasic
            placeholder="Nombre del producto"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
          <InputBasic
            placeholder="Precio"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <InputBasic
            placeholder="Costo de adquisición"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
          <InputBasic
            placeholder="Código de barras"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
          <button
  className="flex items-center justify-between w-full py-3 px-4 bg-gray-50 rounded shadow-sm hover:bg-gray-100"
  onClick={() => navigation("/select-caterory-sales")}
>
  {context.categorySelected.Name !== "" ? (
    <>
      <span className="text-purple-500 font-semibold">
        {context.categorySelected.Name}
      </span>
      <ChevronGo width={20} height={20} stroke={ThemeLight.textColor} />
    </>
  ) : (
    <>
      <span className="text-gray-700">Asignar Categoría</span>
      <ChevronGo width={20} height={20} stroke={ThemeLight.textColor} />
    </>
  )}
</button>

        </div>
        {/* Expandable Stock Section */}
        <div className="bg-white rounded-lg p-4 form-section-add-product mt-4">
          <button
            className="flex justify-between w-full"
            onClick={() => setDetailsExpanded(!detailsExpanded)}
          >
            <span>Inventario</span>
            <span>{detailsExpanded ? "▲" : "▼"}</span>
          </button>
          {detailsExpanded && (
            <div className="mt-4">
              <InputBasic
                placeholder="Existencias"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
              <div className="flex justify-between flex-wrap">
                <InputBasic
                  placeholder="Stock Mínimo"
                  value={minStock?.toString() || ""}
                  onChange={(e) => setMinStock(parseInt(e.target.value))}
                />
                <InputBasic
                  placeholder="Stock Óptimo"
                  value={optStock?.toString() || ""}
                  onChange={(e) => setOptStock(parseInt(e.target.value))}
                />
              </div>
              <InputBasic
                placeholder="Precio Promoción"
                value={promoPrice?.toString() || ""}
                onChange={(e) => setPromoPrice(parseFloat(e.target.value))}
              />
            
            </div>
          )}
        </div>

        {/* Expandable Details Section */}
        <div className="bg-white rounded-lg p-4 form-section-add-product mt-4">
          <button
            className="flex justify-between w-full"
            onClick={() => setDetailsExpanded(!detailsExpanded)}
          >
            <span>Detalles</span>
            <span>{detailsExpanded ? "▲" : "▼"}</span>
          </button>
          {detailsExpanded && (
            <div className="mt-4">
              <InputBasic
                placeholder="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex justify-between p-2">
                <p>Vender por</p>
              <button onClick={handleUnitChange}>{unitType}</button>
              </div>
              <div className="mt-4">
                <label className="flex justify-between">
                  Disponible para venta
                  <input
                  type="checkbox"
                  className="h-6 w-6 bg-white rounded"
                  style={{
                    backgroundColor: isAvailableForSale
                    ? context.store.Color || ThemeLight.secondaryColor
                    : "white",
                  }}
                  checked={isAvailableForSale}
                  onChange={() => setIsAvailableForSale(!isAvailableForSale)}
                  />
                </label>
              </div>
                <div className="mt-4">
                <label className="flex justify-between">
                  Mostrar en tienda
                  <input
                  type="checkbox"
                  className="h-6 w-6 bg-white rounded border-2"
                  style={{
                    borderColor: isDisplayedInStore
                    ? context.store.Color || ThemeLight.secondaryColor
                    : "#e2e8f0",
                    backgroundColor: isDisplayedInStore
                    ? context.store.Color || ThemeLight.secondaryColor
                    : "white",
                  }}
                  checked={isDisplayedInStore}
                  onChange={() => setIsDisplayedInStore(!isDisplayedInStore)}
                  />
                </label>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 bg-white flex justify-center container-btn-add-product">
        <button
          className="py-3 px-6 bg-purple-500 text-white rounded-lg shadow w-full max-w-96"
          onClick={handleSave}
          //colcoar el color del boton de acuerdo al color de la tienda
          style={{
            backgroundColor: context.store.Color || ThemeLight.secondaryColor,
          }}
        >
          Guardar
        </button>
      </footer>

      {/* Modals */}
      <PickerColor
        isVisible={isVisibleColorPicker}
        setIsVisible={setIsVisibleColorPicker}
        setColorSelected={setColorSelected}
        colorSelected={colorSelected}
      />
      <ModalKeyboard
        visible={showModal}
        setVisible={setShowModal}
        currentStock={stock}
        setStock={setStock}
      />
    </div>
  );
};
