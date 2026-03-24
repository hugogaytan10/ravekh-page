import React, { useEffect, useState, useContext, useMemo, useCallback } from "react";
import { SalesBar } from "./NavBar/SalesBar";
import { ProductList } from "../Sales/Card";
import { List } from "./List";
import PlusIcon from "../../../../assets/POS/PlusIcon";
import {
  getBusinessInformation,
  getTaxes,
  getCategoriesByBusiness,
  getProductsAvailableByBusiness,
  getProductsByCategory,
} from "./Petitions";
import "./Css/MainSales.css";
import { Item } from "../Model/Item";
import { Category } from "../Model/Category";
import { AppContext } from "../../Context/AppContext";
import { useLocation, useNavigate } from "react-router-dom";

type CategoryOption = {
  key: string;
  label: string;
  categoryId: number | null;
};

export const MainSales: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const location = useLocation();

  const [products, setProducts] = useState<Item[]>([]);
  const [view, setView] = useState(true);
  const [showModalPremium, setShowModalPremium] = useState(false);
  const [loader, setLoader] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>("all");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [availableCategoryIds, setAvailableCategoryIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const skeletonCards = useMemo(() => Array.from({ length: 8 }), []);
  const productLimit = useMemo(() => {
    const planFromBusiness = (context.store?.Plan ?? "").trim();
    if (planFromBusiness) {
      return planFromBusiness;
    }

    const planFromStorage = (localStorage.getItem("plan") ?? "").trim();
    return planFromStorage;
  }, [context.store?.Plan]);

  const categoryOptions = useMemo<CategoryOption[]>(() => {
    const dynamic = categories
      .filter((category) => availableCategoryIds.includes(Number(category.Id)))
      .map((category) => ({
      key: String(category.Id),
      label: category.Name,
      categoryId: category.Id,
      }));

    return [{ key: "all", label: "Todos", categoryId: null }, ...dynamic];
  }, [availableCategoryIds, categories]);

  const selectedCategoryOption = useMemo(() => {
    return (
      categoryOptions.find((option) => option.key === selectedCategoryKey) ||
      categoryOptions[0]
    );
  }, [categoryOptions, selectedCategoryKey]);

  const moveCategory = useCallback(
    (direction: "prev" | "next") => {
      if (categoryOptions.length <= 1) {
        return;
      }

      const currentIndex = categoryOptions.findIndex(
        (option) => option.key === selectedCategoryKey,
      );
      const safeIndex = currentIndex >= 0 ? currentIndex : 0;
      const delta = direction === "next" ? 1 : -1;
      const nextIndex = (safeIndex + delta + categoryOptions.length) % categoryOptions.length;
      setSelectedCategoryKey(categoryOptions[nextIndex].key);
    },
    [categoryOptions, selectedCategoryKey],
  );

  useEffect(() => {
    const checkFocus = () => context.setShowNavBarBottom(true);
    checkFocus();
    window.addEventListener("popstate", checkFocus);
    return () => window.removeEventListener("popstate", checkFocus);
  }, [location.pathname, context.setShowNavBarBottom]);

  useEffect(() => {
    if (!context.user?.Business_Id || !context.user?.Token) {
      setLoader(false);
      setProducts([]);
      return;
    }

    const selectedCategoryId = selectedCategoryOption?.categoryId ?? null;

    setLoader(true);
    const fetchProducts = selectedCategoryId === null
      ? getProductsAvailableByBusiness(
        context.user.Business_Id,
        context.user.Token,
        productLimit,
        currentPage,
      )
      : getProductsByCategory(
        selectedCategoryId,
        context.user.Token,
        productLimit,
        currentPage,
      );

    fetchProducts
      .then((response) => {
        const normalized = response.products.map((product: Item) => ({
          ...product,
          Image: (product as Item & { Image?: string }).Image || product.Images?.[0] || "",
        }));
        setProducts(normalized);
        if (selectedCategoryId === null) {
          setAvailableCategoryIds(response.pagination.categoryIds);
        }
        setCurrentPage(response.pagination.page);
        setTotalPages(response.pagination.totalPages);
      })
      .finally(() => setLoader(false));
  }, [
    context.user.Business_Id,
    context.user.Token,
    context.stockFlag,
    selectedCategoryOption?.categoryId,
    currentPage,
    productLimit,
  ]);

  useEffect(() => {
    if (!context.user?.Business_Id || !context.user?.Token) {
      return;
    }

    getCategoriesByBusiness(context.user.Business_Id.toString(), context.user.Token)
      .then((data: Category[]) => {
        const mapped = Array.isArray(data) ? data : [];
        setCategories(mapped);

        if (mapped.length > 0) {
          setSelectedCategoryKey((prev) => {
            const prevExists = mapped.some(
              (category) => String(category.Id) === prev || prev === "all",
            );
            return prevExists ? prev : "all";
          });
          return;
        }

        setSelectedCategoryKey("all");
      })
      .catch(() => {
        setCategories([]);
        setSelectedCategoryKey("all");
      });
  }, [context.user.Business_Id, context.user.Token, context.stockFlag]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryKey]);

  useEffect(() => {
    if (!context.user?.Business_Id || !context.user?.Token) {
      return;
    }

    getBusinessInformation(context.user.Business_Id.toString(), context.user.Token)
      .then((data: any) => data && context.setStore(data));

    getTaxes(context.user.Business_Id.toString(), context.user.Token)
      .then((data: any) => data && context.setTax(data));
  }, [
    context.user.Business_Id,
    context.user.Token,
    context.setStore,
    context.setTax,
  ]);

  const { totalPrice, totalItems } = useMemo(() => {
    let totalP = 0;
    let total = 0;
    context.cartPos.forEach((item) => {
      total += item.Quantity;
      totalP += item.Quantity * item.Price;
    });
    return { totalPrice: totalP, totalItems: total };
  }, [context.cartPos]);

  const handleAddProduct = useCallback(() => {
    if (context.store.Plan === "GRATUITO" && products.length >= 10) {
      setShowModalPremium(true);
    } else {
      context.setShowNavBarBottom(false);
      navigate("/add-product");
    }
  }, [context.store.Plan, context.setShowNavBarBottom, navigate, products.length]);

  const MemoizedProductList = useMemo(
    () => (
      <div className="py-2">
        <ProductList
          products={products}
          onAddProduct={handleAddProduct}
          storeColor={context.store.Color}
        />
      </div>
    ),
    [products, handleAddProduct, context.store.Color]
  );

  return (
    <div className="main-sales">
      <div className="header-tools">
        <SalesBar
          view={view}
          setView={setView}
          products={products}
          setFilteredProducts={() => undefined}
        />
      </div>

      <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
        <button
          type="button"
          className="text-xl font-semibold px-2 text-gray-700"
          onClick={() => moveCategory("prev")}
        >
          ‹
        </button>
        <button
          type="button"
          className="text-sm font-semibold text-gray-800 px-3 py-1 rounded-md hover:bg-gray-100"
          onClick={() => setIsCategoryModalOpen(true)}
        >
          {selectedCategoryOption?.label || "Todos"}
        </button>
        <button
          type="button"
          className="text-xl font-semibold px-2 text-gray-700"
          onClick={() => moveCategory("next")}
        >
          ›
        </button>
      </div>

      {isCategoryModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
          onClick={() => setIsCategoryModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-gray-900 mb-3">Seleccionar categoría</h3>
            <div className="max-h-[60vh] overflow-y-auto space-y-2">
              {categoryOptions.map((option) => {
                const isActive = option.key === selectedCategoryKey;
                return (
                  <button
                    key={option.key}
                    type="button"
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      isActive
                        ? "bg-purple-100 text-purple-800 font-semibold"
                        : "bg-gray-50 text-gray-700"
                    }`}
                    onClick={() => {
                      setSelectedCategoryKey(option.key);
                      setIsCategoryModalOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className={`sales-container ${view ? "overflow-hidden" : "overflow-y-auto"}`}>
        {loader ? (
          view ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-3">
              {skeletonCards.map((_, index) => (
                <div
                  key={`sales-skeleton-card-${index}`}
                  className="h-[250px] rounded-lg bg-gray-200 animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="p-2 space-y-3">
              {skeletonCards.map((_, index) => (
                <div
                  key={`sales-skeleton-row-${index}`}
                  className="h-20 rounded-lg bg-gray-200 animate-pulse"
                ></div>
              ))}
            </div>
          )
        ) : view ? (
          <div className="flex-1 min-h-0">
            {MemoizedProductList}
          </div>
        ) : (
          <div className="p-2">
            <button
              className="w-full flex flex-col justify-center items-center text-indigo-900 font-semibold bg-blue-100 border-2 border-dashed border-blue-500 rounded-lg h-[100px] cursor-pointer transition-all duration-200 hover:bg-blue-200"
              onClick={handleAddProduct}
            >
              <PlusIcon width={30} height={30} color="#007bff" />
              <span>Agregar Producto</span>
            </button>

            <List Products={products} />
          </div>
        )}
        <div className="px-3 py-2 border-t border-gray-200 bg-white flex items-center justify-between">
          <button
            type="button"
            className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={loader || currentPage <= 1}
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          <button
            type="button"
            className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={loader || currentPage >= totalPages}
          >
            Siguiente
          </button>
        </div>

        <footer className={loader ? "sales-footer-loader" : "sales-footer"}>
          <div className="cart-info">
            <span>Pedidos</span>
          </div>
          <button
            className="order-button"
            style={{ backgroundColor: context.store.Color || "#6D01D1" }}
            onClick={() => {
              if (context.cartPos.length > 0) {
                context.setShowNavBarBottom(false);
                navigate("/MainCart");
              }
            }}
          >
            {totalItems.toFixed(2)}x Items = ${totalPrice.toFixed(2)}
          </button>
        </footer>
      </div>
    </div>
  );
};
