import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../../Context/AppContext";
import { getProducts } from "../Petitions";
import { ThemeLight } from "../../Theme/Theme";
import { ChevronGo } from "../../../../../assets/POS/ChevronGo";
import PlusIcon from "../../../../../assets/POS/PlusIcon";
import { useNavigate } from "react-router-dom";
import { URL } from "../../Const/Const";

interface Product {
  Id?: number;
  Business_Id?: number;
  Name: string;
  Category_Id?: string | null;
  Price: number | null;
  Image?: string;
  Images?: string[];
  Stock?: number | null;
  Cost?: number;
  IsLabeled?: boolean;
  Volume?: boolean;
  PromotionPrice?: number | null;
  Barcode?: string;
  ForSale?: boolean;
  ShowInStore?: boolean;
  Description?: string;
  Color?: string;
  MinStock?: number;
  OptStock?: number;
  ExpDate?: string;
}

type ListProps = {
  barCode: string;
};

export const List: React.FC<ListProps> = ({ barCode }: ListProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true); // Estado de carga
  const [showModalPremium, setShowModalPremium] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const context = useContext(AppContext);
  const navigation = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const truncate = (text: string, length: number) =>
    text.length > length ? `${text.substring(0, length)}...` : text;

  const fetchProducts = () => {
    setLoading(true); // Activar el estado de carga
    getProducts(context.user.Token, context.user.Business_Id + "").then(
      (response) => {
        if (response) {
          if (context.store.Plan === "GRATUITO") {
            response = response.slice(0, 10);
          }
          setProducts(
            response.map((product: Product) => {
              const mainImage = product.Image || product.Images?.[0] || "";
              return {
                ...product,
                Image: mainImage,
                Name: truncate(product.Name, 16),
              };
            })
          );
        }
        setLoading(false); // Desactivar el estado de carga cuando los datos estén listos
      }
    );
  };

  useEffect(() => {
    if (barCode) {
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.Barcode === barCode)
      );
    }
  }, [barCode]);

  useEffect(() => {
    fetchProducts();
  }, [context.stockFlag]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files || []);
    const spreadsheetFile = selectedFiles.find((f) =>
      /\.(xlsx|xls|csv)$/i.test(f.name)
    );

    if (!spreadsheetFile) {
      setImportMessage("Selecciona un archivo de Excel o CSV para importar.");
      event.target.value = "";
      return;
    }

    setImporting(true);
    setImportMessage(null);
    setImportErrors([]);

    try {
      const XLSX = await import( 
        "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm"
      );

      const data = await spreadsheetFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error("El archivo no contiene hojas de cálculo.");
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
        defval: "",
      });

      if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error("No se encontraron registros para importar.");
      }

      const parseImages = (rawImages: unknown): string[] => {
        if (!rawImages) return [];

        return (Array.isArray(rawImages) ? rawImages : String(rawImages).split(","))
          .map((img) => String(img).trim())
          .filter(Boolean);
      };

      const toBoolean = (value: any) => {
        if (typeof value === "boolean") return value;
        if (typeof value === "number") return value === 1;
        if (typeof value === "string") {
          const trimmed = value.trim().toLowerCase();
          if (trimmed === "true") return true;
          if (trimmed === "false") return false;
          if (trimmed === "1") return true;
          if (trimmed === "0") return false;
        }
        return undefined;
      };

      const toNumberOrNull = (value: any) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
      };

      const normalizedRows = await Promise.all(
        rows.map(async (row) => {
          const images = parseImages(row.Images || row.Image || row.image);
          const color = String(row.Color ?? row.color ?? "").trim() || "#000000";

          const normalizedRow = {
            Barcode: row.Barcode ?? row.barcode ?? "",
            Business_Id: context.user.Business_Id,
            Category: row.Category ?? row.category ?? "",
            Subcategory: row.Subcategory ?? row.subcategory ?? "",
            Name: row.Name ?? row.name ?? "",
            Color: color,
            Price: toNumberOrNull(row.Price ?? row.price),
            CostPerItem: toNumberOrNull(
              row.CostPerItem ?? row.costperitem ?? row.Cost ?? row.cost
            ),
            Stock: toNumberOrNull(row.Stock ?? row.stock),
            Description: row.Description ?? row.description ?? "",
            Volume: toBoolean(row.Volume ?? row.volume),
            ForSale: toBoolean(row.ForSale ?? row.forsale ?? row["For Sale"]),
            ShowInStore: toBoolean(
              row.ShowInStore ?? row.showinstore ?? row["Show In Store"]
            ),
            Available: toBoolean(row.Available ?? row.available),
            Images: images,
            PromotionPrice: toNumberOrNull(
              row.PromotionPrice ?? row.promotionprice
            ),
            ExpDate: row.ExpDate ?? row.expdate ?? row["Exp Date"] ?? "",
            MinStock: toNumberOrNull(row.MinStock ?? row.minstock),
            OptStock: toNumberOrNull(row.OptStock ?? row.optstock),
          } as Record<string, any>;

          normalizedRow.color = normalizedRow.Color; // soporte por si el backend espera minúsculas

          return normalizedRow;
        })
      );

      const response = await fetch(
        `${URL}products/import/${context.user.Business_Id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: context.user.Token,
          },
          body: JSON.stringify({ rows: normalizedRows }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "No se pudieron importar los productos.");
      }

      setImportMessage(`Productos importados: ${result.imported || 0}`);
      const resultErrors = Array.isArray(result.errors) ? result.errors : [];
      setImportErrors(resultErrors);
      fetchProducts();
    } catch (error: any) {
      setImportMessage(error?.message || "Ocurrió un error al importar.");
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  };

  const renderSkeleton = () => {
    return (
      <div className="p-2 rounded-md mb-20">
        <div className="bg-gray-200 animate-pulse h-10 w-full mb-4"></div>
        <div className="flex flex-wrap gap-4">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-200 animate-pulse h-24 w-full md:w-2/5 lg:w-3/12 rounded-md"
            ></div>
          ))}
        </div>
      </div>
    );
  };

  const renderHeader = () => {
    const isAdminOrManager =
      context.user?.Role === "ADMINISTRADOR" ||
      context.user?.Role === "GERENTE";
    const isHelper = context.user?.Role === "AYUDANTE";

    const handleAddProduct = () => {
      if (
        (context.store.Plan === "PRUEBA" && products.length >= 50) ||
        (context.store.Plan === "GRATUITO" && products.length >= 10) ||
        (context.store.Plan === "EMPRENDEDOR" && products.length >= 200) ||
        (context.store.Plan === "EMPRESARIAL" && products.length >= 2000)
      ) {
        setShowModalPremium(true);
      } else {
        context.setShowNavBarBottom(false); // Ocultar la barra de navegación
        navigation("/add-product-products");
      }
    };

    if (isHelper) return null;

    return (
      <div className="bg-white mt-2 py-5 px-4 rounded-md mb-2">
        <button
          className="flex justify-between items-center w-full py-2 border-b border-gray-300"
          onClick={() => {
            context.setShowNavBarBottom(false);
            navigation("/select-category-product");
          }}
        >
          <span className="text-lg font-medium text-gray-700">Categorías</span>
          <ChevronGo width={25} height={25} stroke={ThemeLight.textColor} />
        </button>
        {isAdminOrManager && (
          <div className="flex flex-col gap-3 mt-3">
            <button
              className="flex items-center py-2 border-b border-gray-300 w-full"
              onClick={handleAddProduct}
            >
              <PlusIcon width={25} height={25} color={context.store.Color} />
              <span className="ml-3 text-lg font-medium text-purple-500">
                Crear nuevo producto
              </span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              className="flex items-center py-2 border-b border-gray-300 w-full"
              onClick={handleImportClick}
              disabled={importing}
            >
              <span className="ml-1 text-lg font-medium text-purple-500">
                {importing ? "Importando..." : "Importar productos"}
              </span>
            </button>

            {importMessage && (
              <div className="text-sm text-gray-700 bg-purple-50 p-2 rounded">
                {importMessage}
                {importErrors.length > 0 && (
                  <ul className="list-disc list-inside text-red-500 mt-1 space-y-1">
                    {importErrors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderItem = (item: Product) => {
    const isHelper = context.user?.Role === "AYUDANTE";

    return (
      <button
        className="flex items-center w-full bg-white p-2 border-b border-gray-300 rounded-md h-24"
        onClick={() => {
          if (!isHelper) {
            context.setShowNavBarBottom(false);
            navigation(`/edit-product/${item.Id}`);
          }
        }}
        disabled={isHelper}
      >
        {(item.Image || item.Images?.[0]) ? (
          <img
            src={item.Image || item.Images?.[0] || ""}
            alt={item.Name}
            className="w-24 h-full object-cover rounded mr-4"
          />
        ) : (
          <div
            className="w-24 h-full flex items-center justify-center rounded mr-4"
            style={{ backgroundColor: item.Color || "#ccc" }}
          >
            <span className="text-white text-sm font-medium">{item.Name}</span>
          </div>
        )}
        <div className="flex-1 flex justify-between items-center">
          <span className="text-lg font-medium text-gray-800 md:text-base">
            {item.Name}
          </span>
          <div className="flex flex-col items-end">
            {item.PromotionPrice ? (
              <>
                <span className="text-lg font-semibold text-green-600 md:text-sm">
                  ${item.PromotionPrice.toFixed(2) || "0.00"}
                </span>
                <span className="text-sm line-through text-gray-500 md:text-base">
                  ${item.Price?.toFixed(2)}
                </span>
              </>
            ) : (
              <>
                <span className="text-sm line-through text-gray-500 md:text-sm">
                  ${item.PromotionPrice?.toFixed(2) || "0.00"}
                </span>
                <span className="text-lg font-semibold text-gray-800 md:text-base">
                  ${item.Price?.toFixed(2)}
                </span>
              </>
            )}
          </div>
        </div>
      </button>
    );
  };

  return loading ? renderSkeleton() : (
    <div className="p-2 rounded-md mb-20">
      {renderHeader()}
      <div className="space-y-1 flex flex-wrap justify-around gap-1">
        {products.map((product) => (
          <div key={product.Id} className="w-full md:w-2/5 lg:w-3/12">
            {renderItem(product)}
          </div>
        ))}
      </div>
    </div>
  );
};
