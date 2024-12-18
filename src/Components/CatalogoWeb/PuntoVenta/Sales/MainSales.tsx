import React, { useEffect, useState, useContext } from "react";
import { SalesBar } from "./NavBar/SalesBar";
import { ProductList } from "../Sales/Card";
import { List } from "./List";
//import { PremiumExpirationModal } from "../Utilities/Stripe/PremiumExpirationModal";
import PlusIcon from "../../../../assets/POS/PlusIcon";
import {
  getBusinessInformation,
  getProduct,
  getTaxes,
  updateAdvice,
} from "./Petitions";
import "./Css/MainSales.css";
import { Item } from "../Model/Item";
import { AppContext } from "../../Context/AppContext";
import { CartPos } from "../Model/CarPos";
import { useNavigate } from "react-router-dom";

export const MainSales: React.FC = () => {
  const navigate = useNavigate(); // React Router para navegación
  const [products, setProducts] = useState<Item[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Item[]>([]);
  const [view, setView] = useState(true); // Vista de card:row
  const context = useContext(AppContext);
  const [totalPrice, setTotalPrice] = useState(0.0);
  const [totalItems, setTotalItems] = useState(0);
  const [showModalPremium, setShowModalPremium] = useState(false);
  const [loader, setLoader] = useState(false);
  useEffect(() => {
    // Obtener productos al cargar
    try {
      setLoader(true);
      getProduct(context.user.Business_Id, context.user.Token).then(
        (data: any) => {
          try {
            if (data.length > 0) {
              const filteredData = data[0]
                .concat(data[1])
                .filter((product: Item | null) => product !== null);
              setProducts(filteredData);
              setFilteredProducts(filteredData);
            }
          } catch (e) {
            console.error(e);
          }
        }
      );

      calculateCartTotals();
    } catch (e) {
    } finally {
      setLoader(false);
    }
  }, [context.stockFlag]);

  useEffect(() => {
    calculateCartTotals();
  }, [context.cartPos]);

  const calculateCartTotals = () => {
    let totalP = 0.0;
    let total = 0;
    (context.cartPos as CartPos[]).forEach((item: CartPos) => {
      total += item.Quantity;
      totalP += item.Quantity * item.Price;
    });
    setTotalPrice(totalP);
    setTotalItems(total);
  };

  const handleAddProduct = () => {
    if (context.store.Plan === "GRATUITO" && products.length >= 10) {
      setShowModalPremium(true);
    } else {
      context.setShowNavBarBottom(false); // Ocultar barra de navegación
      navigate("/add-product");
    }
  };

  useEffect(() => {
    getBusinessInformation(
      context.user.Business_Id + "",
      context.user.Token
    ).then((data: any) => {
      if (data) {
        context.setStore(data);
      }
    });
    getTaxes(context.user.Business_Id + "", context.user.Token).then(
      (data: any) => {
        if (data) {
          context.setTax(data);
        }
      }
    );
  }, []);

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
            <ProductList products={filteredProducts} />
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
                //navegar a la pagina de pago (/MainCart)
                context.setShowNavBarBottom(false); // Ocultar barra de navegación
                navigate("/MainCart");
              }
            }}
          >
            {totalItems.toFixed(2)}x Items = ${totalPrice.toFixed(2)}
          </button>
        </footer>
      </div>

      {/* Modal */}
      {/*
        <PremiumExpirationModal
          isVisible={showModalPremium}
          onClose={() => setShowModalPremium(false)}
        />
        */}
    </div>
  );
};
