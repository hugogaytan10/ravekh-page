import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../Context/AppContext";
import { Item } from "../../Model/Item";
import { getProductsByBusiness } from "../../../Petitions";
import { useNavigate } from "react-router-dom";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
import { getProduct } from "../Petitions";

export const SearchScreen: React.FC = () => {
  const context = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredProducts, setFilteredProducts] = useState<Item[]>([]);
  const [products, setProducts] = useState<Item[]>([]); // Lista de productos desde el servidor
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

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
                  className="flex justify-between items-center p-2 border-b border-gray-200"
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
    </div>
  );
};
