import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { ModernSystemsFactory } from "../../../../../index";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import type { IncomePoint, ReportRange, ReportSale } from "../model/SalesReport";
import type { ReportSummaryViewModel } from "../pages/ReportingInsightsPage";
import "./PosV2ReportingPage.css";

const API_BASE_URL = getPosApiBaseUrl();
const TOKEN_KEY = "pos-v2-token";
const BUSINESS_ID_KEY = "pos-v2-business-id";

const moneyFormatter = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });
const dateFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });

const RANGE_OPTIONS: Array<{ value: ReportRange; label: string }> = [
  { value: "DAY", label: "Hoy" },
  { value: "MONTH", label: "Mes" },
  { value: "YEAR", label: "Año" },
];

const PAYMENT_OPTIONS: Array<{ value: "TODOS" | "EFECTIVO" | "TARJETA"; label: string }> = [
  { value: "TODOS", label: "Todos" },
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TARJETA", label: "Tarjeta" },
];
const PENDING_MODULES = [
  { id: "sales-tax", title: "Impuestos", detail: "Configuración fiscal por negocio" },
  { id: "exports", title: "Exportar reportes", detail: "Descargas para contabilidad y auditoría" },
  { id: "cash-closing", title: "Cortes de caja", detail: "Cierre de turnos con resumen de efectivo" },
];

const DEFAULT_SUMMARY: ReportSummaryViewModel = {
  balance: 0,
  income: 0,
  earnings: 0,
  averageSale: 0,
  totalSales: 0,
  cashSalesPercentage: 0,
  cardSalesPercentage: 0,
  bestSeller: "Sin datos",
  bestCategory: "Sin datos",
};

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend, Filler);

type ToastState = { type: "success" | "error"; message: string } | null;

type TrendPoint = IncomePoint & {
  widthPercentage: number;
  deltaLabel: string;
};

type TopChartItem = { name: string; quantity: number };

const clampPercentage = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Number(value.toFixed(1))));
};

const normalizeSeries = (series: IncomePoint[]): TrendPoint[] => {
  if (series.length === 0) return [];

  const highestAmount = Math.max(...series.map((point) => Math.abs(Number(point.amount) || 0)), 1);

  return series.map((point, index) => {
    const currentAmount = Number(point.amount) || 0;
    const previousAmount = index > 0 ? Number(series[index - 1]?.amount || 0) : currentAmount;
    const difference = currentAmount - previousAmount;

    return {
      ...point,
      widthPercentage: Math.max((Math.abs(currentAmount) / highestAmount) * 100, 8),
      deltaLabel: index === 0 ? "Base" : `${difference >= 0 ? "+" : ""}${moneyFormatter.format(difference)}`,
    };
  });
};

const formatDate = (value: string): string => {
  if (!value) return "Sin fecha";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return dateFormatter.format(parsed);
};

const getSafeSession = () => {
  const token = (window.localStorage.getItem(TOKEN_KEY) ?? "").trim();
  const businessId = Number(window.localStorage.getItem(BUSINESS_ID_KEY) ?? "");

  return {
    token,
    businessId,
    hasSession: token.length > 0 && Number.isFinite(businessId) && businessId > 0,
  };
};

