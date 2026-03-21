import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ModernSystemsFactory } from "../../../../../index";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import type { FinanceEntry } from "../model/FinanceEntry";
import "./PosV2FinancePage.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://apipos.ravekh.com/api/";
const TOKEN_KEY = "pos-v2-token";
const BUSINESS_ID_KEY = "pos-v2-business-id";

type FinanceFormMode = "income" | "expense";

const moneyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

const normalizeDate = (value?: string): string => {
  if (!value) return "Sin fecha";
  const candidate = new Date(value);
  return Number.isNaN(candidate.getTime()) ? value : dateFormatter.format(candidate);
};

export const PosV2FinancePage = () => {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY) ?? "");
  const [businessIdInput, setBusinessIdInput] = useState(() => window.localStorage.getItem(BUSINESS_ID_KEY) ?? "");
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("0");
  const [formMode, setFormMode] = useState<FinanceFormMode>("income");

  const [overview, setOverview] = useState({
    monthIncome: 0,
    monthExpenses: 0,
    monthBalance: 0,
    todayIncome: 0,
    todayExpenses: 0,
  });
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
    () => Array.from({ length: 12 }, (_, monthIndex) => new Date(new Date().getFullYear(), monthIndex, 1).toLocaleString("es-MX", { month: "long" })),
    [],
  );

  const businessId = Number(businessIdInput);
  const hasSession = Boolean(token.trim()) && Number.isFinite(businessId) && businessId > 0;

  const refreshData = useCallback(async () => {
    if (!hasSession) {
      setError("Ingresa token y business id para cargar finanzas.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [overviewData, movementData] = await Promise.all([
        page.loadOverview(businessId, token),
        page.loadMonthMovement(businessId, month, token),
      ]);

      setOverview(overviewData);
      setMovement(movementData);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cargar la información financiera.");
    } finally {
      setLoading(false);
    }
  }, [businessId, hasSession, month, page, token]);

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

    window.localStorage.setItem(TOKEN_KEY, token.trim());
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

    if (!name.trim()) {
      setError("El concepto es obligatorio.");
      return;
    }

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Ingresa un monto válido mayor a 0.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        businessId,
        name: name.trim(),
        amount: parsedAmount,
      };

      if (formMode === "income") {
        await page.createIncome(payload, token);
      } else {
        await page.createExpense(payload, token);
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
    <PosV2Shell title="Finanzas" subtitle="Módulo nuevo, desacoplado y optimizado del POS v2">
      <section className="pos-v2-finance">
        <header className="pos-v2-finance__header">
          <div>
            <h2>Resumen financiero</h2>
            <p>Control de ingresos, egresos y balance con arquitectura moderna.</p>
          </div>

          <div className="pos-v2-finance__filters">
            <label>
              Mes
              <select value={month} onChange={(event) => setMonth(Number(event.target.value))}>
                {monthOptions.map((monthLabel, index) => (
                  <option key={monthLabel} value={index}>{monthLabel}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={refreshData} disabled={loading || !hasSession}>Actualizar</button>
          </div>
        </header>

        <section className="pos-v2-finance__session">
          <label>
            Token
            <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Token POS v2" />
          </label>
          <label>
            Business ID
            <input value={businessIdInput} onChange={(event) => setBusinessIdInput(event.target.value)} placeholder="Ej. 12" inputMode="numeric" />
          </label>
          <button type="button" onClick={handleSaveSession}>Conectar</button>
        </section>

        {error ? <p className="pos-v2-finance__error">{error}</p> : null}
        {successMessage ? <p className="pos-v2-finance__success">{successMessage}</p> : null}

        <section className="pos-v2-finance__stats">
          <article>
            <span>Ingresos del mes</span>
            <strong>{moneyFormatter.format(overview.monthIncome)}</strong>
          </article>
          <article>
            <span>Egresos del mes</span>
            <strong>{moneyFormatter.format(overview.monthExpenses)}</strong>
          </article>
          <article>
            <span>Balance del mes</span>
            <strong>{moneyFormatter.format(overview.monthBalance)}</strong>
          </article>
          <article>
            <span>Ingresos de hoy</span>
            <strong>{moneyFormatter.format(overview.todayIncome)}</strong>
          </article>
          <article>
            <span>Egresos de hoy</span>
            <strong>{moneyFormatter.format(overview.todayExpenses)}</strong>
          </article>
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
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Venta delivery" maxLength={80} />
            </label>

            <label>
              Monto
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </label>

            <button type="submit" disabled={saving || loading || !hasSession}>{saving ? "Guardando..." : `Guardar ${formMode === "income" ? "ingreso" : "egreso"}`}</button>
          </form>

          <div className="pos-v2-finance__lists">
            <article>
              <h3>Ingresos del mes</h3>
              <ul>
                {movement.income.length === 0 ? <li className="is-empty">Sin ingresos en este mes.</li> : movement.income.map((entry, index) => (
                  <li key={`${entry.name}-${index}`}>
                    <div>
                      <strong>{entry.name || "Sin concepto"}</strong>
                      <span>{normalizeDate(entry.createdAt)}</span>
                    </div>
                    <strong>{moneyFormatter.format(entry.amount)}</strong>
                  </li>
                ))}
              </ul>
            </article>

            <article>
              <h3>Egresos del mes</h3>
              <ul>
                {movement.expenses.length === 0 ? <li className="is-empty">Sin egresos en este mes.</li> : movement.expenses.map((entry, index) => (
                  <li key={`${entry.name}-${index}`}>
                    <div>
                      <strong>{entry.name || "Sin concepto"}</strong>
                      <span>{normalizeDate(entry.createdAt)}</span>
                    </div>
                    <strong>{moneyFormatter.format(entry.amount)}</strong>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      </section>
    </PosV2Shell>
  );
};
