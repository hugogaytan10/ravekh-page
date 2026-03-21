import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ModernSystemsFactory } from "../../../../../index";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import type { FinanceEntry } from "../model/FinanceEntry";
import "./PosV2FinancePage.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://apipos.ravekh.com/api/";
const TOKEN_KEY = "pos-v2-token";
const BUSINESS_ID_KEY = "pos-v2-business-id";

type FinanceFormMode = "income" | "expense";
type FinanceFilter = "all" | FinanceFormMode;
type PeriodView = "month" | "today";

type FinanceTransactionViewModel = {
  id: string;
  concept: string;
  amount: number;
  type: FinanceFormMode;
  createdAt?: string;
};

const dateFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });
const moneyFormatter = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });

const INCOME_CATEGORIES = ["Venta", "Servicio", "Delivery", "Transferencia", "Otro ingreso"];
const EXPENSE_CATEGORIES = ["Nómina", "Renta", "Comida", "Marketing", "Papelería", "Transporte", "General"];

const sanitizeConceptInput = (value: string): string => value.replace(/\s+/g, " ").replace(/[<>]/g, "").trimStart();

const sanitizeConceptForSave = (value: string): string =>
  value
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s\-.,]/gu, "")
    .trim();

const sanitizeMoneyInput = (value: string): string => {
  const sanitized = value.replace(/[^\d.]/g, "");
  const [integer, decimal = ""] = sanitized.split(".");
  return decimal.length > 0 ? `${integer}.${decimal.slice(0, 2)}` : integer;
};

const toPresentationDate = (value?: string): string => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
};

const isTodayEntry = (value?: string): boolean => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
};

