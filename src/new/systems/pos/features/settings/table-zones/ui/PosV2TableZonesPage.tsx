import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getPosApiBaseUrl } from "../../../../shared/config/posEnv";
import { PosV2Shell } from "../../../../shared/ui/PosV2Shell";
import { POS_SESSION_STORAGE_KEYS } from "../../../../shared/config/posSession";
import "./PosV2TableZonesPage.css";

const API_BASE_URL = getPosApiBaseUrl();
const TOKEN_KEY = POS_SESSION_STORAGE_KEYS.token;
const BUSINESS_ID_KEY = POS_SESSION_STORAGE_KEYS.businessId;

type ZoneVm = {
  id: number;
  name: string;
  isActive: boolean;
};

type TableVm = {
  id: number;
  name: string;
  zoneId: number;
  isAvailable: boolean;
  chairs: number | null;
};

type DeleteTarget =
  | { kind: "zone"; id: number; name: string }
  | { kind: "table"; id: number; name: string };

type ZoneApiResponse = {
  Id?: number;
  Name?: string;
  Active?: boolean | number | string | null;
  Tables?: TableApiResponse[] | null;
};

type TableApiResponse = {
  Id?: number;
  Name?: string;
  Table_Zone_Id?: number | null;
  TableZoneId?: number | null;
  Zone_Id?: number | null;
  IsAvailable?: boolean | number | null;
  Chairs?: number | null;
};

const sanitizeName = (value: string): string => value.replace(/\s+/g, " ").replace(/[<>]/g, "").trimStart();

const toBoolean = (value: unknown): boolean => value === true || value === 1 || value === "1" || value === "true";

const toZoneVm = (row: ZoneApiResponse): ZoneVm => ({
  id: Number(row.Id ?? 0),
  name: String(row.Name ?? "").trim(),
  isActive: toBoolean(row.Active),
});

const toTableVm = (row: TableApiResponse): TableVm => ({
  id: Number(row.Id ?? 0),
  name: String(row.Name ?? "").trim(),
  zoneId: Number(row.Table_Zone_Id ?? row.TableZoneId ?? row.Zone_Id ?? 0),
  isAvailable: toBoolean(row.IsAvailable),
  chairs: Number.isFinite(Number(row.Chairs)) && Number(row.Chairs) > 0 ? Number(row.Chairs) : null,
});

