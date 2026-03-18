import { useEffect, useMemo, useState } from "react";
import { InventoryApi } from "../api/InventoryApi";
import type { InventorySummary } from "../model/InventoryItem";
import { GetInventorySummaryService } from "../services/GetInventorySummaryService";

interface InventorySummaryPageProps {
  token: string;
  businessId: number;
}

export const InventorySummaryPage = ({ token, businessId }: InventorySummaryPageProps) => {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const service = useMemo(() => new GetInventorySummaryService(new InventoryApi()), []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const result = await service.execute(token, businessId);

      if (!isMounted) {
        return;
      }

      if (!result.success || !result.data) {
        setError(result.error || result.message);
        return;
      }

      setSummary(result.data);
      setError(null);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [businessId, service, token]);

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (!summary) {
    return <p>Loading inventory summary...</p>;
  }

  return (
    <section>
      <h2>Catalog Inventory Summary</h2>
      <p>Total items: {summary.totalItems}</p>
      <p>Active items: {summary.activeItems}</p>
      <p>Out of stock: {summary.outOfStockItems}</p>
    </section>
  );
};
