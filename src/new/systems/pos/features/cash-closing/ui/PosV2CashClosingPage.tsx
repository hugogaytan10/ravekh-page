import { FormEvent, useEffect, useMemo, useState } from "react";
import { ModernSystemsFactory } from "../../../../../index";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { POS_SESSION_STORAGE_KEYS } from "../../../shared/config/posSession";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import "./PosV2CashClosingPage.css";

const API_BASE_URL = getPosApiBaseUrl();
const TOKEN_KEY = POS_SESSION_STORAGE_KEYS.token;
const BUSINESS_ID_KEY = POS_SESSION_STORAGE_KEYS.businessId;
const EMPLOYEE_ID_KEY = POS_SESSION_STORAGE_KEYS.employeeId;

const moneyFormatter = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });

type EmployeeOption = { id: number; fullName: string };
type ClosingView = {
  id: number;
  employeeId: number;
  total: number;
  date: string;
  employeeName: string;
};

type SessionState = {
  token: string;
  businessId: number;
  employeeId: number;
  hasSession: boolean;
};

const getSafeSession = (): SessionState => {
  const token = (window.localStorage.getItem(TOKEN_KEY) ?? "").trim();
  const businessId = Number(window.localStorage.getItem(BUSINESS_ID_KEY) ?? "");
  const employeeId = Number(window.localStorage.getItem(EMPLOYEE_ID_KEY) ?? "");

  return {
    token,
    businessId,
    employeeId,
    hasSession: token.length > 0 && Number.isFinite(businessId) && businessId > 0,
  };
};

const getOwnerCapability = (token: string): boolean => {
  if (!token || !token.includes(".")) return false;
  try {
    const payload = JSON.parse(window.atob(token.split(".")[1] || ""));
    const role = String(payload.role ?? payload.Role ?? payload.typeUser ?? payload.TypeUser ?? "").toLowerCase();
    const isOwnerFlag = payload.isOwner ?? payload.IsOwner ?? payload.owner ?? payload.Owner;
    return role.includes("owner") || role.includes("due") || role.includes("admin") || isOwnerFlag === true || isOwnerFlag === 1;
  } catch {
    return false;
  }
};

