import React, { useState, useRef, useContext, useEffect } from "react";
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
import { VariantDraft } from "./variantTypes";
import { draftsToVariants, syncDraftColors } from "./variantUtils";
import VariantsEditor from "./VariantsEditor";

export const AddProduct: React.FC = () => {
  const context = useContext(AppContext);
  const navigation = useNavigate();
  const scrollViewRef = useRef<HTMLDivElement>(null);

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [cost, setCost] = useState<string>("");
  const [barcode, setBarcode] = useState("");
  const [stock, setStock] = useState<string>("");
  const [minStock, setMinStock] = useState<string>("");
  const [optStock, setOptStock] = useState<string>("");
  const [promoPrice, setPromoPrice] = useState<string>("");
  const [inventoryExpanded, setInventoryExpanded] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [variantsExpanded, setVariantsExpanded] = useState(false);
  const [isAvailableForSale, setIsAvailableForSale] = useState(true);
  const [isDisplayedInStore, setIsDisplayedInStore] = useState(true);
  const [description, setDescription] = useState("");
  const [unitType, setUnitType] = useState("Unidad");
  const [colorSelected, setColorSelected] = useState(
    context.store.Color || ThemeLight.secondaryColor
  );
  const [isVisibleColorPicker, setIsVisibleColorPicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const formLoadedRef = useRef(false);
  const [variantDrafts, setVariantDrafts] = useState<VariantDraft[]>([]);

  const unitOptions = ["Unidad", "Kilos", "Litros"];
  const accentColor = colorSelected || ThemeLight.secondaryColor;

  useEffect(() => {
    if (formLoadedRef.current) {
      return;
    }

    const draft = context.productFormState;
    if (draft && draft.mode === "add") {
      setProductName(draft.productName);
      setPrice(draft.price);
      setCost(draft.cost);
      setBarcode(draft.barcode);
      setStock(draft.stock);
      setMinStock(draft.minStock);
      setOptStock(draft.optStock);
      setPromoPrice(draft.promoPrice);
      setDescription(draft.description);
      setUnitType(draft.unitType);
      setColorSelected(draft.colorSelected || context.store.Color || ThemeLight.secondaryColor);
      setGalleryImages(draft.galleryImages || []);
      setIsAvailableForSale(draft.isAvailableForSale);
      setIsDisplayedInStore(draft.isDisplayedInStore);
      setVariantDrafts(draft.variantDrafts || []);
    }

    formLoadedRef.current = true;
  }, [context.productFormState, context.store.Color]);

  useEffect(() => {
    if (!formLoadedRef.current) {
      return;
    }

    context.setProductFormState({
      mode: "add",
      productName,
      price,
      cost,
      barcode,
      stock,
      minStock,
      optStock,
      promoPrice,
      description,
      unitType,
      colorSelected,
      galleryImages,
      isAvailableForSale,
      isDisplayedInStore,
      available: true,
      variantDrafts,
    });
  }, [
    productName,
    price,
    cost,
    barcode,
    stock,
    minStock,
    optStock,
    promoPrice,
    description,
    unitType,
    colorSelected,
    galleryImages,
    isAvailableForSale,
    isDisplayedInStore,
    variantDrafts,
    context.setProductFormState,
  ]);

  useEffect(() => {
    setVariantDrafts((prev) => syncDraftColors(prev, colorSelected));
  }, [colorSelected]);

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      context.setIsShowSplash(true);

      const businessId = context.user?.Business_Id;
      if (!businessId) {
        throw new Error("El negocio no está disponible para crear productos");
      }

      const imagesToUpload = [mainImage, ...galleryImages].filter(
        (value): value is string => Boolean(value)
      );
      const uploadedImages = await Promise.all(
        imagesToUpload.map(async (imageSource) => {
          if (imageSource.startsWith("http")) {
            return imageSource;
          }
          const uploadedUrl = await uploadImage(imageSource);
          return uploadedUrl || "";
        })
      );
      const sanitizedImages = uploadedImages.filter((url) => url);

      const product: Item = {
        Business_Id: businessId,
        Name: productName,
        Price: price ? parseFloat(price) : null,
        CostPerItem: cost ? parseFloat(cost) : null,
        Stock: stock ? parseFloat(stock) : null,
        Barcode: barcode || null,
        PromotionPrice: promoPrice !== "" ? parseFloat(promoPrice) : null,
        Description: description,
        Color: colorSelected,
        ForSale: isAvailableForSale,
        ShowInStore: isDisplayedInStore,
        Available: true,
        Volume: unitType !== "Unidad",
        Category_Id: context.categorySelected.Id
          ? context.categorySelected.Id
          : undefined,
        MinStock: minStock !== "" ? parseInt(minStock, 10) : null,
        OptStock: optStock !== "" ? parseInt(optStock, 10) : null,
        Images: sanitizedImages.length > 0 ? sanitizedImages : undefined,
      };

      const variantsPayload = draftsToVariants(variantDrafts, colorSelected);

      await insertProduct(product, context.user?.Token, variantsPayload);

      context.setStockFlag(!context.stockFlag);
      context.setCategorySelected({ Id: 0, Name: "", Color: "" } as Category);
      context.setProductFormState(null);
      setMainImage(null);
      setGalleryImages([]);
      setVariantDrafts([]);
      formLoadedRef.current = false;
      context.setShowNavBarBottom(true); // Mostrar la barra de navegación inferior
      navigation("/main-products/items");
    } catch (error) {
      console.error("Error al guardar el producto:", error);
    } finally {
      context.setIsShowSplash(false);
      setIsSaving(false);
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
        <button
          onClick={() => {
            context.setProductFormState(null);
            formLoadedRef.current = false;
            setMainImage(null);
            setGalleryImages([]);
            setVariantDrafts([]);
            navigation("/main-products/items");
            context.setShowNavBarBottom(true);
          }}
          className="mr-auto"
        >
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
            {mainImage && (
              <img
                src={mainImage}
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
            multiple
            className="hidden"
            onChange={async (e) => {
              if (!e.target.files || e.target.files.length === 0) {
                return;
              }
              try {
                const files = Array.from(e.target.files);
                const images = await Promise.all(
                  files.map(
                    (file) =>
                      new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = () => reject(reader.error);
                        reader.readAsDataURL(file);
                      })
                  )
                );
                const [nextMain, ...extraImages] = images;
                if (nextMain) {
                  const previousMain = mainImage;
                  setMainImage(nextMain);
                  setGalleryImages((prev) => {
                    const nextGallery = [...prev];
                    if (previousMain && !nextGallery.includes(previousMain)) {
                      nextGallery.push(previousMain);
                    }
                    extraImages.forEach((imageValue) => {
                      if (!nextGallery.includes(imageValue)) {
                        nextGallery.push(imageValue);
                      }
                    });
                    return nextGallery;
                  });
                }
                e.target.value = "";
              } catch (error) {
                console.error("Error al cargar la imagen principal:", error);
              }
            }}
          />
        </div>

        {/* Imágenes adicionales */}
        <div className="w-full mb-6">
          {galleryImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-3">
              {galleryImages.map((imageUrl, index) => (
                <div key={`${imageUrl}-${index}`} className="relative">
                  <img
                    src={imageUrl}
                    alt={`Producto adicional ${index + 1}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="absolute inset-0 flex flex-col justify-between p-1">
                    <button
                      type="button"
                      className="text-xs bg-black/60 text-white rounded px-1"
                      onClick={() => {
                        const selectedImage = galleryImages[index];
                        if (!selectedImage) {
                          return;
                        }
                        const remaining = galleryImages.filter((_, i) => i !== index);
                        if (mainImage) {
                          remaining.push(mainImage);
                        }
                        setGalleryImages(remaining);
                        setMainImage(selectedImage);
                      }}
                    >
                      Principal
                    </button>
                    <button
                      type="button"
                      className="text-xs bg-red-600 text-white rounded px-1 self-end"
                      onClick={() => {
                        setGalleryImages((prev) => prev.filter((_, i) => i !== index));
                      }}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <label
            className="inline-flex items-center gap-2 px-3 py-2 rounded bg-gray-200 text-sm cursor-pointer"
            htmlFor="galleryUpload"
          >
            <ImageIcon />
            Agregar imágenes adicionales
          </label>
          <input
            id="galleryUpload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={async (e) => {
              if (!e.target.files || e.target.files.length === 0) {
                return;
              }
              try {
                const files = Array.from(e.target.files);
                const images = await Promise.all(
                  files.map(
                    (file) =>
                      new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = () => reject(reader.error);
                        reader.readAsDataURL(file);
                      })
                  )
                );
                setGalleryImages((prev) => [...prev, ...images]);
                e.target.value = "";
              } catch (error) {
                console.error("Error al cargar imágenes adicionales:", error);
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
            onClick={() => setInventoryExpanded(!inventoryExpanded)}
          >
            <span>Inventario</span>
            <span>{inventoryExpanded ? "▲" : "▼"}</span>
          </button>
          {inventoryExpanded && (
            <div className="mt-4">
              <InputBasic
                placeholder="Existencias"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                keyboardType="number"
              />
              <div className="flex justify-between flex-wrap">
                <InputBasic
                  placeholder="Stock Mínimo"
                  value={minStock}
                  onChange={(e) => {
                    const { value } = e.target;
                    if (value === "" || /^\d+$/.test(value)) {
                      setMinStock(value);
                    }
                  }}
                  keyboardType="number"
                />
                <InputBasic
                  placeholder="Stock Óptimo"
                  value={optStock}
                  onChange={(e) => {
                    const { value } = e.target;
                    if (value === "" || /^\d+$/.test(value)) {
                      setOptStock(value);
                    }
                  }}
                  keyboardType="number"
                />
              </div>
              <InputBasic
                placeholder="Precio Promoción"
                value={promoPrice}
                onChange={(e) => {
                  const { value } = e.target;
                  if (value === "" || /^\d+(\.\d*)?$/.test(value)) {
                    setPromoPrice(value);
                  }
                }}
                keyboardType="number"
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
                    ? accentColor
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
                    ? accentColor
                    : "#e2e8f0",
                    backgroundColor: isDisplayedInStore
                    ? accentColor
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

        {/* Variants Section */}
        <div className="bg-white rounded-lg p-4 form-section-add-product mt-4">
          <button
            className="flex justify-between w-full"
            onClick={() => setVariantsExpanded(!variantsExpanded)}
          >
            <span>Variantes</span>
            <span>{variantsExpanded ? "▲" : "▼"}</span>
          </button>
          {variantsExpanded && (
            <div className="mt-4">
              <VariantsEditor
                variants={variantDrafts}
                onChange={setVariantDrafts}
                accentColor={accentColor}
                showSectionHeader={false}
                containerClassName="bg-transparent border-0 shadow-none p-0"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 bg-white flex justify-center container-btn-add-product">
        <button
          className="py-3 px-6 bg-purple-500 text-white rounded-lg shadow w-full max-w-96 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSave}
          disabled={isSaving}
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