export const PosV2TableZonesPage = () => {
  const [token] = useState(() => window.localStorage.getItem(TOKEN_KEY) ?? "");
  const [businessIdInput] = useState(() => window.localStorage.getItem(BUSINESS_ID_KEY) ?? "");

  const [zones, setZones] = useState<ZoneVm[]>([]);
  const [tables, setTables] = useState<TableVm[]>([]);
  const [searchZone, setSearchZone] = useState("");
  const [searchTable, setSearchTable] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");

  const [zoneName, setZoneName] = useState("");
  const [zoneEditId, setZoneEditId] = useState<number | null>(null);

  const [tableName, setTableName] = useState("");
  const [tableChairs, setTableChairs] = useState("4");
  const [tableEditId, setTableEditId] = useState<number | null>(null);
  const [quickZoneName, setQuickZoneName] = useState("");
  const [quickNumTables, setQuickNumTables] = useState("4");

  const [isTableOrderEnabled, setIsTableOrderEnabled] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const businessId = Number(businessIdInput);
  const cleanToken = token.trim();
  const hasSession = Boolean(cleanToken) && Number.isFinite(businessId) && businessId > 0;

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      token: cleanToken,
      Authorization: `Bearer ${cleanToken}`,
    }),
    [cleanToken],
  );

  const loadZones = useCallback(async () => {
    if (!hasSession) {
      setError("Completa token y business id válidos para administrar zonas y mesas.");
      return;
    }

    setLoadingZones(true);
    setError(null);

    try {
      const response = await fetch(new URL(`table_zones/business/${businessId}`, API_BASE_URL).toString(), { headers });
      if (!response.ok) {
        throw new Error(`No se pudieron cargar zonas (${response.status}).`);
      }

      const payload = (await response.json().catch(() => null)) as ZoneApiResponse[] | null;
      const zoneRows = (Array.isArray(payload) ? payload : [])
        .map(toZoneVm)
        .filter((zone) => zone.id > 0 && zone.name.length > 0)
        .sort((a, b) => a.id - b.id);

      setZones(zoneRows);
      setIsTableOrderEnabled(zoneRows.some((zone) => zone.isActive));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar las zonas.");
      setZones([]);
    } finally {
      setLoadingZones(false);
    }
  }, [businessId, hasSession, headers]);

  const loadTablesByZone = useCallback(async (zoneId: number) => {
    if (!hasSession) {
      return;
    }

    setLoadingTables(true);
    setError(null);

    try {
      const response = await fetch(new URL(`tables/zone/${zoneId}`, API_BASE_URL).toString(), { headers });
      if (!response.ok) {
        throw new Error(`No se pudieron cargar mesas (${response.status}).`);
      }

      const payload = (await response.json().catch(() => null)) as TableApiResponse[] | null;
      const tableRows = (Array.isArray(payload) ? payload : [])
        .map(toTableVm)
        .filter((table) => table.id > 0 && table.name.length > 0 && table.zoneId > 0)
        .sort((a, b) => a.id - b.id);

      setTables(tableRows);
    } catch (cause) {
      setTables([]);
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar las mesas.");
    } finally {
      setLoadingTables(false);
    }
  }, [hasSession, headers]);

  useEffect(() => {
    if (hasSession) {
      loadZones();
    }
  }, [hasSession, loadZones]);

  useEffect(() => {
    if (!selectedZoneId && zones.length > 0) {
      setSelectedZoneId(String(zones[0].id));
      return;
    }

    if (selectedZoneId && !zones.some((zone) => String(zone.id) === selectedZoneId)) {
      setSelectedZoneId(zones.length > 0 ? String(zones[0].id) : "");
    }
  }, [zones, selectedZoneId]);

  useEffect(() => {
    if (!selectedZoneId) {
      setTables([]);
      return;
    }

    void loadTablesByZone(Number(selectedZoneId));
  }, [selectedZoneId, loadTablesByZone]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      setIsZoneModalOpen(false);
      setIsQuickModalOpen(false);
      setIsTableModalOpen(false);
      setDeleteTarget(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!successMessage) {
      return;
    }
    const timeout = window.setTimeout(() => setSuccessMessage(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  const filteredZones = useMemo(() => {
    const term = searchZone.trim().toLowerCase();
    if (!term) {
      return zones;
    }
    return zones.filter((zone) => zone.name.toLowerCase().includes(term));
  }, [zones, searchZone]);

  const filteredTables = useMemo(() => {
    const term = searchTable.trim().toLowerCase();
    if (!term) {
      return tables;
    }
    return tables.filter((table) => table.name.toLowerCase().includes(term));
  }, [tables, searchTable]);

  const selectedZoneName = useMemo(
    () => zones.find((zone) => String(zone.id) === selectedZoneId)?.name ?? "Sin zona seleccionada",
    [zones, selectedZoneId],
  );

  const selectedZone = useMemo(
    () => zones.find((zone) => String(zone.id) === selectedZoneId) ?? null,
    [zones, selectedZoneId],
  );

  const handleToggleTableOrders = async () => {
    if (!hasSession) {
      setError("Conecta sesión para activar o desactivar pedidos con mesa.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const nextValue = !isTableOrderEnabled;
      const response = await fetch(new URL(`table_zones/active/${businessId}`, API_BASE_URL).toString(), {
        method: "PUT",
        headers,
        body: JSON.stringify({ active: nextValue }),
      });

      if (!response.ok) {
        throw new Error(`No se pudo actualizar pedidos con mesa (${response.status}).`);
      }

      setSuccessMessage(nextValue ? "Pedidos con mesa activados." : "Pedidos con mesa desactivados.");
      await loadZones();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo actualizar el estado de mesas.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitZone = async (event: FormEvent) => {
    event.preventDefault();

    if (!hasSession) {
      setError("Conecta sesión para registrar zonas.");
      return;
    }

    const safeName = sanitizeName(zoneName).trim();
    if (safeName.length < 2) {
      setError("El nombre de la zona debe tener al menos 2 caracteres.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const endpoint = zoneEditId ? `table_zones/${zoneEditId}` : "table_zones";
      const response = await fetch(new URL(endpoint, API_BASE_URL).toString(), {
        method: zoneEditId ? "PUT" : "POST",
        headers,
        body: JSON.stringify({ Business_Id: businessId, Name: safeName, Active: true }),
      });

      if (!response.ok) {
        throw new Error(`No se pudo guardar la zona (${response.status}).`);
      }

      setZoneName("");
      setZoneEditId(null);
      setSuccessMessage(zoneEditId ? "Zona actualizada correctamente." : "Zona creada correctamente.");
      setIsZoneModalOpen(false);
      await loadZones();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar la zona.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateZoneWithTables = async (event: FormEvent) => {
    event.preventDefault();

    if (!hasSession) {
      setError("Conecta sesión para crear zona y mesas.");
      return;
    }

    const zoneName = sanitizeName(quickZoneName).trim();
    const numTables = Number(quickNumTables);

    if (zoneName.length < 2) {
      setError("El nombre de la zona rápida debe tener al menos 2 caracteres.");
      return;
    }
    if (!Number.isFinite(numTables) || numTables <= 0) {
      setError("El número de mesas debe ser mayor a 0.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(new URL(`table_zones/zone/${businessId}`, API_BASE_URL).toString(), {
        method: "POST",
        headers,
        body: JSON.stringify({
          zoneName,
          numTables,
          isAvailable: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`No se pudo crear zona con mesas (${response.status}).`);
      }

      setQuickZoneName("");
      setQuickNumTables("4");
      setSuccessMessage(`Zona "${zoneName}" creada con ${numTables} mesas.`);
      setIsQuickModalOpen(false);
      await loadZones();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo crear zona con mesas.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitTable = async (event: FormEvent) => {
    event.preventDefault();

    if (!hasSession) {
      setError("Conecta sesión para registrar mesas.");
      return;
    }

    const safeName = sanitizeName(tableName).trim();
    if (safeName.length < 2) {
      setError("El nombre de la mesa debe tener al menos 2 caracteres.");
      return;
    }

    if (!selectedZoneId) {
      setError("Selecciona una zona para crear o editar mesas.");
      return;
    }

    const chairs = Number(tableChairs);
    if (!Number.isFinite(chairs) || chairs <= 0) {
      setError("Las sillas deben ser un número mayor a 0.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const endpoint = tableEditId ? `tables/${tableEditId}` : "tables";
      const response = await fetch(new URL(endpoint, API_BASE_URL).toString(), {
        method: tableEditId ? "PUT" : "POST",
        headers,
        body: JSON.stringify({
          Table_Zone_Id: Number(selectedZoneId),
          Name: safeName,
          IsAvailable: true,
          Chairs: chairs,
        }),
      });

      if (!response.ok) {
        throw new Error(`No se pudo guardar la mesa (${response.status}).`);
      }

      setTableName("");
      setTableChairs("4");
      setTableEditId(null);
      setSuccessMessage(tableEditId ? "Mesa actualizada correctamente." : "Mesa creada correctamente.");
      setIsTableModalOpen(false);
      await loadTablesByZone(Number(selectedZoneId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar la mesa.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteZone = async (zoneId: number) => {
    if (!hasSession) {
      setError("Conecta sesión para eliminar zonas.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(new URL(`table_zones/${zoneId}`, API_BASE_URL).toString(), {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        throw new Error(`No se pudo eliminar la zona (${response.status}).`);
      }

      setSuccessMessage("Zona eliminada correctamente.");
      setZoneEditId(null);
      setZoneName("");
      await loadZones();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo eliminar la zona.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTable = async (tableId: number) => {
    if (!hasSession) {
      setError("Conecta sesión para eliminar mesas.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(new URL(`tables/${tableId}`, API_BASE_URL).toString(), {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        throw new Error(`No se pudo eliminar la mesa (${response.status}).`);
      }

      setSuccessMessage("Mesa eliminada correctamente.");
      await loadTablesByZone(Number(selectedZoneId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo eliminar la mesa.");
    } finally {
      setSaving(false);
    }
  };

  const isLoading = loadingZones || loadingTables;

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    if (deleteTarget.kind === "zone") {
      await handleDeleteZone(deleteTarget.id);
    } else {
      await handleDeleteTable(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  return (
    <PosV2Shell title="Mesas" subtitle="Configuración v2 de mesas desacoplada del código anterior">
      <section className="pos-v2-table-zones">
        <header className="pos-v2-table-zones__header">
          <div>
            <h2>Mesas y zonas</h2>
            <p>Flujo moderno: primero administras zonas y luego administras las mesas dentro de cada zona.</p>
          </div>
          <button type="button" onClick={loadZones} disabled={isLoading || !hasSession}>
            {isLoading ? "Actualizando..." : "Actualizar listado"}
          </button>
        </header>

        {error ? <p className="pos-v2-table-zones__error" role="alert" aria-live="assertive">{error}</p> : null}
        {successMessage ? <p className="pos-v2-table-zones__success" role="status" aria-live="polite">{successMessage}</p> : null}

        <section className="pos-v2-table-zones__toolbar">
          <article className="pos-v2-table-zones__status">
            <span className={`is-pill ${isTableOrderEnabled ? "is-active" : "is-inactive"}`}>
              Pedidos con mesa: {isTableOrderEnabled ? "Activo" : "Inactivo"}
            </span>
            <span className="is-pill">Negocio #{hasSession ? businessId : "sin sesión"}</span>
            <button type="button" className="is-secondary-chip" onClick={handleToggleTableOrders} disabled={saving || !hasSession}>
              {isTableOrderEnabled ? "Desactivar pedidos con mesa" : "Activar pedidos con mesa"}
            </button>
          </article>
          <article className="pos-v2-table-zones__quick-actions">
            <button type="button" className="is-secondary-chip" aria-label="Crear nueva zona" onClick={() => { setZoneEditId(null); setZoneName(""); setIsZoneModalOpen(true); }}>
              + Nueva zona
            </button>
            <button type="button" className="is-secondary-chip" aria-label="Crear zona con mesas automáticamente" onClick={() => setIsQuickModalOpen(true)}>
              + Zona con mesas
            </button>
            <button type="button" className="is-secondary-chip" aria-label="Crear nueva mesa en la zona seleccionada" onClick={() => { setTableEditId(null); setTableName(""); setTableChairs("4"); setIsTableModalOpen(true); }} disabled={!selectedZoneId}>
              + Nueva mesa
            </button>
          </article>
        </section>

        <section className="pos-v2-table-zones__stats">
          <article>
            <span>Zonas</span>
            <strong>{zones.length}</strong>
          </article>
          <article>
            <span>Mesas en zona</span>
            <strong>{tables.length}</strong>
          </article>
          <article>
            <span>Zona activa</span>
            <strong>{selectedZoneName}</strong>
          </article>
        </section>

        <section className="pos-v2-table-zones__board">
          <section className="pos-v2-table-zones__list">
          <header>
            <div>
              <h3>Listado de zonas</h3>
              <p className="pos-v2-table-zones__list-helper">Selecciona una zona para administrar sus mesas.</p>
            </div>
            <div className="pos-v2-table-zones__search">
              <input value={searchZone} onChange={(event) => setSearchZone(event.target.value)} placeholder="Buscar zona" aria-label="Buscar zona" />
              {searchZone ? <button type="button" className="is-secondary-chip" onClick={() => setSearchZone("")}>Limpiar</button> : null}
            </div>
          </header>
          <ul>
            {loadingZones ? (
              <li className="is-skeleton" aria-hidden="true"><span /><span /><span /></li>
            ) : null}
            {!loadingZones && filteredZones.length === 0 ? <li className="is-empty">Sin zonas registradas.</li> : filteredZones.map((zone) => (
              <li key={zone.id} className={selectedZoneId === String(zone.id) ? "is-editing" : ""}>
                <div>
                  <strong>{zone.name}</strong>
                  <span>{zone.isActive ? "Activa" : "Inactiva"} · ID {zone.id}</span>
                </div>
                <div className="pos-v2-table-zones__actions">
                  <button type="button" className="is-secondary-chip" onClick={() => setSelectedZoneId(String(zone.id))}>{selectedZoneId === String(zone.id) ? "Seleccionada" : "Ver mesas"}</button>
                  <button type="button" className="is-secondary-chip" onClick={() => { setZoneEditId(zone.id); setZoneName(zone.name); setIsZoneModalOpen(true); }}>Editar</button>
                  <button type="button" className="is-danger" onClick={() => setDeleteTarget({ kind: "zone", id: zone.id, name: zone.name })} disabled={saving}>Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
          </section>

          <section className="pos-v2-table-zones__list">
          <header>
            <div>
              <h3>Listado de mesas por zona</h3>
              <p className="pos-v2-table-zones__list-helper">Zona actual: <strong>{selectedZoneName}</strong></p>
            </div>
            <div className="pos-v2-table-zones__search is-stack-on-mobile">
              <select
                value={selectedZoneId}
                onChange={(event) => setSelectedZoneId(event.target.value)}
                aria-label="Seleccionar zona para ver mesas"
              >
                <option value="">Selecciona zona</option>
                {zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
              </select>
              <input value={searchTable} onChange={(event) => setSearchTable(event.target.value)} placeholder="Buscar mesa" aria-label="Buscar mesa" />
              {searchTable ? <button type="button" className="is-secondary-chip" onClick={() => setSearchTable("")}>Limpiar</button> : null}
            </div>
          </header>

          <ul>
            {loadingTables ? <li className="is-skeleton" aria-hidden="true"><span /><span /><span /></li> : null}
            {!loadingTables && filteredTables.length === 0 ? <li className="is-empty">Sin mesas para la zona seleccionada.</li> : filteredTables.map((table) => (
              <li key={table.id} className={tableEditId === table.id ? "is-editing" : ""}>
                <div>
                  <strong>{table.name}</strong>
                  <span>{table.isAvailable ? "Disponible" : "No disponible"} · {table.chairs ?? "-"} sillas · ID {table.id}</span>
                </div>
                <div className="pos-v2-table-zones__actions">
                  <button
                    type="button"
                    className="is-secondary"
                    onClick={() => {
                      setTableEditId(table.id);
                      setTableName(table.name);
                      setTableChairs(String(table.chairs ?? 4));
                      setSelectedZoneId(String(table.zoneId));
                      setIsTableModalOpen(true);
                    }}
                  >
                    Editar
                  </button>
                  <button type="button" className="is-danger" onClick={() => setDeleteTarget({ kind: "table", id: table.id, name: table.name })} disabled={saving}>Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
          </section>
        </section>

        {isZoneModalOpen ? (
          <section className="pos-v2-table-zones__modal" role="dialog" aria-modal="true" aria-label="Editar o crear zona" onClick={() => setIsZoneModalOpen(false)}>
            <form className="pos-v2-table-zones__modal-card" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmitZone}>
              <h3>{zoneEditId ? `Editar zona #${zoneEditId}` : "Crear zona"}</h3>
              <p className="pos-v2-table-zones__modal-helper">Las zonas te ayudan a organizar las mesas por área del local.</p>
              <label>
                Nombre de zona
                <input value={zoneName} onChange={(event) => setZoneName(sanitizeName(event.target.value))} placeholder="Ej. Terraza" maxLength={50} />
              </label>
              <div className="pos-v2-table-zones__modal-actions">
                <button type="button" className="is-secondary-chip" onClick={() => setIsZoneModalOpen(false)}>Cancelar</button>
                <button type="submit" disabled={saving || !hasSession}>{saving ? "Guardando..." : "Guardar zona"}</button>
              </div>
            </form>
          </section>
        ) : null}

        {isQuickModalOpen ? (
          <section className="pos-v2-table-zones__modal" role="dialog" aria-modal="true" aria-label="Crear zona con mesas" onClick={() => setIsQuickModalOpen(false)}>
            <form className="pos-v2-table-zones__modal-card" onClick={(event) => event.stopPropagation()} onSubmit={handleCreateZoneWithTables}>
              <h3>Alta rápida de zona</h3>
              <p className="pos-v2-table-zones__modal-helper">Crea una zona y varias mesas disponibles en un solo paso.</p>
              <label>
                Nombre de zona
                <input value={quickZoneName} onChange={(event) => setQuickZoneName(sanitizeName(event.target.value))} placeholder="Ej. Salón principal" maxLength={50} />
              </label>
              <label>
                Número de mesas
                <input type="number" min="1" value={quickNumTables} onChange={(event) => setQuickNumTables(event.target.value)} />
              </label>
              <div className="pos-v2-table-zones__modal-actions">
                <button type="button" className="is-secondary-chip" onClick={() => setIsQuickModalOpen(false)}>Cancelar</button>
                <button type="submit" disabled={saving || !hasSession}>{saving ? "Creando..." : "Crear zona con mesas"}</button>
              </div>
            </form>
          </section>
        ) : null}

        {isTableModalOpen ? (
          <section className="pos-v2-table-zones__modal" role="dialog" aria-modal="true" aria-label="Editar o crear mesa" onClick={() => setIsTableModalOpen(false)}>
            <form className="pos-v2-table-zones__modal-card" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmitTable}>
              <h3>{tableEditId ? `Editar mesa #${tableEditId}` : "Crear mesa"}</h3>
              <p className="pos-v2-table-zones__modal-helper">Zona seleccionada: <strong>{selectedZone?.name ?? "Sin zona"}</strong></p>
              <label>
                Zona de mesa
                <select value={selectedZoneId} onChange={(event) => setSelectedZoneId(event.target.value)}>
                  <option value="">Selecciona zona</option>
                  {zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
                </select>
              </label>
              <label>
                Nombre de mesa
                <input value={tableName} onChange={(event) => setTableName(sanitizeName(event.target.value))} placeholder="Ej. Mesa 1" maxLength={50} />
              </label>
              <label>
                Sillas
                <input type="number" min="1" value={tableChairs} onChange={(event) => setTableChairs(event.target.value)} placeholder="Ej. 4" />
              </label>
              <div className="pos-v2-table-zones__modal-actions">
                <button type="button" className="is-secondary-chip" onClick={() => setIsTableModalOpen(false)}>Cancelar</button>
                <button type="submit" disabled={saving || !hasSession}>{saving ? "Guardando..." : "Guardar mesa"}</button>
              </div>
            </form>
          </section>
        ) : null}

        {deleteTarget ? (
          <section className="pos-v2-table-zones__modal" role="dialog" aria-modal="true" aria-label="Confirmar eliminación" onClick={() => setDeleteTarget(null)}>
            <article className="pos-v2-table-zones__modal-card" onClick={(event) => event.stopPropagation()}>
              <h3>Confirmar eliminación</h3>
              <p className="pos-v2-table-zones__modal-helper">
                ¿Seguro que deseas eliminar {deleteTarget.kind === "zone" ? "la zona" : "la mesa"} <strong>{deleteTarget.name}</strong>? Esta acción no se puede deshacer.
              </p>
              <div className="pos-v2-table-zones__modal-actions">
                <button type="button" className="is-secondary-chip" onClick={() => setDeleteTarget(null)}>Cancelar</button>
                <button type="button" className="is-danger" onClick={handleConfirmDelete} disabled={saving}>
                  {saving ? "Eliminando..." : "Sí, eliminar"}
                </button>
              </div>
            </article>
          </section>
        ) : null}
      </section>
    </PosV2Shell>
  );
};
