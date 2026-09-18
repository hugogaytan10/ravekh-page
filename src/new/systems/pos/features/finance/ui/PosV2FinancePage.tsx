import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModernSystemsFactory } from "../../../../../index";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import {
  POS_SESSION_STORAGE_KEYS,
  resolvePosOperatorRole,
} from "../../../shared/config/posSession";
import { onPosBranchUpdated, readActivePosBranchId, type PosBranch } from "../../../shared/config/posBranch";
import { PosBranchApi } from "../../../shared/api/PosBranchApi";
import { FetchHttpClient } from "../../../../../core/api/FetchHttpClient";
import type { FinanceEntry } from "../model/FinanceEntry";
import "./PosV2FinancePage.css";

const API_BASE_URL = getPosApiBaseUrl();
const TOKEN_KEY = POS_SESSION_STORAGE_KEYS.token;
const BUSINESS_ID_KEY = POS_SESSION_STORAGE_KEYS.businessId;

type FinanceFormMode = "income" | "expense";
type FinanceFilter = "all" | FinanceFormMode;
type PeriodView = "month" | "today";

type FinanceTransactionViewModel = {
  id: string;
  concept: string;
  detail?: string;
  amount: number;
  type: FinanceFormMode;
  createdAt?: string;
  occurredAt?: Date | null;
  source?: string;
  orderId?: number | null;
  commandId?: number | null;
};

const dateFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });
const moneyFormatter = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });

const INCOME_CATEGORIES = ["Venta", "Servicio", "Delivery", "Transferencia", "Otro ingreso"];
const EXPENSE_CATEGORIES = ["Nómina", "Renta", "Comida", "Marketing", "Papelería", "Transporte", "General"];

const sanitizeConceptInput = (value: string): string => value.replace(/\s+/g, " ").replace(/[<>]/g, "").trimStart();
const sanitizeConceptForSave = (value: string): string => value.replace(/\s+/g, " ").replace(/[^\p{L}\p{N}\s\-.,]/gu, "").trim();
const sanitizeMoneyInput = (value: string): string => {
  const sanitized = value.replace(/[^\d.]/g, "");
  const [integer, decimal = ""] = sanitized.split(".");
  return decimal.length > 0 ? `${integer}.${decimal.slice(0, 2)}` : integer;
};

const parseFinanceDate = (value?: string): Date | null => {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, (month || 1) - 1, day || 1, 12, 0, 0);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toPresentationDate = (value?: string): string => {
  const parsed = parseFinanceDate(value);
  return parsed ? dateFormatter.format(parsed) : "Sin fecha";
};

const isTodayEntry = (value?: string): boolean => {
  const date = parseFinanceDate(value);
  if (!date) return false;

  const today = new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
};

const sumAmounts = (entries: FinanceEntry[]): number => entries.reduce((acc, item) => acc + Math.abs(Number(item.amount ?? 0)), 0);

const getSafeSession = () => {
  const token = (window.localStorage.getItem(TOKEN_KEY) ?? "").trim();
  const businessId = Number(window.localStorage.getItem(BUSINESS_ID_KEY) ?? "");
  return {
    token,
    businessId,
    role: resolvePosOperatorRole(token),
    hasSession: Boolean(token) && Number.isFinite(businessId) && businessId > 0,
  };
};