export const PosV2CashClosingPage = () => {
  const [session] = useState<SessionState>(() => getSafeSession());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(() => (session.employeeId > 0 ? String(session.employeeId) : ""));
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [recentClosings, setRecentClosings] = useState<ClosingView[]>([]);
  const [currentTotal, setCurrentTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string>("");
  const canCloseCash = useMemo(() => getOwnerCapability(session.token), [session.token]);

  const page = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosCashClosingPage();
  }, []);

  const refreshEmployeeData = async (employeeId: number, token: string) => {
    const [currentResult, historyResult] = await Promise.allSettled([
      page.loadCurrentTotal(employeeId, token),
      page.listByEmployee(employeeId, token),
    ]);

    if (currentResult.status === "fulfilled") {
      setCurrentTotal(Number(currentResult.value || 0));
    } else {
      setCurrentTotal(0);
    }

    if (historyResult.status === "fulfilled") {
      setRecentClosings(historyResult.value.slice(0, 12));
    } else {
      setRecentClosings([]);
    }
  };

  const refreshData = async () => {
    if (!session.hasSession) {
      setError("No hay sesión activa para consultar corte de caja.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loadedEmployees = await page.listEmployees(session.businessId, session.token);
      setEmployees(loadedEmployees);

      const fallbackEmployee = loadedEmployees[0]?.id ?? 0;
      const selected = Number(selectedEmployeeId);
      const activeEmployeeId = Number.isFinite(selected) && selected > 0 ? selected : fallbackEmployee;

      if (!activeEmployeeId) {
        setError("No encontramos empleados activos para registrar cortes.");
        setCurrentTotal(0);
        setRecentClosings([]);
        return;
      }

      if (!selectedEmployeeId || Number(selectedEmployeeId) !== activeEmployeeId) {
        setSelectedEmployeeId(String(activeEmployeeId));
      }

      await refreshEmployeeData(activeEmployeeId, session.token);
    } catch {
      setError("No se pudo cargar la información del corte de caja. Verifica token, negocio y conectividad.");
      setCurrentTotal(0);
      setRecentClosings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session.hasSession) {
      refreshData();
    }
  }, [session.hasSession]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const employeeId = Number(selectedEmployeeId);
    if (!session.hasSession || !Number.isFinite(employeeId) || employeeId <= 0) return;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        await refreshEmployeeData(employeeId, session.token);
      } catch {
        setError("No se pudo refrescar el corte para el empleado seleccionado.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [selectedEmployeeId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const employeeId = Number(selectedEmployeeId);

    if (!Number.isFinite(employeeId) || employeeId <= 0) {
      setError("Selecciona un empleado válido para registrar el corte.");
      return;
    }

    if (!canCloseCash) {
      setError("Solo dueños/administradores pueden confirmar el corte de caja.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const totalBeforeClosing = await page.loadCurrentTotal(employeeId, session.token);
      await page.register({ employeeId }, session.token);
      setToast(`Corte registrado por ${moneyFormatter.format(totalBeforeClosing)}.`);
      await refreshEmployeeData(employeeId, session.token);
    } catch {
      setError("No fue posible registrar el corte de caja.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PosV2Shell title="Corte de caja" subtitle="Control moderno de cierres por empleado y revisión de diferencias.">
      <section className="pos-v2-cash-closing">
        <header className="pos-v2-cash-closing__header">
          <div>
            <h2>Cierre de turno</h2>
            <p>Calcula el total del día por empleado y confirma el corte contra el endpoint legacy desacoplado.</p>
          </div>
          <button type="button" onClick={refreshData} disabled={loading || saving}>Actualizar</button>
        </header>

        {!session.hasSession ? <p className="pos-v2-cash-closing__error">No hay sesión activa. Inicia sesión para gestionar cierres.</p> : null}
        {error ? <p className="pos-v2-cash-closing__error">{error}</p> : null}
        {toast ? <p className="pos-v2-cash-closing__toast">{toast}</p> : null}
        {!canCloseCash ? <p className="pos-v2-cash-closing__warning">🔒 Solo cuentas dueñas/administradoras pueden ejecutar el cierre.</p> : null}

        <section className="pos-v2-cash-closing__card">
          <h3>Registrar corte</h3>
          <form onSubmit={handleSubmit} className="pos-v2-cash-closing__form">
            <label>
              Empleado
              <select value={selectedEmployeeId} onChange={(event) => setSelectedEmployeeId(event.target.value)} disabled={loading || saving || employees.length === 0}>
                <option value="">Selecciona...</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={String(employee.id)}>{employee.fullName}</option>
                ))}
              </select>
            </label>
            <p className="pos-v2-cash-closing__hint">
              Total calculado por backend para cierre actual: <strong>{moneyFormatter.format(currentTotal)}</strong>
            </p>
            <button type="submit" disabled={saving || loading || !canCloseCash}>{saving ? "Guardando..." : "Confirmar corte"}</button>
          </form>
        </section>

        <section className="pos-v2-cash-closing__grid">
          <article className="pos-v2-cash-closing__card">
            <h3>Total actual para cierre</h3>
            {loading ? <p>Cargando resumen...</p> : null}
            {!loading ? (
              <div className="pos-v2-cash-closing__current">
                <p><strong>Empleado:</strong> {employees.find((employee) => String(employee.id) === selectedEmployeeId)?.fullName ?? "Sin seleccionar"}</p>
                <p><strong>Total:</strong> <span className={currentTotal > 0 ? "is-positive" : "is-equal"}>{moneyFormatter.format(currentTotal)}</span></p>
              </div>
            ) : null}
          </article>

          <article className="pos-v2-cash-closing__card">
            <h3>Historial reciente</h3>
            <ul className="pos-v2-cash-closing__history">
              {recentClosings.map((closing) => (
                <li key={closing.id}>
                  <div>
                    <strong>Corte #{closing.id}</strong>
                    <small>{closing.date ? new Date(closing.date).toLocaleString("es-MX") : "Sin fecha"}{closing.employeeName ? ` · ${closing.employeeName}` : ""}</small>
                  </div>
                  <span className={closing.total > 0 ? "is-positive" : "is-equal"}>{moneyFormatter.format(closing.total)}</span>
                </li>
              ))}
              {!loading && recentClosings.length === 0 ? <li className="is-empty">Aún no hay cierres registrados.</li> : null}
            </ul>
          </article>
        </section>
      </section>
    </PosV2Shell>
  );
};
