import { useCallback, useEffect, useMemo, useState } from "react";
import { ModernSystemsFactory } from "../../../../../index";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import type { IncomePoint, ReportRange } from "../model/SalesReport";
import "./PosV2ReportingPage.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://apipos.ravekh.com/api/";
const TOKEN_KEY = "pos-v2-token";
const BUSINESS_ID_KEY = "pos-v2-business-id";

const moneyFormatter = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });

const RANGE_OPTIONS: Array<{ value: ReportRange; label: string }> = [
  { value: "DAY", label: "Hoy" },
  { value: "MONTH", label: "Mes" },
  { value: "YEAR", label: "Año" },
];

export const PosV2ReportingPage = () => {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY) ?? "");
  const [businessIdInput, setBusinessIdInput] = useState(() => window.localStorage.getItem(BUSINESS_ID_KEY) ?? "");
  const [range, setRange] = useState<ReportRange>("MONTH");
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    earnings: 0,
    averageSale: 0,
    totalSales: 0,
    cashSalesPercentage: 0,
    cardSalesPercentage: 0,
    bestSeller: "Sin datos",
    bestCategory: "Sin datos",
  });
  const [series, setSeries] = useState<IncomePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const page = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosReportingPage();
  }, []);

  const businessId = Number(businessIdInput);
  const hasSession = Boolean(token.trim()) && Number.isFinite(businessId) && businessId > 0;

  const loadReporting = useCallback(async () => {
    if (!hasSession) {
      setError("Ingresa token y business id para consultar reportes.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [summaryData, incomeSeries] = await Promise.all([
        page.loadSummary(businessId, range, token),
        page.loadIncomeSeries(businessId, range, token),
      ]);

      setSummary(summaryData);
      setSeries(incomeSeries);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar los reportes.");
    } finally {
      setLoading(false);
    }
  }, [businessId, hasSession, page, range, token]);

  useEffect(() => {
    if (hasSession) {
      loadReporting();
    }
  }, [hasSession, loadReporting]);

  const handleSaveSession = () => {
    if (!hasSession) {
      setError("Completa token y business id válidos para conectar.");
      return;
    }

    window.localStorage.setItem(TOKEN_KEY, token.trim());
    window.localStorage.setItem(BUSINESS_ID_KEY, String(businessId));
    setSuccessMessage("Sesión conectada para reportes.");
    setError(null);
    loadReporting();
  };

  return (
    <PosV2Shell title="Reportes" subtitle="Analítica operacional en arquitectura v2 desacoplada del legacy">
      <section className="pos-v2-reporting">
        <header className="pos-v2-reporting__header">
          <div>
            <h2>Insights de ventas</h2>
            <p>Métricas y tendencia de ingresos por rango.</p>
          </div>
          <div className="pos-v2-reporting__filters">
            <label>
              Rango
              <select value={range} onChange={(event) => setRange(event.target.value as ReportRange)}>
                {RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={loadReporting} disabled={loading || !hasSession}>{loading ? "Actualizando..." : "Actualizar"}</button>
          </div>
        </header>

        <section className="pos-v2-reporting__session">
          <label>
            Token
            <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Token POS v2" />
          </label>
          <label>
            Business ID
            <input value={businessIdInput} onChange={(event) => setBusinessIdInput(event.target.value)} inputMode="numeric" placeholder="Ej. 12" />
          </label>
          <button type="button" onClick={handleSaveSession}>Conectar</button>
        </section>

        {error ? <p className="pos-v2-reporting__error">{error}</p> : null}
        {successMessage ? <p className="pos-v2-reporting__success">{successMessage}</p> : null}

        <section className="pos-v2-reporting__stats">
          <article><span>Balance</span><strong>{moneyFormatter.format(summary.balance)}</strong></article>
          <article><span>Ingresos</span><strong>{moneyFormatter.format(summary.income)}</strong></article>
          <article><span>Ganancia</span><strong>{moneyFormatter.format(summary.earnings)}</strong></article>
          <article><span>Ticket promedio</span><strong>{moneyFormatter.format(summary.averageSale)}</strong></article>
          <article><span>Total ventas</span><strong>{summary.totalSales}</strong></article>
        </section>

        <section className="pos-v2-reporting__content">
          <article className="pos-v2-reporting__card">
            <h3>Mix de cobro</h3>
            <p>Efectivo: <strong>{summary.cashSalesPercentage}%</strong></p>
            <p>Tarjeta: <strong>{summary.cardSalesPercentage}%</strong></p>
          </article>

          <article className="pos-v2-reporting__card">
            <h3>Top desempeño</h3>
            <p>Producto más vendido: <strong>{summary.bestSeller || "Sin datos"}</strong></p>
            <p>Categoría líder: <strong>{summary.bestCategory || "Sin datos"}</strong></p>
          </article>

          <article className="pos-v2-reporting__card is-full">
            <h3>Serie de ingresos</h3>
            {series.length === 0 ? <p className="is-empty">Sin puntos de ingreso para este rango.</p> : (
              <ul>
                {series.map((point, index) => (
                  <li key={`${point.dateLabel}-${index}`}>
                    <span>{point.dateLabel || `Punto ${index + 1}`}</span>
                    <strong>{moneyFormatter.format(point.amount)}</strong>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      </section>
    </PosV2Shell>
  );
};
