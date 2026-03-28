import { useEffect, useMemo, useState } from "react";
import { HttpClient } from "../../../../shared/api/HttpClient";
import { PosSalesApi } from "../api/PosSalesApi";
import { PosSalesService } from "../services/PosSalesService";
import type { SalesCategory, SalesProduct } from "../models/SalesModels";
import { getPosApiBaseUrl } from "../../../../shared/config/posEnv";

const POS_API_URL = getPosApiBaseUrl();

interface PosSalesModernPageProps {
  token: string;
  businessId: string;
}

export const PosSalesModernPage = ({ token, businessId }: PosSalesModernPageProps) => {
  const [products, setProducts] = useState<SalesProduct[]>([]);
  const [categories, setCategories] = useState<SalesCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const salesService = useMemo(() => {
    const httpClient = new HttpClient({ baseUrl: POS_API_URL });
    const api = new PosSalesApi(httpClient);
    return new PosSalesService(api);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      const result = await salesService.loadBootstrap(token, businessId);

      if (!isMounted) {
        return;
      }

      if (!result.success || !result.data) {
        setError(result.error || result.message);
        setIsLoading(false);
        return;
      }

      setProducts(result.data.products);
      setCategories(result.data.categories);
      setError(null);
      setIsLoading(false);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [businessId, salesService, token]);

  const visibleProducts = useMemo(
    () => salesService.filterProductsByCategory(products, selectedCategoryId),
    [products, salesService, selectedCategoryId],
  );

  return (
    <section>
      <h2>POS Sales (Modern)</h2>

      <label htmlFor="modern-pos-category">Category</label>
      <select
        id="modern-pos-category"
        value={selectedCategoryId === null ? "all" : String(selectedCategoryId)}
        onChange={(event) =>
          setSelectedCategoryId(event.target.value === "all" ? null : Number(event.target.value))
        }
      >
        <option value="all">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {isLoading && <p>Loading POS sales data...</p>}
      {error && <p role="alert">{error}</p>}

      {!isLoading && !error && (
        <ul>
          {visibleProducts.map((product) => (
            <li key={product.id}>
              {product.name} - ${product.price}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
