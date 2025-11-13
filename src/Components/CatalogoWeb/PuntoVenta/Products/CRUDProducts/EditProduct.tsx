import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../../Context/AppContext";
import { getProduct, updateProduct, deleteProduct } from "../Petitions";
import { uploadImage } from "../../Cloudinary/Cloudinary";
import { PickerColor } from "../../CustomizeApp/PickerColor";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
import { ChevronGo } from "../../../../../assets/POS/ChevronGo";
import ImageIcon from "../../../../../assets/POS/ImageIcon";
import { InputBasic } from "../../Utilities/InputBasic";
import { Trash } from "../../../../../assets/POS/Trash";
import { ThemeLight } from "../../Theme/Theme";
import { DeleteProductModal } from "./DeleteProductModal";
import { Category } from "../../Model/Category";
import { Item } from "../../Model/Item";

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
  const [minStock, setMinStock] = useState<string>("");
  const [optStock, setOptStock] = useState<string>("");
  const [promoPrice, setPromoPrice] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [unitType, setUnitType] = useState<string>("Unidad");
  const [colorSelected, setColorSelected] = useState<string>("");
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isAvailableForSale, setIsAvailableForSale] = useState<boolean>(true);
  const [isDisplayedInStore, setIsDisplayedInStore] = useState<boolean>(true);
  const [isVisibleColorPicker, setIsVisibleColorPicker] = useState<boolean>(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [available, setAvailable] = useState<boolean>(true);
  const formLoadedRef = useRef(false);

  useEffect(() => {
    if (!productId || formLoadedRef.current) {
      return;
    }

    const currentId = parseInt(productId, 10);
    const draft = context.productFormState;

    if (draft && draft.mode === "edit" && draft.productId === currentId) {
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
      setAvailable(draft.available);
      setIsAvailableForSale(draft.isAvailableForSale);
      setIsDisplayedInStore(draft.isDisplayedInStore);
      formLoadedRef.current = true;
    }
  }, [context.productFormState, context.store.Color, productId]);

  useEffect(() => {
    if (!productId) {
      return;
    }

    const currentId = parseInt(productId, 10);
    if (
      context.productFormState &&
      context.productFormState.mode === "edit" &&
      context.productFormState.productId === currentId
    ) {
      return;
    }

    context.setIsShowSplash(true);
    getProduct(currentId, context.user.Token)
      .then((response) => {
        if (response) {
          setProductName(response.Name || "");
          setPrice(response.Price?.toString() || "");
          setCost(response.CostPerItem?.toString() || "");
          setBarcode(response.Barcode || "");
          setStock(response.Stock?.toString() || "");
          setMinStock(
            response.MinStock !== null && response.MinStock !== undefined
              ? response.MinStock.toString()
              : ""
          );
          setOptStock(
            response.OptStock !== null && response.OptStock !== undefined
              ? response.OptStock.toString()
              : ""
          );
          setPromoPrice(
            response.PromotionPrice !== null && response.PromotionPrice !== undefined
              ? response.PromotionPrice.toString()
              : ""
          );
          setDescription(response.Description || "");
          setColorSelected(response.Color || context.store.Color || ThemeLight.secondaryColor);
          const imagesFromResponse = Array.isArray(response.Images)
            ? response.Images
            : response.Image
            ? [response.Image]
            : [];
          setMainImage(imagesFromResponse[0] || null);
          setGalleryImages(imagesFromResponse.slice(1));
          setIsAvailableForSale(response.ForSale ?? true);
          setIsDisplayedInStore(response.ShowInStore ?? true);
          setAvailable(response.Available ?? true);
          context.setCategorySelected({
            Id: response.Category_Id || 0,
            Name: response.Category_Name || "",
            Color: response.Color || "",
          } as Category);
        }
        formLoadedRef.current = true;
      })
      .catch((error) => {
        console.error("Error loading product:", error);
      })
      .finally(() => {
        context.setIsShowSplash(false);
      });
  }, [productId, context.stockFlag, context.user.Token, context.store.Color]);

  useEffect(() => {
    if (!formLoadedRef.current || !productId) {
      return;
    }

    context.setProductFormState({
      mode: "edit",
      productId: parseInt(productId, 10),
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
      available,
    });
  }, [
    productId,
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
    available,
    context.setProductFormState,
  ]);

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      context.setIsShowSplash(true);

      const businessId = context.user?.Business_Id;
      if (!businessId) {
        throw new Error("El negocio no está disponible para actualizar productos");
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
        Id: productId ? parseInt(productId, 10) : undefined,
        Business_Id: businessId,
        Name: productName,
        Price: price ? parseFloat(price) : null,
        CostPerItem: cost ? parseFloat(cost) : null,
        Stock: stock ? parseFloat(stock) : null,
        ForSale: isAvailableForSale,
        ShowInStore: isDisplayedInStore,
        Available: available,
        Barcode: barcode.length > 0 ? barcode : null,
        Description: description,
        Color: colorSelected,
        PromotionPrice: promoPrice !== "" ? parseFloat(promoPrice) : null,
        Category_Id: context.categorySelected.Id || undefined,
        MinStock: minStock !== "" ? parseInt(minStock, 10) : null,
        OptStock: optStock !== "" ? parseInt(optStock, 10) : null,
        Images: sanitizedImages.length > 0 ? sanitizedImages : undefined,
        Volume: unitType !== "Unidad",
      };

      await updateProduct(product, context.user.Token); // This line is missing in the original code
      context.setStockFlag(!context.stockFlag); // This line is missing in the original code
      context.setCategorySelected({ Id: 0, Name: "", Color: "", Business_Id: 0 } as Category); // This line is missing in the original code
      context.setProductFormState(null);
      setMainImage(null);
      setGalleryImages([]);
      formLoadedRef.current = false;
      context.setShowNavBarBottom(true); // This line is missing in the original code
      navigate("/main-products/items");
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      context.setIsShowSplash(false);
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    deleteProduct(parseInt(productId!), context.user.Token).then(() => {
      context.setStockFlag(!context.stockFlag);
      context.setProductFormState(null);
      setMainImage(null);
      setGalleryImages([]);
      formLoadedRef.current = false;
      navigate(-1);
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
        <button
          onClick={() => {
            context.setProductFormState(null);
            formLoadedRef.current = false;
            setMainImage(null);
            setGalleryImages([]);
            navigate(-1);
            context.setShowNavBarBottom(true);
          }}
          className="mr-auto"
        >
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
            {mainImage && <img src={mainImage} alt="Product" className="h-full w-full object-cover" />}
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
            onChange={async (e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                try {
                  const previousMain = mainImage;
                  const dataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = () => reject(reader.error);
                    reader.readAsDataURL(file);
                  });
                  if (
                    previousMain &&
                    !galleryImages.some((imageValue) => imageValue === previousMain)
                  ) {
                    setGalleryImages((prev) => [...prev, previousMain]);
                  }
                  setMainImage(dataUrl);
                  e.target.value = "";
                } catch (error) {
                  console.error("Error al actualizar la imagen principal:", error);
                }
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
          <InputBasic placeholder="Nombre del producto" value={productName} onChange={(e) => setProductName(e.target.value)} />
          <InputBasic placeholder="Precio" value={price} onChange={(e) => setPrice(e.target.value)} />
          <InputBasic placeholder="Costo de adquisición" value={cost} onChange={(e) => setCost(e.target.value)} />
          <InputBasic placeholder="Código de barras" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
          <button
            className="flex items-center justify-between w-full py-3 px-4 bg-gray-50 rounded shadow-sm hover:bg-gray-100"
            onClick={() => navigate("/select-caterory-sales")}
          >
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
          className="py-3 px-6 bg-purple-500 text-white rounded-lg shadow w-full max-w-96 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSave}
          disabled={isSaving}
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