export const PosV2FinancePage = () => {
  const navigate = useNavigate();
  const [session] = useState(() => getSafeSession());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [periodView, setPeriodView] = useState<PeriodView>("month");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("0");
  const [formMode, setFormMode] = useState<FinanceFormMode>("income");
  const [typeFilter, setTypeFilter] = useState<FinanceFilter>("all");
  const [search, setSearch] = useState("");
  const [openFormModal, setOpenFormModal] = useState(false);

  const [financeBranches, setFinanceBranches] = useState<PosBranch[]>([]);
  const [financeBranchId, setFinanceBranchId] = useState(() => readActivePosBranchId());
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchError, setBranchError] = useState<string | null>(null);

  const [overview, setOverview] = useState({ monthIncome: 0, monthExpenses: 0, monthBalance: 0, todayIncome: 0, todayExpenses: 0 });
  const [movement, setMovement] = useState<{ income: FinanceEntry[]; expenses: FinanceEntry[] }>({ income: [], expenses: [] });
  const [todayMovement, setTodayMovement] = useState<{ income: FinanceEntry[]; expenses: FinanceEntry[] }>({ income: [], expenses: [] });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const page = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosFinanceTrackingPage();
  }, []);

  const branchApi = useMemo(
    () => new PosBranchApi(new FetchHttpClient(API_BASE_URL)),
    [],
  );

  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, index) => new Date(new Date().getFullYear(), index, 1).toLocaleString("es-MX", { month: "long" })),
    [],
  );

  const hasSession = session.hasSession;
  const isAdmin = session.role === "admin";

  const activeFinanceBranch = useMemo(
    () => financeBranches.find((branch) => branch.id === financeBranchId) ?? null,
    [financeBranchId, financeBranches],
  );

  const selectedBranchLabel = activeFinanceBranch?.name ?? "Sucursal activa";

  const financeTimeline = useMemo<FinanceTransactionViewModel[]>(() => {
    const fallbackTodayMovement = {
      income: movement.income.filter((entry) => isTodayEntry(entry.createdAt)),
      expenses: movement.expenses.filter((entry) => isTodayEntry(entry.createdAt)),
    };
    const hasTodayEndpointsData = todayMovement.income.length > 0 || todayMovement.expenses.length > 0;
    const sourceMovement = periodView === "today" ? (hasTodayEndpointsData ? todayMovement : fallbackTodayMovement) : movement;
    const base = [
      ...sourceMovement.income.map((entry, index) => {
        const isPosSale = Boolean(entry.orderId) || entry.source === "POS";
        const isRestaurantSale = Boolean(entry.commandId) || entry.source === "RESTAURANT";
        const concept = isPosSale
          ? `Venta POS${entry.orderId ? ` #${entry.orderId}` : ""}`
          : isRestaurantSale
            ? `Venta restaurante${entry.commandId ? ` #${entry.commandId}` : ""}`
            : entry.name?.trim() || "Ingreso";

        const detail = isPosSale || isRestaurantSale
          ? entry.name?.trim() && entry.name.trim().toUpperCase() !== "VENTA"
            ? entry.name.trim()
            : undefined
          : entry.source === "MANUAL"
            ? "Ingreso manual"
            : undefined;

        return {
          id: `income-${entry.id ?? index}-${entry.orderId ?? entry.commandId ?? entry.name}`,
          concept,
          detail,
          amount: Math.abs(Number(entry.amount ?? 0)),
          type: "income" as const,
          createdAt: entry.createdAt,
          occurredAt: parseFinanceDate(entry.createdAt),
          source: entry.source,
          orderId: entry.orderId,
          commandId: entry.commandId,
        };
      }),
      ...sourceMovement.expenses.map((entry, index) => ({
        id: `expense-${index}-${entry.name}`,
        concept: entry.name?.trim() || "Egreso",
        amount: Math.abs(Number(entry.amount ?? 0)),
        type: "expense" as const,
        createdAt: entry.createdAt,
        occurredAt: parseFinanceDate(entry.createdAt),
      })),
    ];

    const normalizedSearch = search.trim().toLowerCase();

    return base
      .filter((item) => (typeFilter === "all" ? true : item.type === typeFilter))
      .filter((item) => (normalizedSearch ? item.concept.toLowerCase().includes(normalizedSearch) : true))
      .sort((a, b) => (b.occurredAt?.getTime() ?? 0) - (a.occurredAt?.getTime() ?? 0));
  }, [movement, todayMovement, periodView, typeFilter, search]);

  const activeCategories = formMode === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const monthSales = useMemo(
    () => movement.income.filter((entry) => entry.isSale),
    [movement.income],
  );

  const monthSalesTotal = useMemo(
    () => sumAmounts(monthSales),
    [monthSales],
  );

  const derivedOverview = useMemo(() => {
    const fallbackMonthIncome = sumAmounts(movement.income);
    const fallbackMonthExpenses = sumAmounts(movement.expenses);

    const monthIncome = overview.monthIncome > 0 ? overview.monthIncome : fallbackMonthIncome;
    const monthExpenses = overview.monthExpenses > 0 ? overview.monthExpenses : fallbackMonthExpenses;

    const todayIncome = overview.todayIncome > 0 ? overview.todayIncome : sumAmounts(todayMovement.income);
    const todayExpenses = overview.todayExpenses > 0 ? overview.todayExpenses : sumAmounts(todayMovement.expenses);

    const monthBalance = monthIncome - monthExpenses;
    const monthBurnRate = monthIncome > 0 ? Math.min((monthExpenses / monthIncome) * 100, 100) : 0;
    const todayNet = todayIncome - todayExpenses;

    return {
      monthIncome,
      monthExpenses,
      monthBalance,
      todayIncome,
      todayExpenses,
      monthBurnRate: Number(monthBurnRate.toFixed(1)),
      todayNet,
    };
  }, [movement.expenses, movement.income, overview, todayMovement.expenses, todayMovement.income]);

  const burnRateStatus = useMemo(() => {
    if (derivedOverview.monthBurnRate < 45) return { label: "Saludable", tone: "is-good", description: "Tus egresos están bajo control." };
    if (derivedOverview.monthBurnRate < 75) return { label: "Atención", tone: "is-warning", description: "Monitorea costos para proteger margen." };
    return { label: "Crítico", tone: "is-danger", description: "Tus egresos están consumiendo gran parte de ingresos." };
  }, [derivedOverview.monthBurnRate]);

  const refreshData = useCallback(async () => {
    if (!hasSession) {
      setError("No hay sesión activa para cargar finanzas.");
      return;
    }

    setLoading(true);
    setError(null);

    const branchId = financeBranchId > 0 ? financeBranchId : undefined;

    const [overviewResult, movementResult, todayMovementResult] = await Promise.allSettled([
      page.loadOverview(session.businessId, session.token, branchId),
      page.loadMonthMovement(session.businessId, month, session.token, branchId),
      page.loadTodayMovement(session.businessId, session.token, branchId),
    ]);

    if (overviewResult.status === "fulfilled") {
      setOverview(overviewResult.value);
    }

    if (movementResult.status === "fulfilled") {
      setMovement(movementResult.value);
    } else {
      setMovement({ income: [], expenses: [] });
    }

    if (todayMovementResult.status === "fulfilled") {
      setTodayMovement(todayMovementResult.value);
    } else {
      setTodayMovement({ income: [], expenses: [] });
    }

    if (overviewResult.status === "rejected" && movementResult.status === "rejected" && todayMovementResult.status === "rejected") {
      setError("No se pudieron cargar ingresos y egresos. Verifica sesión o disponibilidad del API.");
    } else if (overviewResult.status === "rejected") {
      setError("No se pudo cargar el resumen, pero sí los movimientos.");
    } else if (movementResult.status === "rejected" && todayMovementResult.status === "rejected") {
      setError("No se pudo cargar el detalle de ingresos/egresos del periodo seleccionado.");
    }

    setLoading(false);
  }, [financeBranchId, hasSession, month, page, session.businessId, session.token]);

  useEffect(() => {
    return onPosBranchUpdated((branch) => {
      if (!isAdmin) {
        setFinanceBranchId(branch.id);
      }
    });
  }, [isAdmin]);

  useEffect(() => {
    if (!hasSession || !isAdmin) {
      return;
    }

    let cancelled = false;
    setBranchesLoading(true);
    setBranchError(null);

    branchApi
      .list(session.token)
      .then((rows) => {
        if (cancelled) return;

        setFinanceBranches(rows);

        const activeGlobalBranchId = readActivePosBranchId(session.businessId);
        const fallback =
          rows.find((branch) => branch.id === activeGlobalBranchId) ??
          rows.find((branch) => branch.isMain) ??
          rows[0] ??
          null;

        setFinanceBranchId((current) => {
          const currentExists = rows.some((branch) => branch.id === current);
          return currentExists ? current : fallback?.id ?? 0;
        });
      })
      .catch((cause) => {
        if (cancelled) return;
        setBranchError(cause instanceof Error ? cause.message : "No se pudieron cargar las sucursales.");
      })
      .finally(() => {
        if (!cancelled) setBranchesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    branchApi,
    hasSession,
    isAdmin,
    session.businessId,
    session.token,
  ]);

  useEffect(() => {
    if (hasSession && financeBranchId > 0) {
      refreshData();
    }
  }, [financeBranchId, hasSession, refreshData]);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setToast(null);

    if (!hasSession) {
      setError("Necesitas iniciar sesión para registrar movimientos.");
      return;
    }

    const safeName = sanitizeConceptForSave(name);
    if (safeName.length < 3) {
      setError("El concepto debe tener al menos 3 caracteres válidos.");
      return;
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Ingresa un monto válido mayor a 0.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = { businessId: session.businessId, name: safeName, amount: Number(parsedAmount.toFixed(2)) };
      if (formMode === "income") {
        await page.createIncome(payload, session.token, financeBranchId || undefined);
      } else {
        await page.createExpense(payload, session.token, financeBranchId || undefined);
      }

      setName("");
      setAmount("0");
      setOpenFormModal(false);
      setToast({ type: "success", message: formMode === "income" ? "Ingreso registrado correctamente." : "Egreso registrado correctamente." });
      await refreshData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar el movimiento.");
      setToast({ type: "error", message: "No se pudo guardar el movimiento." });
    } finally {
      setSaving(false);
    }
  };

  const renderMovementForm = () => (
    <form className="pos-v2-finance__form" onSubmit={handleSubmit}>
      <h3>Registrar movimiento · {selectedBranchLabel}</h3>
      <div className="pos-v2-finance__mode-toggle" role="tablist" aria-label="Tipo de movimiento">
        <button type="button" className={formMode === "income" ? "is-active" : ""} onClick={() => setFormMode("income")}>Ingreso</button>
        <button type="button" className={formMode === "expense" ? "is-active" : ""} onClick={() => setFormMode("expense")}>Egreso</button>
      </div>

      <label>
        Concepto
        <input value={name} onChange={(event) => setName(sanitizeConceptInput(event.target.value))} placeholder="Ej. Venta en mostrador" maxLength={80} />
      </label>

      <div className="pos-v2-finance__chips" aria-label="Categorías sugeridas">
        {activeCategories.map((category) => (
          <button key={category} type="button" className={name === category ? "is-active" : ""} onClick={() => setName(category)}>{category}</button>
        ))}
      </div>

      <label>
        Monto
        <input type="text" inputMode="decimal" value={amount} onChange={(event) => setAmount(sanitizeMoneyInput(event.target.value))} placeholder="0.00" />
      </label>

      <button type="submit" disabled={saving || loading || !hasSession}>{saving ? "Guardando..." : `Guardar ${formMode === "income" ? "ingreso" : "egreso"}`}</button>
    </form>
  );

  if (!hasSession) {
    return (
      <PosV2Shell title="Finanzas" subtitle="Control de ingresos y egresos moderno y desacoplado del código anterior">
        <section className="pos-v2-finance pos-v2-finance--empty">
          <h2>Sesión requerida</h2>
          <p>Para ver tus finanzas, primero inicia sesión en POS v2.</p>
          <button type="button" onClick={() => navigate(POS_V2_PATHS.login)}>Ir a iniciar sesión</button>
        </section>
      </PosV2Shell>
    );
  }

  return (
    <PosV2Shell title="Finanzas" subtitle="Control financiero v2 optimizado para cualquier dispositivo">
      <section className="pos-v2-finance">
        <header className="pos-v2-finance__header">
          <div>
            <h2>Panel financiero</h2>
            <p>Datos del mes y del día con filtros operativos en tiempo real.</p>
          </div>

          <div className="pos-v2-finance__filters">
            {isAdmin ? (
              <label className="pos-v2-finance__branch-filter">
                Sucursal
                <select
                  value={financeBranchId || ""}
                  onChange={(event) => setFinanceBranchId(Number(event.target.value))}
                  disabled={branchesLoading || financeBranches.length === 0}
                >
                  {branchesLoading ? <option value="">Cargando sucursales…</option> : null}
                  {!branchesLoading && financeBranches.length === 0 ? <option value="">Sin sucursales</option> : null}
                  {financeBranches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}{branch.isMain ? " · Principal" : ""}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label>
              Mes
              <select value={month} onChange={(event) => setMonth(Number(event.target.value))}>
                {monthOptions.map((monthLabel, index) => <option key={monthLabel} value={index}>{monthLabel}</option>)}
              </select>
            </label>

            <button type="button" className="pos-v2-finance__refresh" onClick={() => refreshData()} disabled={loading}>
              {loading ? "Actualizando…" : "Actualizar"}
            </button>

            <button type="button" className="pos-v2-finance__new-mobile" onClick={() => setOpenFormModal(true)}>+ Nuevo</button>
          </div>
        </header>

        <div className="pos-v2-finance__scope">
          <span>Consultando:</span>
          <strong>{selectedBranchLabel}</strong>
          {isAdmin ? <small>Vista administrativa por sucursal</small> : <small>Sucursal operativa actual</small>}
        </div>

        {branchError ? <p className="pos-v2-finance__error">{branchError}</p> : null}
        {error ? <p className="pos-v2-finance__error">{error}</p> : null}
        {toast ? <p className={`pos-v2-finance__toast is-${toast.type}`}>{toast.message}</p> : null}

        <section className="pos-v2-finance__stats">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <article key={`finance-stat-skeleton-${index}`} className="is-skeleton" aria-hidden="true"><span /><strong /></article>
            ))
          ) : (
            <>
              <article><span>Entradas del mes</span><strong>{moneyFormatter.format(derivedOverview.monthIncome)}</strong></article>
              <article><span>Ventas del mes</span><strong>{moneyFormatter.format(monthSalesTotal)}</strong></article>
              <article><span>Transacciones de venta</span><strong>{monthSales.length}</strong></article>
              <article><span>Salidas del mes</span><strong>{moneyFormatter.format(derivedOverview.monthExpenses)}</strong></article>
              <article><span>Resultado operativo hoy</span><strong className={derivedOverview.todayNet >= 0 ? "is-income" : "is-expense"}>{derivedOverview.todayNet >= 0 ? "+" : ""}{moneyFormatter.format(derivedOverview.todayNet)}</strong></article>
              <article><span>Movimientos registrados</span><strong>{financeTimeline.length}</strong></article>
            </>
          )}
        </section>

        <section className="pos-v2-finance__insights">
          <article>
            <h3>Salud mensual</h3>
            <p>Egresos del mes: <strong>{moneyFormatter.format(derivedOverview.monthExpenses)}</strong> de <strong>{moneyFormatter.format(derivedOverview.monthIncome)}</strong> en ingresos.</p>
            <div className="pos-v2-finance__progress" role="presentation" aria-hidden="true"><span style={{ width: `${derivedOverview.monthBurnRate}%` }} /></div>
            <div className="pos-v2-finance__health-row">
              <small>Uso: <strong>{derivedOverview.monthBurnRate}%</strong></small>
              <span className={`pos-v2-finance__health-badge ${burnRateStatus.tone}`}>{burnRateStatus.label}</span>
            </div>
            <small>{burnRateStatus.description}</small>
          </article>
          <article>
            <h3>Resultado de hoy</h3>
            <p className={derivedOverview.todayNet >= 0 ? "is-income" : "is-expense"}>{derivedOverview.todayNet >= 0 ? "+" : ""}{moneyFormatter.format(derivedOverview.todayNet)}</p>
            <small>Ingreso diario - egreso diario</small>
          </article>
          <article>
            <h3>Movimientos visibles</h3>
            <p><strong>{financeTimeline.length}</strong> registros filtrados</p>
            <small>Incluye filtro por tipo, periodo y búsqueda.</small>
          </article>
        </section>

        <section className="pos-v2-finance__content">
          <div className="pos-v2-finance__desktop-form">{renderMovementForm()}</div>

          <article className="pos-v2-finance__timeline">
            <header>
              <h3>Movimientos</h3>
              <div className="pos-v2-finance__toolbar">
                <div className="pos-v2-finance__period-toggle" role="group" aria-label="Rango de movimientos">
                  <button type="button" className={periodView === "month" ? "is-active" : ""} onClick={() => setPeriodView("month")}>Mes</button>
                  <button type="button" className={periodView === "today" ? "is-active" : ""} onClick={() => setPeriodView("today")}>Hoy</button>
                </div>
                <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as FinanceFilter)} aria-label="Filtrar por tipo">
                  <option value="all">Todo</option>
                  <option value="income">Ingresos</option>
                  <option value="expense">Egresos</option>
                </select>
              </div>
            </header>

            <input className="pos-v2-finance__search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por concepto" aria-label="Buscar movimientos" />

            <ul>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => <li key={`finance-line-skeleton-${index}`} className="is-skeleton" aria-hidden="true"><span /><strong /></li>)
              ) : null}
              {!loading && financeTimeline.length === 0 ? <li className="is-empty">Sin movimientos para los filtros seleccionados.</li> : null}
              {!loading && financeTimeline.map((entry) => (
                <li key={entry.id}>
                  <div>
                    <strong>{entry.concept || "Sin concepto"}</strong>
                    {entry.detail ? <small className="pos-v2-finance__movement-detail">{entry.detail}</small> : null}
                    <span>{toPresentationDate(entry.createdAt)}</span>
                  </div>
                  <strong className={entry.type === "income" ? "is-income" : "is-expense"}>{entry.type === "income" ? "+" : "-"}{moneyFormatter.format(entry.amount)}</strong>
                </li>
              ))}
            </ul>
          </article>
        </section>

        {openFormModal ? (
          <section className="pos-v2-finance__modal" role="dialog" aria-modal="true" aria-label="Registrar movimiento">
            <article>
              <header>
                <h3>Nuevo movimiento</h3>
                <button 
                type="button" 
                onClick={() => setOpenFormModal(false)} aria-label="Cerrar">Cerrar</button>
              </header>
              {renderMovementForm()}
            </article>
          </section>
        ) : null}
      </section>
    </PosV2Shell>
  );
};