export const PosV2ReportingPage = () => {
  const [session] = useState(() => getSafeSession());
  const [range, setRange] = useState<ReportRange>("MONTH");
  const [paymentFilter, setPaymentFilter] = useState<"TODOS" | "EFECTIVO" | "TARJETA">("TODOS");
  const [summary, setSummary] = useState<ReportSummaryViewModel>(DEFAULT_SUMMARY);
  const [series, setSeries] = useState<IncomePoint[]>([]);
  const [sales, setSales] = useState<ReportSale[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<TrendPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [salesLoading, setSalesLoading] = useState(false);
  const [topChartsLoading, setTopChartsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [topProducts, setTopProducts] = useState<TopChartItem[]>([]);
  const [topCategories, setTopCategories] = useState<TopChartItem[]>([]);
  const [newCustomersToday, setNewCustomersToday] = useState(0);
  const [insightMonth, setInsightMonth] = useState(() => new Date().getMonth() + 1);
  const [tableRange, setTableRange] = useState<ReportRange>("DAY");
  const [salesQuery, setSalesQuery] = useState("");
  const [salesStatus, setSalesStatus] = useState<"TODOS" | "PENDIENTE" | "ENTREGADO">("TODOS");
  const reportRequestRef = useRef(0);
  const salesRequestRef = useRef(0);
  const topChartsRequestRef = useRef(0);

  const { reportingPage, dashboardPage } = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return {
      reportingPage: factory.createPosReportingPage(),
      dashboardPage: factory.createPosDashboardAnalyticsPage(),
    };
  }, []);

  const businessId = session.businessId;
  const cleanToken = session.token;
  const hasBusinessId = session.hasSession;
  const hasToken = session.hasSession;
  const navigate = useNavigate();

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => setToast(null), 3400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const loadReporting = useCallback(async () => {
    if (!hasBusinessId) {
      setError("No hay sesión activa para consultar reportes.");
      return;
    }

    const reportRequestId = reportRequestRef.current + 1;
    reportRequestRef.current = reportRequestId;
    setLoading(true);
    setError(null);

    try {
      const summaryPromise = reportingPage
        .loadSummary(businessId, range, cleanToken)
        .then((summaryData) => summaryData);
      const seriesPromise = reportingPage
        .loadIncomeSeries(businessId, range, cleanToken)
        .then((incomeSeries) => incomeSeries);

      const [summaryData, incomeSeries] = await Promise.all([summaryPromise, seriesPromise]);

      if (reportRequestRef.current !== reportRequestId) {
        return;
      }

      setSummary(summaryData);
      setSeries(incomeSeries);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "No se pudieron cargar los reportes.";
      if (reportRequestRef.current === reportRequestId) {
        setError(message);
        showToast("error", message);
      }
    } finally {
      if (reportRequestRef.current === reportRequestId) {
        setLoading(false);
      }
    }
  }, [businessId, cleanToken, hasBusinessId, reportingPage, range, showToast]);

  const loadSales = useCallback(async () => {
    if (!hasBusinessId || !hasToken) {
      setSales([]);
      return;
    }

    const salesRequestId = salesRequestRef.current + 1;
    salesRequestRef.current = salesRequestId;
    setSalesLoading(true);
    try {
      const details = await reportingPage.loadSalesDetails(businessId, tableRange, paymentFilter, cleanToken);
      if (salesRequestRef.current !== salesRequestId) {
        return;
      }
      setSales(details);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "No se pudieron cargar ventas detalladas.";
      if (salesRequestRef.current === salesRequestId) {
        showToast("error", message);
      }
    } finally {
      if (salesRequestRef.current === salesRequestId) {
        setSalesLoading(false);
      }
    }
  }, [businessId, cleanToken, hasBusinessId, hasToken, reportingPage, paymentFilter, tableRange, showToast]);

  const loadTopCharts = useCallback(async () => {
    if (!hasBusinessId || !hasToken) {
      setTopProducts([]);
      setTopCategories([]);
      setNewCustomersToday(0);
      return;
    }

    const requestId = topChartsRequestRef.current + 1;
    topChartsRequestRef.current = requestId;
    setTopChartsLoading(true);

    try {
      const snapshot = await dashboardPage.loadViewModel(businessId, insightMonth, cleanToken);
      if (topChartsRequestRef.current !== requestId) {
        return;
      }

      setTopProducts(snapshot.topProducts.slice(0, 5));
      setTopCategories(snapshot.topCategories.slice(0, 5));
      setNewCustomersToday(snapshot.newCustomersToday);
    } catch (cause) {
      if (topChartsRequestRef.current === requestId) {
        setTopProducts([]);
        setTopCategories([]);
        setNewCustomersToday(0);
        showToast("error", cause instanceof Error ? cause.message : "No se pudieron cargar gráficas avanzadas.");
      }
    } finally {
      if (topChartsRequestRef.current === requestId) {
        setTopChartsLoading(false);
      }
    }
  }, [businessId, cleanToken, dashboardPage, hasBusinessId, hasToken, insightMonth, showToast]);

  useEffect(() => {
    if (hasBusinessId) {
      loadReporting();
    }
  }, [hasBusinessId, loadReporting]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  useEffect(() => {
    loadTopCharts();
  }, [loadTopCharts]);

  const trendData = useMemo(() => normalizeSeries(series), [series]);

  const derivedKpis = useMemo(
    () => ({
      margin: summary.income > 0 ? clampPercentage((summary.earnings / summary.income) * 100) : 0,
      cashRatio: clampPercentage(summary.cashSalesPercentage),
      cardRatio: clampPercentage(summary.cardSalesPercentage),
    }),
    [summary],
  );

  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, index) => ({
      value: index + 1,
      label: new Date(new Date().getFullYear(), index, 1).toLocaleString("es-MX", { month: "long" }),
    })),
    [],
  );

  const trendChartData = useMemo(() => ({
    labels: trendData.map((point) => point.dateLabel || "Sin fecha"),
    datasets: [
      {
        label: "Ingresos",
        data: trendData.map((point) => Number(point.amount) || 0),
        borderColor: "#7c3aed",
        backgroundColor: "rgba(124, 58, 237, 0.16)",
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: true,
      },
    ],
  }), [trendData]);

  const paymentChartData = useMemo(() => ({
    labels: ["Efectivo", "Tarjeta"],
    datasets: [
      {
        data: [derivedKpis.cashRatio || 0, derivedKpis.cardRatio || 0],
        backgroundColor: ["#8b5cf6", "#06b6d4"],
        borderWidth: 0,
      },
    ],
  }), [derivedKpis.cardRatio, derivedKpis.cashRatio]);

  const lineChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        ticks: {
          callback: (value: string | number) => moneyFormatter.format(Number(value) || 0),
        },
      },
    },
  }), []);

  const doughnutOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: { display: true },
    },
  }), []);

  const quantityBarOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#475569" } },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => `${Number(value) || 0} u.`,
        },
      },
    },
  }), []);

  const fallbackTopProducts = useMemo(() => {
    const grouped = new Map<string, number>();
    for (const sale of sales) {
      const key = (sale.productName || "Sin detalle").trim();
      grouped.set(key, (grouped.get(key) ?? 0) + (Number(sale.quantity) || 0));
    }
    return Array.from(grouped.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [sales]);

  const fallbackTopCategories = useMemo<TopChartItem[]>(() => {
    const grouped = new Map<string, number>();
    for (const sale of sales) {
      const label = sale.type === "ORDER" ? "Pedidos online" : "Comandas";
      grouped.set(label, (grouped.get(label) ?? 0) + (Number(sale.quantity) || 0));
    }
    return Array.from(grouped.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [sales]);

  const displayTopProducts = topProducts.length > 0 ? topProducts : fallbackTopProducts;
  const displayTopCategories = topCategories.length > 0 ? topCategories : fallbackTopCategories;
  const hasOverviewValues = summary.income > 0 || summary.earnings > 0 || summary.averageSale > 0;

  const topProductsChartData = useMemo(() => ({
    labels: displayTopProducts.map((item, index) => item.name || `Producto ${index + 1}`),
    datasets: [
      {
        label: "Productos más vendidos",
        data: displayTopProducts.map((item) => item.quantity),
        borderRadius: 8,
        borderSkipped: false,
        backgroundColor: ["#3b82f6", "#60a5fa", "#93c5fd", "#38bdf8", "#0ea5e9"],
      },
    ],
  }), [displayTopProducts]);

  const topCategoriesChartData = useMemo(() => ({
    labels: displayTopCategories.map((item, index) => item.name || `Categoría ${index + 1}`),
    datasets: [
      {
        label: "Categorías más vendidas",
        data: displayTopCategories.map((item) => item.quantity),
        backgroundColor: ["#06b6d4", "#22d3ee", "#67e8f9", "#0ea5e9", "#0284c7"],
        borderWidth: 0,
      },
    ],
  }), [displayTopCategories]);

  const businessOverviewData = useMemo(() => ({
    labels: ["Ingresos", "Ganancia", "Ticket promedio"],
    datasets: [
      {
        data: [summary.income, summary.earnings, summary.averageSale],
        backgroundColor: ["#7c3aed", "#10b981", "#f59e0b"],
        borderWidth: 0,
      },
    ],
  }), [summary.averageSale, summary.earnings, summary.income]);

  const filteredSales = useMemo(() => {
    const query = salesQuery.trim().toLowerCase();

    return sales.filter((sale) => {
      const matchesStatus =
        salesStatus === "TODOS"
          ? true
          : salesStatus === "PENDIENTE"
            ? sale.status.toLowerCase().includes("pend")
            : !sale.status.toLowerCase().includes("pend");

      if (!matchesStatus) return false;
      if (!query) return true;

      const searchable = `${sale.productName} ${sale.address} ${sale.status}`.toLowerCase();
      return searchable.includes(query);
    });
  }, [sales, salesQuery, salesStatus]);

  const salesTotals = useMemo(() => ({
    totalRows: filteredSales.length,
    totalAmount: filteredSales.reduce((acc, sale) => acc + (Number(sale.total) || 0), 0),
  }), [filteredSales]);

  const exportSalesCsv = () => {
    if (filteredSales.length === 0) {
      showToast("error", "No hay filas para exportar.");
      return;
    }

    const headers = ["Producto", "Dirección", "Fecha", "Cantidad", "Monto", "Estado"];
    const rows = filteredSales.map((sale) => [
      sale.productName,
      sale.address,
      formatDate(sale.date),
      String(sale.quantity),
      String(Number(sale.total).toFixed(2)),
      sale.status,
    ]);

    const csv = [headers, ...rows]
      .map((line) => line.map((item) => `"${String(item).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    link.href = url;
    link.download = `reporte-ventas-v2-${yyyy}${mm}${dd}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("success", "CSV exportado correctamente.");
  };

  if (!session.hasSession) {
    return (
      <PosV2Shell title="Reportes" subtitle="Analítica operacional v2 moderna y desacoplada">
        <section className="pos-v2-reporting">
          <section className="pos-v2-reporting__session-empty">
            <h2>Sesión requerida</h2>
            <p>Inicia sesión en POS v2 para ver reportes y gráficas.</p>
            <button type="button" onClick={() => navigate("/v2/login-punto-venta")}>Ir a iniciar sesión</button>
          </section>
        </section>
      </PosV2Shell>
    );
  }

  return (
    <PosV2Shell title="Reportes" subtitle="Analítica operacional v2 enfocada en decisiones rápidas">
      <section className="pos-v2-reporting">
        <header className="pos-v2-reporting__header">
          <div>
            <h2>Insights de ventas</h2>
            <p>Métricas accionables, diseño limpio y visualización moderna para móvil, tablet y desktop.</p>
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
          </div>
        </header>

        {error ? <p className="pos-v2-reporting__error">{error}</p> : null}
        {toast ? <p className={`pos-v2-reporting__toast is-${toast.type}`}>{toast.message}</p> : null}

        <section className="pos-v2-reporting__legend" aria-label="Leyenda de reportes">
          <span><i className="is-cash" />Efectivo</span>
          <span><i className="is-card" />Tarjeta</span>
          <span><i className="is-trend" />Tendencia de ingresos</span>
          <span><i className="is-profit" />Ganancia</span>
          <span><i className="is-ticket" />Ticket promedio</span>
          <span><i className="is-products" />Top productos</span>
          <span><i className="is-categories" />Top categorías</span>
        </section>

        <section className="pos-v2-reporting__content">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <article key={`reporting-skeleton-${index}`} className="pos-v2-reporting__card is-loading" aria-hidden="true">
                <div className="pos-v2-reporting__card-skeleton-title" />
                <div className="pos-v2-reporting__card-skeleton-line" />
                <div className="pos-v2-reporting__card-skeleton-line short" />
              </article>
            ))
          ) : null}

          {!loading ? <article className="pos-v2-reporting__card">
            <h3>Mix de cobro</h3>
            {(derivedKpis.cashRatio > 0 || derivedKpis.cardRatio > 0) ? (
              <div className="pos-v2-reporting__doughnut">
                <Doughnut data={paymentChartData} options={doughnutOptions} />
              </div>
            ) : (
              <p className="is-empty">Sin cobros para este rango. Prueba con otro periodo.</p>
            )}
            <div className="pos-v2-reporting__progress">
              <span style={{ width: `${derivedKpis.cashRatio}%` }} />
              <span style={{ width: `${derivedKpis.cardRatio}%` }} />
            </div>
            <p>Efectivo: <strong>{derivedKpis.cashRatio}%</strong></p>
            <p>Tarjeta: <strong>{derivedKpis.cardRatio}%</strong></p>
          </article> : null}

          {!loading ? <article className="pos-v2-reporting__card">
            <h3>Rentabilidad</h3>
            <p>Margen bruto: <strong>{derivedKpis.margin}%</strong></p>
          </article> : null}

          {!loading ? <article className="pos-v2-reporting__card">
            <h3>Top desempeño</h3>
            <p>Producto más vendido: <strong>{summary.bestSeller}</strong></p>
            <p>Categoría líder: <strong>{summary.bestCategory || "Sin datos"}</strong></p>
            <p>Nuevos clientes hoy: <strong>{newCustomersToday}</strong></p>
          </article> : null}

          {!loading ? <article className="pos-v2-reporting__card">
            <h3>Resumen comercial</h3>
            {hasOverviewValues ? (
              <div className="pos-v2-reporting__doughnut">
                <Doughnut data={businessOverviewData} options={doughnutOptions} />
              </div>
            ) : (
              <p className="is-empty">Aún no hay datos consolidados de ingresos/ganancia.</p>
            )}
            <p>Ingresos: <strong>{moneyFormatter.format(summary.income)}</strong></p>
            <p>Ganancia: <strong>{moneyFormatter.format(summary.earnings)}</strong></p>
          </article> : null}

          <article className="pos-v2-reporting__card">
            <header>
              <h3>Top productos</h3>
              <select value={insightMonth} onChange={(event) => setInsightMonth(Number(event.target.value))}>
                {monthOptions.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}
              </select>
            </header>
            {topChartsLoading ? <div className="pos-v2-reporting__chart-skeleton" aria-hidden="true" /> : null}
            {!topChartsLoading && displayTopProducts.length === 0 ? <p className="is-empty">Sin datos de productos para el mes.</p> : null}
            {!topChartsLoading && displayTopProducts.length > 0 ? (
              <>
                {topProducts.length === 0 ? <p className="pos-v2-reporting__hint">Mostrando estimación con ventas del periodo seleccionado.</p> : null}
                <div className="pos-v2-reporting__mini-line"><Bar data={topProductsChartData} options={quantityBarOptions} /></div>
              </>
            ) : null}
          </article>

          <article className="pos-v2-reporting__card">
            <header>
              <h3>Top categorías</h3>
              <select value={insightMonth} onChange={(event) => setInsightMonth(Number(event.target.value))}>
                {monthOptions.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}
              </select>
            </header>
            {topChartsLoading ? <div className="pos-v2-reporting__chart-skeleton" aria-hidden="true" /> : null}
            {!topChartsLoading && displayTopCategories.length === 0 ? <p className="is-empty">Sin datos de categorías para el mes.</p> : null}
            {!topChartsLoading && displayTopCategories.length > 0 ? (
              <>
                {topCategories.length === 0 ? <p className="pos-v2-reporting__hint">Estimación basada en tipo de venta (pedido/comanda).</p> : null}
                <div className="pos-v2-reporting__mini-line"><Doughnut data={topCategoriesChartData} options={doughnutOptions} /></div>
              </>
            ) : null}
          </article>

          <article className="pos-v2-reporting__card is-full">
            <header className="pos-v2-reporting__sales-header">
              <h3>Reporte pedidos</h3>
              <div className="pos-v2-reporting__sales-controls">
                <label>
                  Periodo
                  <select value={tableRange} onChange={(event) => setTableRange(event.target.value as ReportRange)} disabled={salesLoading || !hasToken}>
                    {RANGE_OPTIONS.map((option) => <option key={`table-${option.value}`} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <div className="pos-v2-reporting__payment-tabs">
                  {PAYMENT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={paymentFilter === option.value ? "is-active" : ""}
                      onClick={() => setPaymentFilter(option.value)}
                      disabled={salesLoading || !hasToken}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <label>
                  Buscar
                  <input
                    value={salesQuery}
                    onChange={(event) => setSalesQuery(event.target.value)}
                    placeholder="Producto, dirección o estado"
                    disabled={salesLoading || !hasToken}
                  />
                </label>
                <label>
                  Estado
                  <select value={salesStatus} onChange={(event) => setSalesStatus(event.target.value as "TODOS" | "PENDIENTE" | "ENTREGADO")}>
                    <option value="TODOS">Todos</option>
                    <option value="PENDIENTE">Pendientes</option>
                    <option value="ENTREGADO">Entregados</option>
                  </select>
                </label>
                <button type="button" onClick={exportSalesCsv} disabled={salesLoading || !hasToken || filteredSales.length === 0}>
                  Exportar CSV
                </button>
              </div>
            </header>
            <p className="pos-v2-reporting__table-summary">
              {salesTotals.totalRows} registros · Total {moneyFormatter.format(salesTotals.totalAmount)}
            </p>
            {!hasToken ? <p className="is-empty">Para ventas detalladas ingresa token POS v2.</p> : null}
            {hasToken && salesLoading ? (
              <div className="pos-v2-reporting__table-skeleton" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, index) => <span key={`table-skeleton-${index}`} />)}
              </div>
            ) : null}
            {hasToken && !salesLoading && filteredSales.length === 0 ? <p className="is-empty">Sin ventas para este rango/filtro.</p> : null}
            {hasToken && filteredSales.length > 0 ? (
              <div className="pos-v2-reporting__table-wrap">
                <table className="pos-v2-reporting__table">
                  <thead>
                    <tr>
                      <th>Nombre del producto</th>
                      <th>Dirección</th>
                      <th>Fecha de encargo</th>
                      <th>Cantidad</th>
                      <th>Monto</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.slice(0, 30).map((sale) => (
                      <tr key={`${sale.type}-${sale.id}`}>
                        <td>{sale.productName}</td>
                        <td>{sale.address}</td>
                        <td>{formatDate(sale.date)}</td>
                        <td>{sale.quantity}</td>
                        <td>{moneyFormatter.format(sale.total)}</td>
                        <td>
                          <span className={`status ${sale.status.toLowerCase().includes("pend") ? "is-pending" : "is-success"}`}>
                            {sale.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </article>

          <article className="pos-v2-reporting__card is-full">
            <header>
              <h3>Módulos en ruta (v2)</h3>
              <span>UX lista para integrar endpoints existentes del legacy</span>
            </header>
            <div className="pos-v2-reporting__module-grid">
              {PENDING_MODULES.map((module) => (
                <button key={module.id} type="button" className="pos-v2-reporting__module-card" onClick={() => navigate(`/v2/more/preview/${module.id}`)}>
                  <strong>{module.title}</strong>
                  <small>{module.detail}</small>
                  <span>Abrir vista previa</span>
                </button>
              ))}
            </div>
          </article>
        </section>

        {selectedPoint ? (
          <section className="pos-v2-reporting__modal" role="dialog" aria-modal="true" aria-label="Detalle de punto de ingreso" onClick={() => setSelectedPoint(null)}>
            <article onClick={(event) => event.stopPropagation()}>
              <header>
                <h3>{selectedPoint.dateLabel}</h3>
                <button type="button" onClick={() => setSelectedPoint(null)} aria-label="Regresar al reporte">← Regresar</button>
              </header>
              <p>Monto: <strong>{moneyFormatter.format(selectedPoint.amount)}</strong></p>
              <p>Variación: <strong>{selectedPoint.deltaLabel}</strong></p>
            </article>
          </section>
        ) : null}
      </section>
    </PosV2Shell>
  );
};
