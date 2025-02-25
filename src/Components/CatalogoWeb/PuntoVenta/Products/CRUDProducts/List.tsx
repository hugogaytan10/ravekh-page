import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../Context/AppContext";
import { getProducts } from "../Petitions";
import { ThemeLight } from "../../Theme/Theme";
import { ChevronGo } from "../../../../../assets/POS/ChevronGo";
import PlusIcon from "../../../../../assets/POS/PlusIcon";
import { useNavigate } from "react-router-dom";

interface Product {
  Id?: number;
  Business_Id?: number;
  Name: string;
  Category_Id?: string | null;
  Price: number | null;
  Image: string;
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
  const context = useContext(AppContext);
  const navigation = useNavigate();

  const truncate = (text: string, length: number) =>
    text.length > length ? `${text.substring(0, length)}...` : text;

  useEffect(() => {
    if (barCode) {
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.Barcode === barCode)
      );
    }
  }, [barCode]);

  useEffect(() => {
    setLoading(true); // Activar el estado de carga
    getProducts(context.user.Token, context.user.Business_Id + "").then(
      (response) => {
        if (response) {
          if (context.store.Plan === "GRATUITO") {
            response = response.slice(0, 10);
          }
          setProducts(
            response.map((product: Product) => ({
              ...product,
              Name: truncate(product.Name, 16),
            }))
          );
        }
        setLoading(false); // Desactivar el estado de carga cuando los datos estén listos
      }
    );
  }, [context.stockFlag]);

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
          <button
            className="flex items-center py-2 mt-3 border-b border-gray-300 w-full"
            onClick={handleAddProduct}
          >
            <PlusIcon width={25} height={25} color={context.store.Color} />
            <span className="ml-3 text-lg font-medium text-purple-500">
              Crear nuevo producto
            </span>
          </button>
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
        {item.Image ? (
          <img
            src={item.Image}
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
