import { useEffect, useMemo, useState } from "react";
import { HttpClient } from "../../../../shared/api/HttpClient";
import type { FinanceOverview } from "../models/FinanceRecord";
import { FinanceApi } from "../api/FinanceApi";
import { FinanceService } from "../services/FinanceService";

const POS_API_URL = "https://apipos.ravekh.com/api/";

interface FinanceModernPageProps {
  token: string;
  businessId: string;
  month: number;
}

export const FinanceModernPage = ({ token, businessId, month }: FinanceModernPageProps) => {
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const financeService = useMemo(() => {
    const httpClient = new HttpClient(POS_API_URL);
    const financeApi = new FinanceApi(httpClient);
    return new FinanceService(financeApi);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadOverview = async () => {
      const result = await financeService.getOverviewByMonth(token, businessId, month);

      if (!isMounted) {
        return;
      }

      if (result.success && result.data) {
        setOverview(result.data);
        setError(null);
        return;
      }

      setOverview(null);
      setError(result.error || result.message);
    };

    loadOverview();

    return () => {
      isMounted = false;
    };
  }, [businessId, financeService, month, token]);

  if (error) {
    return <p role="alert">{error}</p>;
  }

  return (
    <section>
      <h2>POS Finance (Modern)</h2>
      <p>Income: ${overview?.income ?? 0}</p>
      <p>Expenses: ${overview?.expenses ?? 0}</p>
      <p>Net: ${overview?.net ?? 0}</p>
    </section>
  );
};
