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

export const MainSales: React.FC = () => {
  const [products, setProducts] = useState<Item[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Item[]>([]);
  const [view, setView] = useState(true); // Vista de card:row
  const context = useContext(AppContext);
  const [totalPrice, setTotalPrice] = useState(0.0);
  const [totalItems, setTotalItems] = useState(0);
  const [showModalPremium, setShowModalPremium] = useState(false);

  useEffect(() => {
    // Obtener productos al cargar
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
  }, [context.stockFlag]);

  useEffect(() => {
    calculateCartTotals();
  }, [context.cart]);

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
      console.log("Navigate to Add Product Page");
    }
  };

  useEffect(() => {
    getBusinessInformation(context.user.Business_Id+"", context.user.Token).then(
      (data: any) => {
        if (data) {
          context.setStore(data);
        }
      }
    );
    getTaxes(context.user.Business_Id+"", context.user.Token).then((data: any) => {
      if (data) {
        context.setTax(data);
      }
    });
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
      <div className="sales-container">
        {filteredProducts.length > 0 ? (
          view ? (
            <ProductList products={filteredProducts} />
          ) : (
            <div>
              <button className="add-product" onClick={handleAddProduct}>
                <PlusIcon width={30} height={30} color="#007bff"/>
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
      <footer className="sales-footer">
        <div className="cart-info">
          <span>Pedidos</span>
        </div>
        <button
          className="order-button"
          style={{ backgroundColor: context.store.Color || "#6D01D1" }}
        >
          {totalItems.toFixed(2)}x Items = ${totalPrice.toFixed(2)}
        </button>
      </footer>
      </div>

    

      {/* Modal */}
      {
        /*
        <PremiumExpirationModal
          isVisible={showModalPremium}
          onClose={() => setShowModalPremium(false)}
        />
        */
      }
    </div>
  );
};
