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
import type { IncomePoint, ReportRange, ReportSale, SalesTicket } from "../model/SalesReport";
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

const toDateInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const initialSalesDates = () => {
  const today = new Date();
  return { from: toDateInput(new Date(today.getFullYear(), today.getMonth(), 1)), to: toDateInput(today) };
};

const escapeHtml = (value: unknown): string => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

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
  const [salesDates, setSalesDates] = useState(initialSalesDates);
  const [salesTickets, setSalesTickets] = useState<SalesTicket[]>([]);
  const [salesTicketsLoading, setSalesTicketsLoading] = useState(false);
  const [salesTicketsPage, setSalesTicketsPage] = useState(1);
  const [salesTicketsTotalPages, setSalesTicketsTotalPages] = useState(1);
  const [salesTicketsTotalItems, setSalesTicketsTotalItems] = useState(0);
  const reportRequestRef = useRef(0);
  const salesRequestRef = useRef(0);
  const topChartsRequestRef = useRef(0);
  const salesTicketsRequestRef = useRef(0);

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

  const loadSalesTickets = useCallback(async () => {
    if (!hasBusinessId || !hasToken) return;
    if (!salesDates.from || !salesDates.to || salesDates.from > salesDates.to) {
      showToast("error", "Selecciona un rango de fechas válido.");
      return;
    }

    const requestId = ++salesTicketsRequestRef.current;
    setSalesTicketsLoading(true);
    try {
      const result = await reportingPage.loadSalesTicketsByDateRange(
        businessId,
        salesDates.from,
        salesDates.to,
        Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Mexico_City",
        salesTicketsPage,
        50,
        cleanToken,
      );
      if (salesTicketsRequestRef.current !== requestId) return;
      setSalesTickets(result.items);
      setSalesTicketsTotalPages(result.pagination.totalPages);
      setSalesTicketsTotalItems(result.pagination.totalItems);
    } catch (cause) {
      if (salesTicketsRequestRef.current === requestId) {
        setSalesTickets([]);
        showToast("error", cause instanceof Error ? cause.message : "No se pudo cargar el reporte de ventas.");
      }
    } finally {
      if (salesTicketsRequestRef.current === requestId) setSalesTicketsLoading(false);
    }
  }, [businessId, cleanToken, hasBusinessId, hasToken, reportingPage, salesDates, salesTicketsPage, showToast]);

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

  useEffect(() => {
    loadSalesTickets();
  }, [loadSalesTickets]);

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

  const setQuickSalesRange = (period: ReportRange) => {
    const today = new Date();
    const from = period === "DAY"
      ? today
      : period === "MONTH"
        ? new Date(today.getFullYear(), today.getMonth(), 1)
        : new Date(today.getFullYear(), 0, 1);
    setSalesTicketsPage(1);
    setSalesDates({ from: toDateInput(from), to: toDateInput(today) });
  };

  const exportSalesTicketsCsv = () => {
    if (salesTickets.length === 0) return;
    const rows = salesTickets.map((sale) => [
      sale.id,
      formatDate(sale.date),
      sale.paymentMethod,
      sale.employeeName ?? "",
      sale.customerName ?? "",
      sale.products.map((product) => `${product.quantity}x ${product.itemName}`).join(" | "),
      sale.discountApplied,
      sale.taxesApplied,
      sale.total,
      sale.currency,
    ]);
    const csv = [["Ticket", "Fecha", "Pago", "Empleado", "Cliente", "Productos", "Descuento", "Impuestos", "Total", "Moneda"], ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte-ventas-${salesDates.from}-${salesDates.to}-pagina-${salesTicketsPage}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("success", "Reporte de ventas exportado.");
  };

  const reprintTicket = (sale: SalesTicket) => {
    const printWindow = window.open("", "_blank", "width=520,height=800");
    if (!printWindow) {
      showToast("error", "Permite ventanas emergentes para reimprimir el ticket.");
      return;
    }
    const productRows = sale.products.map((product) => `
      <tr><td>${escapeHtml(product.quantity)} x ${escapeHtml(product.itemName)}</td><td>${escapeHtml(moneyFormatter.format(product.detailAmount))}</td></tr>
    `).join("");
    printWindow.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Ticket ${sale.id}</title><style>
      body{font-family:Arial,sans-serif;color:#111;margin:0}.actions{padding:12px;text-align:center}.ticket{width:76mm;margin:auto;padding:3mm}.ticket h1{text-align:center;font-size:18px}.meta{font-size:12px;line-height:1.5}table{width:100%;border-collapse:collapse;font-size:12px}td{padding:5px 0;border-bottom:1px dashed #aaa}td:last-child{text-align:right}.total{font-size:16px;text-align:right;margin-top:10px}@media print{.actions{display:none}.ticket{margin:0}}
    </style></head><body><div class="actions"><button onclick="window.print()">Imprimir ticket</button></div><main class="ticket">
      <h1>Ticket de venta #${escapeHtml(sale.id)}</h1><div class="meta">Fecha: ${escapeHtml(formatDate(sale.date))}<br>Pago: ${escapeHtml(sale.paymentMethod)}<br>Empleado: ${escapeHtml(sale.employeeName ?? "Sin empleado")}<br>Cliente: ${escapeHtml(sale.customerName ?? "Público general")}</div>
      <table><tbody>${productRows}</tbody></table><p>Descuento: ${escapeHtml(moneyFormatter.format(sale.discountApplied))}<br>Impuestos: ${escapeHtml(moneyFormatter.format(sale.taxesApplied))}</p><p class="total"><strong>Total: ${escapeHtml(moneyFormatter.format(sale.total))}</strong></p>
    </main></body></html>`);
    printWindow.document.close();
    printWindow.focus();
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
              <div>
                <h3>Reporte de ventas</h3>
                <span>Consulta, exporta y reimprime tickets por rango de fechas.</span>
              </div>
              <div className="pos-v2-reporting__sales-controls">
                <div className="pos-v2-reporting__payment-tabs" aria-label="Rangos rápidos">
                  {RANGE_OPTIONS.map((option) => (
                    <button key={`sales-range-${option.value}`} type="button" onClick={() => setQuickSalesRange(option.value)} disabled={salesTicketsLoading}>
                      {option.label}
                    </button>
                  ))}
                </div>
                <label>
                  Desde
                  <input
                    type="date"
                    value={salesDates.from}
                    max={salesDates.to}
                    onChange={(event) => {
                      setSalesTicketsPage(1);
                      setSalesDates((current) => ({ ...current, from: event.target.value }));
                    }}
                  />
                </label>
                <label>
                  Hasta
                  <input
                    type="date"
                    value={salesDates.to}
                    min={salesDates.from}
                    onChange={(event) => {
                      setSalesTicketsPage(1);
                      setSalesDates((current) => ({ ...current, to: event.target.value }));
                    }}
                  />
                </label>
                <button type="button" onClick={exportSalesTicketsCsv} disabled={salesTicketsLoading || salesTickets.length === 0}>
                  Exportar CSV
                </button>
              </div>
            </header>
            <p className="pos-v2-reporting__table-summary">
              {salesTicketsTotalItems} tickets · Página {salesTicketsPage} de {salesTicketsTotalPages}
            </p>
            {salesTicketsLoading ? (
              <div className="pos-v2-reporting__table-skeleton" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, index) => <span key={`sales-ticket-skeleton-${index}`} />)}
              </div>
            ) : null}
            {!salesTicketsLoading && salesTickets.length === 0 ? <p className="is-empty">No hay ventas en el rango seleccionado.</p> : null}
            {!salesTicketsLoading && salesTickets.length > 0 ? (
              <>
                <div className="pos-v2-reporting__table-wrap">
                  <table className="pos-v2-reporting__table">
                    <thead>
                      <tr><th>Ticket</th><th>Fecha</th><th>Pago</th><th>Empleado</th><th>Productos</th><th>Total</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                      {salesTickets.map((sale) => (
                        <tr key={`${sale.type}-${sale.id}`}>
                          <td>#{sale.id}</td>
                          <td>{formatDate(sale.date)}</td>
                          <td>{sale.paymentMethod}</td>
                          <td>{sale.employeeName ?? "Sin empleado"}</td>
                          <td>{sale.products.map((product) => `${product.quantity}x ${product.itemName}`).join(", ") || "Sin detalle"}</td>
                          <td>{moneyFormatter.format(sale.total)}</td>
                          <td><button type="button" onClick={() => reprintTicket(sale)}>Reimprimir</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <nav className="pos-v2-reporting__pagination" aria-label="Paginación del reporte de ventas">
                  <button type="button" onClick={() => setSalesTicketsPage((page) => Math.max(1, page - 1))} disabled={salesTicketsPage <= 1}>Anterior</button>
                  <span>Página {salesTicketsPage} de {salesTicketsTotalPages}</span>
                  <button type="button" onClick={() => setSalesTicketsPage((page) => Math.min(salesTicketsTotalPages, page + 1))} disabled={salesTicketsPage >= salesTicketsTotalPages}>Siguiente</button>
                </nav>
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
