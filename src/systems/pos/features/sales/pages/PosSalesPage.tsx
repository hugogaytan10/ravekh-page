import { useEffect, useMemo, useState } from "react";
import type { Product } from "../model/Product";
import { PosSalesApi } from "../api/PosSalesApi";
import { GetAvailableProductsService } from "../services/GetAvailableProductsService";

interface PosSalesPageProps {
  token: string;
  userId: number;
}

export const PosSalesPage = ({ token, userId }: PosSalesPageProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const service = useMemo(() => {
    const repository = new PosSalesApi(token);
    return new GetAvailableProductsService(repository);
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      setStatus("loading");
      const result = await service.execute(userId);

      if (!isMounted) {
        return;
      }

      if (!result.ok) {
        setStatus("error");
        setErrorMessage(result.error);
        return;
      }

      setProducts(result.data);
      setStatus("idle");
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [service, userId]);

  if (status === "loading") {
    return <p>Loading products...</p>;
  }

  if (status === "error") {
    return <p>Unable to load products: {errorMessage}</p>;
  }

  return (
    <section>
      <h1>POS Sales</h1>
      <p>Total products: {products.length}</p>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} - ${product.salePrice}
          </li>
        ))}
      </ul>
    </section>
  );
};
