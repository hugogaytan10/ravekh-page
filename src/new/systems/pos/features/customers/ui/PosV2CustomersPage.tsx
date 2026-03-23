import { FormEvent, useEffect, useMemo, useState } from "react";
import { ModernSystemsFactory } from "../../../../../index";
import { CustomerSalesPeriod, CustomerSex } from "../model/Customer";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import "./PosV2CustomersPage.css";

const TOKEN_KEY = "pos-v2-token";
const BUSINESS_ID_KEY = "pos-v2-business-id";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://apipos.ravekh.com/api/";

type CustomerVm = {
  id: number;
  name: string;
  contact: string;
  canPayLater: boolean;
};

type CustomerSaleVm = {
  orderId: number;
  date: string;
  total: number;
  status: string;
};

const SEX_LABELS: Record<CustomerSex, string> = {
  M: "Masculino",
  F: "Femenino",
  O: "Otro",
};

const PERIOD_LABELS: Record<CustomerSalesPeriod, string> = {
  DAY: "Día",
  MONTH: "Mes",
  YEAR: "Año",
};

export const PosV2CustomersPage = () => {
  const [token] = useState(() => window.localStorage.getItem(TOKEN_KEY) ?? "");
  const [businessId] = useState(() => Number(window.localStorage.getItem(BUSINESS_ID_KEY) ?? ""));
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<CustomerVm[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<CustomerVm | null>(null);

  const [salesCustomer, setSalesCustomer] = useState<CustomerVm | null>(null);
  const [salesPeriod, setSalesPeriod] = useState<CustomerSalesPeriod>("DAY");
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesRows, setSalesRows] = useState<CustomerSaleVm[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [sex, setSex] = useState<CustomerSex>("M");
  const [canPayLater, setCanPayLater] = useState(false);

  const page = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosCustomerPage();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setNotes("");
    setSex("M");
    setCanPayLater(false);
  };

  const loadCustomers = async () => {
    if (!token || !Number.isFinite(businessId) || businessId <= 0) {
      setError("No hay sesión activa para cargar clientes.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const rows = await page.getCustomerCards(businessId, token, search);
      setCustomers(rows);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible cargar clientes.");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSales = async (customer: CustomerVm, period: CustomerSalesPeriod) => {
    if (!token) return;

    setSalesLoading(true);
    try {
      const rows = await page.getCustomerSales(customer.id, period, token);
      setSalesRows(rows);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible cargar ventas del cliente.");
      setSalesRows([]);
    } finally {
      setSalesLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  useEffect(() => {
    if (salesCustomer) {
      loadSales(salesCustomer, salesPeriod);
    }
  }, [salesCustomer, salesPeriod]);

  const startCreate = () => {
    resetForm();
    setOpenForm(true);
  };

  const startEdit = async (customerId: number) => {
    if (!token) return;
    try {
      const selected = await page.getCustomerDetail(customerId, token);
      setEditingId(selected.id);
      setName(selected.name);
      setPhone(selected.phoneNumber);
      setEmail(selected.email);
      setAddress(selected.address);
      setNotes(selected.notes);
      setSex(selected.sex);
      setCanPayLater(selected.canPayLater);
      setOpenForm(true);
    } catch {
      setError("No se pudo preparar la edición del cliente.");
    }
  };

  const saveCustomer = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !Number.isFinite(businessId) || businessId <= 0) return;
    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await page.upsertCustomer(token, {
        businessId,
        name: name.trim(),
        phoneNumber: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
        sex,
        canPayLater,
      }, editingId ?? undefined);

      setOpenForm(false);
      resetForm();
      await loadCustomers();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible guardar el cliente.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!token || !deleteCandidate) return;

    try {
      await page.deleteCustomer(deleteCandidate.id, token);
      setDeleteCandidate(null);
      await loadCustomers();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo eliminar el cliente.");
    }
  };

  const salesTotal = salesRows.reduce((sum, row) => sum + row.total, 0);

  return (
    <PosV2Shell title="Clientes" subtitle="Gestión moderna de clientes desacoplada del legacy">
      <section className="pos-v2-customers">
        <header>
          <h2>Clientes</h2>
          <button type="button" className="is-primary" onClick={startCreate}>+ Nuevo cliente</button>
        </header>

        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o contacto" aria-label="Buscar clientes" />

        {error ? <p className="pos-v2-customers__error">{error}</p> : null}
        {loading ? <p>Cargando clientes...</p> : null}

        {!loading ? (
          <ul>
            {customers.map((customer) => (
              <li key={customer.id}>
                <div>
                  <strong>{customer.name}</strong>
                  <span>{customer.contact}</span>
                  <small>{customer.canPayLater ? "Pago aplazado habilitado" : "Pago aplazado deshabilitado"}</small>
                </div>
                <div className="pos-v2-customers__actions">
                  <button type="button" onClick={() => startEdit(customer.id)}>Editar</button>
                  <button type="button" onClick={() => { setSalesCustomer(customer); setSalesPeriod("DAY"); }}>Ventas</button>
                  <button type="button" className="is-danger" onClick={() => setDeleteCandidate(customer)}>Eliminar</button>
                </div>
              </li>
            ))}
            {customers.length === 0 ? <li className="is-empty">Sin clientes para mostrar.</li> : null}
          </ul>
        ) : null}

        {openForm ? (
          <section className="pos-v2-customers__modal" role="dialog" aria-modal="true">
            <form onSubmit={saveCustomer}>
              <h3>{editingId ? "Editar cliente" : "Nuevo cliente"}</h3>
              <div className="pos-v2-customers__grid">
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre" required />
                <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Teléfono" />
                <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Correo" type="email" />
                <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Dirección" />
                <select value={sex} onChange={(event) => setSex(event.target.value as CustomerSex)} aria-label="Sexo del cliente">
                  <option value="M">{SEX_LABELS.M}</option>
                  <option value="F">{SEX_LABELS.F}</option>
                  <option value="O">{SEX_LABELS.O}</option>
                </select>
              </div>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notas" rows={3} />
              <label className="pos-v2-customers__switch">
                <input type="checkbox" checked={canPayLater} onChange={(event) => setCanPayLater(event.target.checked)} />
                <span className="slider" aria-hidden="true" />
                <span>Permitir pago aplazado</span>
              </label>
              <div className="pos-v2-customers__actions">
                <button type="button" onClick={() => { setOpenForm(false); resetForm(); }}>Cancelar</button>
                <button type="submit" className="is-primary" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
              </div>
            </form>
          </section>
        ) : null}

        {deleteCandidate ? (
          <section className="pos-v2-customers__modal" role="dialog" aria-modal="true">
            <article className="pos-v2-customers__confirm">
              <h3>Eliminar cliente</h3>
              <p>¿Seguro que deseas eliminar a <strong>{deleteCandidate.name}</strong>? Esta acción no se puede deshacer.</p>
              <div className="pos-v2-customers__actions">
                <button type="button" onClick={() => setDeleteCandidate(null)}>Cancelar</button>
                <button type="button" className="is-danger" onClick={confirmDelete}>Eliminar</button>
              </div>
            </article>
          </section>
        ) : null}

        {salesCustomer ? (
          <section className="pos-v2-customers__modal" role="dialog" aria-modal="true">
            <article className="pos-v2-customers__confirm">
              <header className="pos-v2-customers__sales-head">
                <h3>Ventas de {salesCustomer.name}</h3>
                <button type="button" onClick={() => setSalesCustomer(null)}>Cerrar</button>
              </header>
              <div className="pos-v2-customers__sales-filter">
                <label>Periodo</label>
                <select value={salesPeriod} onChange={(event) => setSalesPeriod(event.target.value as CustomerSalesPeriod)}>
                  <option value="DAY">{PERIOD_LABELS.DAY}</option>
                  <option value="MONTH">{PERIOD_LABELS.MONTH}</option>
                  <option value="YEAR">{PERIOD_LABELS.YEAR}</option>
                </select>
              </div>
              <p>Total: ${salesTotal.toFixed(2)} • {salesRows.length} venta(s)</p>
              {salesLoading ? <p>Cargando ventas...</p> : (
                <ul className="pos-v2-customers__sales-list">
                  {salesRows.map((row) => (
                    <li key={`${row.orderId}-${row.date}`}>
                      <strong>Pedido #{row.orderId || "N/A"}</strong>
                      <span>{row.date || "Sin fecha"}</span>
                      <small>{row.status}</small>
                      <small>${row.total.toFixed(2)}</small>
                    </li>
                  ))}
                  {salesRows.length === 0 ? <li className="is-empty">Sin ventas para este periodo.</li> : null}
                </ul>
              )}
            </article>
          </section>
        ) : null}
      </section>
    </PosV2Shell>
  );
};
