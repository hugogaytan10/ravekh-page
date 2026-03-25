import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../Context/AppContext";
import { getProductsByBusinessPaginated } from "../Petitions";
import PlusIcon from "../../../../../assets/POS/PlusIcon";

type Product = {
  Id?: number;
  Business_Id?: number;
  Name: string;
  Price: number | null;
  Image?: string;
  Images?: string[];
  Stock?: number | null;
  Barcode: string;
  Color: string;
};

type StockListProps = {
  barcode: string;
};

export const StockList: React.FC<StockListProps> = ({ barcode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [showModalPremium, setShowModalPremium] = useState(false);
  const [imageErrorsByProduct, setImageErrorsByProduct] = useState<Record<string, boolean>>({});
  const context = useContext(AppContext);
  const navigate = useNavigate();

  const isHelper = context.user?.Role === "AYUDANTE";
  const productLimit = (context.store?.Plan ?? localStorage.getItem("plan") ?? "").trim();

  const truncate = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  useEffect(() => {
    if (barcode) {
      setProducts(products.filter((product) => product.Barcode === barcode));
    }
  }, [barcode]);

  useEffect(() => {
    context.setIsShowSplash(true);
    if (context.user.Token && context.store.Id && productLimit) {
      getProductsByBusinessPaginated(
        context.user.Token,
        context.user.Business_Id.toString(),
        currentPage,
        productLimit,
      ).then(
        (response) => {
          if (response?.products) {
            setCurrentPage(response.pagination.page);
            setTotalPages(response.pagination.totalPages);
            setHasNextPage(response.pagination.hasNext);
            setHasPrevPage(response.pagination.hasPrev);
            setProducts(
              response.products.map((product) => {
                const mainImage = product.Image || product.Images?.[0] || "";
                return {
                  ...product,
                  Image: mainImage,
                  Name: truncate(product.Name, 16),
                };
              })
            );
          }
          context.setIsShowSplash(false);
        }
      );
    } else {
      navigate("/login-punto-venta");
    }
  }, [context.stockFlag, currentPage, productLimit]);

  useEffect(() => {
    setCurrentPage(1);
  }, [barcode]);

  const handleStockEdit = (product: Product) => {
    if (context.user.Role !== "AYUDANTE") {
      context.setShowNavBarBottom(false); // This is a function from the context
      navigate(`/keyboardProduct/${product.Id}/${product.Stock}`); // navegar a la ruta /keyboardProduct/:productId/:currentStock
    }
  };

  const renderHeader = () =>
    context.user.Role !== "AYUDANTE" && (
      <div className="mb-2">
        <button
          onClick={() => {
            if (
              (context.store.Plan === "PRUEBA" && products.length >= 50) ||
              (context.store.Plan === "GRATUITO" && products.length >= 10) ||
              (context.store.Plan === "EMPRENDEDOR" &&
                products.length >= 200) ||
              (context.store.Plan === "EMPRESARIAL" && products.length >= 2000)
            ) {
              setShowModalPremium(true);
            } else {
              context.setShowNavBarBottom(false);
              navigate("/add-product-products");
            }
          }}
          className="w-full flex items-center bg-white px-4 py-2 rounded-md shadow hover:bg-gray-50"
        >
          <PlusIcon width={25} height={25} color={context.store.Color} />
          <span
            className="ml-2 text-lg font-medium"
            style={{ color: context.store.Color }}
          >
            Crear nuevo producto
          </span>
        </button>
      </div>
    );

  const renderItem = (item: Product) => {
    const stockColor =
      item.Stock === 0
        ? "text-red-500"
        : item.Stock! > 10
        ? "text-green-500"
        : "text-orange-500";
    const itemKey = `${item.Id ?? item.Name}`;
    const hasImage = Boolean(item.Image || item.Images?.[0]);
    const hasImageError = imageErrorsByProduct[itemKey];

    return (
      <div key={item.Id} className="flex items-center p-4 bg-white border-b">
        {hasImage && !hasImageError ? (
          <div className="relative w-24 h-16 mr-4">
            <img
              src={item.Image || item.Images?.[0] || ""}
              alt={item.Name}
              className="w-full h-full object-cover rounded"
              onError={() =>
                setImageErrorsByProduct((prev) => ({
                  ...prev,
                  [itemKey]: true,
                }))
              }
            />
          </div>
        ) : (
          <div
            className="w-24 h-16 mr-4 flex items-center justify-center rounded"
            style={{ backgroundColor: item.Color }}
          >
            <span className="text-white font-bold text-center">{item.Name}</span>
          </div>
        )}
        <div className="flex-1 flex justify-between items-center">
          <span className="text-base font-medium text-gray-800 truncate">
            {item.Name}
          </span>
          <button
            className={`px-4 py-1 border rounded-full ${stockColor} md:w-40`}
            onClick={() => handleStockEdit(item)}
            disabled={isHelper}
          >
            {item.Stock! > 0 ? item.Stock : "Sin stock"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderHeader()}
      <div className="overflow-y-auto pb-28">
        {products.map((item) => renderItem(item))}
      </div>
      {totalPages > 1 && (
        <div className="mt-2 px-1 py-2 border-t border-gray-200 bg-white/95 flex items-center justify-between">
          <button
            type="button"
            className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={!hasPrevPage}
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700 font-medium">
            Página {currentPage} de {totalPages}
          </span>
          <button
            type="button"
            className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={!hasNextPage}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};
