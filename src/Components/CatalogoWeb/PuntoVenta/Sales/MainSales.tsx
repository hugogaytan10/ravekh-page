import React, { useEffect, useState, useContext, useMemo } from "react";
import { SalesBar } from "./NavBar/SalesBar";
import { ProductList } from "../Sales/Card";
import { List } from "./List";
import PlusIcon from "../../../../assets/POS/PlusIcon";
import {
  getBusinessInformation,
  getProduct,
  getTaxes,
} from "./Petitions";
import "./Css/MainSales.css";
import { Item } from "../Model/Item";
import { AppContext } from "../../Context/AppContext";
import { CartPos } from "../Model/CarPos";
import { useLocation, useNavigate } from "react-router-dom";

export const MainSales: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const location = useLocation();

  const [products, setProducts] = useState<Item[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Item[]>([]);
  const [view, setView] = useState(true);
  const [showModalPremium, setShowModalPremium] = useState(false);
  const [loader, setLoader] = useState(false);

  /** Muestra la barra de navegación al cambiar de página */
  useEffect(() => {
    const checkFocus = () => context.setShowNavBarBottom(true);
    checkFocus();
    window.addEventListener("popstate", checkFocus);
    return () => window.removeEventListener("popstate", checkFocus);
  }, [location.pathname]);

  /** Obtiene los productos y datos de negocio */
  useEffect(() => {
    setLoader(true);
    getProduct(context.user.Business_Id, context.user.Token).then((data: any) => {
      if (data?.length > 0) {
        const filteredData = [...data[0], ...data[1]].filter(Boolean);
        setProducts(filteredData);
        setFilteredProducts(filteredData);
      }
    }).finally(() => setLoader(false));
  }, [context.user.Business_Id, context.user.Token]);

  /** Obtiene la información de impuestos y negocio */
  useEffect(() => {
    getBusinessInformation(context.user.Business_Id.toString(), context.user.Token)
      .then((data: any) => data && context.setStore(data));

    getTaxes(context.user.Business_Id.toString(), context.user.Token)
      .then((data: any) => data && context.setTax(data));
  }, [context.user.Business_Id, context.user.Token]);

  /** Calcula totales del carrito */
  const { totalPrice, totalItems } = useMemo(() => {
    let totalP = 0;
    let total = 0;
    context.cartPos.forEach((item) => {
      total += item.Quantity;
      totalP += item.Quantity * item.Price;
    });
    return { totalPrice: totalP, totalItems: total };
  }, [context.cartPos]);

  /** Manejo de agregar productos */
  const handleAddProduct = () => {
    if (context.store.Plan === "GRATUITO" && products.length >= 10) {
      setShowModalPremium(true);
    } else {
      context.setShowNavBarBottom(false);
      navigate("/add-product");
    }
  };

  /** Memoiza `ProductList` para evitar re-renders innecesarios */
  const MemoizedProductList = useMemo(
    () => <ProductList products={filteredProducts} />,
    [filteredProducts]
  );

  return (
    <div className="main-sales">
      {/* Barra de herramientas */}
      <div className="header-tools">
        <SalesBar
          view={view}
          setView={setView}
          products={products}
          setFilteredProducts={setFilteredProducts}
        />
      </div>

      {/* Contenido principal */}
      <div className="sales-container overflow-y-auto">
        {filteredProducts.length > 0 ? (
          view ? (
            MemoizedProductList
          ) : (
            <div className="p-2">
              <button
                className="w-full flex flex-col justify-center items-center text-indigo-900 font-semibold bg-blue-100 border-2 border-dashed border-blue-500 rounded-lg  h-[100px] cursor-pointer transition-all duration-200 hover:bg-blue-200"
                onClick={handleAddProduct}
              >
                <PlusIcon width={30} height={30} color="#007bff" />
                <span>Agregar Producto</span>
              </button>
              <List Products={filteredProducts} />
            </div>
          )
        ) : (
          <button className="add-product" onClick={handleAddProduct}>
            <PlusIcon width={30} height={30} />
            <span>Agregar Productos</span>
          </button>
        )}

        {/* Footer */}
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
