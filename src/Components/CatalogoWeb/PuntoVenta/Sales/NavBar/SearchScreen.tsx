import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../Context/AppContext";
import { Item } from "../../Model/Item";
import { getProductsByBusiness } from "../../../Petitions";
import { useNavigate } from "react-router-dom";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
import { getProduct } from "../Petitions";
import { Settings } from "../../../../../assets/POS/Settings";
import { ExpandableModalScanner } from "../Cart/ExpandableModalScanner";
import { CartPos } from "../../Model/CarPos";

export const SearchScreen: React.FC = () => {
  const context = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredProducts, setFilteredProducts] = useState<Item[]>([]);
  const [products, setProducts] = useState<Item[]>([]); // Lista de productos desde el servidor
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0.0);
  const navigate = useNavigate();
  const handleNavigate = () => {
    if (context.cartPos.length > 0) {
      navigate("/MainCart");
    }
  };

  // Función para cargar productos desde el servidor
  const loadProducts = async () => {
    try {
      const fetchedProducts = await getProduct(
        context.user.Business_Id,
        context.user.Token
      );
      if (fetchedProducts.length > 0) {
        const filteredData = fetchedProducts[0]
          .concat(fetchedProducts[1])
          .filter((product: Item | null) => product !== null);
        setProducts(filteredData);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [context.user.Business_Id, context.user.Token]);

  // Función para manejar la búsqueda
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = products.filter(
      (product) =>
        product.Name.toLowerCase().includes(query.toLowerCase()) ||
        (product.Barcode && product.Barcode.includes(query))
    );
    setFilteredProducts(filtered);
  };

  const handleAddProduct = (product: Item) => {
    const quantityToAdd = Number(context.quantityNextSell) || 1;
    const existingIndex = context.cartPos.findIndex(
      (item: CartPos) => item.Id === product.Id
    );
    let updatedCart = [...context.cartPos];

    if (existingIndex >= 0) {
      const existingItem = updatedCart[existingIndex];
      const updatedQuantity = existingItem.Quantity + quantityToAdd;
      updatedCart[existingIndex] = {
        ...existingItem,
        Quantity: updatedQuantity,
        SubTotal: updatedQuantity * (existingItem.Price || 0),
      };
    } else {
      updatedCart = [
        ...updatedCart,
        {
          Id: product.Id,
          Name: product.Name,
          Price: product.Price || 0,
          Barcode: product.Barcode || "",
          Quantity: quantityToAdd,
          SubTotal: (product.Price || 0) * quantityToAdd,
          Image: product.Image || product.Images?.[0] || "",
        },
      ];
    }

    context.setCartPos(updatedCart);
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

  useEffect(() => {
    updateTotals();
  }, [context.cartPos, context.tax]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header
        className="h-16 bg-blue-600 text-white flex items-center justify-between px-4"
        style={{ backgroundColor: context.store.Color || "#3B82F6" }}
      >
        <button
          onClick={() => {
            context.setShowNavBarBottom(true);
            navigate(-1);
          }}
          className="text-white"
        >
          <ChevronBack />
        </button>
        <h1 className="text-lg font-semibold flex-grow text-center">
          Buscar Producto
        </h1>
        <div className="w-6"></div>
      </header>

      {/* Input de búsqueda */}
      <div className="flex flex-col items-center mt-4 px-4">
        <input
          type="text"
          placeholder="Buscar por nombre o código de barras"
          className="bg-white w-full max-w-md p-2 border border-gray-300 rounded-md"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Contenido */}
      <div className="flex-grow flex flex-col items-center mt-4 px-4">
        {isLoading ? (
          <p className="text-gray-500">Cargando productos...</p>
        ) : filteredProducts.length === 0 && searchQuery ? (
          <p className="text-gray-500">No se encontraron resultados</p>
        ) : (
          <ul className="w-full max-w-md">
            {(filteredProducts.length > 0 ? filteredProducts : products).map(
              (product) => (
                <li
                  key={product.Id}
                  className="flex justify-between items-center p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleAddProduct(product)}
                >
                  <div>
                    <p className="font-medium text-gray-800">{product.Name}</p>
                    <p className="text-sm text-gray-500">
                      Código: {product.Barcode || "N/A"}
                    </p>
                  </div>
                  <p className="text-blue-600 font-semibold">
                    ${product.Price?.toFixed(2)}
                  </p>
                </li>
              )
            )}
          </ul>
        )}
      </div>
      <div className="h-20 bg-white px-4 border-t w-full">
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
      </div>
    </div>
  );
};
