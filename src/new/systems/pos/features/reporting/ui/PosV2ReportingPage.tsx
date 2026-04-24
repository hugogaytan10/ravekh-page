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
import { HiMiniCube, HiMiniUser, HiMiniUserGroup } from "react-icons/hi2";
import { ModernSystemsFactory } from "../../../../../index";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import type { IncomePoint, ReportRange, ReportSale } from "../model/SalesReport";
import type { ReportSummaryViewModel } from "../pages/ReportingInsightsPage";
import { POS_SESSION_STORAGE_KEYS } from "../../../shared/config/posSession";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import "./PosV2ReportingPage.css";

const API_BASE_URL = getPosApiBaseUrl();
const TOKEN_KEY = POS_SESSION_STORAGE_KEYS.token;
const BUSINESS_ID_KEY = POS_SESSION_STORAGE_KEYS.businessId;

const moneyFormatter = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });
const dateFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });
const BRAND_PURPLE = "#6d01d1";
const BRAND_VIOLET = "#7c3aed";
const BRAND_ORCHID = "#9333ea";
const BRAND_LAVENDER = "#a78bfa";
const BRAND_SOFT = "#c4b5fd";
const BRAND_INDIGO = "#4c1d95";

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
  const [topEmployees, setTopEmployees] = useState<TopChartItem[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopChartItem[]>([]);
  const [tableRange, setTableRange] = useState<ReportRange>("DAY");
  const [salesQuery, setSalesQuery] = useState("");
  const [salesStatus, setSalesStatus] = useState<"TODOS" | "PEDIDO" | "ENTREGADO" | "CANCELADO">("TODOS");
  const reportRequestRef = useRef(0);
  const salesRequestRef = useRef(0);
  const topChartsRequestRef = useRef(0);

  const { reportingPage } = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return {
      reportingPage: factory.createPosReportingPage(),
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
      const [summaryResult, incomeResult] = await Promise.allSettled([
        reportingPage.loadSummary(businessId, range, cleanToken),
        reportingPage.loadIncomeSeries(businessId, range, cleanToken),
      ]);

      if (reportRequestRef.current !== reportRequestId) {
        return;
      }

      setSummary(summaryResult.status === "fulfilled" ? summaryResult.value : DEFAULT_SUMMARY);
      setSeries(incomeResult.status === "fulfilled" ? incomeResult.value : []);
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
      setTopEmployees([]);
      setTopCustomers([]);
      return;
    }

    const requestId = topChartsRequestRef.current + 1;
    topChartsRequestRef.current = requestId;
    setTopChartsLoading(true);

    try {
      const [productsRows, employeeRows, customerRows] = await Promise.all([
        reportingPage.loadProductsLeaderboard(businessId, range, cleanToken),
        reportingPage.loadEmployeesLeaderboard(businessId, range, cleanToken),
        reportingPage.loadCustomersLeaderboard(businessId, range, cleanToken),
      ]);
      if (topChartsRequestRef.current !== requestId) {
        return;
      }

      setTopProducts(productsRows.slice(0, 5).map((item) => ({ name: item.name, quantity: item.quantity || item.totalSales })));
      setTopEmployees(employeeRows.slice(0, 5).map((item) => ({ name: item.name, quantity: item.totalSales })));
      setTopCustomers(customerRows.slice(0, 5).map((item) => ({ name: item.name, quantity: item.totalSales })));
      setSummary((previous) => ({
        ...previous,
        bestSeller: previous.bestSeller !== "Sin datos" ? previous.bestSeller : (productsRows[0]?.name ?? "Sin datos"),
      }));
    } catch (cause) {
      if (topChartsRequestRef.current === requestId) {
        setTopProducts([]);
        setTopEmployees([]);
        setTopCustomers([]);
        showToast("error", cause instanceof Error ? cause.message : "No se pudieron cargar gráficas avanzadas.");
      }
    } finally {
      if (topChartsRequestRef.current === requestId) {
        setTopChartsLoading(false);
      }
    }
  }, [businessId, cleanToken, hasBusinessId, hasToken, range, reportingPage, showToast]);

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

  const trendChartData = useMemo(() => ({
    labels: trendData.map((point) => point.dateLabel || "Sin fecha"),
    datasets: [
      {
        label: "Ingresos",
        data: trendData.map((point) => Number(point.amount) || 0),
        borderColor: BRAND_VIOLET,
        backgroundColor: "rgba(109, 1, 209, 0.16)",
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
        backgroundColor: [BRAND_VIOLET, BRAND_SOFT],
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

  const displayTopProducts = topProducts.length > 0 ? topProducts : fallbackTopProducts;
  const hasOverviewValues = summary.income > 0 || summary.earnings > 0 || summary.averageSale > 0;

  const topProductsChartData = useMemo(() => ({
    labels: displayTopProducts.map((item, index) => item.name || `Producto ${index + 1}`),
    datasets: [
      {
        label: "Productos más vendidos",
        data: displayTopProducts.map((item) => item.quantity),
        borderRadius: 8,
        borderSkipped: false,
        backgroundColor: [BRAND_PURPLE, BRAND_VIOLET, BRAND_ORCHID, BRAND_LAVENDER, BRAND_SOFT],
      },
    ],
  }), [displayTopProducts]);

  const topEmployeesChartData = useMemo(() => ({
    labels: topEmployees.map((item, index) => item.name || `Empleado ${index + 1}`),
    datasets: [
      {
        label: "Ventas por empleado",
        data: topEmployees.map((item) => item.quantity),
        backgroundColor: [BRAND_INDIGO, BRAND_PURPLE, BRAND_VIOLET, BRAND_ORCHID, BRAND_LAVENDER],
        borderWidth: 0,
      },
    ],
  }), [topEmployees]);

  const topCustomersChartData = useMemo(() => ({
    labels: topCustomers.map((item, index) => item.name || `Cliente ${index + 1}`),
    datasets: [
      {
        label: "Ventas por cliente",
        data: topCustomers.map((item) => item.quantity),
        borderRadius: 8,
        borderSkipped: false,
        backgroundColor: [BRAND_ORCHID, BRAND_VIOLET, BRAND_PURPLE, BRAND_LAVENDER, BRAND_SOFT],
      },
    ],
  }), [topCustomers]);

  const businessOverviewData = useMemo(() => ({
    labels: ["Ingresos", "Ganancia", "Ticket promedio"],
    datasets: [
      {
        data: [summary.income, summary.earnings, summary.averageSale],
        backgroundColor: [BRAND_VIOLET, BRAND_PURPLE, BRAND_LAVENDER],
        borderWidth: 0,
      },
    ],
  }), [summary.averageSale, summary.earnings, summary.income]);

  const filteredSales = useMemo(() => {
    const query = salesQuery.trim().toLowerCase();

    return sales.filter((sale) => {
      const normalizedStatus = sale.status.toUpperCase().trim();
      const matchesStatus = salesStatus === "TODOS" ? true : normalizedStatus === salesStatus;

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

  const salesStatusChartData = useMemo(() => {
    const order = filteredSales.filter((sale) => sale.status.toUpperCase().trim() === "PEDIDO").length;
    const delivered = filteredSales.filter((sale) => sale.status.toUpperCase().trim() === "ENTREGADO").length;
    const canceled = filteredSales.filter((sale) => sale.status.toUpperCase().trim() === "CANCELADO").length;
    return {
      labels: ["Pedido", "Entregado", "Cancelado"],
      datasets: [
        {
          label: "Estado de pedidos",
          data: [order, delivered, canceled],
          backgroundColor: [BRAND_ORCHID, BRAND_PURPLE, "#ef4444"],
          borderWidth: 0,
        },
      ],
    };
  }, [filteredSales]);

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
            <button type="button" onClick={() => navigate(POS_V2_PATHS.login)}>Ir a iniciar sesión</button>
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


          <article className="pos-v2-reporting__card">
            <header>
              <h3>Top productos</h3>
              <HiMiniCube aria-hidden="true" />
            </header>
            {topChartsLoading ? <div className="pos-v2-reporting__chart-skeleton" aria-hidden="true" /> : null}
            {!topChartsLoading && displayTopProducts.length === 0 ? <p className="is-empty">Sin datos de productos para este rango.</p> : null}
            {!topChartsLoading && displayTopProducts.length > 0 ? (
              <>
                {topProducts.length === 0 ? <p className="pos-v2-reporting__hint">Mostrando estimación con ventas del periodo seleccionado.</p> : null}
                <div className="pos-v2-reporting__mini-line"><Bar data={topProductsChartData} options={quantityBarOptions} /></div>
              </>
            ) : null}
          </article>

          <article className="pos-v2-reporting__card">
            <header>
              <h3>Ventas por empleado</h3>
              <HiMiniUser aria-hidden="true" />
            </header>
            {topChartsLoading ? <div className="pos-v2-reporting__chart-skeleton" aria-hidden="true" /> : null}
            {!topChartsLoading && topEmployees.length === 0 ? <p className="is-empty">Sin datos de empleados para este rango.</p> : null}
            {!topChartsLoading && topEmployees.length > 0 ? <div className="pos-v2-reporting__mini-line"><Doughnut data={topEmployeesChartData} options={doughnutOptions} /></div> : null}
          </article>

          <article className="pos-v2-reporting__card">
            <header>
              <h3>Ventas por cliente</h3>
              <HiMiniUserGroup aria-hidden="true" />
            </header>
            {topChartsLoading ? <div className="pos-v2-reporting__chart-skeleton" aria-hidden="true" /> : null}
            {!topChartsLoading && topCustomers.length === 0 ? <p className="is-empty">Sin datos de clientes para este rango.</p> : null}
            {!topChartsLoading && topCustomers.length > 0 ? <div className="pos-v2-reporting__mini-line"><Bar data={topCustomersChartData} options={quantityBarOptions} /></div> : null}
          </article>

          <article className="pos-v2-reporting__card">
            <header>
              <h3>Estado de pedidos</h3>
              <HiMiniCube aria-hidden="true" />
            </header>
            {salesLoading ? <div className="pos-v2-reporting__chart-skeleton" aria-hidden="true" /> : null}
            {!salesLoading && filteredSales.length === 0 ? <p className="is-empty">Sin pedidos para mostrar estatus.</p> : null}
            {!salesLoading && filteredSales.length > 0 ? <div className="pos-v2-reporting__doughnut"><Doughnut data={salesStatusChartData} options={doughnutOptions} /></div> : null}
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
                  <select value={salesStatus} onChange={(event) => setSalesStatus(event.target.value as "TODOS" | "PEDIDO" | "ENTREGADO" | "CANCELADO")}>
                    <option value="TODOS">Todos</option>
                    <option value="PEDIDO">Pedido</option>
                    <option value="ENTREGADO">Entregados</option>
                    <option value="CANCELADO">Cancelados</option>
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
                          <span
                            className={`status ${
                              sale.status.toUpperCase().includes("CANCEL")
                                ? "is-cancelled"
                                : sale.status.toUpperCase().includes("ENTREG")
                                  ? "is-success"
                                  : "is-pending"
                            }`}
                          >
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
              <span>UX lista para integrar endpoints existentes del sistema anterior</span>
            </header>
            <div className="pos-v2-reporting__module-grid">
              {PENDING_MODULES.map((module) => (
                <button
                  key={module.id}
                  type="button"
                  className="pos-v2-reporting__module-card"
                  onClick={() => navigate(module.id === "cash-closing" ? POS_V2_PATHS.cashClosing : POS_V2_PATHS.morePreview(module.id))}
                >
                  <strong>{module.title}</strong>
                  <small>{module.detail}</small>
                  <span>{module.id === "cash-closing" ? "Abrir módulo" : "Abrir vista previa"}</span>
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
