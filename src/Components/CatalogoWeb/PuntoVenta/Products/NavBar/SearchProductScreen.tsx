import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../Context/AppContext";
import { Item } from "../../Model/Item";
import { getProducts } from "../Petitions";
import { ProductList } from "./Card";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
import { useNavigate } from "react-router-dom";

export const SearchProductScreen: React.FC = () => {
  const context = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState(""); // Estado para la consulta de búsqueda
  const [products, setProducts] = useState<Item[]>([]); // Estado para los productos
  const [filteredProducts, setFilteredProducts] = useState<Item[]>([]); // Estado para los productos filtrados
  const [isLoading, setIsLoading] = useState<boolean>(true); // Estado de carga
  const navigate = useNavigate();
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

  // Obtener productos desde el servidor
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts(
          context.user.Token,
          `${context.store.Id}`
        );
        setProducts(response);
        setFilteredProducts(response);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [context.user.Token, context.store.Id]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header
        className="h-16 bg-blue-600 text-white flex items-center justify-between px-4 z-100"
        style={{ backgroundColor: context.store.Color || "#3B82F6" }}>
        <button
          className="back-button"
          onClick={() => {
            context.setShowNavBarBottom(true);
            navigate(-1);
          }}
        >
          <ChevronBack />
        </button>
        <h1 className="text-lg font-semibold">Buscar Producto</h1>
        <div className="w-6 h-6"/>
      </header>

      {/* Input de búsqueda */}
      <div className="p-4">
        <input
          type="text"
          placeholder="Buscar por nombre o código de barras"
          className="bg-white w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Lista de productos */}
      <div className="flex-grow p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="loader" />{" "}
            {/* Puedes reemplazar con un spinner CSS o un componente */}
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500">
            No se encontraron resultados
          </p>
        ) : (
          <ProductList products={filteredProducts} />
        )}
      </div>
    </div>
  );
};
