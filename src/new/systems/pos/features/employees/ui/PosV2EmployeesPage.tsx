import { FormEvent, useEffect, useMemo, useState } from "react";
import { ModernSystemsFactory } from "../../../../../index";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { EmployeeRole } from "../model/Employee";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import "./PosV2EmployeesPage.css";

const TOKEN_KEY = "pos-v2-token";
const BUSINESS_ID_KEY = "pos-v2-business-id";
const EMPLOYEE_ID_KEY = "pos-v2-employee-id";
const API_BASE_URL = getPosApiBaseUrl();

type EmployeeVm = {
  id: number;
  name: string;
  email: string;
  role: EmployeeRole;
  canAccessFinancialData: boolean;
};

const ROLE_OPTIONS: Array<{ value: EmployeeRole; label: string; description: string }> = [
  { value: "manager", label: "Gerente", description: "Gestiona ventas, inventario y clientes con acceso financiero." },
  { value: "staff", label: "Ayudante", description: "Opera ventas y tareas base sin permisos administrativos avanzados." },
  { value: "cashier", label: "Cajero", description: "Enfocado en cobro y operación de caja." },
  { value: "admin", label: "Administrador", description: "Control total de módulos y configuración." },
];

const getRoleLabel = (role: EmployeeRole): string => ROLE_OPTIONS.find((option) => option.value === role)?.label ?? "Sin rol";
const getRoleDescription = (role: EmployeeRole): string => ROLE_OPTIONS.find((option) => option.value === role)?.description ?? "";

export const PosV2EmployeesPage = () => {
  const [token] = useState(() => window.localStorage.getItem(TOKEN_KEY) ?? "");
  const [businessId] = useState(() => Number(window.localStorage.getItem(BUSINESS_ID_KEY) ?? ""));
  const [currentEmployeeId] = useState(() => Number(window.localStorage.getItem(EMPLOYEE_ID_KEY) ?? ""));
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState<EmployeeVm[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<EmployeeVm | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<EmployeeRole>("staff");
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");

  const page = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosEmployeePage();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setRole("staff");
    setPin("");
    setPassword("");
  };

  const loadEmployees = async () => {
    if (!token || !Number.isFinite(businessId) || businessId <= 0) {
      setError("No hay sesión activa para cargar empleados.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const rows = await page.getEmployeeCards(businessId, token, search);
      const withoutCurrent = Number.isFinite(currentEmployeeId) && currentEmployeeId > 0
        ? rows.filter((employee) => employee.id !== currentEmployeeId)
        : rows;

      setEmployees(withoutCurrent.map((employee) => ({
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        canAccessFinancialData: employee.canAccessFinancialData,
      })));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible cargar empleados.");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [search]);

  const startCreate = () => {
    resetForm();
    setOpenForm(true);
  };

  const startEdit = async (employee: EmployeeVm) => {
    if (!token) return;

    try {
      const detail = await page.getEmployeeDetail(employee.id, token);
      setEditingId(detail.id);
      setName(detail.name);
      setEmail(detail.email);
      setRole(detail.role);
      setPin("");
      setPassword("");
      setOpenForm(true);
    } catch {
      setError("No se pudo preparar la edición del empleado.");
    }
  };

  const saveEmployee = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !Number.isFinite(businessId) || businessId <= 0) return;

    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (!email.trim()) {
      setError("El correo es obligatorio.");
      return;
    }

    if (!editingId && !password.trim()) {
      setError("La contraseña es obligatoria para un empleado nuevo.");
      return;
    }

    if (!editingId && pin.trim().length !== 4) {
      setError("El PIN es obligatorio y debe tener 4 dígitos para un empleado nuevo.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await page.upsertEmployee(token, {
        businessId,
        name: name.trim(),
        email: email.trim(),
        role,
        isActive: true,
        pin: pin.trim() || undefined,
        password: password.trim() || undefined,
      }, editingId ?? undefined);

      setOpenForm(false);
      resetForm();
      await loadEmployees();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible guardar el empleado.");
    } finally {
      setSaving(false);
    }
  };

  const removeEmployee = async (employeeId: number) => {
    if (!token) return;
    try {
      await page.deleteEmployee(employeeId, token);
      setDeleteCandidate(null);
      await loadEmployees();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo eliminar el empleado.");
    }
  };

  return (
    <PosV2Shell title="Empleados" subtitle="Administración de personal y permisos desacoplada del legacy">
      <section className="pos-v2-employees">
        <header>
          <h2>Empleados</h2>
          <button type="button" className="is-primary" onClick={startCreate}>+ Nuevo empleado</button>
        </header>

        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, correo o rol" aria-label="Buscar empleados" />

        {error ? <p className="pos-v2-employees__error">{error}</p> : null}
        {loading ? <p>Cargando empleados...</p> : null}

        {!loading ? (
          <ul>
            {employees.map((employee) => (
              <li key={employee.id}>
                <div>
                  <strong>{employee.name}</strong>
                  <span>{employee.email}</span>
                  <small>{getRoleLabel(employee.role)}</small>
                  <small>{employee.canAccessFinancialData ? "Con acceso a finanzas" : "Sin acceso a finanzas"}</small>
                </div>
                <div className="pos-v2-employees__actions">
                  <button type="button" onClick={() => startEdit(employee)}>Editar</button>
                  <button type="button" className="is-danger" onClick={() => setDeleteCandidate(employee)}>Eliminar</button>
                </div>
              </li>
            ))}
            {employees.length === 0 ? <li className="is-empty">Sin empleados para mostrar.</li> : null}
          </ul>
        ) : null}

        {openForm ? (
          <section className="pos-v2-employees__modal" role="dialog" aria-modal="true">
            <form onSubmit={saveEmployee}>
              <h3>{editingId ? "Editar empleado" : "Nuevo empleado"}</h3>
              <div className="pos-v2-employees__grid">
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre" required />
                <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Correo" type="email" required />
                <select value={role} onChange={(event) => setRole(event.target.value as EmployeeRole)} aria-label="Rol del empleado">
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <p className="pos-v2-employees__help">{getRoleDescription(role)}</p>
                <input
                  value={pin}
                  onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder={editingId ? "PIN (opcional para actualizar)" : "PIN de 4 dígitos"}
                  inputMode="numeric"
                />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  placeholder={editingId ? "Contraseña (opcional para actualizar)" : "Contraseña"}
                />
              </div>

              <div className="pos-v2-employees__actions">
                <button type="button" onClick={() => { setOpenForm(false); resetForm(); }}>Cancelar</button>
                <button type="submit" className="is-primary" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
              </div>
            </form>
          </section>
        ) : null}

        {deleteCandidate ? (
          <section className="pos-v2-employees__modal" role="dialog" aria-modal="true">
            <article className="pos-v2-employees__confirm">
              <h3>Eliminar empleado</h3>
              <p>¿Seguro que deseas eliminar a <strong>{deleteCandidate.name}</strong>? Esta acción no se puede deshacer.</p>
              <div className="pos-v2-employees__actions">
                <button type="button" onClick={() => setDeleteCandidate(null)}>Cancelar</button>
                <button type="button" className="is-danger" onClick={() => removeEmployee(deleteCandidate.id)}>Eliminar</button>
              </div>
            </article>
          </section>
        ) : null}
      </section>
    </PosV2Shell>
  );
};
