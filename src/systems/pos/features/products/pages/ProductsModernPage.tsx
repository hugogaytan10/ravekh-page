import { useEffect, useMemo, useState } from "react";
import { HttpClient } from "../../../../shared/api/HttpClient";
import { ProductApi } from "../api/ProductApi";
import type { Product } from "../models/Product";
import { ProductService } from "../services/ProductService";
import { getPosApiBaseUrl } from "../../../../shared/config/posEnv";

const POS_API_URL = getPosApiBaseUrl();

interface ProductsModernPageProps {
  token: string;
  businessId: string;
}

export const ProductsModernPage = ({ token, businessId }: ProductsModernPageProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  const productService = useMemo(() => {
    const httpClient = new HttpClient({ baseUrl: POS_API_URL });
    const productApi = new ProductApi(httpClient);
    return new ProductService(productApi);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      const result = await productService.listProducts(token, businessId);

      if (!isMounted) {
        return;
      }

      if (result.success && result.data) {
        setProducts(result.data);
        setError(null);
        return;
      }

      setError(result.error || result.message);
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [businessId, productService, token]);

  if (error) {
    return <p role="alert">{error}</p>;
  }

  return (
    <section>
      <h2>POS Products (Modern)</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id || `${product.name}-${product.businessId}`}>
            {product.name} - ${product.price ?? 0}
          </li>
        ))}
      </ul>
    </section>
  );
};
