import { useEffect, useMemo, useState } from "react";
import { CatalogProductApi } from "../api/CatalogProductApi";
import type { CatalogProduct } from "../model/CatalogProduct";
import { GetCatalogProductsService } from "../services/GetCatalogProductsService";

interface CatalogProductsPageProps {
  token: string;
  businessId: number;
}

export const CatalogProductsPage = ({
  token,
  businessId,
}: CatalogProductsPageProps) => {
  const [products, setProducts] = useState<CatalogProduct[]>([]);

  const service = useMemo(() => {
    const repository = new CatalogProductApi(token);
    return new GetCatalogProductsService(repository);
  }, [token]);

  useEffect(() => {
    service.execute(businessId).then((result) => {
      if (result.ok) {
        setProducts(result.data);
      }
    });
  }, [businessId, service]);

  return (
    <section>
      <h1>Catalog Products</h1>
      <p>{products.length} products loaded.</p>
    </section>
  );
};
