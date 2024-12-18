import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../../../Context/AppContext";
import { Item } from "../../Model/Item";
import { Settings } from "../../../../../assets/POS/Settings";
import { Trash } from "../../../../../assets/POS/Trash";
import { CartPos } from "../../Model/CarPos";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
import { getProductsByBusiness } from "../../../Petitions";
import { getProduct } from "../Petitions";
import { useNavigate } from "react-router-dom";
import { ThemeLight } from "../../Theme/Theme";
import { ExpandableModalScanner } from "../Cart/ExpandableModalScanner";

export const Scanner: React.FC = () => {
  const context = useContext(AppContext);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0.0);
  const [isVisible, setIsVisible] = useState(false);
  const [scannedCode, setScannedCode] = useState<string>(""); // Captura del código escaneado
  const [isListLoading, setIsListLoading] = useState(false);
  const [products, setProducts] = useState<Item[]>([]); // Estado para almacenar los productos
 
  const navigate = useNavigate();
  const handleNavigate = () => {
    if (context.cartPos.length > 0) {
      navigate("/MainCart");
    }
  };
  const handleScan = (code: string) => {
    setScannedCode(code);
    const product = products.find((item: Item) => item.Barcode === code);
    if (product) {
      const cartProduct = context.cartPos.find(
        (item: CartPos) => item.Barcode === code
      );

      if (cartProduct) {
        cartProduct.Quantity += Number(context.quantityNextSell);
        cartProduct.SubTotal = cartProduct.Quantity * (cartProduct.Price || 0);
      } else {
        context.setCartPos([
          ...context.cartPos,
          {
            Id: product.Id,
            Name: product.Name,
            Price: product.Price || 0,
            Barcode: product.Barcode || "",
            Quantity: Number(context.quantityNextSell),
            SubTotal: product.Price || 0,
            Image: product.Image,
          },
        ]);
      }
      updateTotals();
      //limpiamos el scanner
      setScannedCode("")
    } else {
      console.log("Producto no encontrado");
    }
  };

  const updateTotals = () => {
    let totalQuantity = 0;
    let totalAmount = 0.0;
  
    context.cartPos.forEach((item: CartPos) => {
      totalQuantity += item.Quantity;
      totalAmount += item.Quantity * item.Price;
    });
  
    setTotalItems(totalQuantity);
  
    if (context.tax) {
      const taxAmount = context.tax.IsPercent
        ? totalAmount * (context.tax.Value / 100)
        : context.tax.Value || 0;
      const totalWithTax = totalAmount + taxAmount;
      setTotalPrice(totalWithTax);
      context.setTicketDetail({...context.ticketDetail, totalWithTaxes: totalWithTax, total: totalAmount})
    } else {
      setTotalPrice(totalAmount);
      context.setTicketDetail({...context.ticketDetail, totalWithTaxes: totalAmount, total: totalAmount})

    }
  };
  

  const handleDeleteItem = (id: number) => {
    setIsListLoading(true);
    const updatedCart = context.cart.filter((item) => item.Id !== id);
    context.setCart(updatedCart);
    setIsListLoading(false);
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const fetchedProducts = await getProduct(
          context.user.Business_Id,
          context.user.Token
        );
        if(fetchedProducts.length > 0) {
          const filteredData = fetchedProducts[0]
            .concat(fetchedProducts[1])
            .filter((product: Item | null) => product !== null);
          setProducts(filteredData);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    loadProducts();
  }, [context.user.Business_Id, context.user.Token]);

  useEffect(() => {
    updateTotals();
  }, [context.cartPos]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header
        className="h-16 bg-blue-600 text-white flex items-center justify-between px-4 z-100"
        style={{ backgroundColor: context.store.Color || "#3B82F6" }}
      >
        <button
          onClick={() => {
            context.setShowNavBarBottom(true);
            navigate(-1);
          }}
        >
          <ChevronBack />
        </button>
        <h1 className="text-lg font-semibold flex-grow text-center">
          Escáner de Productos
        </h1>
        <div className="w-6"></div>
      </header>

      <div className="mt-2 flex-grow flex flex-col items-center">
        <input
          type="text"
          placeholder="Escanea el código de barras"
          className="bg-white w-11/12 max-w-md p-3 border rounded-md mb-4 text-lg"
          value={scannedCode}
          onChange={(e) => handleScan(e.target.value)}
        />

        <div className="w-11/12 max-w-md bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-lg font-semibold">Total: {totalItems} Items</h2>
          <h3 className="text-xl font-bold">${totalPrice.toFixed(2)}</h3>
        </div>

        <div className="w-11/12 max-w-md flex flex-col gap-2">
          {isListLoading ? (
            <div className="flex justify-center py-4">
              <div className="loader" />
            </div>
          ) : context.cartPos.length > 0 ? (
            context.cartPos.map((item) => (
              <div
                key={item.Id}
                className="flex items-center justify-between p-2 border-b"
              >
                <span className="text-sm font-medium">
                  {item.Quantity}x {item.Name}
                </span>
                <span className="text-sm font-medium">
                  ${item.SubTotal.toFixed(2)}
                </span>
                <button
                  onClick={() => handleDeleteItem(item.Id || 0)}
                  className="text-red-500"
                >
                  <Trash width={25} height={25} fill={context.store.Color ? context.store.Color : ThemeLight.btnBackground}/>
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              No hay productos en el carrito
            </p>
          )}
        </div>
      </div>

      <footer className="h-20 bg-white px-4 border-t w-full">
         {/* Barra inferior */}
            <div className="bottom-nav">
              <button
                className={`icon-button `}
                //tendra un background dependiendo el color de context.store.Color
      
                onClick={() => setIsVisible(!isVisible)}
              >
                <Settings fillColor={`${context.store.Color ? context.store.Color : "#6D01D1"}`} />
              </button>
              <button className={`order-button-cart`}   style={{ backgroundColor: context.store.Color || "#6D01D1" }} onClick={handleNavigate}>
                {totalItems} Items = ${totalPrice.toFixed(2)}
              </button>
            </div>
      
            {/* Modal para configuración */}
            {isVisible && (
              <ExpandableModalScanner
                isVisible={isVisible}
                setIsVisible={setIsVisible}
              />
            )}
      </footer>
    </div>
  );
};
