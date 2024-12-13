import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../../Context/AppContext";
import { getProduct, updateProduct, deleteProduct } from "../Petitions";
import { PickerColor } from "../../CustomizeApp/PickerColor";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
import { ChevronGo } from "../../../../../assets/POS/ChevronGo";
import ImageIcon from "../../../../../assets/POS/ImageIcon";
import { InputBasic } from "../../Utilities/InputBasic";
import { Trash } from "../../../../../assets/POS/Trash";
import { ThemeLight } from "../../Theme/Theme";
import { DeleteProductModal } from "./DeleteProductModal";
import { Category } from "../../Model/Category";

export const EditProduct: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const scrollViewRef = useRef<HTMLDivElement>(null);

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [cost, setCost] = useState<string>("");
  const [barcode, setBarcode] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [minStock, setMinStock] = useState<number | undefined>(undefined);
  const [optStock, setOptStock] = useState<number | undefined>(undefined);
  const [promoPrice, setPromoPrice] = useState<number | null>(null);
  const [description, setDescription] = useState<string>("");
  const [unitType, setUnitType] = useState<string>("Unidad");
  const [colorSelected, setColorSelected] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [isAvailableForSale, setIsAvailableForSale] = useState<boolean>(true);
  const [isDisplayedInStore, setIsDisplayedInStore] = useState<boolean>(true);
  const [isVisibleColorPicker, setIsVisibleColorPicker] = useState<boolean>(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);

  useEffect(() => {
    if (productId) {
      context.setIsShowSplash(true);
      getProduct(parseInt(productId), context.user.Token).then((response) => {
        if (response) {
          setProductName(response.Name);
          setPrice(response.Price.toString());
          setCost(response.CostPerItem.toString());
          setBarcode(response.Barcode || "");
          setStock(response.Stock ? response.Stock.toString() : "");
          setMinStock(response.MinStock || undefined);
          setOptStock(response.OptStock || undefined);
          setPromoPrice(response.PromotionPrice || null);
          setDescription(response.Description || "");
          setColorSelected(response.Color || context.store.Color || ThemeLight.secondaryColor);
          setImage(response.Image || null);
          setIsAvailableForSale(response.ForSale);
          setIsDisplayedInStore(response.ShowInStore);
          context.setCategorySelected({
            Id: response.Category_Id,
            Name: response.Category_Name,
          } as Category);
        }
        context.setIsShowSplash(false);
      });
    }
  }, [productId, context.stockFlag]);

  const handleSave = async () => {
    try {
      context.setIsShowSplash(true);

      const product = {
        Id: parseInt(productId!),
        Name: productName,
        Price: parseFloat(price),
        CostPerItem: parseFloat(cost),
        Stock: parseFloat(stock) || null,
        ForSale: isAvailableForSale,
        ShowInStore: isDisplayedInStore,
        Image: image || "",
        Barcode: barcode,
        Description: description,
        Color: colorSelected,
        Business_Id: context.user.Business_Id,
        PromotionPrice: promoPrice || null,
        Category_Id: context.categorySelected.Id.toString(),
      };

      await updateProduct(product, context.user.Token); // This line is missing in the original code
      context.setStockFlag(!context.stockFlag); // This line is missing in the original code
      context.setCategorySelected({ Id: 0, Name: "", Color: "", Business_Id: 0 } as Category); // This line is missing in the original code
      context.setShowNavBarBottom(true); // This line is missing in the original code
      navigate("/main-products/items");
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      context.setIsShowSplash(false);
    }
  };

  const handleDelete = () => {
    deleteProduct(parseInt(productId!), context.user.Token).then(() => {
      context.setStockFlag(!context.stockFlag);
      navigate("/items");
    });
  };

  const handleUnitChange = () => {
    const unitOptions = ["Unidad", "Kilos", "Litros"];
    const currentIndex = unitOptions.indexOf(unitType);
    const nextIndex = (currentIndex + 1) % unitOptions.length;
    setUnitType(unitOptions[nextIndex]);
  };

  return (
    <div className="flex flex-col bg-gray-100 container-add-product">
      {/* Header */}
      <header
        className="flex items-center px-4 py-3 text-white "
        style={{ backgroundColor: context.store.Color || ThemeLight.btnBackground }}
      >
        <button onClick={() => {navigate(-1); context.setShowNavBarBottom(true);}} className="mr-auto">
          <ChevronBack />
        </button>
        <h1 className="text-lg font-bold text-center ">{productName || "Editar Producto"}</h1>
        <button onClick={() => setShowModalDelete(true)} className="ml-auto mr-10">
          <Trash width={30} height={30} fill={"#fff"} />
        </button>
      </header>

      {/* Scrollable Content */}
      <div ref={scrollViewRef} className="overflow-auto flex-grow p-4 scroll-container-add-product">
        {/* Image and Color Picker */}
        <div className="flex items-center justify-center mb-6 image-section-add-product">
          <button
            className="w-10 h-10 rounded"
            style={{ backgroundColor: colorSelected }}
            onClick={() => setIsVisibleColorPicker(true)}
          ></button>
          <div
            className="flex flex-col items-center mx-4 main-info-add-product"
            style={{
              backgroundColor: colorSelected,
              height: "150px",
              width: "150px",
              borderRadius: "10px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {image && <img src={image} alt="Product" className="h-full w-full object-cover" />}
            <div className="absolute bottom-0 left-0 w-full h-16 bg-black bg-opacity-40 text-white flex flex-col items-center justify-center">
              <span className="text-sm font-semibold w-full text-center">{productName}</span>
              <span className="text-base font-bold">${price || "0.00"}</span>
            </div>
          </div>
          <label className="p-2 rounded-full bg-gray-300 cursor-pointer" htmlFor="imageUpload">
            <ImageIcon />
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = () => setImage(reader.result as string);
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-lg p-4 form-section-add-product">
          <InputBasic placeholder="Nombre del producto" value={productName} onChange={(e) => setProductName(e.target.value)} />
          <InputBasic placeholder="Precio" value={price} onChange={(e) => setPrice(e.target.value)} />
          <InputBasic placeholder="Costo de adquisición" value={cost} onChange={(e) => setCost(e.target.value)} />
          <InputBasic placeholder="Código de barras" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
          <button className="flex items-center justify-between w-full py-3 px-4 bg-gray-50 rounded shadow-sm hover:bg-gray-100">
            {context.categorySelected.Name !== "" ? (
              <>
                <span className="text-purple-500 font-semibold">{context.categorySelected.Name}</span>
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
          <button className="flex justify-between w-full" onClick={() => setDetailsExpanded(!detailsExpanded)}>
            <span>Inventario</span>
            <span>{detailsExpanded ? "▲" : "▼"}</span>
          </button>
          {detailsExpanded && (
            <div className="mt-4">
              <InputBasic placeholder="Existencias" value={stock} onChange={(e) => setStock(e.target.value)} />
              <div className="flex justify-between flex-wrap">
                <InputBasic placeholder="Stock Mínimo" value={minStock?.toString() || ""} onChange={(e) => setMinStock(parseInt(e.target.value))} />
                <InputBasic placeholder="Stock Óptimo" value={optStock?.toString() || ""} onChange={(e) => setOptStock(parseInt(e.target.value))} />
              </div>
              <InputBasic placeholder="Precio Promoción" value={promoPrice?.toString() || ""} onChange={(e) => setPromoPrice(parseFloat(e.target.value))} />
            </div>
          )}
        </div>

        {/* Expandable Details Section */}
        <div className="bg-white rounded-lg p-4 form-section-add-product mt-4">
          <button className="flex justify-between w-full" onClick={() => setDetailsExpanded(!detailsExpanded)}>
            <span>Detalles</span>
            <span>{detailsExpanded ? "▲" : "▼"}</span>
          </button>
          {detailsExpanded && (
            <div className="mt-4">
              <InputBasic placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} />
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
          style={{ backgroundColor: context.store.Color || ThemeLight.secondaryColor }}
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
      <DeleteProductModal
        isVisible={showModalDelete}
        onClose={() => setShowModalDelete(false)}
        onDelete={handleDelete}
      />
    </div>
  );
};