export const PosV2FinancePage = () => {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY) ?? "");
  const [businessIdInput, setBusinessIdInput] = useState(() => window.localStorage.getItem(BUSINESS_ID_KEY) ?? "");
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [periodView, setPeriodView] = useState<PeriodView>("month");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("0");
  const [formMode, setFormMode] = useState<FinanceFormMode>("income");
  const [typeFilter, setTypeFilter] = useState<FinanceFilter>("all");
  const [search, setSearch] = useState("");

  const [overview, setOverview] = useState({ monthIncome: 0, monthExpenses: 0, monthBalance: 0, todayIncome: 0, todayExpenses: 0 });
  const [movement, setMovement] = useState<{ income: FinanceEntry[]; expenses: FinanceEntry[] }>({ income: [], expenses: [] });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const page = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosFinanceTrackingPage();
  }, []);

  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, index) => new Date(new Date().getFullYear(), index, 1).toLocaleString("es-MX", { month: "long" })),
    [],
  );

  const businessId = Number(businessIdInput);
  const cleanToken = token.trim();
  const hasSession = Boolean(cleanToken) && Number.isFinite(businessId) && businessId > 0;

  const financeTimeline = useMemo<FinanceTransactionViewModel[]>(() => {
    const base = [
      ...movement.income.map((entry, index) => ({
        id: `income-${index}-${entry.name}`,
        concept: entry.name?.trim() || "Ingreso",
        amount: Math.abs(Number(entry.amount ?? 0)),
        type: "income" as const,
        createdAt: entry.createdAt,
      })),
      ...movement.expenses.map((entry, index) => ({
        id: `expense-${index}-${entry.name}`,
        concept: entry.name?.trim() || "Egreso",
        amount: Math.abs(Number(entry.amount ?? 0)),
        type: "expense" as const,
        createdAt: entry.createdAt,
      })),
    ];

    const normalizedSearch = search.trim().toLowerCase();

    return base
      .filter((item) => (periodView === "today" ? isTodayEntry(item.createdAt) : true))
      .filter((item) => (typeFilter === "all" ? true : item.type === typeFilter))
      .filter((item) => (normalizedSearch ? item.concept.toLowerCase().includes(normalizedSearch) : true))
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  }, [movement, periodView, typeFilter, search]);

  const activeCategories = formMode === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const refreshData = useCallback(async () => {
    if (!hasSession) {
      setError("Ingresa token y business id válidos para cargar finanzas.");
      return;
    }

    setLoading(true);
    setError(null);

    const [overviewResult, movementResult] = await Promise.allSettled([
      page.loadOverview(businessId, cleanToken),
      page.loadMonthMovement(businessId, month, cleanToken),
    ]);

    if (overviewResult.status === "fulfilled") {
      setOverview(overviewResult.value);
    }

    if (movementResult.status === "fulfilled") {
      setMovement(movementResult.value);
    } else {
      setMovement({ income: [], expenses: [] });
    }

    if (overviewResult.status === "rejected" && movementResult.status === "rejected") {
      setError("No se pudieron cargar ingresos y egresos. Verifica token, business ID o disponibilidad del API.");
    } else if (overviewResult.status === "rejected") {
      setError("No se pudo cargar el resumen, pero sí los movimientos.");
    } else if (movementResult.status === "rejected") {
      setError("No se pudo cargar el detalle de ingresos/egresos del periodo seleccionado.");
    }

    setLoading(false);
  }, [businessId, cleanToken, hasSession, month, page]);

  useEffect(() => {
    if (hasSession) {
      refreshData();
    }
  }, [hasSession, refreshData]);

  const handleSaveSession = () => {
    if (!hasSession) {
      setError("Completa token y business id válidos para conectar.");
      return;
    }

    window.localStorage.setItem(TOKEN_KEY, cleanToken);
    window.localStorage.setItem(BUSINESS_ID_KEY, String(businessId));
    setSuccessMessage("Sesión de finanzas conectada.");
    setError(null);
    refreshData();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSuccessMessage(null);

    if (!hasSession) {
      setError("Necesitas conectar sesión para registrar movimientos.");
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
      const payload = { businessId, name: safeName, amount: Number(parsedAmount.toFixed(2)) };
      if (formMode === "income") {
        await page.createIncome(payload, cleanToken);
      } else {
        await page.createExpense(payload, cleanToken);
      }

      setName("");
      setAmount("0");
      setSuccessMessage(formMode === "income" ? "Ingreso registrado correctamente." : "Egreso registrado correctamente.");
      await refreshData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar el movimiento.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PosV2Shell title="Finanzas" subtitle="Control de ingresos y egresos optimizado para móvil, tablet y desktop">
      <section className="pos-v2-finance">
        <header className="pos-v2-finance__header">
          <div>
            <h2>Panel financiero</h2>
            <p>Registro rápido + visualización de movimientos en tiempo real.</p>
          </div>

          <div className="pos-v2-finance__filters">
            <label>
              Mes
              <select value={month} onChange={(event) => setMonth(Number(event.target.value))}>
                {monthOptions.map((monthLabel, index) => <option key={monthLabel} value={index}>{monthLabel}</option>)}
              </select>
            </label>
            <button type="button" onClick={refreshData} disabled={loading || !hasSession}>{loading ? "Actualizando..." : "Actualizar"}</button>
          </div>
        </header>

        <section className="pos-v2-finance__session">
          <label>
            Token
            <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Token POS v2" />
          </label>
          <label>
            Business ID
            <input value={businessIdInput} onChange={(event) => setBusinessIdInput(event.target.value.replace(/[^\d]/g, ""))} placeholder="Ej. 12" inputMode="numeric" />
          </label>
          <button type="button" onClick={handleSaveSession}>Conectar</button>
        </section>

        {error ? <p className="pos-v2-finance__error">{error}</p> : null}
        {successMessage ? <p className="pos-v2-finance__success">{successMessage}</p> : null}

        <section className="pos-v2-finance__stats">
          <article><span>Ingresos del mes</span><strong>{moneyFormatter.format(overview.monthIncome)}</strong></article>
          <article><span>Egresos del mes</span><strong>{moneyFormatter.format(overview.monthExpenses)}</strong></article>
          <article><span>Balance del mes</span><strong>{moneyFormatter.format(overview.monthBalance)}</strong></article>
          <article><span>Ingresos de hoy</span><strong>{moneyFormatter.format(overview.todayIncome)}</strong></article>
          <article><span>Egresos de hoy</span><strong>{moneyFormatter.format(overview.todayExpenses)}</strong></article>
        </section>

        <section className="pos-v2-finance__content">
          <form className="pos-v2-finance__form" onSubmit={handleSubmit}>
            <h3>Registrar movimiento</h3>
            <div className="pos-v2-finance__mode-toggle" role="tablist" aria-label="Tipo de movimiento">
              <button type="button" className={formMode === "income" ? "is-active" : ""} onClick={() => setFormMode("income")}>Ingreso</button>
              <button type="button" className={formMode === "expense" ? "is-active" : ""} onClick={() => setFormMode("expense")}>Egreso</button>
            </div>

            <label>
              Concepto
              <input
                value={name}
                onChange={(event) => setName(sanitizeConceptInput(event.target.value))}
                placeholder="Ej. Venta en mostrador"
                maxLength={80}
              />
            </label>

            <div className="pos-v2-finance__chips" aria-label="Categorías sugeridas">
              {activeCategories.map((category) => (
                <button key={category} type="button" className={name === category ? "is-active" : ""} onClick={() => setName(category)}>{category}</button>
              ))}
            </div>

            <label>
              Monto
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(sanitizeMoneyInput(event.target.value))}
                placeholder="0.00"
              />
            </label>

            <button type="submit" disabled={saving || loading || !hasSession}>{saving ? "Guardando..." : `Guardar ${formMode === "income" ? "ingreso" : "egreso"}`}</button>
          </form>

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
              {financeTimeline.length === 0 ? <li className="is-empty">Sin movimientos para los filtros seleccionados.</li> : financeTimeline.map((entry) => (
                <li key={entry.id}>
                  <div>
                    <strong>{entry.concept || "Sin concepto"}</strong>
                    <span>{toPresentationDate(entry.createdAt)}</span>
                  </div>
                  <strong className={entry.type === "income" ? "is-income" : "is-expense"}>
                    {entry.type === "income" ? "+" : "-"}{moneyFormatter.format(entry.amount)}
                  </strong>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </section>
    </PosV2Shell>
  );
};
